/**
 * PrusaSlicer Wrapper
 * Handles execution of PrusaSlicer CLI for 3D model slicing
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import path from 'path';
import { parseGCode, GCodeMetrics } from './gcode-parser';

const execAsync = promisify(exec);

const PRUSASLICER_PATH = process.env.PRUSASLICER_PATH || process.env.CURAENGINE_PATH || '/usr/local/bin/prusa-slicer';
const SLICER_TIMEOUT = parseInt(process.env.SLICER_TIMEOUT || '60000', 10); // 60 seconds default
const TEMP_DIR = process.env.SLICER_TEMP_DIR || '/tmp/slicing';

export interface SlicerConfig {
  quality: 'draft' | 'standard' | 'high' | 'ultra';
  material: 'PLA' | 'PETG' | 'ABS' | 'Resin';
  infillDensity: number; // 5-100 percentage
  infillType?: string;
}

export interface SliceResult {
  success: boolean;
  gcodeFilePath: string;
  metrics: GCodeMetrics;
  error?: string;
}

/**
 * Ensure temp directory exists
 */
async function ensureTempDir(): Promise<void> {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create temp directory:', error);
  }
}

/**
 * Generate PrusaSlicer command based on configuration
 */
function buildPrusaSlicerCommand(
  inputPath: string,
  outputPath: string,
  config: SlicerConfig
): string {
  const { quality, material, infillDensity } = config;

  // Configuration file paths (will be in Docker container)
  const configDir = '/app/config/prusaslicer';
  const printerProfile = `${configDir}/printer/Generic_FDM.ini`;
  const filamentProfile = `${configDir}/filament/${material}.ini`;
  const printProfile = `${configDir}/print/Standard_Quality.ini`;

  // Layer heights by quality
  const layerHeights = {
    draft: 0.3,
    standard: 0.2,
    high: 0.1,
    ultra: 0.05,
  };

  const layerHeight = layerHeights[quality];

  // Build PrusaSlicer command with config files and overrides
  // Note: Removed quotes around paths - they cause shell parsing issues
  const command = [
    PRUSASLICER_PATH,
    '--export-gcode',
    inputPath,
    '--output', outputPath,
    '--load', printerProfile,
    '--load', filamentProfile,
    '--load', printProfile,
    '--layer-height', layerHeight.toString(),
    '--fill-density', `${infillDensity}%`,
    // Enable supports for better print quality (use = syntax for boolean values)
    '--support-material=1',
    '--support-material-auto=1',
    '--support-material-threshold=45', // Auto-generate supports for overhangs > 45°
    // Enable brim for better bed adhesion
    '--brim-width=5', // 5mm brim
    '--skirts=1', // Number of skirt loops
    '--skirt-distance=6', // Distance from object (mm)
  ].join(' ');

  return command;
}

/**
 * Slice a 3D model file using PrusaSlicer
 */
