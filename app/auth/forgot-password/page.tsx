'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await resetPassword(email);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#EDEDED] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h1 className="text-[24px] font-semibold text-[#1F1F1F] mb-3">Check Your Email</h1>
            <p className="text-[14px] text-[#7A7A7A] mb-8">
              We&apos;ve sent password reset instructions to <strong>{email}</strong>.
              Click the link in the email to reset your password.
            </p>
            <Link
              href="/auth/login"
              className="inline-block px-8 py-3 text-[14px] font-medium uppercase tracking-[0.28px] text-white transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(to right, #1F1F1F 0%, #3a3a3a 100%)'
              }}
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#EDEDED] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 shadow-sm">
          <h1 className="text-[28px] font-semibold text-[#1F1F1F] mb-2">Forgot Password?</h1>
          <p className="text-[14px] text-[#7A7A7A] mb-8">
            Enter your email address and we&apos;ll send you instructions to reset your password.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-[14px] text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-[14px] font-medium text-[#1F1F1F] mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[#E6E6E6] text-[14px] text-[#1F1F1F] focus:outline-none focus:border-[#F4008A]"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-[14px] font-medium uppercase tracking-[0.28px] text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{
                background: 'linear-gradient(to right, #1F1F1F 0%, #3a3a3a 100%)'
              }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <p className="mt-6 text-center text-[14px] text-[#7A7A7A]">
            Remember your password?{' '}
            <Link href="/auth/login" className="text-[#F4008A] hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
