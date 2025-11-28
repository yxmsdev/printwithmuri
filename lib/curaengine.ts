/**
 * CuraEngine Wrapper
 * Handles execution of CuraEngine CLI for 3D model slicing
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import path from 'path';
import { parseGCode, GCodeMetrics } from './gcode-parser';

const execAsync = promisify(exec);

const CURAENGINE_PATH = process.env.CURAENGINE_PATH || 'CuraEngine';
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
 * Generate CuraEngine command based on configuration
 */
function buildCuraCommand(
  inputPath: string,
  outputPath: string,
  config: SlicerConfig
): string {
  const { quality, material, infillDensity } = config;

  // Layer heights by quality
  const layerHeights = {
    draft: 0.3,
    standard: 0.2,
    high: 0.1,
    ultra: 0.05,
  };

  // Print speeds by quality (mm/s)
  const printSpeeds = {
    draft: 80,
    standard: 60,
    high: 40,
    ultra: 20,
  };

  // Material temperatures
  const materialSettings = {
    PLA: { nozzle: 210, bed: 60 },
    PETG: { nozzle: 235, bed: 80 },
    ABS: { nozzle: 240, bed: 100 },
    Resin: { nozzle: 0, bed: 0 }, // N/A for FDM
  };

  const layerHeight = layerHeights[quality];
  const printSpeed = printSpeeds[quality];
  const temps = materialSettings[material];

  // Build CuraEngine command with settings
  // Note: This is a simplified command. In production, you'd use a full JSON config file
  const command = [
    CURAENGINE_PATH,
    'slice',
    `-l "${inputPath}"`,
    `-o "${outputPath}"`,
    `-s layer_height=${layerHeight}`,
    `-s infill_sparse_density=${infillDensity}`,
    `-s speed_print=${printSpeed}`,
    `-s material_print_temperature=${temps.nozzle}`,
    `-s material_bed_temperature=${temps.bed}`,
    `-s machine_width=220`,
    `-s machine_depth=220`,
    `-s machine_height=250`,
    `-s machine_nozzle_size=0.4`,
  ].join(' ');

  return command;
}

/**
 * Slice a 3D model file using CuraEngine
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
    console.log('🔧 Starting CuraEngine slice...');
    console.log('Input:', inputFilePath);
    console.log('Output:', gcodeFilePath);
    console.log('Config:', config);

    const command = buildCuraCommand(inputFilePath, gcodeFilePath, config);
    console.log('Command:', command);

    // Execute CuraEngine with timeout
    const { stdout, stderr } = await execAsync(command, {
      timeout: SLICER_TIMEOUT,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large outputs
    });

    if (stderr) {
      console.warn('CuraEngine stderr:', stderr);
    }

    console.log('✅ Slicing completed successfully');

    // Read and parse the generated G-code
    const gcodeContent = await fs.readFile(gcodeFilePath, 'utf-8');
    const metrics = parseGCode(gcodeContent, config.material);

    console.log('📊 Metrics:', metrics);

    return {
      success: true,
      gcodeFilePath,
      metrics,
    };
  } catch (error) {
    console.error('❌ CuraEngine slicing failed:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Clean up partial G-code file if it exists
    try {
      await fs.unlink(gcodeFilePath);
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
 * Check if CuraEngine is installed and accessible
 */
export async function checkCuraEngineInstallation(): Promise<boolean> {
  try {
    const { stdout } = await execAsync(`${CURAENGINE_PATH} help`, {
      timeout: 5000,
    });
    console.log('✅ CuraEngine found:', stdout.substring(0, 100));
    return true;
  } catch (error) {
    console.error('❌ CuraEngine not found or not executable:', error);
    return false;
  }
}
