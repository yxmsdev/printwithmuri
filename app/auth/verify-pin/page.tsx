'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyPinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromParams = searchParams.get('email') || '';

  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds

  // Refs for input fields
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Focus first input on mount
  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  // Redirect if no email provided
  useEffect(() => {
    if (!emailFromParams) {
      router.push('/auth/forgot-password');
    }
  }, [emailFromParams, router]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setError('PIN expired. Please request a new one.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePinChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }

    // Handle paste
    if (e.key === 'v' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, '').slice(0, 6);
        if (digits.length === 6) {
          setPin(digits.split(''));
          inputRefs[5].current?.focus();
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const pinCode = pin.join('');

    // Validate PIN is complete
    if (pinCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailFromParams,
          pin: pinCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle remaining attempts
        if (data.remainingAttempts !== undefined) {
          setRemainingAttempts(data.remainingAttempts);
        }

        if (data.maxAttemptsReached) {
          setError('Maximum attempts reached. Redirecting to request a new PIN...');
          setTimeout(() => {
            router.push('/auth/forgot-password');
          }, 2000);
        } else {
          setError(data.error || 'Invalid PIN code');
        }

        // Clear PIN inputs on error
        setPin(['', '', '', '', '', '']);
        inputRefs[0].current?.focus();
        return;
      }

      // Success! Redirect to reset password page with token
      router.push(`/auth/reset-password?token=${data.resetToken}&email=${data.email}`);

    } catch (error) {
      setError('Something went wrong. Please try again.');
      console.error('Verify PIN error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendPin = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/request-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailFromParams }),
      });

      if (response.ok) {
        setPin(['', '', '', '', '', '']);
        setRemainingAttempts(null);
        setError('');
        setTimeRemaining(600); // Reset timer to 10 minutes
        // Show success message
        alert('A new PIN has been sent to your email');
        inputRefs[0].current?.focus();
      } else {
        setError('Failed to resend PIN. Please try again.');
      }
    } catch (error) {
      setError('Failed to resend PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-white flex flex-col items-center justify-center px-[133px] antialiased -mt-[32px]">
      <div className="w-full max-w-[1176px] flex flex-col items-center gap-[24px]">
        {/* Heading Section */}
        <div className="flex flex-col gap-[16px] w-[386px]">
          <div className="flex flex-col gap-[8px]">
            <h1 className="font-semibold text-[24px] leading-none text-black capitalize">
              Enter PIN Code
            </h1>
            <p className="font-normal text-[14px] leading-[16px] text-black">
              We've sent a 6-digit PIN to <strong>{emailFromParams}</strong>
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="w-[386px] flex flex-col gap-[16px]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-[24px]">
            {/* PIN Input */}
            <div className="flex flex-col gap-[4px]">
              <label className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
                PIN Code
              </label>
              <div className="flex gap-2">
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-[58px] h-14 text-center text-[24px] font-semibold bg-[#EFEFEF] rounded-[2px] focus:outline-none focus:ring-1 transition-all ${
                      error ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-[#F4008A]'
                    }`}
                    disabled={loading}
                  />
                ))}
              </div>
              <div className="flex justify-between items-start mt-1">
                <div className="flex-1">
                  {error && (
                    <p className="text-[12px] text-red-600">{error}</p>
                  )}
                  {remainingAttempts !== null && remainingAttempts > 0 && (
                    <p className="text-[12px] text-red-500 mt-1">
                      {remainingAttempts} {remainingAttempts === 1 ? 'attempt' : 'attempts'} remaining
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className={`text-[12px] font-medium ${timeRemaining <= 60 ? 'text-red-600' : 'text-[#8D8D8D]'}`}>
                    {formatTime(timeRemaining)}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || pin.join('').length !== 6}
              className="text-white text-[14px] font-medium uppercase tracking-[0.28px] px-[24px] py-[8px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed w-full rounded-[2px]"
              style={{
                background: 'linear-gradient(180deg, #464750 21.275%, #000000 100%)'
              }}
            >
              {loading ? 'VERIFYING...' : 'Verify PIN'}
            </button>
          </form>

          {/* Bottom Links */}
          <div className="flex flex-col gap-[8px]">
            <button
              onClick={handleResendPin}
              disabled={loading}
              className="text-[12px] text-[#F4008A] hover:underline font-medium disabled:opacity-50 text-center"
            >
              Didn't receive the code? Resend PIN
            </button>

            <p className="text-[12px] leading-[1.3] font-normal capitalize text-center">
              <span className="text-black">Remember your password? </span>
              <Link href="/auth/login" className="text-[#F4008A] underline hover:no-underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
