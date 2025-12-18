'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    console.log('🔘 Google Sign-In button clicked');
    try {
      const result = await signInWithGoogle();
      console.log('🔄 signInWithGoogle result:', result);
      const { error } = result;
      if (error) {
        console.error('❌ Google Sign-In error:', error);
        setEmailError(error.message);
      }
    } catch (e) {
      console.error('💥 Exception in handleGoogleSignIn:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      // Determine which field has the error
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('email') || errorMessage.includes('invalid login')) {
        setEmailError('Invalid email or password');
      } else if (errorMessage.includes('password')) {
        setPasswordError(error.message);
      } else {
        setEmailError(error.message);
      }
      setLoading(false);
    } else {
      router.push(redirectTo);
      router.refresh();
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-white flex flex-col items-center justify-center px-[133px] antialiased -mt-[32px]">
      <div className="w-full max-w-[1176px] flex items-start justify-between gap-[68px]">
        {/* Left Side - Heading */}
        <div className="flex flex-col w-[318.43px]">
          <div className="flex flex-col gap-[16px]">
            <h1 className="font-semibold text-[48px] leading-none text-black capitalize">
              Sign In
            </h1>
            <p className="font-normal text-[16px] leading-[1.3] text-black capitalize whitespace-nowrap">
              Welcome back to Muri.
            </p>
          </div>
          <p className="text-[12px] leading-[1.3] font-normal mt-[16px]">
            <span className="text-black">Don't have an account? </span>
            <Link href={`/auth/signup${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} className="text-[#F4008A] underline hover:no-underline">
              Sign up
            </Link>
          </p>
        </div>

        {/* Right Side - Form */}
        <div className="w-[386px] flex flex-col gap-[40px]">
          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-[8px] bg-white border border-black rounded-[2px] px-8 py-[8px] text-[14px] font-medium text-[#1F1F1F] tracking-[0.28px] hover:bg-[#F6F6F6] transition-colors uppercase"
          >
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.20443C17.64 8.56625 17.5827 7.95262 17.4764 7.36353H9V10.8449H13.8436C13.635 11.9699 13.0009 12.9231 12.0477 13.5613V15.8194H14.9564C16.6582 14.2526 17.64 11.9453 17.64 9.20443Z" fill="#4285F4" />
              <path d="M8.99976 18C11.4298 18 13.467 17.1941 14.9561 15.8195L12.0475 13.5613C11.2416 14.1013 10.2107 14.4204 8.99976 14.4204C6.65567 14.4204 4.67158 12.8372 3.96385 10.71H0.957031V13.0418C2.43794 15.9831 5.48158 18 8.99976 18Z" fill="#34A853" />
              <path d="M3.96409 10.7098C3.78409 10.1698 3.68182 9.59301 3.68182 8.99983C3.68182 8.40665 3.78409 7.82983 3.96409 7.28983V4.95801H0.957273C0.347727 6.17301 0 7.54755 0 8.99983C0 10.4521 0.347727 11.8266 0.957273 13.0416L3.96409 10.7098Z" fill="#FBBC05" />
              <path d="M8.99976 3.57955C10.3211 3.57955 11.5075 4.03364 12.4402 4.92545L15.0216 2.34409C13.4629 0.891818 11.4257 0 8.99976 0C5.48158 0 2.43794 2.01682 0.957031 4.95818L3.96385 7.29C4.67158 5.16273 6.65567 3.57955 8.99976 3.57955Z" fill="#EA4335" />
            </svg>
            <span>Sign in with Google</span>
          </button>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
            {/* Email */}
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
                className={`bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full rounded-[2px] ${emailError ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-[#F4008A]'
                  }`}
              />
              {emailError && (
                <p className="text-[12px] text-red-600 mt-1">{emailError}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-[4px]">
              <label htmlFor="password" className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                placeholder="••••••••••••••"
                required
                disabled={loading}
                className={`bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full rounded-[2px] ${passwordError ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-[#F4008A]'
                  }`}
              />
              {passwordError && (
                <p className="text-[12px] text-red-600 mt-1">{passwordError}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-start">
              <Link
                href="/auth/forgot-password"
                className="text-[12px] text-[#F4008A] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="text-white text-[14px] font-medium tracking-[0.28px] px-8 py-[8px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed w-full rounded-[2px]"
              style={{
                background: 'linear-gradient(180deg, #464750 21.275%, #000000 100%)'
              }}
            >
              {loading ? 'SIGNING IN...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
