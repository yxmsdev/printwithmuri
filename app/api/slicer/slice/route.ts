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
  try {
    // Cleanup old files before processing (async, don't wait)
    cleanupOldFiles(24).catch(err => console.error('Cleanup error:', err));

    // Get the file and configuration from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const quality = formData.get('quality') as string;
    const material = formData.get('material') as string;
    const infillDensity = formData.get('infillDensity') as string;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!quality || !['draft', 'standard', 'high', 'ultra'].includes(quality)) {
      return NextResponse.json(
        { error: 'Valid quality is required (draft, standard, high, ultra)' },
        { status: 400 }
      );
    }

    if (!material || !['PLA', 'PETG', 'ABS', 'Resin'].includes(material)) {
      return NextResponse.json(
        { error: 'Valid material is required (PLA, PETG, ABS, Resin)' },
        { status: 400 }
      );
    }

    const infillDensityNum = parseFloat(infillDensity);
    if (isNaN(infillDensityNum) || infillDensityNum < 5 || infillDensityNum > 100) {
      return NextResponse.json(
        { error: 'infillDensity must be between 5 and 100' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedExtensions = ['.stl', '.obj', '.3mf', '.fbx', '.gltf', '.glb'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: `Unsupported file type. Allowed: ${allowedExtensions.join(', ')}` },
        { status: 400 }
      );
    }

    console.log('🔵 Starting slice operation...');
    console.log('File:', file.name, `(${file.size} bytes)`);
    console.log('Quality:', quality);
    console.log('Material:', material);
    console.log('Infill:', infillDensity + '%');

    // Ensure temp directory exists
    await fs.mkdir(TEMP_DIR, { recursive: true });

    // Save uploaded file to temp directory
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const tempFileName = `model-${timestamp}-${randomId}${fileExtension}`;
    const tempFilePath = path.join(TEMP_DIR, tempFileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(tempFilePath, buffer);

    console.log('📁 File saved to:', tempFilePath);

    // Configure slicing settings
    const slicerConfig: SlicerConfig = {
      quality: quality as 'draft' | 'standard' | 'high' | 'ultra',
      material: material as 'PLA' | 'PETG' | 'ABS' | 'Resin',
      infillDensity: infillDensityNum,
    };

    // Slice the model
    console.log('⚙️  Starting PrusaSlicer slicing...');
    const sliceStart = Date.now();

    const sliceResult = await sliceModel(tempFilePath, slicerConfig);

    const sliceDuration = Date.now() - sliceStart;
    console.log(`⏱️  Slicing took ${(sliceDuration / 1000).toFixed(1)}s`);

    // Clean up input file
    try {
      await fs.unlink(tempFilePath);
      console.log('🗑️  Cleaned up input file');
    } catch (error) {
      console.warn('Failed to cleanup input file:', error);
    }

    if (!sliceResult.success) {
      return NextResponse.json(
        {
          error: 'Slicing failed',
          details: sliceResult.error,
        },
        { status: 500 }
      );
    }

    // Calculate pricing based on sliced metrics
    const { metrics } = sliceResult;
    const materialCostPerGram = MATERIAL_RATES[material] || MATERIAL_RATES.PLA;

    const materialCost = metrics.filamentWeightGrams * materialCostPerGram;
    const machineCost = metrics.printTimeHours * MACHINE_COST_PER_HOUR;
    const itemTotal = materialCost + machineCost + SETUP_FEE;

    // Generate quote ID
    const quoteId = `quote-${timestamp}-${randomId}`;

    console.log('💰 Pricing calculated:');
    console.log(`  Weight: ${metrics.filamentWeightGrams.toFixed(2)}g`);
    console.log(`  Time: ${metrics.printTimeHours.toFixed(2)}h`);
    console.log(`  Material Cost: ₦${materialCost.toFixed(2)}`);
    console.log(`  Machine Cost: ₦${machineCost.toFixed(2)}`);
    console.log(`  Total: ₦${itemTotal.toFixed(2)}`);

    // Return formatted quote
    return NextResponse.json({
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
    });

  } catch (error) {
    console.error('❌ Error in slicer slice route:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
