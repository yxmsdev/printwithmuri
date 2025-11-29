/**
 * G-code Parser
 * Extracts print metrics from PrusaSlicer generated G-code files
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

    // Extract print time from PrusaSlicer comment (; estimated printing time)
    if (trimmed.includes('estimated printing time')) {
      // Format: "; estimated printing time (normal mode) = 1h 23m 45s"
      const timeMatch = trimmed.match(/(\d+)h\s*(\d+)m\s*(\d+)s/);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        const seconds = parseInt(timeMatch[3], 10);
        printTimeSeconds = hours * 3600 + minutes * 60 + seconds;
      } else {
        // Try format: "1h 23m" or "45m 30s"
        const hm = trimmed.match(/(\d+)h\s*(\d+)m/);
        const ms = trimmed.match(/(\d+)m\s*(\d+)s/);
        if (hm) {
          printTimeSeconds = parseInt(hm[1], 10) * 3600 + parseInt(hm[2], 10) * 60;
        } else if (ms) {
          printTimeSeconds = parseInt(ms[1], 10) * 60 + parseInt(ms[2], 10);
        }
      }
    }

    // Count layers from PrusaSlicer layer change comments
    // PrusaSlicer uses ";LAYER_CHANGE" or "; layer 1, Z = 0.200"
    if (trimmed.startsWith(';LAYER_CHANGE') || trimmed.startsWith('; layer ')) {
      layerCount++;
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
