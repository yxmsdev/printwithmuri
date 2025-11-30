/**
 * PrusaSlicer Wrapper
 * Handles execution of PrusaSlicer CLI for 3D model slicing
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import path from 'path';
import { parseGCode, GCodeMetrics } from './gcode-parser';

const execFileAsync = promisify(execFile);

const PRUSASLICER_PATH = process.env.PRUSASLICER_PATH || '/usr/local/bin/prusa-slicer';
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
 * Validate that a config file exists and is readable
 */
async function validateConfigFile(filePath: string, description: string): Promise<void> {
  try {
    await fs.access(filePath, fs.constants.R_OK);
  } catch {
    throw new Error(`${description} not found or not readable: ${filePath}`);
  }
}

/**
 * Build PrusaSlicer arguments array based on configuration
 * Returns an array of arguments (safe for execFile, no shell injection)
 */
async function buildPrusaSlicerArgs(
  inputPath: string,
  outputPath: string,
  config: SlicerConfig
): Promise<string[]> {
  const { quality, material, infillDensity } = config;

  // Configuration file paths (use different path for dev vs production)
  // In production (Docker), config is at /app/config/prusaslicer
  // In development, config is in the project root
  const configDir = process.env.NODE_ENV === 'production'
    ? '/app/config/prusaslicer'
    : path.join(process.cwd(), 'config/prusaslicer');

  console.log(`🔧 Config directory: ${configDir} (NODE_ENV: ${process.env.NODE_ENV})`);

  const printerProfile = `${configDir}/printer/Generic_FDM.ini`;
  const filamentProfile = `${configDir}/filament/${material}.ini`;
  const printProfile = `${configDir}/print/Standard_Quality.ini`;

  console.log(`📁 Looking for config files:`);
  console.log(`   Printer: ${printerProfile}`);
  console.log(`   Material: ${filamentProfile}`);
  console.log(`   Quality: ${printProfile}`);

  // Validate config files exist before attempting to slice
  await validateConfigFile(printerProfile, 'Printer profile');
  await validateConfigFile(filamentProfile, `Filament profile for ${material}`);
  await validateConfigFile(printProfile, 'Print quality profile');

  // Layer heights by quality
  const layerHeights: Record<SlicerConfig['quality'], number> = {
    draft: 0.3,
    standard: 0.2,
    high: 0.1,
    ultra: 0.05,
  };

  const layerHeight = layerHeights[quality];

  // Build arguments array (execFile handles escaping automatically)
  const args: string[] = [
    '--export-gcode',
    '--output', outputPath,
    '--load', printerProfile,
    '--load', filamentProfile,
    '--load', printProfile,
    '--layer-height', layerHeight.toString(),
    '--fill-density', `${infillDensity}%`,
    // Enable supports for better print quality (use = syntax to avoid ambiguity)
    '--support-material=1',
    '--support-material-auto=1',
    '--support-material-threshold=45', // Auto-generate supports for overhangs > 45°
    // Enable brim for better bed adhesion
    '--brim-width=5', // 5mm brim
    '--skirts=1', // Number of skirt loops
    '--skirt-distance=6', // Distance from object (mm)
    // Input file must be last
    inputPath,
  ];

  return args;
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

    // Validate input file exists
    try {
      await fs.access(inputFilePath, fs.constants.R_OK);
    } catch {
      throw new Error(`Input file not found or not readable: ${inputFilePath}`);
    }

    const args = await buildPrusaSlicerArgs(inputFilePath, gcodeFilePath, config);
    console.log('Command:', PRUSASLICER_PATH, args.join(' '));

    // Execute PrusaSlicer with timeout using execFile (safe from shell injection)
    console.log('⏳ Executing PrusaSlicer (this may take up to', SLICER_TIMEOUT / 1000, 'seconds)...');
    const execStart = Date.now();

    const { stdout, stderr } = await execFileAsync(PRUSASLICER_PATH, args, {
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
    let gcodeStats: Awaited<ReturnType<typeof fs.stat>>;
    try {
      gcodeStats = await fs.stat(gcodeFilePath);
      console.log('✅ G-code file created:', gcodeFilePath, `(${gcodeStats.size} bytes)`);
    } catch {
      throw new Error(`G-code file was not created at ${gcodeFilePath}. PrusaSlicer may have failed silently.`);
    }

    if (gcodeStats.size === 0) {
      throw new Error('G-code file is empty');
    }

    // Read and parse the generated G-code
    console.log('📖 Reading G-code file...');
    const gcodeContent = await fs.readFile(gcodeFilePath, 'utf-8');

    console.log('🔍 Parsing G-code (', gcodeContent.length, 'bytes)...');
    const metrics = parseGCode(gcodeContent, config.material);

    console.log('📊 Parsed metrics:', JSON.stringify(metrics));
    console.log('✅ Slicing completed successfully');

    return {
      success: true,
      gcodeFilePath,
      metrics,
    };
  } catch (error: unknown) {
    console.error('❌ PrusaSlicer slicing failed');

    const errorObj = error instanceof Error ? error : new Error(String(error));
    console.error('Error type:', errorObj.constructor.name);
    console.error('Error message:', errorObj.message);
    console.error('Error stack:', errorObj.stack);

    // Check for specific error types
    let errorMessage = 'Unknown error during slicing';

    if (errorObj.message.includes('ETIMEDOUT') || errorObj.message.includes('timeout') || errorObj.message.includes('KILLED')) {
      errorMessage = `Slicing timeout after ${SLICER_TIMEOUT / 1000}s. Try a simpler model or increase SLICER_TIMEOUT.`;
    } else if (errorObj.message.includes('ENOENT') && errorObj.message.includes(PRUSASLICER_PATH)) {
      errorMessage = `PrusaSlicer not found at ${PRUSASLICER_PATH}. Check Docker installation.`;
    } else if (errorObj.message.includes('EACCES')) {
      errorMessage = `Permission denied. Check file permissions for PrusaSlicer and input/output paths.`;
    } else if (errorObj.message.includes('not found or not readable')) {
      errorMessage = errorObj.message;
    } else if (errorObj.message.includes('not created')) {
      errorMessage = errorObj.message;
    } else {
      errorMessage = errorObj.message;
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
        try {
          const stats = await fs.stat(filePath);
          const age = now - stats.mtimeMs;

          if (age > ttlMs) {
            await fs.unlink(filePath);
            console.log(`🗑️ Deleted old G-code file: ${file}`);
          }
        } catch (fileError) {
          console.warn(`Failed to process file ${file}:`, fileError);
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
    const { stdout } = await execFileAsync(PRUSASLICER_PATH, ['--help'], {
      timeout: 5000,
    });
    console.log('✅ PrusaSlicer found:', stdout.substring(0, 100));
    return true;
  } catch (error) {
    console.error('❌ PrusaSlicer not found or not executable:', error);
    return false;
  }
}