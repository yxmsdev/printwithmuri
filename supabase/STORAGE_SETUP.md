# Storage Buckets Setup

Storage buckets cannot be created via SQL migrations in Supabase. You need to create them manually through the dashboard.

## Step 1: Create the "models" bucket

1. Go to **Storage** in your Supabase dashboard
2. Click **New bucket**
3. Configure:
   - **Name**: `models`
   - **Public bucket**: OFF (keep it private)
   - **File size limit**: 50MB (52428800 bytes)
   - **Allowed MIME types**: Leave empty for now (we'll configure via policies)
4. Click **Create bucket**

## Step 2: Create the "design-guides" bucket

1. Click **New bucket** again
2. Configure:
   - **Name**: `design-guides`
   - **Public bucket**: OFF (keep it private)
   - **File size limit**: 10MB (10485760 bytes)
   - **Allowed MIME types**: Leave empty for now
3. Click **Create bucket**

## Step 3: Add Storage Policies

After creating both buckets, go back to **SQL Editor** and run this:

```sql
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
```

## Done!

Your storage is now configured with:
- ✅ Two private buckets (models, design-guides)
- ✅ Security policies that ensure users only access their own files
