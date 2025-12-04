import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { sliceModel, SlicerConfig, cleanupOldFiles } from '@/lib/prusaslicer';
import { createClient } from '@/lib/supabase/server';

// Configure the API route to allow longer execution time
export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';

const TEMP_DIR = process.env.SLICER_TEMP_DIR || '/tmp/slicing';

// Material cost per gram in NGN
const MATERIAL_RATES: Record<string, number> = {
  PLA: 350,
  PETG: 500,
  ABS: 700,
  Resin: 1100,
};

// Machine cost per hour
const MACHINE_COST_PER_HOUR = 2000; // ₦2000/hour

// Setup fee per unique model
const SETUP_FEE = 2500; // ₦2500

let isSlicing = false;
const sliceQueue: {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  request: NextRequest;
}[] = [];

async function processQueue() {
  if (isSlicing || sliceQueue.length === 0) {
    return;
  }

  isSlicing = true;
  const { resolve, reject, request } = sliceQueue.shift()!;

  try {
    const result = await handleSlicing(request);
    resolve(result);
  } catch (error) {
    reject(error);
  } finally {
    isSlicing = false;
    processQueue();
  }
}

export async function POST(request: NextRequest) {
  return new Promise((resolve, reject) => {
    sliceQueue.push({ resolve, reject, request });
    processQueue();
  });
}

