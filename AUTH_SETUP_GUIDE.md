# Authentication Setup Guide - Print with Muri

This guide will help you set up and connect authentication for the Print with Muri platform using Supabase.

## 📋 Prerequisites

1. A Supabase account ([sign up here](https://supabase.com))
2. A Supabase project created for Print with Muri

---

## Step 1: Get Supabase Credentials

1. **Go to your Supabase Project Dashboard**
   - Visit: https://app.supabase.com
   - Select your project (or create a new one)

2. **Get API Keys**
   - Click **Settings** (⚙️ icon in sidebar) → **API**
   - Copy these three values:

   | Field | Environment Variable | Location in Dashboard |
   |-------|---------------------|----------------------|
   | Project URL | `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
   | anon/public key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → anon public |
   | service_role key | `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role (⚠️ secret) |

3. **Update `.env.local`**

   Open your `.env.local` file and add:

   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key-here
   ```

---

## Step 2: Run Database Migrations

You need to run **6 migrations** in order. Choose one method:

### Method A: Supabase Dashboard (Recommended)

1. **Go to SQL Editor**
   - In Supabase dashboard → **SQL Editor** (left sidebar)

2. **Run each migration in this order:**

   #### Migration 1: Initial Schema
   ```bash
   # Copy content from: supabase/migrations/20250127000001_initial_schema.sql
   ```
   - Creates tables: `profiles`, `models`, `drafts`, `orders`, `order_status_history`, `design_guide_images`, `coming_soon_signups`
   - Sets up RLS (Row Level Security) policies
   - Click **RUN** → Wait for "Success"

   #### Migration 2: Storage Buckets
   ```bash
   # Copy content from: supabase/migrations/20250127000003_storage_buckets_safe.sql
   ```
   - Creates storage buckets: `models`, `design-guides`
   - Sets up file access policies
   - Click **RUN**

   #### Migration 3: Temp Uploads
   ```bash
   # Copy content from: supabase/migrations/20251130192535_temp_uploads.sql
   ```
   - Creates `temp_uploads` table for file staging
   - Click **RUN**

   #### Migration 4: Newsletter Signups
   ```bash
   # Copy content from: supabase/migrations/20251201000001_newsletter_signups.sql
   ```
   - Creates `newsletter_signups` table
   - Click **RUN**

   #### Migration 5: Password Reset PINs
   ```bash
   # Copy content from: supabase/migrations/20251202000001_password_reset_pins.sql
   ```
   - Creates `password_reset_pins` table for PIN-based password reset
   - Click **RUN**

   #### Migration 6: Profession and Industry Fields
   ```bash
   # Copy content from: supabase/migrations/20250127000004_add_profession_industry.sql
   ```
   - Adds `user_type`, `profession`, and `industry` columns to profiles table
   - Updates the `handle_new_user()` trigger to capture these fields
   - Click **RUN**

3. **Verify Migrations**
   - Go to **Table Editor** → You should see all tables listed
   - Check **profiles** table → Should see `user_type`, `profession`, `industry` columns
   - Go to **Storage** → You should see `models` and `design-guides` buckets

### Method B: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (find project-ref in Project Settings → General)
supabase link --project-ref your-project-ref

# Push all migrations
supabase db push
```

---

## Step 3: Configure Authentication Providers

### Email/Password Authentication (Required)

1. **Go to Authentication → Providers**
2. **Email** should be enabled by default
3. **Configure Email Templates** (Optional but recommended):
   - Go to **Authentication** → **Email Templates**
   - Customize:
     - ✉️ **Confirm signup** - Welcome email
     - 🔒 **Reset password** - Password reset link
     - 🔑 **Magic Link** - Passwordless login

### Google OAuth (Optional)

1. **Create Google OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project (or use existing)
   - Enable **Google+ API**
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs:
     ```
     https://xxxxxxxxxxxxx.supabase.co/auth/v1/callback
     ```
     (Replace with your Supabase project URL)

2. **Configure in Supabase**
   - Go to **Authentication** → **Providers**
   - Enable **Google**
   - Enter:
     - **Client ID** (from Google Console)
     - **Client Secret** (from Google Console)
   - Click **Save**

3. **Update Site URL (Important!)**
   - Go to **Authentication** → **URL Configuration**
   - Set **Site URL** to:
     - Development: `http://localhost:3000`
     - Production: `https://yourdomain.com`
   - Add to **Redirect URLs**:
     ```
     http://localhost:3000/auth/callback
     https://yourdomain.com/auth/callback
     ```

---

## Step 4: Configure Email Service (For Password Reset)

The platform uses **Resend** for sending password reset PINs.

1. **Sign up for Resend**
   - Go to [resend.com](https://resend.com)
   - Create an account

2. **Get API Key**
   - Dashboard → **API Keys** → **Create API Key**
   - Copy the key

3. **Add to `.env.local`**
   ```env
   # Email (Resend)
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
   ```

4. **Optional: Configure Sender Email**
   ```env
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   RESEND_FROM_NAME=Muri Press
   ```

---

## Step 5: Verify Authentication Setup

### 5.1 Check Environment Variables

Make sure your `.env.local` has:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Email (Required for password reset)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# Optional
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_FROM_NAME=Muri Press
```

### 5.2 Restart Development Server

```bash
# Stop the server (Ctrl+C)
# Start fresh
npm run dev
```

### 5.3 Test Authentication Flows

1. **Test Sign Up**
   - Go to `http://localhost:3000/auth/signup`
   - Create a test account
   - Check Supabase → **Authentication** → **Users** (you should see the new user)
   - Check **Table Editor** → **profiles** (profile should be auto-created)

2. **Test Sign In**
   - Go to `http://localhost:3000/auth/login`
   - Login with your test account
   - You should be redirected to homepage
   - Check browser console for auth state (no errors)

3. **Test Google OAuth** (if configured)
   - Click "Continue with Google" button
   - Should redirect to Google login
   - After success, redirects back to app

4. **Test Password Reset**
   - Go to `http://localhost:3000/auth/forgot-password`
   - Enter your email
   - Check your email for 6-digit PIN
   - Enter PIN at `http://localhost:3000/auth/verify-pin`
   - Set new password

5. **Test Sign Out**
   - Click profile/logout button
   - Should clear session and redirect to login

---

## Step 6: Verify Database Tables

Go to Supabase → **Table Editor** and verify these tables exist:

- ✅ **profiles** - User profiles (auto-created on signup)
- ✅ **temp_uploads** - Temporary file uploads
- ✅ **newsletter_signups** - Newsletter subscribers
- ✅ **password_reset_pins** - Password reset PINs
- ⚠️ **models** - Not yet used (future feature)
- ⚠️ **drafts** - Not used (using LocalStorage instead)
- ⚠️ **orders** - Not used (using LocalStorage instead)
- ⚠️ **order_status_history** - Not yet used
- ⚠️ **design_guide_images** - Not yet used
- ⚠️ **coming_soon_signups** - Not yet used

---

## 🔐 Security Checklist

- ✅ Never commit `.env.local` to git (it's in `.gitignore`)
- ✅ Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- ✅ RLS policies are enabled on all tables
- ✅ Storage policies restrict file access to owners
- ✅ All sensitive operations use API routes (server-side)

---

## 🔧 Troubleshooting

### Issue: "Invalid API key" or "Invalid JWT"

**Solution:**
- Double-check your API keys in `.env.local`
- Make sure you copied the correct keys (anon vs service_role)
- Restart dev server after updating `.env.local`

### Issue: User created but profile not found

**Solution:**
- Check if database trigger exists:
  - Go to **Database** → **Functions**
  - Should see `handle_new_user()` function
- Manually create profile:
  ```sql
  INSERT INTO profiles (id, full_name)
  VALUES ('user-id-here', 'Full Name');
  ```

### Issue: Google OAuth redirect error

**Solution:**
- Verify redirect URI in Google Console matches exactly:
  ```
  https://xxxxxxxxxxxxx.supabase.co/auth/v1/callback
  ```
- Check Site URL in Supabase → **Authentication** → **URL Configuration**

### Issue: Password reset email not received

**Solution:**
- Check Resend API key is correct
- Check spam folder
- Verify email in Resend dashboard → **Logs**
- For development, check Supabase email logs:
  - **Authentication** → **Email Templates** → Enable "Development mode"

### Issue: RLS policy errors

**Solution:**
- Ensure user is authenticated (check `auth.uid()`)
- Verify RLS policies in **Table Editor** → Select table → **Policies** tab
- Test policies in SQL Editor:
  ```sql
  SELECT * FROM profiles WHERE id = auth.uid();
  ```

---

## 📚 What Auth Features Are Implemented?

### ✅ Fully Working

1. **Email/Password Sign Up**
   - Location: `app/auth/signup/page.tsx`
   - Creates user + auto-creates profile
   - Supports "creator" or "business" user types
   - Optional profession field for creators (expandable dropdown)
   - Optional industry field for businesses (expandable dropdown)
   - "Other" option allows custom text input

2. **Email/Password Sign In**
   - Location: `app/auth/login/page.tsx`
   - Session management via Supabase

3. **Google OAuth Sign In**
   - Configured in `contexts/AuthContext.tsx`
   - Callback handler at `app/auth/callback/route.ts`

4. **PIN-based Password Reset**
   - Request PIN: `app/auth/forgot-password/page.tsx`
   - Verify PIN: `app/auth/verify-pin/page.tsx`
   - Reset password: `app/auth/reset-password/page.tsx`
   - Sends email via Resend API
   - 6-digit PIN valid for 15 minutes

5. **Sign Out**
   - Available in `AuthContext.signOut()`
   - Clears session and redirects

6. **Auth State Management**
   - Global `AuthContext` provider in `app/layout.tsx`
   - Available via `useAuth()` hook anywhere in app
   - Automatic session refresh

### 📍 How to Use Auth in Components

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, loading, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

---

## 🎯 Next Steps After Setup

1. ✅ Test all auth flows (signup, login, reset password)
2. ✅ Verify users appear in Supabase dashboard
3. ✅ Check profiles are auto-created
4. 🔜 Connect orders/drafts to database (currently using LocalStorage)
5. 🔜 Add protected routes (redirect to login if not authenticated)
6. 🔜 Implement profile editing

---

## 📞 Need Help?

- **Supabase Docs**: https://supabase.com/docs/guides/auth
- **Resend Docs**: https://resend.com/docs
- **Google OAuth Setup**: https://supabase.com/docs/guides/auth/social-login/auth-google

---

**Last Updated**: December 2024
