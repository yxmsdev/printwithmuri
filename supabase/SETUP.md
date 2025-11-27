# Supabase Setup Guide

This guide will help you set up Supabase for the Print with Muri platform.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A new Supabase project created

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Click on **Settings** (gear icon) → **API**
3. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

4. Update your `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Step 2: Run Database Migrations

1. Go to your Supabase dashboard → **SQL Editor**
2. Create a new query
3. Copy and paste the contents of `supabase/migrations/20250127_initial_schema.sql`
4. Click **Run** to execute the migration
5. Repeat for `supabase/migrations/20250127_storage_buckets.sql`

Alternatively, you can use the Supabase CLI:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Step 3: Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (enabled by default)
3. Configure email templates (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize the templates for:
     - Confirm signup
     - Reset password
     - Magic link

## Step 4: Verify Storage Buckets

1. Go to **Storage** in your Supabase dashboard
2. Verify that two buckets were created:
   - `models` (50MB limit, for 3D files)
   - `design-guides` (10MB limit, for reference images)

## Step 5: Test the Connection

Once you've set up everything, test the connection:

```bash
cd print-with-muri
npm run dev
```

Open your browser console and check for any Supabase-related errors.

## Database Schema Overview

### Tables Created:

1. **profiles** - User profile information
2. **models** - Uploaded 3D model metadata
3. **drafts** - Saved print configurations
4. **orders** - Order records
5. **order_status_history** - Order status change tracking
6. **design_guide_images** - Reference image metadata
7. **coming_soon_signups** - Email signups for Paper/Merch services

### Key Features:

- **Row Level Security (RLS)** enabled on all tables
- **Automatic profile creation** when users sign up
- **Order number generation** with unique format: `MUR-YYYYMMDD-XXXX`
- **Status change tracking** for orders
- **Auto-delete expired drafts** after 30 days
- **Storage policies** to ensure users only access their own files

## Storage Bucket Structure

Files should be organized by user ID:

```
models/
  ├── {user_id}/
  │   ├── {model_id}.stl
  │   ├── {model_id}.obj
  │   └── ...

design-guides/
  ├── {user_id}/
  │   ├── {image_id}.jpg
  │   ├── {image_id}.png
  │   └── ...
```

## Security Notes

- Never expose your `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- RLS policies ensure users can only access their own data
- Storage policies restrict file access to the file owner
- All sensitive operations should use server-side code (API routes)

## Troubleshooting

### Migration Errors

If you encounter errors running migrations:

1. Check if tables already exist and drop them if needed
2. Ensure UUID extension is enabled
3. Run migrations in order (schema first, then storage)

### Storage Access Errors

If you can't upload/download files:

1. Verify storage policies are created
2. Check that the bucket exists
3. Ensure user is authenticated
4. Verify file path follows the pattern: `{user_id}/{filename}`

### RLS Policy Issues

If users can't access their data:

1. Ensure the user is authenticated (`auth.uid()` is not null)
2. Check that the policy matches the query being performed
3. Use Supabase dashboard → **Table View** → **Policies** to debug

## Next Steps

After setting up Supabase:

1. Implement user authentication (login/signup pages)
2. Update the bag checkout flow to save orders to database
3. Integrate Paystack payment webhook to update order status
4. Add file upload functionality for 3D models
5. Implement draft save/restore with database persistence
