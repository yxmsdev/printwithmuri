# Google OAuth Setup Guide

This guide will help you fix the "Error 400: redirect_uri_mismatch" and set up Google OAuth properly.

## 🔍 Understanding the Error

**Error:** `Error 400: redirect_uri_mismatch`

**Cause:** The redirect URI your app sends to Google doesn't match what's registered in Google Cloud Console.

**Your app's redirect URI:** `http://localhost:3000/auth/callback`

---

## Step 1: Google Cloud Console Setup (10 min)

### 1.1 Create/Access Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. **Create a new project** (or select existing):
   - Click project dropdown at top
   - Click "New Project"
   - Name: "Print with Muri" (or your preferred name)
   - Click "Create"

### 1.2 Enable Google+ API

1. In the left sidebar, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and click **Enable**

### 1.3 Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. If prompted to configure consent screen:
   - Click **Configure Consent Screen**
   - Select **External** (for testing) or **Internal** (for workspace)
   - Click **Create**
   - Fill in:
     - **App name:** Print with Muri
     - **User support email:** Your email
     - **Developer contact:** Your email
   - Click **Save and Continue**
   - Skip Scopes (click **Save and Continue**)
   - Add Test Users (your email) if using External
   - Click **Save and Continue**

4. Back to **Create OAuth client ID**:
   - **Application type:** Web application
   - **Name:** Print with Muri Web Client

5. **Authorized JavaScript origins:**
   - Click **+ ADD URI**
   - Add: `http://localhost:3000`
   - Add: `https://yourdomain.com` (for production, when ready)

6. **Authorized redirect URIs** (MOST IMPORTANT):
   - Click **+ ADD URI**
   - Add these URIs in this exact order:

   ```
   http://localhost:3000/auth/callback
   https://rcpgvscvexpyqwfskqqs.supabase.co/auth/v1/callback
   ```

   **Note:** The second URL is your Supabase project callback URL. Replace `rcpgvscvexpyqwfskqqs` with your actual Supabase project reference if different.

7. Click **CREATE**

8. **Save Your Credentials:**
   - A popup will show your **Client ID** and **Client Secret**
   - **Copy both** - you'll need them for Supabase

---

## Step 2: Supabase Configuration (5 min)

### 2.1 Enable Google Provider

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **rcpgvscvexpyqwfskqqs** (or your project)
3. Go to **Authentication** → **Providers**
4. Find **Google** in the list
5. Toggle it to **Enabled**

### 2.2 Add Google Credentials

1. Paste the credentials from Google Cloud Console:
   - **Client ID (for OAuth):** Paste your Google Client ID
   - **Client Secret (for OAuth):** Paste your Google Client Secret

2. Click **Save**

### 2.3 Configure Site URL and Redirect URLs

1. Go to **Authentication** → **URL Configuration**

2. **Site URL:**
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`

3. **Redirect URLs** - Add these:
   ```
   http://localhost:3000/**
   http://localhost:3000/auth/callback
   https://yourdomain.com/** (for production)
   ```

4. Click **Save**

---

## Step 3: Verify .env.local (1 min)

Make sure your `.env.local` has:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://rcpgvscvexpyqwfskqqs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App URL (used for OAuth redirects)
NEXT_PUBLIC_URL=http://localhost:3000
```

---

## Step 4: Test Google OAuth (2 min)

1. **Restart your dev server** (if already running):
   ```bash
   # Stop: Ctrl+C
   npm run dev
   ```

2. Go to [http://localhost:3000/auth/signup](http://localhost:3000/auth/signup)

3. Click **"Sign in with Google"** button

4. You should:
   - See Google account selection popup
   - Select your account
   - Be redirected back to your app
   - Be logged in successfully

---

## 🚨 Troubleshooting

### Still getting "redirect_uri_mismatch"?

**Check these:**

1. ✅ **Exact match required:** URIs in Google Console must EXACTLY match what the app sends
   - Including `http://` vs `https://`
   - Including trailing slashes (or not)
   - Port numbers (`:3000`)

2. ✅ **Supabase callback URL:** Make sure you added:
   ```
   https://rcpgvscvexpyqwfskqqs.supabase.co/auth/v1/callback
   ```
   Replace `rcpgvscvexpyqwfskqqs` with YOUR Supabase project ref

3. ✅ **Check your Supabase Project Reference:**
   - In Supabase Dashboard → Settings → General
   - Find "Reference ID"
   - Should match the subdomain in your Supabase URL

4. ✅ **Clear browser cache:**
   - Sometimes old OAuth sessions cause issues
   - Try in incognito/private window

5. ✅ **Wait a few minutes:**
   - Google can take 1-5 minutes to propagate OAuth config changes

### Error: "This app is blocked"

If using **External** user type in consent screen:
- Add your email as a test user
- Go to OAuth consent screen → Test users → Add users

### Credentials not working?

1. Double-check you copied:
   - Full Client ID (looks like: `xxxxx.apps.googleusercontent.com`)
   - Full Client Secret (random string)

2. No extra spaces or line breaks when pasting

---

## 📋 Production Deployment Checklist

When deploying to production (e.g., Vercel, Netlify):

1. **Update Google Cloud Console:**
   - Add production domain to **Authorized JavaScript origins**:
     ```
     https://yourdomain.com
     ```
   - Add production redirect URI:
     ```
     https://yourdomain.com/auth/callback
     ```

2. **Update Supabase:**
   - Set Site URL to production domain
   - Add production redirect URL

3. **Update .env for production:**
   ```env
   NEXT_PUBLIC_URL=https://yourdomain.com
   ```

4. **Publish OAuth Consent Screen** (if External):
   - Go to OAuth consent screen
   - Click "Publish App"
   - May require verification for public use

---

## 🔐 Security Notes

- ✅ Never commit `.env.local` to git (already in `.gitignore`)
- ✅ Keep Client Secret private (server-side only)
- ✅ Client ID can be public (it's in the frontend)
- ✅ Use environment-specific credentials (dev vs prod)

---

## 📚 Reference

- **Your Supabase Project:** https://rcpgvscvexpyqwfskqqs.supabase.co
- **Google Cloud Console:** https://console.cloud.google.com/
- **Supabase Auth Docs:** https://supabase.com/docs/guides/auth/social-login/auth-google

---

## ✅ Success Checklist

After setup, you should be able to:

- [ ] Click "Sign in with Google" on signup page
- [ ] See Google account picker
- [ ] Select account without errors
- [ ] Be redirected back to your app
- [ ] See user logged in (check Supabase Auth → Users)
- [ ] Profile auto-created in profiles table

---

**Last Updated:** December 2024
