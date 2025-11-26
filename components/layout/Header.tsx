'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import ComingSoonContent from '@/components/layout/ComingSoonContent';
import BagModal from '@/components/bag/BagModal';
import { useBagStore } from '@/stores/useBagStore';

const Header = () => {
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonType, setComingSoonType] = useState<'paper' | 'merch'>('paper');
  
  // Get bag state from store
  const bagItems = useBagStore((state) => state.items);
  const showBag = useBagStore((state) => state.isOpen);
  const openBag = useBagStore((state) => state.openBag);
  const closeBag = useBagStore((state) => state.closeBag);
  const bagCount = bagItems.reduce((total, item) => total + item.config.quantity, 0);

  const handleOpenComingSoon = (type: 'paper' | 'merch') => {
    setComingSoonType(type);
    setShowComingSoon(true);
  };

  // Placeholder count for drafts - will be connected to actual store later
  const draftCount = 0;

  return (
    <>
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40 h-[56px]">
        <div className="container mx-auto px-[115px] h-full flex items-center justify-between max-w-[1440px]">
          {/* Left: Service Navigation */}
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="text-[#F4008A] font-medium text-[13px] uppercase hover:opacity-80 transition-opacity leading-[1.37]"
            >
              3D
            </Link>
            <button
              onClick={() => handleOpenComingSoon('paper')}
              className="text-[#B7B7B7] font-medium text-[13px] uppercase hover:text-[#1F1F1F] transition-colors leading-[1.37]"
            >
              PAPER
            </button>
            <button
              onClick={() => handleOpenComingSoon('merch')}
              className="text-[#B7B7B7] font-medium text-[13px] uppercase hover:text-[#1F1F1F] transition-colors leading-[1.37]"
            >
              MERCH
            </button>
          </nav>

          {/* Center: Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <Image
              src="/images/logo.svg"
              alt="Print with Muri"
              width={81}
              height={33}
              priority
            />
          </Link>

          {/* Right: User Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/drafts"
              className="text-[#1F1F1F] font-medium text-[13px] uppercase hover:text-[#F4008A] transition-colors leading-[1.37]"
            >
              DRAFTS({draftCount})
            </Link>
            
            {/* Bag Button with Dropdown */}
            <div className="relative">
              <button
                onClick={() => showBag ? closeBag() : openBag()}
                className="text-[#1F1F1F] font-medium text-[13px] uppercase hover:text-[#F4008A] transition-colors leading-[1.37]"
              >
                BAG({bagCount})
              </button>
            </div>
            
            <button className="w-6 h-6 hover:opacity-80 transition-opacity">
              <Image
                src="/images/account-icon.svg"
                alt="Account"
                width={24}
                height={24}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Bag Dropdown - positioned below header */}
      {showBag && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-30" 
            onClick={closeBag}
          />
          
          {/* Dropdown Panel */}
          <div className="fixed top-[56px] right-[115px] w-[380px] bg-white shadow-xl border border-[#E6E6E6] z-50">
            <div className="p-4 border-b border-[#E6E6E6]">
              <h2 className="text-[16px] font-medium text-[#1F1F1F]">Your Bag</h2>
            </div>
            <div className="p-4">
              <BagModal onClose={closeBag} />
            </div>
          </div>
        </>
      )}

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
