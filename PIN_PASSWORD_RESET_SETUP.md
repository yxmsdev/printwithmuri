# 6-Digit PIN Password Reset Flow - Setup Guide

## ✅ Implementation Complete

The password reset flow has been successfully updated to use a 6-digit PIN code system instead of magic links.

## 🔄 New Flow

1. User enters email on `/auth/forgot-password`
2. System sends 6-digit PIN to user's email
3. User enters PIN on `/auth/verify-pin`
4. After PIN verification, user is redirected to `/auth/reset-password`
5. User enters new password
6. Password is updated in Supabase

## 📁 Files Created

### Database
- `supabase/migrations/20251202000001_password_reset_pins.sql` - Database table for storing PINs

### Backend Utilities
- `lib/pin-utils.ts` - PIN generation, hashing, verification, and token utilities

### API Routes
- `app/api/auth/request-pin/route.ts` - Generates and sends PIN via email
- `app/api/auth/verify-pin/route.ts` - Verifies PIN and generates reset token
- `app/api/auth/reset-password/route.ts` - Updates user password after verification

### Frontend Pages
- `app/auth/verify-pin/page.tsx` - NEW: PIN entry page with 6-digit input
- `app/auth/forgot-password/page.tsx` - MODIFIED: Now sends PIN instead of magic link
- `app/auth/reset-password/page.tsx` - MODIFIED: Validates reset token from PIN verification

## 🚀 Setup Instructions

### 1. Run Database Migration

You need to run the migration to create the `password_reset_pins` table in Supabase:

```bash
# If using Supabase CLI locally
supabase db push

# OR manually run the migration in Supabase Dashboard:
# Go to SQL Editor and run the contents of:
# supabase/migrations/20251202000001_password_reset_pins.sql
```

### 2. Configure Environment Variables

Ensure these variables are set in your `.env.local`:

```bash
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://rcpgvscvexpyqwfskqqs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # ⚠️ REQUIRED for admin functions

# Resend Email Service (already configured)
RESEND_API_KEY=your-resend-api-key
```

**IMPORTANT:** You need the `SUPABASE_SERVICE_ROLE_KEY` for the password reset API to work. This allows the server to:
- Look up users by email
- Update passwords via admin API
- Access the password_reset_pins table

### 3. Verify Resend Email Setup

The PIN is sent via Resend. Make sure:
- Your `RESEND_API_KEY` is valid
- The "from" email is verified in Resend dashboard
- Update the "from" email in `app/api/auth/request-pin/route.ts` if needed:

```typescript
from: 'Print with Muri <noreply@printwithmuri.com>',
```

If you haven't verified `printwithmuri.com`, use:
```typescript
from: 'onboarding@resend.dev', // Resend's test domain
```

### 4. Test the Flow

#### Test Checklist:

- [ ] **Request PIN**: Go to `/auth/forgot-password` and enter a valid email
- [ ] **Receive Email**: Check inbox for PIN email (check spam folder)
- [ ] **Verify PIN**: Enter the 6-digit PIN on `/auth/verify-pin`
- [ ] **Reset Password**: Enter new password on `/auth/reset-password`
- [ ] **Login**: Try logging in with new password

#### Test Edge Cases:

- [ ] Invalid email (non-existent user) - should show generic success message
- [ ] Expired PIN (after 10 minutes) - should show "PIN expired" error
- [ ] Invalid PIN - should show remaining attempts
- [ ] Max attempts (5) - should redirect to request new PIN
- [ ] Resend PIN - should generate new PIN and invalidate old one
- [ ] Invalid reset token - should show invalid token error
- [ ] Password too short (< 6 chars) - should show validation error

## 🔒 Security Features

### PIN Security
- ✅ 6-digit random PIN (1 million combinations)
- ✅ SHA-256 hashed before storage (never store plain PIN)
- ✅ 10-minute expiration window
- ✅ Maximum 5 attempts per PIN
- ✅ Single-use PINs (marked as used after password reset)
- ✅ Only one active PIN per email at a time

### Email Security
- ✅ Professional email template with branding
- ✅ Security notice included
- ✅ Clear expiration warning (10 minutes)
- ✅ Sent via Resend (reliable email service)

