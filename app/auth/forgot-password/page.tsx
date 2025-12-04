'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/request-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setEmailError(data.error || 'Failed to send PIN. Please try again.');
        setLoading(false);
        return;
      }

      // Success! Redirect to PIN verification page
      router.push(`/auth/verify-pin?email=${encodeURIComponent(email)}`);
    } catch (error) {
      setEmailError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-white flex flex-col items-center justify-center px-[133px] antialiased -mt-[32px]">
      <div className="w-full max-w-[1176px] flex flex-col items-center gap-[24px]">
        {/* Heading Section */}
        <div className="flex flex-col gap-[16px] w-[318.43px]">
          <div className="flex flex-col gap-[8px]">
            <h1 className="font-semibold text-[24px] leading-none text-black capitalize">
              Confirm Email
            </h1>
            <p className="font-normal text-[14px] leading-[16px] text-black">
              Enter your email address and we&apos;ll send you instructions to reset your password.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="w-[320px] flex flex-col gap-[16px]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
            {/* Email Input */}
            <div className="flex flex-col gap-[4px]">
              <label htmlFor="email" className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                }}
                placeholder="Muripress@gmail.com"
                pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                required
                disabled={loading}
                className={`bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full rounded-[2px] ${
                  emailError ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-[#F4008A]'
                }`}
              />
              {emailError && (
                <p className="text-[12px] text-red-600 mt-1">{emailError}</p>
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
              {loading ? 'SENDING...' : 'Send Reset Link'}
            </button>
          </form>

          {/* Bottom Link */}
          <p className="text-[12px] leading-[1.3] font-normal capitalize">
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
