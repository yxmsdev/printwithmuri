import { ModelInfo, PrintConfig, PriceBreakdown } from '@/types';
import { estimateWeight } from './model-parser';

// Material densities in g/cm³
const MATERIAL_DENSITIES = {
  PLA: 1.24,
  PETG: 1.27,
  ABS: 1.04,
  Resin: 1.10,
};

// Print speeds by quality (grams per hour)
const PRINT_SPEEDS = {
  draft: 80,      // 0.3mm layer height
  standard: 50,   // 0.2mm layer height
  high: 20,       // 0.1mm layer height
  ultra: 10,      // 0.05mm layer height - very slow, highest detail
};

// Machine hourly rate in Naira
const HOURLY_RATE = 2000;

// Material cost per gram in Naira
const MATERIAL_RATES = {
  PLA: 450,
  PETG: 600,
  TPU: 900,
  ABS: 800,
  Resin: 3000,
};

const SETUP_FEE = 2500; // ₦ per unique model
const TIME_BUFFER = 3; // 15% buffer for supports, travel, etc.

/**
 * Calculate the complete price breakdown for a print job
 */
export function calculatePrice(
  config: PrintConfig,
  modelInfo: ModelInfo
): PriceBreakdown {
  // Estimate weight based on volume, material, and infill
  const estimatedWeight = estimateWeight(
    modelInfo,
    config.material,
    config.infillDensity
  );

  // Calculate print time with buffer
  const printSpeed = PRINT_SPEEDS[config.quality];
  const printTime = (estimatedWeight / printSpeed) * TIME_BUFFER;

  // Calculate costs
  const machineCost = Math.round(printTime * HOURLY_RATE);
  const materialCost = Math.round(estimatedWeight * MATERIAL_RATES[config.material]);
  const itemTotal = machineCost + materialCost + SETUP_FEE;
  const subtotal = itemTotal * config.quantity;

  return {
    estimatedWeight,
    printTime: Math.round(printTime * 100) / 100, // Round to 2 decimals
    machineCost,
    materialCost,
    setupFee: SETUP_FEE,
    itemTotal,
    quantity: config.quantity,
    subtotal,
    source: 'local-estimation',
  };
}

/**
 * Format print time for display
 */
export function formatPrintTime(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} mins`;
  } else if (hours < 24) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  } else {
    const days = Math.floor(hours / 24);
    const h = Math.round(hours % 24);
    return h > 0 ? `${days}d ${h}h` : `${days}d`;
  }
}

/**
 * Export constants for use in other components
 */
export const PRICING_CONSTANTS = {
  MATERIAL_DENSITIES,
  PRINT_SPEEDS,
  HOURLY_RATE,
  MATERIAL_RATES,
  SETUP_FEE,
  TIME_BUFFER,
};
