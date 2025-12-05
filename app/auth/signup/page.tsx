'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import UserTypeSelector from '@/components/auth/UserTypeSelector';
import { professions, industries } from '@/lib/professions-industries';

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const { signUp, signInWithGoogle } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<'business' | 'creator'>('creator');
  const [profession, setProfession] = useState('');
  const [professionOther, setProfessionOther] = useState('');
  const [industry, setIndustry] = useState('');
  const [industryOther, setIndustryOther] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [surnameError, setSurnameError] = useState('');
  const [companyNameError, setCompanyNameError] = useState('');
  const [contactNameError, setContactNameError] = useState('');
  const [professionError, setProfessionError] = useState('');
  const [industryError, setIndustryError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      setEmailError(error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear all errors
    setFirstNameError('');
    setSurnameError('');
    setCompanyNameError('');
    setContactNameError('');
    setProfessionError('');
    setIndustryError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    // Validate fields
    let hasError = false;

    if (userType === 'creator') {
      if (!firstName.trim()) {
        setFirstNameError('First name is required');
        hasError = true;
      }

      if (!surname.trim()) {
        setSurnameError('Surname is required');
        hasError = true;
      }

      // Validate profession: only required if "Other" is selected but not specified
      if (profession === 'Other' && !professionOther.trim()) {
        setProfessionError('Please specify your profession');
        hasError = true;
      }
    } else {
      // Business validation
      if (!companyName.trim()) {
        setCompanyNameError('Company name is required');
        hasError = true;
      }

      if (!contactName.trim()) {
        setContactNameError('Contact name is required');
        hasError = true;
      }

      // Validate industry: only required if "Other" is selected but not specified
      if (industry === 'Other' && !industryOther.trim()) {
        setIndustryError('Please specify your industry');
        hasError = true;
      }
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasError = true;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    // For creator: use first name + surname
    // For business: use contact name (or company name as fallback)
    const fullName = userType === 'creator'
      ? `${firstName} ${surname}`.trim()
      : contactName.trim() || companyName.trim();

    // Determine final profession/industry values
    const finalProfession = profession === 'Other' ? professionOther : profession;
    const finalIndustry = industry === 'Other' ? industryOther : industry;

    const { error } = await signUp(
      email,
      password,
      fullName,
      userType,
      finalProfession || undefined,
      finalIndustry || undefined
    );

    if (error) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('email')) {
        setEmailError(error.message);
      } else if (errorMessage.includes('password')) {
        setPasswordError(error.message);
      } else {
        setEmailError(error.message);
      }
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-white flex items-center justify-center px-6 py-12 -mt-[32px]">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h1 className="text-[24px] font-semibold text-[#1F1F1F] mb-3">Check Your Email</h1>
            <p className="text-[14px] text-[#7A7A7A] mb-8">
              We&apos;ve sent a confirmation link to <strong>{email}</strong>.
              Click the link to verify your account and get started.
            </p>
            <Link
              href="/auth/login"
              className="rounded-[2px] inline-block px-8 py-3 text-[14px] font-medium uppercase tracking-[0.28px] text-white transition-all hover:opacity-90"
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
    <div className="min-h-[calc(100vh-72px)] bg-white flex flex-col items-center justify-center px-[133px] antialiased -mt-[32px] pt-[80px]">
      <div className="w-full max-w-[1176px] flex items-start justify-between gap-[68px]">
        {/* Left Side - Heading */}
        <div className="flex flex-col w-[318.43px]">
          <div className="flex flex-col gap-[16px]">
            <h1 className="font-semibold text-[48px] leading-none text-black capitalize">
              Sign Up
            </h1>
            <p className="font-normal text-[16px] leading-[1.3] text-black capitalize whitespace-nowrap">
              Create an account with Muri.
            </p>
          </div>
          <p className="text-[12px] leading-[1.3] font-normal mt-[16px]">
            <span className="text-black">Already have an account? </span>
            <Link href={`/auth/login${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} className="text-[#F4008A] underline hover:no-underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Right Side - Form */}
        <div className="w-[386px] flex flex-col gap-[40px]">
          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-[8px] bg-white border border-black rounded-[2px] px-[24px] py-[8px] text-[14px] font-medium text-[#1F1F1F] tracking-[0.28px] hover:bg-[#F6F6F6] transition-colors uppercase"
          >
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.20443C17.64 8.56625 17.5827 7.95262 17.4764 7.36353H9V10.8449H13.8436C13.635 11.9699 13.0009 12.9231 12.0477 13.5613V15.8194H14.9564C16.6582 14.2526 17.64 11.9453 17.64 9.20443Z" fill="#4285F4"/>
              <path d="M8.99976 18C11.4298 18 13.467 17.1941 14.9561 15.8195L12.0475 13.5613C11.2416 14.1013 10.2107 14.4204 8.99976 14.4204C6.65567 14.4204 4.67158 12.8372 3.96385 10.71H0.957031V13.0418C2.43794 15.9831 5.48158 18 8.99976 18Z" fill="#34A853"/>
              <path d="M3.96409 10.7098C3.78409 10.1698 3.68182 9.59301 3.68182 8.99983C3.68182 8.40665 3.78409 7.82983 3.96409 7.28983V4.95801H0.957273C0.347727 6.17301 0 7.54755 0 8.99983C0 10.4521 0.347727 11.8266 0.957273 13.0416L3.96409 10.7098Z" fill="#FBBC05"/>
              <path d="M8.99976 3.57955C10.3211 3.57955 11.5075 4.03364 12.4402 4.92545L15.0216 2.34409C13.4629 0.891818 11.4257 0 8.99976 0C5.48158 0 2.43794 2.01682 0.957031 4.95818L3.96385 7.29C4.67158 5.16273 6.65567 3.57955 8.99976 3.57955Z" fill="#EA4335"/>
            </svg>
            <span>Sign in with Google</span>
          </button>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
            {/* User Type Selector */}
            <UserTypeSelector value={userType} onChange={setUserType} />

            {/* Conditional Fields Based on User Type */}
            {userType === 'business' ? (
              <>
                {/* Company Name */}
                <div className="flex flex-col gap-[4px]">
                  <label htmlFor="companyName" className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
                    Company's Name
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      setCompanyNameError('');
                    }}
                    placeholder="TheWildOnes ltd"
                    required
                    disabled={loading}
                    className={`bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full rounded-[2px] ${
                      companyNameError ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-[#F4008A]'
                    }`}
                  />
                  {companyNameError && (
                    <p className="text-[12px] text-red-600 mt-1">{companyNameError}</p>
                  )}
                </div>

                {/* Contact Name */}
                <div className="flex flex-col gap-[4px]">
                  <label htmlFor="contactName" className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
                    Contact's name
                  </label>
                  <input
                    id="contactName"
                    type="text"
                    value={contactName}
                    onChange={(e) => {
                      setContactName(e.target.value);
                      setContactNameError('');
                    }}
                    placeholder="Muri Printa"
                    required
                    disabled={loading}
                    className={`bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full rounded-[2px] ${
                      contactNameError ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-[#F4008A]'
                    }`}
                  />
                  {contactNameError && (
                    <p className="text-[12px] text-red-600 mt-1">{contactNameError}</p>
                  )}
                </div>

                {/* Industry (Optional) */}
                <div className="flex flex-col gap-[4px]">
                  <label htmlFor="industry" className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
                    Industry <span className="text-[#B7B7B7]">(Optional)</span>
                  </label>
                  <div className="relative">
                    <select
                      id="industry"
                      value={industry}
                      onChange={(e) => {
                        setIndustry(e.target.value);
                        setIndustryError('');
                        if (e.target.value !== 'Other') {
                          setIndustryOther('');
                        }
                      }}
                      disabled={loading}
                      className={`bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full rounded-[2px] appearance-none cursor-pointer ${
                        industryError ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-[#F4008A]'
                      } ${!industry ? 'text-[#8D8D8D]' : ''}`}
                    >
                      <option value="">Select industry</option>
                      {industries.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                    <Image
                      src="/images/icons/dropdown.svg"
                      alt=""
                      width={10}
                      height={6}
                      className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    />
                  </div>
                  {industry === 'Other' && (
                    <input
                      type="text"
                      value={industryOther}
                      onChange={(e) => {
                        setIndustryOther(e.target.value);
                        setIndustryError('');
                      }}
                      placeholder="Please specify your industry"
                      disabled={loading}
                      className={`bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full rounded-[2px] mt-2 ${
                        industryError ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-[#F4008A]'
                      }`}
                    />
                  )}
                  {industryError && (
                    <p className="text-[12px] text-red-600 mt-1">{industryError}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* First Name */}
                <div className="flex flex-col gap-[4px]">
                  <label htmlFor="firstName" className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      setFirstNameError('');
                    }}
                    placeholder="Muri"
                    required
                    disabled={loading}
                    className={`bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full rounded-[2px] ${
                      firstNameError ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-[#F4008A]'
                    }`}
                  />
                  {firstNameError && (
                    <p className="text-[12px] text-red-600 mt-1">{firstNameError}</p>
                  )}
                </div>

                {/* Surname */}
                <div className="flex flex-col gap-[4px]">
                  <label htmlFor="surname" className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
                    Surname
                  </label>
                  <input
                    id="surname"
                    type="text"
                    value={surname}
                    onChange={(e) => {
                      setSurname(e.target.value);
                      setSurnameError('');
                    }}
                    placeholder="Printa"
                    required
                    disabled={loading}
                    className={`bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full rounded-[2px] ${
                      surnameError ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-[#F4008A]'
                    }`}
                  />
                  {surnameError && (
                    <p className="text-[12px] text-red-600 mt-1">{surnameError}</p>
                  )}
                </div>

                {/* Profession (Optional) */}
                <div className="flex flex-col gap-[4px]">
                  <label htmlFor="profession" className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
                    Profession <span className="text-[#B7B7B7]">(Optional)</span>
                  </label>
                  <div className="relative">
                    <select
                      id="profession"
                      value={profession}
                      onChange={(e) => {
                        setProfession(e.target.value);
                        setProfessionError('');
                        if (e.target.value !== 'Other') {
                          setProfessionOther('');
                        }
                      }}
                      disabled={loading}
                      className={`bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full rounded-[2px] appearance-none cursor-pointer ${
                        professionError ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-[#F4008A]'
                      } ${!profession ? 'text-[#8D8D8D]' : ''}`}
                    >
                      <option value="">Select profession</option>
                      {professions.map((prof) => (
                        <option key={prof} value={prof}>{prof}</option>
                      ))}
                    </select>
                    <Image
                      src="/images/icons/dropdown.svg"
                      alt=""
                      width={10}
                      height={6}
                      className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    />
                  </div>
                  {profession === 'Other' && (
                    <input
                      type="text"
                      value={professionOther}
                      onChange={(e) => {
                        setProfessionOther(e.target.value);
                        setProfessionError('');
                      }}
                      placeholder="Please specify your profession"
                      disabled={loading}
                      className={`bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full rounded-[2px] mt-2 ${
                        professionError ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-[#F4008A]'
                      }`}
                    />
                  )}
                  {professionError && (
                    <p className="text-[12px] text-red-600 mt-1">{professionError}</p>
                  )}
                </div>
              </>
            )}

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
                className={`bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full rounded-[2px] ${
                  emailError ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-[#F4008A]'
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
                className={`bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full rounded-[2px] ${
                  passwordError ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-[#F4008A]'
                }`}
              />
              {passwordError && (
                <p className="text-[12px] text-red-600 mt-1">{passwordError}</p>
              )}
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
                  setConfirmPasswordError('');
                }}
                placeholder="••••••••••••••"
                required
                disabled={loading}
                className={`bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full rounded-[2px] ${
                  confirmPasswordError ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-[#F4008A]'
                }`}
              />
              {confirmPasswordError && (
                <p className="text-[12px] text-red-600 mt-1">{confirmPasswordError}</p>
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
              {loading ? 'CREATING...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
