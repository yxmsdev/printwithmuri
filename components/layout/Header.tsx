'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import ComingSoonContent from '@/components/layout/ComingSoonContent';
import BagModal from '@/components/bag/BagModal';
import { useBagStore } from '@/stores/useBagStore';
import { useDraftsStore } from '@/stores/useDraftsStore';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
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

  // Get user's name or email
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest User';

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
    closeBag(); // Close bag when opening coming soon modal
    setComingSoonType(type);
    setShowComingSoon(true);
  };

  const handleSignOut = async () => {
    closeBag(); // Close bag when signing out
    await signOut();
    setShowAccountMenu(false);
    router.push('/');
  };

  const handleSignIn = () => {
    closeBag(); // Close bag when navigating to sign in
    setShowAccountMenu(false);
    router.push('/auth/login');
  };

  const handle3DClick = (e: React.MouseEvent) => {
    closeBag(); // Close bag when navigating
    // If we're already on the home page, trigger a reset
    if (pathname === '/') {
      e.preventDefault();
      router.push('/?reset=' + Date.now());
    }
    // Otherwise, let the Link navigate normally
  };

  const handleDraftsClick = () => {
    closeBag(); // Close bag when navigating to drafts
  };

  const handleLogoClick = () => {
    closeBag(); // Close bag when clicking logo
  };

  return (
    <>
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40 h-[56px]">
        <div className="container mx-auto px-[115px] h-full flex items-center justify-between max-w-[1440px]">
          {/* Left: Service Navigation */}
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              onClick={handle3DClick}
              className="text-[#F4008A] font-medium text-[13px] uppercase hover:opacity-80 transition-opacity leading-[1.37]"
            >
              3D
            </Link>
            <button
              onClick={() => handleOpenComingSoon('paper')}
              className="text-[#8D8D8D] font-medium text-[13px] uppercase hover:text-[#1F1F1F] transition-colors leading-[1.37]"
            >
              PAPER
            </button>
            <button
              onClick={() => handleOpenComingSoon('merch')}
              className="text-[#8D8D8D] font-medium text-[13px] uppercase hover:text-[#1F1F1F] transition-colors leading-[1.37]"
            >
              MERCH
            </button>
          </nav>

          {/* Center: Logo */}
          <Link href="/" onClick={handleLogoClick} className="absolute left-1/2 -translate-x-1/2">
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
              onClick={handleDraftsClick}
              className="text-[#8D8D8D] font-medium text-[13px] uppercase hover:text-[#1F1F1F] transition-colors leading-[1.37]"
            >
              DRAFTS({draftCount})
            </Link>

            {/* Bag Button with Dropdown */}
            <div className="relative">
              <button
                onClick={() => showBag ? closeBag() : openBag()}
                className="text-[#8D8D8D] font-medium text-[13px] uppercase hover:text-[#1F1F1F] transition-colors leading-[1.37]"
              >
                BAG({bagCount})
              </button>
            </div>
            
            {/* Account Button with Dropdown */}
            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={() => {
                  closeBag(); // Close bag when opening account menu
                  setShowAccountMenu(!showAccountMenu);
                }}
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
                <div className="absolute right-0 top-full mt-2 bg-white rounded-[2px] shadow-[0px_8px_86.4px_0px_rgba(0,0,0,0.15)] p-1 z-50 min-w-[160px]">
                  {/* User Info */}
                  <div className="px-6 py-2 border-b border-[#B7B7B7]/50">
                    <p className="text-[14px] font-medium text-[#1F1F1F] text-center capitalize leading-none truncate max-w-[140px]">
                      {userName}
                    </p>
                    {!user && (
                      <p className="text-[10px] text-[#F4008A] text-center leading-[1.37] mt-1">
                        Sign in to save
                      </p>
                    )}
                    {user && user.email && (
                      <p className="text-[10px] text-[#7A7A7A] text-center leading-[1.37] mt-1 truncate max-w-[140px]">
                        {user.email}
                      </p>
                    )}
                  </div>

                  {user && (
                    <>
                      {/* My Orders */}
                      <Link
                        href="/orders"
                        onClick={() => {
                          closeBag();
                          setShowAccountMenu(false);
                        }}
                        className="block w-full px-3 py-2 rounded-[2px] text-[13px] font-medium text-black text-center capitalize hover:bg-[#E6E6E6] transition-colors mt-1"
                      >
                        My Orders
                      </Link>

                      {/* Support */}
                      <Link
                        href="/support"
                        onClick={() => {
                          closeBag();
                          setShowAccountMenu(false);
                        }}
                        className="block w-full px-3 py-2 text-[13px] font-medium text-[#1F1F1F] text-center capitalize hover:bg-[#E6E6E6] transition-colors"
                      >
                        Support
                      </Link>

                      {/* Log Out */}
                      <button
                        onClick={handleSignOut}
                        className="block w-full px-3 py-2 text-[13px] font-medium text-[#1F1F1F] text-center capitalize hover:bg-[#E6E6E6] transition-colors"
                      >
                        Log Out
                      </button>
                    </>
                  )}

                  {!user && (
                    <>
                      {/* Sign In */}
                      <button
                        onClick={handleSignIn}
                        className="block w-full px-3 py-2 text-[13px] font-medium text-[#1F1F1F] text-center capitalize hover:bg-[#E6E6E6] transition-colors mt-1"
                      >
                        Sign In
                      </button>

                      {/* Sign Up */}
                      <Link
                        href="/auth/signup"
                        onClick={() => {
                          closeBag();
                          setShowAccountMenu(false);
                        }}
                        className="block w-full px-3 py-2 text-[13px] font-medium text-[#F4008A] text-center capitalize hover:bg-[#E6E6E6] transition-colors"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
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
