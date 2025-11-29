import { NextRequest, NextResponse } from 'next/server';
import { checkPrusaSlicerInstallation } from '@/lib/prusaslicer';

/**
 * GET /api/slicer/health
 * Health check endpoint for PrusaSlicer installation
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking PrusaSlicer installation...');

    const isInstalled = await checkPrusaSlicerInstallation();

    if (isInstalled) {
      console.log('✅ PrusaSlicer is installed and accessible');
      return NextResponse.json({
        success: true,
        message: 'PrusaSlicer is installed and accessible',
        prusaslicerPath: process.env.PRUSASLICER_PATH || process.env.CURAENGINE_PATH || '/usr/local/bin/prusa-slicer',
        timeout: parseInt(process.env.SLICER_TIMEOUT || '60000', 10),
        tempDir: process.env.SLICER_TEMP_DIR || '/tmp/slicing',
      });
    } else {
      console.error('❌ PrusaSlicer is not installed or not accessible');
      return NextResponse.json({
        success: false,
        message: 'PrusaSlicer is not installed or not accessible',
        prusaslicerPath: process.env.PRUSASLICER_PATH || process.env.CURAENGINE_PATH || '/usr/local/bin/prusa-slicer',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ Error checking PrusaSlicer installation:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check PrusaSlicer installation',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
