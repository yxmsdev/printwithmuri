import { createClient } from './server';

/**
 * Get the current authenticated user's profile
 */
export async function getCurrentUserProfile() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { user: null, profile: null, error: authError };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return { user, profile, error: profileError };
}

/**
 * Upload a file to Supabase storage
 */
export async function uploadFile(
  bucket: 'models' | 'design-guides',
  filePath: string,
  file: File | Blob,
  userId: string
) {
  const supabase = await createClient();

  // Path format: {userId}/{filename}
  const fullPath = `${userId}/${filePath}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fullPath, file, {
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    return { data: null, error };
  }

  // Get public URL (even though bucket is private, we need the path)
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fullPath);

  return { data: { ...data, publicUrl }, error: null };
}

/**
 * Get a signed URL for a private file
 */
export async function getSignedUrl(
  bucket: 'models' | 'design-guides',
  filePath: string,
  expiresIn: number = 3600 // 1 hour default
) {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, expiresIn);

  return { data, error };
}

/**
 * Delete a file from storage
 */
export async function deleteFile(
  bucket: 'models' | 'design-guides',
  filePath: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  return { data, error };
}

/**
 * Generate a unique order number
 */
export async function generateOrderNumber(): Promise<string> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('generate_order_number');

  if (error) {
    // Fallback to client-side generation if function fails
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `MUR-${timestamp}-${random}`;
  }

  return data as string;
}