async function handleSlicing(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  const requestStartTime = Date.now();

  console.log(`\n${'='.repeat(80)}`);
  console.log(`🆕 NEW SLICE REQUEST [${requestId}]`);
  console.log(`${'='.repeat(80)}\n`);
  console.log(`[${requestId}] ⏱️  Request received at ${new Date().toISOString()}`);

  try {
    // Cleanup old files before processing (async, don't wait)
    cleanupOldFiles(24).catch(err => console.error(`[${requestId}] Cleanup error:`, err));

    // Get configuration from the request
    console.log(`[${requestId}] 📥 Parsing request data...`);
    const formData = await request.formData();
    const fileId = formData.get('fileId') as string;
    const quality = formData.get('quality') as string;
    const material = formData.get('material') as string;
    const infillDensity = formData.get('infillDensity') as string;
    const infillType = (formData.get('infillType') as string) || 'honeycomb';

    console.log(`[${requestId}] 📋 Form data received:`, {
      fileId,
      quality,
      material,
      infillDensity,
      infillType,
      allKeys: Array.from(formData.keys())
    });

    // Validate required fields
    if (!fileId) {
      console.error(`[${requestId}] ❌ Validation failed: No fileId provided`);
      return NextResponse.json(
        { error: 'No fileId provided' },
        { status: 400 }
      );
    }

    console.log(`[${requestId}] 🔍 Looking up file with ID: ${fileId}`);

    // Retrieve file information from database
    const supabase = await createClient();
    const { data: upload, error: dbError } = await supabase
      .from('temp_uploads')
      .select('*')
      .eq('file_id', fileId)
      .single();

    if (dbError || !upload) {
      console.error(`[${requestId}] ❌ File not found in database:`, dbError);
      return NextResponse.json(
        { error: 'File not found. It may have expired or been deleted.' },
        { status: 404 }
      );
    }

    // Check if file has expired
    const expiresAt = new Date(upload.expires_at);
    if (expiresAt < new Date()) {
      console.error(`[${requestId}] ❌ File has expired: ${upload.expires_at}`);
      return NextResponse.json(
        { error: 'File has expired. Please upload again.' },
        { status: 410 }
      );
    }

    // Check if file exists on disk
    const tempFilePath = upload.file_path;
    try {
      await fs.access(tempFilePath, fs.constants.R_OK);
      console.log(`[${requestId}] ✅ File found: ${tempFilePath}`);
    } catch {
      console.error(`[${requestId}] ❌ File not found on disk: ${tempFilePath}`);
      return NextResponse.json(
        { error: 'File not found on server. It may have been cleaned up.' },
        { status: 404 }
      );
    }

    const fileName = upload.file_name;
    const fileExtension = upload.file_extension;

    if (!quality || !['draft', 'standard', 'high', 'ultra'].includes(quality)) {
      console.error(`[${requestId}] ❌ Validation failed: Invalid quality:`, quality);
      return NextResponse.json(
        { error: 'Valid quality is required (draft, standard, high, ultra)' },
        { status: 400 }
      );
    }

    if (!material || !['PLA', 'PETG', 'ABS', 'Resin'].includes(material)) {
      console.error(`[${requestId}] ❌ Validation failed: Invalid material:`, material);
      return NextResponse.json(
        { error: 'Valid material is required (PLA, PETG, ABS, Resin)' },
        { status: 400 }
      );
    }

    const infillDensityNum = parseFloat(infillDensity);
    if (isNaN(infillDensityNum) || infillDensityNum < 5 || infillDensityNum > 100) {
      console.error(`[${requestId}] ❌ Validation failed: Invalid infill density:`, infillDensity);
      return NextResponse.json(
        { error: 'infillDensity must be between 5 and 100' },
        { status: 400 }
      );
    }

    const allowedInfillTypes = ['cubic', 'gyroid', 'honeycomb', 'rectilinear', 'grid', 'line', 'triangles', 'concentric'];
    if (!infillType || !allowedInfillTypes.includes(infillType)) {
        console.error(`[${requestId}] ❌ Validation failed: Invalid infillType:`, infillType);
        return NextResponse.json(
            { error: `Valid infillType is required (${allowedInfillTypes.join(', ')})` },
            { status: 400 }
        );
    }

    console.log(`[${requestId}] ✅ Validation passed`);
    console.log(`[${requestId}] 🔵 Starting slice operation...`);
    console.log(`[${requestId}]   File: ${fileName} (${(upload.file_size / 1024).toFixed(2)} KB)`);
    console.log(`[${requestId}]   File ID: ${fileId}`);
    console.log(`[${requestId}]   Quality: ${quality}`);
    console.log(`[${requestId}]   Material: ${material}`);
    console.log(`[${requestId}]   Infill: ${infillDensity}% (${infillType})`);

    // Configure slicing settings
    const slicerConfig: SlicerConfig = {
      quality: quality as 'draft' | 'standard' | 'high' | 'ultra',
      material: material as 'PLA' | 'PETG' | 'ABS' | 'Resin',
      infillDensity: infillDensityNum,
      infillType: infillType as 'cubic' | 'gyroid' | 'honeycomb' | 'rectilinear' | 'grid' | 'line' | 'triangles' | 'concentric',
    };

    // Slice the model
    console.log(`[${requestId}] ⚙️  Invoking PrusaSlicer...`);
    const sliceStart = Date.now();

    const sliceResult = await sliceModel(tempFilePath, slicerConfig);

    const sliceDuration = Date.now() - sliceStart;
    console.log(`[${requestId}] ⏱️  Slicing operation took ${(sliceDuration / 1000).toFixed(1)}s`);

    // Note: We don't delete the input file since it may be reused for different settings
    console.log(`[${requestId}] 📁 Input file retained for potential re-slicing`);

    if (!sliceResult.success) {
      console.error(`[${requestId}] ❌ Slicing failed:`, sliceResult.error);
      return NextResponse.json(
        {
          error: 'Slicing failed',
          details: sliceResult.error,
        },
        { status: 500 }
      );
    }

    console.log(`[${requestId}] ✅ Slicing succeeded`);

    // Calculate pricing based on sliced metrics
    const { metrics } = sliceResult;
    const materialCostPerGram = MATERIAL_RATES[material] || MATERIAL_RATES.PLA;

    const materialCost = metrics.filamentWeightGrams * materialCostPerGram;
    const machineCost = metrics.printTimeHours * MACHINE_COST_PER_HOUR;
    const itemTotal = materialCost + machineCost + SETUP_FEE;

    // Generate quote ID
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const quoteId = `quote-${timestamp}-${randomId}`;

    console.log(`[${requestId}] 💰 Pricing calculated:`);
    console.log(`[${requestId}]   Weight: ${metrics.filamentWeightGrams.toFixed(2)}g`);
    console.log(`[${requestId}]   Time: ${metrics.printTimeHours.toFixed(2)}h`);
    console.log(`[${requestId}]   Material Cost: ₦${materialCost.toFixed(2)}`);
    console.log(`[${requestId}]   Machine Cost: ₦${machineCost.toFixed(2)}`);
    console.log(`[${requestId}]   Total: ₦${itemTotal.toFixed(2)}`);

    // Return formatted quote
    const response = {
      success: true,
      quote: {
        quote_id: quoteId,
        gcode_file: path.basename(sliceResult.gcodeFilePath),
        estimatedWeight: parseFloat(metrics.filamentWeightGrams.toFixed(2)),
        printTime: parseFloat(metrics.printTimeHours.toFixed(2)),
        machineCost: parseFloat(machineCost.toFixed(2)),
        materialCost: parseFloat(materialCost.toFixed(2)),
        setupFee: SETUP_FEE,
        itemTotal: parseFloat(itemTotal.toFixed(2)),
        currency: 'NGN',
        slicingDuration: sliceDuration,
        layerCount: metrics.layerCount,
      }
    };

    const totalDuration = Date.now() - requestStartTime;
    console.log(`[${requestId}] 🎉 Slice request completed successfully`);
    console.log(`[${requestId}] Quote ID: ${quoteId}`);
    console.log(`[${requestId}] ⏱️  Total request time: ${(totalDuration / 1000).toFixed(1)}s (Slicing: ${(sliceDuration / 1000).toFixed(1)}s)\n`);

    return NextResponse.json(response);

  } catch (error) {
    console.error(`[${requestId}] ❌ Fatal error in slicer route:`);
    console.error(`[${requestId}] Error type:`, error?.constructor?.name);
    console.error(`[${requestId}] Error message:`, error instanceof Error ? error.message : String(error));

    if (error instanceof Error && error.stack) {
      console.error(`[${requestId}] Stack trace:`, error.stack);
    }

    console.log(`${'='.repeat(80)}\n`);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
