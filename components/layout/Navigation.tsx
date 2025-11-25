'use client';

import { usePathname } from 'next/navigation';

// Navigation utility component for handling active states
export const useActiveRoute = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return { isActive, pathname };
};

export default function Navigation() {
  // This is a utility component - actual navigation is in Header
  return null;
}
