'use client';

import Link from 'next/link';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import ComingSoonContent from '@/components/layout/ComingSoonContent';

const Header = () => {
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonType, setComingSoonType] = useState<'paper' | 'merch'>('paper');

  const handleOpenComingSoon = (type: 'paper' | 'merch') => {
    setComingSoonType(type);
    setShowComingSoon(true);
  };

  // Placeholder counts - will be connected to actual stores later
  const draftCount = 0;
  const bagCount = 0;

  return (
    <>
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Service Navigation */}
            <nav className="flex items-center gap-8">
              <Link
                href="/"
                className="text-primary font-bold text-lg hover:text-primary-hover transition-colors"
              >
                3D
              </Link>
              <button
                onClick={() => handleOpenComingSoon('paper')}
                className="text-dark font-bold text-lg hover:text-medium transition-colors"
              >
                PAPER
              </button>
              <button
                onClick={() => handleOpenComingSoon('merch')}
                className="text-dark font-bold text-lg hover:text-medium transition-colors"
              >
                MERCH
              </button>
            </nav>

            {/* Center: Logo */}
            <Link href="/" className="text-2xl font-bold text-dark hover:text-primary transition-colors">
              PRINT<span className="text-xs align-top text-medium">with</span>MURI
            </Link>

            {/* Right: User Actions */}
            <div className="flex items-center gap-6">
              <Link
                href="/drafts"
                className="text-dark font-medium hover:text-primary transition-colors"
              >
                DRAFTS({draftCount})
              </Link>
              <Link
                href="/bag"
                className="text-dark font-medium hover:text-primary transition-colors"
              >
                BAG({bagCount})
              </Link>
              {/* User menu will be added later */}
            </div>
          </div>
        </div>
      </header>

      {/* Coming Soon Modal */}
      <Modal
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
      >
        <ComingSoonContent type={comingSoonType} onClose={() => setShowComingSoon(false)} />
      </Modal>
    </>
  );
};

export default Header;
