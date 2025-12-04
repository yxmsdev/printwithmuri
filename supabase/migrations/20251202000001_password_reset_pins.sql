-- Create password reset pins table
CREATE TABLE IF NOT EXISTS public.password_reset_pins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  attempts INT DEFAULT 0 NOT NULL,
  max_attempts INT DEFAULT 5 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  used_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS password_reset_pins_email_idx
  ON public.password_reset_pins(email);
CREATE INDEX IF NOT EXISTS password_reset_pins_expires_at_idx
  ON public.password_reset_pins(expires_at);
CREATE INDEX IF NOT EXISTS password_reset_pins_created_at_idx
  ON public.password_reset_pins(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.password_reset_pins ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Very restrictive since this is sensitive data
-- No SELECT policy - API routes will use service role
-- No UPDATE policy - API routes will use service role
-- No DELETE policy - API routes will use service role

-- Comment explaining security model
COMMENT ON TABLE public.password_reset_pins IS
  'Stores password reset PIN codes. Access is restricted to service role only. Client cannot query this table directly.';

-- Cleanup function: Delete old/expired PINs
CREATE OR REPLACE FUNCTION cleanup_expired_pins()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.password_reset_pins
  WHERE expires_at < NOW()
     OR (used_at IS NOT NULL AND used_at < NOW() - INTERVAL '1 hour');
END;
$$;

-- Comment on cleanup function
COMMENT ON FUNCTION cleanup_expired_pins() IS
  'Removes expired or used password reset PINs. Should be run periodically via cron job.';
