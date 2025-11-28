/**
 * G-code Parser
 * Extracts print metrics from sliced G-code files
 */

export interface GCodeMetrics {
  printTimeSeconds: number;
  printTimeHours: number;
  filamentLengthMm: number;
  filamentWeightGrams: number;
  layerCount: number;
  materialType: string;
}

const FILAMENT_DIAMETER = 1.75; // mm (standard)
const FILAMENT_RADIUS = FILAMENT_DIAMETER / 2;

// Material densities (g/cm³)
const MATERIAL_DENSITIES: Record<string, number> = {
  PLA: 1.24,
  PETG: 1.27,
  ABS: 1.04,
  Resin: 1.10, // Not typically used for FDM but included for consistency
};

/**
 * Parse G-code file and extract print metrics
 */
export function parseGCode(gcodeContent: string, material: string): GCodeMetrics {
  const lines = gcodeContent.split('\n');

  let printTimeSeconds = 0;
  let filamentLengthMm = 0;
  let layerCount = 0;
  let maxE = 0; // Track maximum extrusion value

  for (const line of lines) {
    const trimmed = line.trim();

    // Extract print time from Cura comment (;TIME:)
    if (trimmed.startsWith(';TIME:')) {
      const timeMatch = trimmed.match(/;TIME:(\d+)/);
      if (timeMatch) {
        printTimeSeconds = parseInt(timeMatch[1], 10);
      }
    }

    // Extract layer count from Cura comment (;LAYER_COUNT:)
    if (trimmed.startsWith(';LAYER_COUNT:')) {
      const layerMatch = trimmed.match(/;LAYER_COUNT:(\d+)/);
      if (layerMatch) {
        layerCount = parseInt(layerMatch[1], 10);
      }
    }

    // Track extrusion (E value) to calculate filament length
    if (trimmed.startsWith('G1') || trimmed.startsWith('G0')) {
      const eMatch = trimmed.match(/E([\d.]+)/);
      if (eMatch) {
        const eValue = parseFloat(eMatch[1]);
        if (eValue > maxE) {
          maxE = eValue;
        }
      }
    }
  }

  // Filament length is the max E value (in mm)
  filamentLengthMm = maxE;

  // Calculate filament weight
  // Volume = length × π × radius²
  // Weight = volume × density
  const filamentVolumeMm3 = filamentLengthMm * Math.PI * Math.pow(FILAMENT_RADIUS, 2);
  const filamentVolumeCm3 = filamentVolumeMm3 / 1000; // Convert mm³ to cm³
  const density = MATERIAL_DENSITIES[material.toUpperCase()] || MATERIAL_DENSITIES.PLA;
  const filamentWeightGrams = filamentVolumeCm3 * density;

  return {
    printTimeSeconds,
    printTimeHours: printTimeSeconds / 3600,
    filamentLengthMm,
    filamentWeightGrams,
    layerCount,
    materialType: material,
  };
}

/**
 * Format print time as human-readable string
 */
export function formatPrintTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Estimate file complexity based on G-code size
 */
export function estimateComplexity(gcodeLength: number): 'simple' | 'moderate' | 'complex' {
  if (gcodeLength < 100000) return 'simple';
  if (gcodeLength < 500000) return 'moderate';
  return 'complex';
}
