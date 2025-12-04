# Auth Setup Quick Checklist

Use this checklist to quickly set up authentication. See `AUTH_SETUP_GUIDE.md` for detailed instructions.

## ☐ Step 1: Get Supabase Credentials (5 min)

1. [ ] Go to [Supabase Dashboard](https://app.supabase.com)
2. [ ] Select/create your project
3. [ ] Settings → API → Copy these 3 values:
   - [ ] `NEXT_PUBLIC_SUPABASE_URL`
   - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - [ ] `SUPABASE_SERVICE_ROLE_KEY`

## ☐ Step 2: Update .env.local (2 min)

Add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## ☐ Step 3: Run Migrations (10 min)

In Supabase → SQL Editor, run these files in order:

1. [ ] `20250127000001_initial_schema.sql`
2. [ ] `20250127000003_storage_buckets_safe.sql`
3. [ ] `20251130192535_temp_uploads.sql`
4. [ ] `20251201000001_newsletter_signups.sql`
5. [ ] `20251202000001_password_reset_pins.sql`
6. [ ] `20250127000004_add_profession_industry.sql`

Verify: Go to **Table Editor** → Should see all tables and `user_type`, `profession`, `industry` columns in profiles

## ☐ Step 4: Configure Auth Providers (5 min)

1. [ ] Authentication → Providers → Verify **Email** is enabled
2. [ ] (Optional) Enable **Google OAuth**:
   - [ ] Get credentials from Google Cloud Console
   - [ ] Add Client ID/Secret in Supabase
3. [ ] Authentication → URL Configuration:
   - [ ] Site URL: `http://localhost:3000`
   - [ ] Add Redirect URL: `http://localhost:3000/auth/callback`

## ☐ Step 5: Setup Email Service (5 min)

1. [ ] Sign up at [resend.com](https://resend.com)
2. [ ] Create API Key
3. [ ] Add to `.env.local`:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```

## ☐ Step 6: Test (10 min)

1. [ ] Restart dev server: `npm run dev`
2. [ ] Test signup: `/auth/signup`
3. [ ] Check user created in Supabase → Authentication → Users
4. [ ] Check profile created in Table Editor → profiles
5. [ ] Test login: `/auth/login`
6. [ ] Test password reset: `/auth/forgot-password`
7. [ ] Test sign out

---

## ✅ Success Criteria

- [ ] Users can sign up with email/password
- [ ] Users can sign in with email/password
- [ ] Profile is auto-created on signup
- [ ] Password reset PIN email is received
- [ ] Users can reset password with PIN
- [ ] Users can sign out
- [ ] (Optional) Google OAuth works

---

## 🚨 Common Issues

**Problem**: "Invalid API key"
- **Fix**: Double-check keys in `.env.local`, restart server

**Problem**: Profile not created
- **Fix**: Check if `handle_new_user()` trigger exists in Database → Functions

**Problem**: Email not received
- **Fix**: Check Resend API key, check spam folder, check Resend logs

---

**Estimated Total Time**: 30-40 minutes

See `AUTH_SETUP_GUIDE.md` for detailed troubleshooting.
