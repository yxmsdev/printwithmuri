#!/usr/bin/env tsx

/**
 * Cloud Slicer Pricing CLI
 *
 * Usage:
 *   npm run calc-price -- path/to/model.stl --quality standard --material PLA --infill 25
 *
 * Options:
 *   --quality    Print quality: draft, standard, high, ultra (default: standard)
 *   --material   Material type: PLA, PETG, ABS, Resin (default: PLA)
 *   --infill     Infill density: 5-100 (default: 25)
 *   --quantity   Number of prints (default: 1)
 */

import { CloudSlicerClient } from '../lib/cloud-slicer-client';
import * as path from 'path';
import * as fs from 'fs';

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);

  const config = {
    filePath: '',
    quality: 'standard' as 'draft' | 'standard' | 'high' | 'ultra',
    material: 'PLA' as 'PLA' | 'PETG' | 'ABS' | 'Resin',
    infill: 25,
    quantity: 1,
  };

  // First arg is the file path
  if (args[0] && !args[0].startsWith('--')) {
    config.filePath = args[0];
  }

  // Parse options
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    if (arg === '--quality' && nextArg) {
      config.quality = nextArg as any;
      i++;
    } else if (arg === '--material' && nextArg) {
      config.material = nextArg as any;
      i++;
    } else if (arg === '--infill' && nextArg) {
      config.infill = parseInt(nextArg);
      i++;
    } else if (arg === '--quantity' && nextArg) {
      config.quantity = parseInt(nextArg);
      i++;
    }
  }

  return config;
}

async function main() {
  console.log('🖨️  Cloud Slicer Pricing Calculator\n');

  // Parse arguments
  const config = parseArgs();

  // Validate file path
  if (!config.filePath) {
    console.error('❌ Error: Please provide a 3D model file path');
    console.log('\nUsage: npm run calc-price -- path/to/model.stl [options]');
    console.log('\nOptions:');
    console.log('  --quality    Print quality: draft, standard, high, ultra (default: standard)');
    console.log('  --material   Material type: PLA, PETG, ABS, Resin (default: PLA)');
    console.log('  --infill     Infill density: 5-100 (default: 25)');
    console.log('  --quantity   Number of prints (default: 1)');
    process.exit(1);
  }

  const resolvedPath = path.resolve(config.filePath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`❌ Error: File not found: ${resolvedPath}`);
    process.exit(1);
  }

  // Check for API key
  const apiKey = process.env.CLOUD_SLICER_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: CLOUD_SLICER_API_KEY environment variable not set');
    console.log('\n💡 Add this to your .env.local file:');
    console.log('   CLOUD_SLICER_API_KEY=your_api_key_here');
    console.log('\n📚 Get your API key at: https://api.cloudslicer3d.com');
    process.exit(1);
  }

  // Display configuration
  console.log('📋 Configuration:');
  console.log(`   File: ${path.basename(resolvedPath)}`);
  console.log(`   Quality: ${config.quality}`);
  console.log(`   Material: ${config.material}`);
  console.log(`   Infill: ${config.infill}%`);
  console.log(`   Quantity: ${config.quantity}`);
  console.log('');

  try {
    // Initialize Cloud Slicer client
    const client = new CloudSlicerClient({ apiKey });

    // Step 1: Upload file
    console.log('📤 Uploading model to Cloud Slicer...');
    const { file_id } = await client.uploadFile(resolvedPath);
    console.log(`✅ File uploaded (ID: ${file_id})\n`);

    // Step 2: Generate quote
    console.log('🔄 Slicing model and calculating pricing...');
    const printerConfig = CloudSlicerClient.getDefaultPrinterConfig(
      config.quality,
      config.material,
      config.infill
    );
    const quoteConfig = CloudSlicerClient.getDefaultQuoteConfig();

    // Adjust material cost based on selected material
    const materialRates = {
      PLA: 150,
      PETG: 180,
      ABS: 170,
      Resin: 350,
    };
    quoteConfig.cost_per_gram = materialRates[config.material];

    const quote = await client.generateQuote(file_id, printerConfig, quoteConfig);
    console.log('✅ Quote generated\n');

    // Step 3: Display results
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💰 PRICING BREAKDOWN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log(`⏱️  Print Time:     ${formatPrintTime(quote.print_time_hours)}`);
    console.log(`⚖️  Material Weight: ${quote.filament_weight_grams.toFixed(1)}g`);
    console.log('');
    console.log(`🔧 Machine Cost:   ₦${quote.machine_cost.toLocaleString()}`);
    console.log(`🧵 Material Cost:  ₦${quote.filament_cost.toLocaleString()}`);
    console.log(`⚙️  Setup Fee:     ₦${quoteConfig.base_price.toLocaleString()}`);
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const itemTotal = quote.total_cost + quoteConfig.base_price;
    const subtotal = itemTotal * config.quantity;

    if (config.quantity > 1) {
      console.log(`💵 Per Item:       ₦${itemTotal.toLocaleString()}`);
      console.log(`📦 Quantity:       ${config.quantity}x`);
      console.log(`💰 Total Cost:     ₦${subtotal.toLocaleString()}`);
    } else {
      console.log(`💰 Total Cost:     ₦${itemTotal.toLocaleString()}`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log(`✨ Quote ID: ${quote.quote_id}`);
    console.log('');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

function formatPrintTime(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} minutes`;
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

// Run the CLI
main().catch(console.error);