### Token Security
- ✅ Reset token generated after PIN verification
- ✅ 60-minute token expiration
- ✅ Token includes email, timestamp, and random nonce
- ✅ Token validated before password reset
- ✅ PIN must be verified and unused

### API Security
- ✅ Server-side PIN generation (never on client)
- ✅ Service role key used for admin operations
- ✅ Email validation on all endpoints
- ✅ Rate limiting ready (add middleware if needed)

## 🛠️ Troubleshooting

### Issue: "Email service not configured" error
**Solution:** Check that `RESEND_API_KEY` is set in `.env.local`

### Issue: "User not found" error when resetting password
**Solution:** Ensure `SUPABASE_SERVICE_ROLE_KEY` is set and valid

### Issue: PIN email not received
**Solutions:**
- Check spam/junk folder
- Verify Resend domain in dashboard
- Check Resend logs for delivery status
- Use `onboarding@resend.dev` for testing

### Issue: "Invalid or expired reset token"
**Solution:** Token is valid for 60 minutes. Request a new PIN if expired.

### Issue: Database error storing PIN
**Solution:**
- Verify migration ran successfully
- Check Supabase table exists: `password_reset_pins`
- Check RLS policies allow inserts

### Issue: Admin API calls failing
**Solution:**
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set (NOT the anon key)
- Find it in Supabase Dashboard → Settings → API → service_role key

## 📧 Email Template

The PIN email includes:
- Professional branding with Muri Press colors
- Large, readable PIN code
- 10-minute expiration notice
- Security warning for users who didn't request reset
- Footer with support email

To customize the email template, edit: `app/api/auth/request-pin/route.ts` (line ~75)

## 🔄 Database Cleanup

The `password_reset_pins` table will accumulate old records. Set up periodic cleanup:

### Option 1: Manual Cleanup
Run this in Supabase SQL Editor periodically:
```sql
SELECT cleanup_expired_pins();
```

### Option 2: Automated Cleanup (Recommended)
Set up a Supabase cron job or Edge Function to run daily:
```sql
-- In Supabase Dashboard → SQL Editor
SELECT cron.schedule(
  'cleanup-expired-pins',
  '0 2 * * *', -- Run at 2 AM daily
  $$SELECT cleanup_expired_pins()$$
);
```

## 🎨 UI/UX Features

### Forgot Password Page
- Updated text to mention "6-digit PIN code"
- Button text changed to "Send PIN Code"
- Redirects to verify-pin page on success

### Verify PIN Page (NEW)
- 6 individual input boxes for PIN digits
- Auto-focus next box on input
- Auto-focus previous box on backspace
- Paste support (Ctrl+V or Cmd+V)
- Real-time error messages
- Remaining attempts counter
- Resend PIN button
- Back to forgot password link
- Security notice with expiration info

### Reset Password Page
- Validates reset token from PIN verification
- Clear error messages
- Password confirmation field
- Auto-redirect to login after success

## 📊 Testing with Mock Data

To test without sending real emails during development:

1. Check the server logs for the generated PIN
2. Temporarily add console.log in `request-pin/route.ts`:
```typescript
console.log('Generated PIN:', pin); // Add after line 51
```

3. Use that PIN on the verify-pin page

**⚠️ IMPORTANT:** Remove console.log before deploying to production!

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Run database migration in production Supabase
- [ ] Set all environment variables in production
- [ ] Verify Resend domain in production
- [ ] Remove any debug console.logs
- [ ] Test complete flow in production
- [ ] Set up database cleanup cron job
- [ ] Monitor Resend email delivery rates
- [ ] Set up error logging/monitoring

## 📝 Notes

- The old magic link flow is completely replaced
- `AuthContext.resetPassword()` is no longer used (but kept for backward compatibility)
- All password reset logic is now server-side (more secure)
- Admin functions require service role key (keep it secret!)
- Resend free tier: 100 emails/day (upgrade if needed)

## 🎉 You're All Set!

The 6-digit PIN password reset flow is now fully implemented and ready to use!

For questions or issues, contact the development team.
