'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useNewsletterStore } from '@/stores/useNewsletterStore';
import { useLandingStore } from '@/stores/useLandingStore';
import NewsletterSection from './NewsletterSection';

const Footer = () => {
  const { user } = useAuth();
  const hasSubmittedNewsletter = useNewsletterStore((state) => state.hasSubmittedNewsletter);
  const isLandingPage = useLandingStore((state) => state.isLandingPage);

  // Show newsletter section only if:
  // 1. User is NOT logged in
  // 2. User has NOT already submitted the newsletter form
  // 3. NOT on the landing page (landing page shows video → footer line directly)
  const showNewsletter = !user && !hasSubmittedNewsletter && !isLandingPage;

  return (
    <footer className="bg-white mt-auto">
      {/* Colorful Top Border - Repeating Pattern - Always show at top */}
      <div className="relative h-[3px] overflow-hidden">
        <div className="absolute inset-0 flex">
          {/* Repeat the pattern multiple times to fill width */}
          {[...Array(12)].map((_, i) => (
            <div key={i} className="flex flex-none">
              <div className="w-[130.781px] h-[3px] bg-[#FFD913]" />
              <div className="w-[130.421px] h-[3px] bg-[#CF2886]" />
              <div className="w-[130.781px] h-[3px] bg-[#41D4EA]" />
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Section - Conditionally rendered */}
      {showNewsletter && <NewsletterSection />}

      {/* Footer Content */}
      <div className="bg-[#F6F6F6] h-[64px]">
        <div className="max-w-[1440px] mx-auto h-full">
          <div className="h-full flex items-center justify-between px-[115px] relative">
            {/* Left Side - Copyright */}
            <p className="text-[12px] font-medium text-[#1F1F1F] tracking-[0.24px]">
              © 2025 · TheWildOnes LTD
            </p>

            {/* Center - Legal Links */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-[24px] text-[12px] font-medium text-[#1F1F1F] uppercase tracking-[0.24px]">
              <Link href="/legal" className="hover:text-[#F4008A] transition-colors">
                Legal
              </Link>
              <Link href="/contact" className="hover:text-[#F4008A] transition-colors">
                Contact
              </Link>
              <Link href="/support" className="hover:text-[#F4008A] transition-colors">
                Support
              </Link>
            </div>

            {/* Right Side - Social Media Icons */}
            <div className="flex items-center gap-[15px]">
              {/* TikTok */}
              <Link
                href="https://tiktok.com/@muripress"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1F1F1F] hover:text-[#F4008A] transition-colors"
                aria-label="TikTok"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M16.59 5.69a4.83 4.83 0 0 1-3.77-4.25V1h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.3 0 .59.04.88.13V8.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 2 19.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4c-.35 0-.69-.04-1-.1z"
                    fill="currentColor"
                  />
                </svg>
              </Link>

              {/* Instagram */}
              <Link
                href="https://instagram.com/muripress"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1F1F1F] hover:text-[#F4008A] transition-colors"
                aria-label="Instagram"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 1.8c2.67 0 2.987.01 4.042.059 2.71.123 3.976 1.409 4.099 4.099.048 1.054.059 1.371.059 4.042 0 2.67-.01 2.987-.059 4.042-.124 2.687-1.387 3.976-4.1 4.099-1.054.048-1.37.059-4.041.059-2.67 0-2.987-.01-4.042-.059-2.717-.124-3.976-1.416-4.1-4.1-.048-1.054-.058-1.37-.058-4.041 0-2.67.01-2.986.059-4.042.123-2.687 1.387-3.975 4.1-4.099 1.054-.048 1.37-.058 4.041-.058zM10 0C7.284 0 6.944.012 5.877.06 2.246.227.228 2.242.06 5.877.012 6.944 0 7.284 0 10s.012 3.057.06 4.123c.167 3.632 2.182 5.65 5.817 5.817C6.944 19.988 7.284 20 10 20s3.057-.012 4.123-.06c3.629-.167 5.652-2.182 5.816-5.817.05-1.066.061-1.406.061-4.123s-.012-3.056-.06-4.122C19.773 2.242 17.755.228 14.123.06 13.056.012 12.716 0 10 0zm0 4.865a5.135 5.135 0 1 0 0 10.27 5.135 5.135 0 0 0 0-10.27zM10 13.333A3.333 3.333 0 1 1 10 6.667a3.333 3.333 0 0 1 0 6.666zm5.338-9.805a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z" />
                </svg>
              </Link>

              {/* X (Twitter) */}
              <Link
                href="https://twitter.com/muripress"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1F1F1F] hover:text-[#F4008A] transition-colors"
                aria-label="X (Twitter)"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15.203 1.875h2.757l-6.023 6.883 7.085 9.367h-5.546l-4.345-5.681-4.975 5.681H1.4l6.443-7.363L1.25 1.875h5.688l3.926 5.193 4.34-5.193zm-.968 14.6h1.528L6.32 3.44H4.68l9.555 12.635z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
