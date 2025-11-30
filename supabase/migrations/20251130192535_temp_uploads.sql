-- Create temp_uploads table for two-phase slicing architecture
-- This table stores uploaded 3D model files temporarily before slicing

CREATE TABLE IF NOT EXISTS temp_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id TEXT UNIQUE NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_extension TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX idx_temp_uploads_file_id ON temp_uploads(file_id);
CREATE INDEX idx_temp_uploads_expires_at ON temp_uploads(expires_at);
CREATE INDEX idx_temp_uploads_created_at ON temp_uploads(created_at);

-- Add RLS policies (allow all for now since files are in temp storage)
ALTER TABLE temp_uploads ENABLE ROW LEVEL SECURITY;

-- Policy to allow inserts
CREATE POLICY "Allow inserts for temp uploads"
  ON temp_uploads
  FOR INSERT
  WITH CHECK (true);

-- Policy to allow reads
CREATE POLICY "Allow reads for temp uploads"
  ON temp_uploads
  FOR SELECT
  USING (true);

-- Policy to allow deletes (for cleanup)
CREATE POLICY "Allow deletes for temp uploads"
  ON temp_uploads
  FOR DELETE
  USING (true);

-- Add comment for documentation
COMMENT ON TABLE temp_uploads IS 'Temporary storage for uploaded 3D model files awaiting slicing. Files are cleaned up after 24 hours.';
