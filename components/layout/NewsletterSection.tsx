'use client';

import { useState } from 'react';
import { useNewsletterStore } from '@/stores/useNewsletterStore';

export default function NewsletterSection() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markAsSubmitted = useNewsletterStore((state) => state.markAsSubmitted);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Split full name into first and last name
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      // Success - mark as submitted and show success message
      markAsSubmitted();
      setShowSuccess(true);

      // Reset form
      setFullName('');
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe');
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="bg-white py-12">
        <div className="max-w-[1344px] mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-[20px] font-medium text-[#1F1F1F] mb-2">
              You're subscribed!
            </h3>
            <p className="text-[14px] text-[#8D8D8D]">
              Thanks for joining the Muri Press newsletter. We'll keep you updated with the latest prints, tips, and exclusive offers.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-12">
      <div className="max-w-[1344px] mx-auto px-6">
        <div className="flex items-start justify-between gap-12">
          {/* Left Side - Heading */}
          <div className="flex flex-col gap-[10px] w-[552px]">
            <h2 className="font-semibold text-[32px] leading-[1.24] tracking-[-1.28px] text-[#1F1F1F] uppercase">
              SUBSCRIBE TO<br /><span className="text-[#F4008A]">MURI'S </span>NEWSLETTER
            </h2>
            <p className="text-[14px] leading-[24px] text-[#8D8D8D]">
              Subscribe to get updates on all our latest products & offerings.
            </p>
          </div>

          {/* Right Side - Form */}
          <div className="flex flex-col gap-[32px] flex-1 max-w-[386px]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
              {/* Full Name Input */}
              <div className="flex flex-col gap-[4px]">
                <label className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8] capitalize">
                  First and last name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Murikas Johnson"
                  required
                  disabled={isLoading}
                  className="bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none focus:ring-1 focus:ring-[#F4008A] disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-[2px]"
                />
              </div>

              {/* Email Input */}
              <div className="flex flex-col gap-[4px]">
                <label className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8] capitalize">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Muripress@gmail.com"
                  required
                  disabled={isLoading}
                  className="bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none focus:ring-1 focus:ring-[#F4008A] disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-[2px]"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="bg-black text-white text-[14px] font-medium uppercase tracking-[0.28px] px-[24px] py-[12px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed w-fit"
              >
                {isLoading ? 'SUBSCRIBING...' : 'SUBSCRIBE!'}
              </button>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-[12px] bg-red-50 px-4 py-2">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
