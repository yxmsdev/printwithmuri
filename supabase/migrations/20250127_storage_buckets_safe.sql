-- =============================================
-- STORAGE BUCKETS SETUP (SAFE VERSION)
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload own models" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own models" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own models" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own models" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own design guides" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own design guides" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own design guides" ON storage.objects;

-- Create buckets (will fail silently if they already exist)
DO $$
BEGIN
  -- Create models bucket
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'models',
    'models',
    false,
    52428800, -- 50MB
    ARRAY[
      'model/stl',
      'application/sla',
      'application/octet-stream',
      'model/obj',
      'text/plain',
      'application/3mf'
    ]
  ) ON CONFLICT (id) DO NOTHING;

  -- Create design-guides bucket
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'design-guides',
    'design-guides',
    false,
    10485760, -- 10MB
    ARRAY[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/jpg'
    ]
  ) ON CONFLICT (id) DO NOTHING;
END $$;

-- =============================================
-- STORAGE POLICIES
-- =============================================

-- Models bucket policies
CREATE POLICY "Users can upload own models"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'models'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own models"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'models'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own models"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'models'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own models"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'models'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Design guides bucket policies
CREATE POLICY "Users can upload own design guides"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'design-guides'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own design guides"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'design-guides'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own design guides"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'design-guides'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
