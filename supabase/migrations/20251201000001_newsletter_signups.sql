-- Create newsletter_signups table
CREATE TABLE IF NOT EXISTS public.newsletter_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add index on email for faster lookups
CREATE INDEX IF NOT EXISTS newsletter_signups_email_idx ON public.newsletter_signups(email);

-- Add index on created_at for sorting
CREATE INDEX IF NOT EXISTS newsletter_signups_created_at_idx ON public.newsletter_signups(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.newsletter_signups ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (sign up for newsletter)
CREATE POLICY "Allow public insert" ON public.newsletter_signups
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow authenticated users to read their own signup
CREATE POLICY "Allow users to read own signup" ON public.newsletter_signups
  FOR SELECT
  TO authenticated
  USING (auth.email() = email);

-- Only service role can read all signups (for admin purposes)
-- No policy needed as service role bypasses RLS
