import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { sliceModel, SlicerConfig, cleanupOldFiles } from '@/lib/prusaslicer';

const TEMP_DIR = process.env.SLICER_TEMP_DIR || '/tmp/slicing';

// Material cost per gram in NGN
const MATERIAL_RATES: Record<string, number> = {
  PLA: 150,
  PETG: 180,
  ABS: 170,
  Resin: 350,
};

// Machine cost per hour
const MACHINE_COST_PER_HOUR = 2000; // ₦2000/hour

// Setup fee per unique model
const SETUP_FEE = 500; // ₦500

/**
 * POST /api/slicer/slice
 * Unified endpoint for slicing 3D models and generating quotes
 *
 * Request body (multipart/form-data):
 * - file: 3D model file (STL, OBJ, etc.)
 * - quality: 'draft' | 'standard' | 'high' | 'ultra'
 * - material: 'PLA' | 'PETG' | 'ABS' | 'Resin'
 * - infillDensity: number (5-100)
 */
export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  const requestStartTime = Date.now();

  console.log(`\n${'='.repeat(80)}`);
  console.log(`🆕 NEW SLICE REQUEST [${requestId}]`);
  console.log(`${'='.repeat(80)}\n`);
  console.log(`[${requestId}] ⏱️  Request received at ${new Date().toISOString()}`);

  try {
    // Cleanup old files before processing (async, don't wait)
    cleanupOldFiles(24).catch(err => console.error(`[${requestId}] Cleanup error:`, err));

    // Get the file and configuration from the request
    console.log(`[${requestId}] 📥 Parsing form data (includes file upload)...`);
    const uploadStartTime = Date.now();
    const formData = await request.formData();
    const uploadDuration = Date.now() - uploadStartTime;
    console.log(`[${requestId}] ⏱️  Upload completed in ${(uploadDuration / 1000).toFixed(1)}s`);
    const file = formData.get('file') as File;
    const quality = formData.get('quality') as string;
    const material = formData.get('material') as string;
    const infillDensity = formData.get('infillDensity') as string;
    const infillType = formData.get('infillType') as string;

    // Validate required fields
    if (!file) {
      console.error(`[${requestId}] ❌ Validation failed: No file provided`);
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

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

    const allowedInfillTypes = ['hexagonal', 'grid', 'lines', 'triangles', 'cubic'];
    if (!infillType || !allowedInfillTypes.includes(infillType)) {
        console.error(`[${requestId}] ❌ Validation failed: Invalid infillType:`, infillType);
        return NextResponse.json(
            { error: `Valid infillType is required (${allowedInfillTypes.join(', ')})` },
            { status: 400 }
        );
    }

    // Validate file type
    const allowedExtensions = ['.stl', '.obj', '.3mf', '.fbx', '.gltf', '.glb'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!allowedExtensions.includes(fileExtension)) {
      console.error(`[${requestId}] ❌ Validation failed: Invalid file type:`, fileExtension);
      return NextResponse.json(
        { error: `Unsupported file type. Allowed: ${allowedExtensions.join(', ')}` },
        { status: 400 }
      );
    }

    console.log(`[${requestId}] ✅ Validation passed`);
    console.log(`[${requestId}] 🔵 Starting slice operation...`);
    console.log(`[${requestId}]   File: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    console.log(`[${requestId}]   Quality: ${quality}`);
    console.log(`[${requestId}]   Material: ${material}`);
    console.log(`[${requestId}]   Infill: ${infillDensity}%`);

    // Ensure temp directory exists
    console.log(`[${requestId}] 📁 Ensuring temp directory exists: ${TEMP_DIR}`);
    await fs.mkdir(TEMP_DIR, { recursive: true });

    // Save uploaded file to temp directory
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const tempFileName = `model-${timestamp}-${randomId}${fileExtension}`;
    const tempFilePath = path.join(TEMP_DIR, tempFileName);

    console.log(`[${requestId}] 💾 Saving uploaded file to: ${tempFilePath}`);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(tempFilePath, buffer);
    console.log(`[${requestId}] ✅ File saved successfully`);

    // Configure slicing settings
    const slicerConfig: SlicerConfig = {
      quality: quality as 'draft' | 'standard' | 'high' | 'ultra',
      material: material as 'PLA' | 'PETG' | 'ABS' | 'Resin',
      infillDensity: infillDensityNum,
      infillType: infillType as 'hexagonal' | 'grid' | 'lines' | 'triangles' | 'cubic',
    };

    // Slice the model
    console.log(`[${requestId}] ⚙️  Invoking PrusaSlicer...`);
    const sliceStart = Date.now();

    const sliceResult = await sliceModel(tempFilePath, slicerConfig);

    const sliceDuration = Date.now() - sliceStart;
    console.log(`[${requestId}] ⏱️  Slicing operation took ${(sliceDuration / 1000).toFixed(1)}s`);

    // Clean up input file
    try {
      await fs.unlink(tempFilePath);
      console.log(`[${requestId}] 🗑️  Cleaned up input file`);
    } catch (error) {
      console.warn(`[${requestId}] ⚠️  Failed to cleanup input file:`, error);
    }

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
    console.log(`[${requestId}] ⏱️  Total request time: ${(totalDuration / 1000).toFixed(1)}s (Upload: ${(uploadDuration / 1000).toFixed(1)}s, Slicing: ${(sliceDuration / 1000).toFixed(1)}s)\n`);

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
