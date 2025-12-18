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
import { useProfileImageStore } from '@/stores/useProfileImageStore';
import { useAuth } from '@/contexts/AuthContext';
import { useLandingStore } from '@/stores/useLandingStore';

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const isLandingPage = useLandingStore((state) => state.isLandingPage);
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

  // Get profile image from store
  const profileImage = useProfileImageStore((state) => state.profileImage);

  // Get user's name or email
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest User';

  // Get user type from metadata (defaults to 'creator')
  const userType = (user?.user_metadata?.user_type as 'business' | 'creator') || 'creator';

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
    e.preventDefault();
    // Always go to the 3D uploader screen
    router.push('/?uploader=' + Date.now());
  };

  const handleDraftsClick = () => {
    closeBag(); // Close bag when navigating to drafts
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    closeBag(); // Close bag when clicking logo
    e.preventDefault();
    // Go to landing page (reset to hero)
    router.push('/?landing=' + Date.now());
  };

  // Determine if we should use transparent header (only on landing page at root path)
  const useTransparentHeader = pathname === '/' && isLandingPage;

  return (
    <>
      <header className={`top-0 z-40 h-[56px] transition-colors ${useTransparentHeader ? 'absolute w-full bg-black/40' : 'bg-white sticky'}`}>
        <div className="container mx-auto px-[115px] h-full flex items-center justify-between max-w-[1440px] relative">
          {/* Left: Service Navigation */}
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              onClick={handle3DClick}
              className={`font-medium text-[14px] uppercase transition-colors leading-[1.37] ${
                useTransparentHeader
                  ? 'text-white/80 hover:text-white'
                  : pathname === '/' ? 'text-[#F4008A]' : 'text-[#8D8D8D] hover:text-[#1F1F1F]'
              }`}
            >
              3D
            </Link>
            <Link
              href="/paper"
              onClick={closeBag}
              className={`font-medium text-[14px] uppercase transition-colors leading-[1.37] ${
                useTransparentHeader
                  ? 'text-white/80 hover:text-white'
                  : pathname === '/paper' ? 'text-[#F4008A]' : 'text-[#8D8D8D] hover:text-[#1F1F1F]'
              }`}
            >
              PAPER
            </Link>
            <Link
              href="/merch"
              onClick={closeBag}
              className={`font-medium text-[14px] uppercase transition-colors leading-[1.37] ${
                useTransparentHeader
                  ? 'text-white/80 hover:text-white'
                  : pathname === '/merch' ? 'text-[#F4008A]' : 'text-[#8D8D8D] hover:text-[#1F1F1F]'
              }`}
            >
              MERCH
            </Link>
          </nav>

          {/* Center: Logo */}
          <Link href="/" onClick={handleLogoClick} className="absolute left-1/2 -translate-x-1/2">
            <Image
              src="/images/Muri_Beta.svg"
              alt="Print with Muri"
              width={81}
              height={33}
              priority
              className={useTransparentHeader ? 'brightness-125' : ''}
            />
          </Link>

          {/* Right: User Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/drafts"
                  onClick={handleDraftsClick}
                  className="text-[#8D8D8D] font-medium text-[14px] uppercase hover:text-[#1F1F1F] transition-colors leading-[1.37]"
                >
                  DRAFTS({draftCount})
                </Link>

                {/* Bag Button with Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => showBag ? closeBag() : openBag()}
                    className="text-[#8D8D8D] font-medium text-[14px] uppercase hover:text-[#1F1F1F] transition-colors leading-[1.37]"
                  >
                    BAG({bagCount})
                  </button>
                </div>

                {/* Account Button with Dropdown */}
                <div className="relative" ref={accountMenuRef}>
                  <button
                    onClick={() => {
                      closeBag();
                      setShowAccountMenu(!showAccountMenu);
                    }}
                    className="w-[26px] h-[26px] rounded-[2px] flex items-center justify-center hover:opacity-90 transition-opacity overflow-hidden"
                  >
                    <Image
                      src={profileImage || (userType === 'business' ? '/images/Company_profile.svg' : '/images/Account profile.svg')}
                      alt="Account"
                      width={26}
                      height={26}
                      className="w-[26px] h-[26px] object-cover"
                    />
                  </button>

                  {/* Account Dropdown Menu */}
                  {showAccountMenu && (
                    <div className="fixed right-[115px] top-[56px] bg-white rounded-[2px] shadow-xl border border-[#E6E6E6] p-1 z-50 min-w-[160px]">
                      {/* User Info */}
                      <div className="px-6 py-2 border-b border-[#B7B7B7]/50">
                        <p className="text-[14px] font-medium text-[#1F1F1F] text-center capitalize leading-none truncate max-w-[140px]">
                          {userName}
                        </p>
                        {user.email && (
                          <p className="text-[10px] text-[#7A7A7A] text-center leading-[1.37] mt-1 truncate max-w-[140px]">
                            {user.email}
                          </p>
                        )}
                      </div>

                      {/* Preferences */}
                      <Link
                        href="/profile"
                        onClick={() => {
                          closeBag();
                          setShowAccountMenu(false);
                        }}
                        className="block w-full px-3 py-2 rounded-[2px] text-[14px] font-medium text-black text-center capitalize hover:bg-[#E6E6E6] transition-colors mt-1"
                      >
                        Preferences
                      </Link>

                      {/* My Orders */}
                      <Link
                        href="/orders"
                        onClick={() => {
                          closeBag();
                          setShowAccountMenu(false);
                        }}
                        className="block w-full px-3 py-2 rounded-[2px] text-[14px] font-medium text-black text-center capitalize hover:bg-[#E6E6E6] transition-colors"
                      >
                        My Orders
                      </Link>

                      {/* Support */}
                      <Link
                        href="/legal"
                        onClick={() => {
                          closeBag();
                          setShowAccountMenu(false);
                        }}
                        className="block w-full px-3 py-2 text-[14px] font-medium text-[#1F1F1F] text-center capitalize hover:bg-[#E6E6E6] transition-colors"
                      >
                        Support
                      </Link>

                      {/* Log Out */}
                      <button
                        onClick={handleSignOut}
                        className="block w-full px-3 py-2 text-[14px] font-medium text-[#1F1F1F] text-center capitalize hover:bg-[#E6E6E6] transition-colors"
                      >
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Log In Button */}
                <Link
                  href="/auth/login"
                  className={`px-[24px] py-[8px] text-[14px] font-normal tracking-[0.28px] rounded-[2px] transition-colors ${
                    useTransparentHeader
                      ? 'text-white hover:bg-white/10'
                      : 'text-[#1F1F1F] hover:bg-[#F5F5F5]'
                  }`}
                  style={{
                    boxShadow: useTransparentHeader
                      ? 'inset 0 0 0 1px rgba(255,255,255,0.5)'
                      : 'inset 0 0 0 1px #B7B7B7',
                  }}
                >
                  Log In
                </Link>

                {/* Sign Up Button */}
                <Link
                  href="/auth/signup"
                  className={`px-6 py-2 text-[14px] font-normal tracking-[0.28px] rounded-[2px] transition-all ${
                    useTransparentHeader
                      ? 'text-white hover:bg-white/10'
                      : 'text-white hover:opacity-90'
                  }`}
                  style={useTransparentHeader
                    ? { boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.5)' }
                    : { background: 'linear-gradient(180deg, #464750 0%, #000000 100%)' }
                  }
                >
                  Sign Up
                </Link>
              </>
            )}
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
            <div className="p-4 border-b border-[#E6E6E6] flex items-center justify-between">
              <h2 className="text-[16px] font-medium text-[#1F1F1F]">Your Bag</h2>
              <span className="text-[14px] text-[#7A7A7A]">
                {bagItems.length} {bagItems.length === 1 ? 'item' : 'items'}
              </span>
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
