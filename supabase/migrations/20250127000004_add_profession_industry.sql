-- Add profession and industry fields to profiles table
-- Migration: 20250127000004_add_profession_industry.sql

-- Add new columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profession TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS industry TEXT;

-- Update the handle_new_user trigger function to capture new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, user_type, profession, industry)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'user_type',
    NEW.raw_user_meta_data->>'profession',
    NEW.raw_user_meta_data->>'industry'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The trigger should already exist from initial schema, but recreate it if needed
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add index on user_type for faster queries
CREATE INDEX IF NOT EXISTS profiles_user_type_idx ON public.profiles(user_type);

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.user_type IS 'Type of user: creator or business';
COMMENT ON COLUMN public.profiles.profession IS 'Profession for creator users (optional)';
COMMENT ON COLUMN public.profiles.industry IS 'Industry for business users (optional)';
