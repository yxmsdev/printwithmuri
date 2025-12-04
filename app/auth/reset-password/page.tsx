'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { verifyResetToken } from '@/lib/pin-utils';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetToken = searchParams.get('token') || '';
  const emailFromParams = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState<boolean | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Verify the reset token from PIN verification
    const checkToken = () => {
      if (!resetToken || !emailFromParams) {
        setValidToken(false);
        return;
      }

      const decoded = verifyResetToken(resetToken, 60); // 60 minutes max age

      if (!decoded || decoded.email !== emailFromParams) {
        setValidToken(false);
      } else {
        setValidToken(true);
      }
    };

    checkToken();
  }, [resetToken, emailFromParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailFromParams,
          password: password,
          resetToken: resetToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state while checking token
  if (validToken === null) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-white flex items-center justify-center px-6 py-12 -mt-[32px]">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 border-4 border-[#F4008A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[14px] text-[#8D8D8D]">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid or expired token
  if (validToken === false) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-white flex items-center justify-center px-6 py-12 -mt-[32px]">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="text-[24px] font-semibold text-[#1F1F1F] mb-3">Invalid or Expired Link</h1>
          <p className="text-[14px] text-black mb-8">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link
            href="/auth/forgot-password"
            className="rounded-[2px] inline-block px-8 py-3 text-[14px] font-medium uppercase tracking-[0.28px] text-white transition-all hover:opacity-90"
            style={{
              background: 'linear-gradient(180deg, #464750 21.275%, #000000 100%)'
            }}
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-white flex items-center justify-center px-6 py-12 -mt-[32px]">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="text-[24px] font-semibold text-[#1F1F1F] mb-3">Password Reset Successful!</h1>
          <p className="text-[14px] text-black mb-8">
            Your password has been successfully reset. Redirecting you to login...
          </p>
          <Link
            href="/auth/login"
            className="rounded-[2px] inline-block px-8 py-3 text-[14px] font-medium uppercase tracking-[0.28px] text-white transition-all hover:opacity-90"
            style={{
              background: 'linear-gradient(180deg, #464750 21.275%, #000000 100%)'
            }}
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-[calc(100vh-72px)] bg-white flex flex-col items-center justify-center px-[133px] antialiased -mt-[32px]">
      <div className="w-full max-w-[1176px] flex flex-col items-center gap-[24px]">
        {/* Heading Section */}
        <div className="flex flex-col gap-[16px] w-[386px]">
          <div className="flex flex-col gap-[8px]">
            <h1 className="font-semibold text-[24px] leading-none text-black capitalize">
              Reset Your Password
            </h1>
            <p className="font-normal text-[14px] leading-[16px] text-black">
              Enter your new password below.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="w-[386px] flex flex-col gap-[16px]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
            {/* New Password */}
            <div className="flex flex-col gap-[4px]">
              <label htmlFor="password" className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter new password"
                required
                minLength={6}
                disabled={loading}
                className={`bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full rounded-[2px] ${
                  error ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-[#F4008A]'
                }`}
              />
              <p className="text-[12px] text-[#8D8D8D]">
                Must be at least 6 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-[4px]">
              <label htmlFor="confirmPassword" className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                placeholder="Confirm new password"
                required
                minLength={6}
                disabled={loading}
                className={`bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full rounded-[2px] ${
                  error ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-[#F4008A]'
                }`}
              />
              {error && (
                <p className="text-[12px] text-red-600 mt-1">{error}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="text-white text-[14px] font-medium uppercase tracking-[0.28px] px-[24px] py-[8px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed w-full rounded-[2px]"
              style={{
                background: 'linear-gradient(180deg, #464750 21.275%, #000000 100%)'
              }}
            >
              {loading ? 'RESETTING...' : 'Reset Password'}
            </button>
          </form>

          {/* Bottom Link */}
          <p className="text-[12px] leading-[1.3] font-normal capitalize text-center">
            <span className="text-black">Remember your password? </span>
            <Link href="/auth/login" className="text-[#F4008A] underline hover:no-underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
