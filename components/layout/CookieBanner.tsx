'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check if user has already accepted cookies
        const hasAccepted = localStorage.getItem('muri_cookie_consent');
        if (!hasAccepted) {
            // Show banner after a short delay
            const timer = setTimeout(() => {
                setShowBanner(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('muri_cookie_consent', 'true');
        setShowBanner(false);
    };

    const handleDecline = () => {
        localStorage.setItem('muri_cookie_consent', 'declined');
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-white border-t border-[#E6E6E6] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="container mx-auto max-w-[1440px] flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                <div className="flex-1">
                    <p className="text-[14px] text-[#1F1F1F] leading-[1.5]">
                        We use cookies to enhance your experience. by continuing to visit this site you agree to our use of cookies. For more information, please visit our{' '}
                        <Link href="/legal" className="text-[#F4008A] hover:underline font-medium">
                            Cookie Policy
                        </Link>.
                    </p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button
                        onClick={handleDecline}
                        className="w-full md:w-auto text-[#1F1F1F] text-[14px] font-medium px-6 py-2 rounded-[2px] border border-[#E6E6E6] hover:bg-[#F6F6F6] transition-colors whitespace-nowrap"
                    >
                        Decline
                    </button>
                    <button
                        onClick={handleAccept}
                        className="w-full md:w-auto text-white text-[14px] font-medium px-8 py-[8px] rounded-[2px] transition-opacity hover:opacity-90 whitespace-nowrap"
                        style={{
                            background: 'linear-gradient(180deg, #464750 21.275%, #000000 100%)'
                        }}
                    >
                        Accept cookies
                    </button>
                </div>
            </div>
        </div>
    );
}
