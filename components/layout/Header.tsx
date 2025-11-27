'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import ComingSoonContent from '@/components/layout/ComingSoonContent';
import BagModal from '@/components/bag/BagModal';
import { useBagStore } from '@/stores/useBagStore';
import { useDraftsStore } from '@/stores/useDraftsStore';

const Header = () => {
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonType, setComingSoonType] = useState<'paper' | 'merch'>('paper');
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  
  // Get bag state from store
  const bagItems = useBagStore((state) => state.items);
  const showBag = useBagStore((state) => state.isOpen);
  const openBag = useBagStore((state) => state.openBag);
  const closeBag = useBagStore((state) => state.closeBag);
  const bagCount = bagItems.reduce((total, item) => total + item.config.quantity, 0);

  // Get drafts count
  const drafts = useDraftsStore((state) => state.drafts);
  const draftCount = drafts.length;

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenComingSoon = (type: 'paper' | 'merch') => {
    setComingSoonType(type);
    setShowComingSoon(true);
  };

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
            
            {/* Account Button with Dropdown */}
            <div className="relative" ref={accountMenuRef}>
              <button 
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="w-8 h-8 hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/images/account-icon.svg"
                  alt="Account"
                  width={32}
                  height={32}
                />
              </button>

              {/* Account Dropdown Menu */}
              {showAccountMenu && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-[4px] shadow-[0px_8px_86.4px_0px_rgba(0,0,0,0.15)] p-1 z-50 min-w-[160px]">
                  {/* User Info */}
                  <div className="px-6 py-2 border-b border-[#B7B7B7]/50">
                    <p className="text-[14px] font-medium text-[#1F1F1F] text-center capitalize leading-none">
                      Guest User
                    </p>
                    <p className="text-[10px] text-[#F4008A] text-center leading-[1.37] mt-1">
                      Sign in to save
                    </p>
                  </div>

                  {/* My Orders */}
                  <Link
                    href="/orders"
                    onClick={() => setShowAccountMenu(false)}
                    className="block w-full px-3 py-2 rounded-[2px] text-[13px] font-medium text-black text-center capitalize hover:bg-[#E6E6E6] transition-colors mt-1"
                  >
                    My Orders
                  </Link>

                  {/* Edit Profile */}
                  <button
                    onClick={() => {
                      setShowAccountMenu(false);
                      alert('Edit Profile coming soon!');
                    }}
                    className="block w-full px-3 py-2 text-[13px] font-medium text-[#1F1F1F] text-center capitalize hover:bg-[#E6E6E6] transition-colors"
                  >
                    Edit Profile
                  </button>

                  {/* Support */}
                  <Link
                    href="/support"
                    onClick={() => setShowAccountMenu(false)}
                    className="block w-full px-3 py-2 text-[13px] font-medium text-[#1F1F1F] text-center capitalize hover:bg-[#E6E6E6] transition-colors"
                  >
                    Support
                  </Link>

                  {/* Log Out / Sign In */}
                  <button
                    onClick={() => {
                      setShowAccountMenu(false);
                      alert('Login coming soon!');
                    }}
                    className="block w-full px-3 py-2 text-[13px] font-medium text-[#1F1F1F] text-center capitalize hover:bg-[#E6E6E6] transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
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
