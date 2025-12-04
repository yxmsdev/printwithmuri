'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ProfileSidebarProps {
  activeTab: 'personal' | 'delivery';
  setActiveTab: (tab: 'personal' | 'delivery') => void;
  userType: 'business' | 'creator';
}

export default function ProfileSidebar({ activeTab, setActiveTab, userType }: ProfileSidebarProps) {
  const [bouncePersonal, setBouncePersonal] = useState(false);
  const [bounceDelivery, setBounceDelivery] = useState(false);
  const prevTabRef = useRef(activeTab);

  useEffect(() => {
    if (prevTabRef.current !== activeTab) {
      // Trigger bounce when line reaches button (synced with 500ms animation)
      const timer = setTimeout(() => {
        if (activeTab === 'personal') {
          setBouncePersonal(true);
          setTimeout(() => setBouncePersonal(false), 150);
        } else {
          setBounceDelivery(true);
          setTimeout(() => setBounceDelivery(false), 150);
        }
      }, 480);
      
      prevTabRef.current = activeTab;
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col gap-[12px] w-[134px] shrink-0 mt-[56px]">
      {/* Personal/Company Details Button */}
      <div className="relative overflow-visible">
        {/* Line - extends from left, retracts to left */}
        <div 
          className="absolute h-[5px] bg-[#FFDAEF] top-1/2"
          style={{ 
            right: '100%',
            width: '100vw',
            transform: `translateY(-50%) scaleX(${activeTab === 'personal' ? 1 : 0})`,
            transformOrigin: 'left center',
            transition: 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
        <button
          onClick={() => setActiveTab('personal')}
          className={`w-full px-[12px] py-[8px] rounded-[2px] text-[14px] font-semibold tracking-[-0.28px] leading-none text-left whitespace-nowrap transition-colors duration-150 ${
            activeTab === 'personal'
              ? 'bg-[#FFDAEF] text-[#F4008A]'
              : 'text-[#8D8D8D] font-medium'
          }`}
          style={{
            transform: bouncePersonal ? 'scale(1.02)' : 'scale(1)',
            transition: 'transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            transformOrigin: 'center center'
          }}
        >
          {userType === 'business' ? 'Company Details' : 'Personal Details'}
        </button>
      </div>

      {/* Delivery Details Button */}
      <div className="relative overflow-visible">
        {/* Line - extends from left, retracts to left */}
        <div 
          className="absolute h-[5px] bg-[#FFDAEF] top-1/2"
          style={{ 
            right: '100%',
            width: '100vw',
            transform: `translateY(-50%) scaleX(${activeTab === 'delivery' ? 1 : 0})`,
            transformOrigin: 'left center',
            transition: 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
        <button
          onClick={() => setActiveTab('delivery')}
          className={`w-full px-[12px] py-[8px] rounded-[2px] text-[14px] font-medium tracking-[-0.28px] leading-none text-left transition-colors duration-150 ${
            activeTab === 'delivery'
              ? 'bg-[#FFDAEF] text-[#F4008A] font-semibold'
              : 'text-[#8D8D8D]'
          }`}
          style={{
            transform: bounceDelivery ? 'scale(1.02)' : 'scale(1)',
            transition: 'transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            transformOrigin: 'center center'
          }}
        >
          Delivery Details
        </button>
      </div>
    </div>
  );
}

