import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { createClient } from '@/lib/supabase/server';
import { FileUploadResponse } from '@/types';

const TEMP_DIR = process.env.SLICER_TEMP_DIR || '/tmp/slicing';
const UPLOAD_TTL_HOURS = parseInt(process.env.UPLOAD_TTL_HOURS || '24', 10);

// Configure the API route
export const maxDuration = 60; // 1 minute for upload
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);

  console.log(`\n${'='.repeat(80)}`);
  console.log(`📤 NEW FILE UPLOAD [${requestId}]`);
  console.log(`${'='.repeat(80)}\n`);

  try {
    // Parse form data
    console.log(`[${requestId}] 📥 Parsing file upload...`);
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Validate file exists
    if (!file) {
      console.error(`[${requestId}] ❌ No file provided`);
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedExtensions = ['.stl', '.obj', '.3mf', '.fbx', '.gltf', '.glb'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!allowedExtensions.includes(fileExtension)) {
      console.error(`[${requestId}] ❌ Invalid file type: ${fileExtension}`);
      return NextResponse.json(
        { error: `Unsupported file type. Allowed: ${allowedExtensions.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      console.error(`[${requestId}] ❌ File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return NextResponse.json(
        { error: `File too large. Maximum size: 50MB` },
        { status: 400 }
      );
    }

    console.log(`[${requestId}] ✅ Validation passed`);
    console.log(`[${requestId}]   File: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);

    // Ensure temp directory exists
    await fs.mkdir(TEMP_DIR, { recursive: true });

    // Generate unique file ID
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const fileId = `${timestamp}-${randomId}`;
    const tempFileName = `upload-${fileId}${fileExtension}`;
    const tempFilePath = path.join(TEMP_DIR, tempFileName);

    // Save file to temp directory
    console.log(`[${requestId}] 💾 Saving file to: ${tempFilePath}`);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(tempFilePath, buffer);
    console.log(`[${requestId}] ✅ File saved successfully`);

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + UPLOAD_TTL_HOURS * 60 * 60 * 1000);

    // Store reference in Supabase
    console.log(`[${requestId}] 💾 Storing file reference in database...`);
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('temp_uploads')
      .insert({
        file_id: fileId,
        file_path: tempFilePath,
        file_name: file.name,
        file_size: file.size,
        file_extension: fileExtension,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error(`[${requestId}] ❌ Database error:`, error);
      // Clean up file if database insert fails
      try {
        await fs.unlink(tempFilePath);
      } catch (cleanupError) {
        console.warn(`[${requestId}] ⚠️ Failed to cleanup file after DB error:`, cleanupError);
      }
      return NextResponse.json(
        { error: 'Failed to store file reference' },
        { status: 500 }
      );
    }

    console.log(`[${requestId}] ✅ File uploaded successfully`);
    console.log(`[${requestId}]   File ID: ${fileId}`);
    console.log(`[${requestId}]   Expires at: ${expiresAt.toISOString()}\n`);

    const response: FileUploadResponse = {
      success: true,
      fileId,
      fileName: file.name,
      fileSize: file.size,
      fileExtension,
      expiresAt: expiresAt.toISOString(),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error(`[${requestId}] ❌ Fatal error in upload route:`);
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