export async function sliceModel(
  inputFilePath: string,
  config: SlicerConfig
): Promise<SliceResult> {
  await ensureTempDir();

  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  const gcodeFileName = `model-${timestamp}-${randomId}.gcode`;
  const gcodeFilePath = path.join(TEMP_DIR, gcodeFileName);

  try {
    console.log('🔧 Starting PrusaSlicer slice...');
    console.log('Input:', inputFilePath);
    console.log('Output:', gcodeFilePath);
    console.log('Config:', JSON.stringify(config));
    console.log('PrusaSlicer Path:', PRUSASLICER_PATH);
    console.log('Timeout:', SLICER_TIMEOUT, 'ms');

    const command = buildPrusaSlicerCommand(inputFilePath, gcodeFilePath, config);
    console.log('Full Command:', command);

    // Execute PrusaSlicer with timeout
    console.log('⏳ Executing PrusaSlicer (this may take up to', SLICER_TIMEOUT / 1000, 'seconds)...');
    const execStart = Date.now();

    const { stdout, stderr } = await execAsync(command, {
      timeout: SLICER_TIMEOUT,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large outputs
    });

    const execDuration = Date.now() - execStart;
    console.log('⏱️ PrusaSlicer execution took', execDuration, 'ms');

    if (stdout) {
      console.log('PrusaSlicer stdout:', stdout);
    }

    if (stderr) {
      console.warn('PrusaSlicer stderr:', stderr);
      // Note: Some tools output info to stderr, so this is a warning not an error
    }

    // Verify G-code file was created
    try {
      const stats = await fs.stat(gcodeFilePath);
      console.log('✅ G-code file created:', gcodeFilePath, `(${stats.size} bytes)`);
    } catch (statError) {
      throw new Error(`G-code file was not created at ${gcodeFilePath}. PrusaSlicer may have failed silently.`);
    }

    // Read and parse the generated G-code
    console.log('📖 Reading G-code file...');
    const gcodeContent = await fs.readFile(gcodeFilePath, 'utf-8');

    if (!gcodeContent || gcodeContent.length === 0) {
      throw new Error('G-code file is empty');
    }

    console.log('🔍 Parsing G-code (', gcodeContent.length, 'bytes)...');
    const metrics = parseGCode(gcodeContent, config.material);

    console.log('📊 Parsed metrics:', JSON.stringify(metrics));
    console.log('✅ Slicing completed successfully');

    return {
      success: true,
      gcodeFilePath,
      metrics,
    };
  } catch (error) {
    console.error('❌ PrusaSlicer slicing failed');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : String(error));

    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }

    // Check for specific error types
    let errorMessage = 'Unknown error during slicing';

    if (error instanceof Error) {
      if (error.message.includes('ETIMEDOUT') || error.message.includes('timeout')) {
        errorMessage = `Slicing timeout after ${SLICER_TIMEOUT / 1000}s. Try a simpler model or increase SLICER_TIMEOUT.`;
      } else if (error.message.includes('ENOENT')) {
        errorMessage = `PrusaSlicer not found at ${PRUSASLICER_PATH}. Check Docker installation.`;
      } else if (error.message.includes('not created')) {
        errorMessage = error.message;
      } else {
        errorMessage = error.message;
      }
    }

    // Clean up partial G-code file if it exists
    try {
      await fs.unlink(gcodeFilePath);
      console.log('🗑️ Cleaned up partial G-code file');
    } catch {
      // Ignore cleanup errors
    }

    return {
      success: false,
      gcodeFilePath: '',
      metrics: {
        printTimeSeconds: 0,
        printTimeHours: 0,
        filamentLengthMm: 0,
        filamentWeightGrams: 0,
        layerCount: 0,
        materialType: config.material,
      },
      error: errorMessage,
    };
  }
}

/**
 * Clean up old G-code files (older than TTL)
 */
export async function cleanupOldFiles(ttlHours: number = 24): Promise<void> {
  try {
    const files = await fs.readdir(TEMP_DIR);
    const now = Date.now();
    const ttlMs = ttlHours * 60 * 60 * 1000;

    for (const file of files) {
      if (file.endsWith('.gcode')) {
        const filePath = path.join(TEMP_DIR, file);
        const stats = await fs.stat(filePath);
        const age = now - stats.mtimeMs;

        if (age > ttlMs) {
          await fs.unlink(filePath);
          console.log(`🗑️  Deleted old G-code file: ${file}`);
        }
      }
    }
  } catch (error) {
    console.error('Failed to cleanup old files:', error);
  }
}

/**
 * Check if PrusaSlicer is installed and accessible
 */
export async function checkPrusaSlicerInstallation(): Promise<boolean> {
  try {
    const { stdout } = await execAsync(`${PRUSASLICER_PATH} --help`, {
      timeout: 5000,
    });
    console.log('✅ PrusaSlicer found:', stdout.substring(0, 100));
    return true;
  } catch (error) {
    console.error('❌ PrusaSlicer not found or not executable:', error);
    return false;
  }
}
