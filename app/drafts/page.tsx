'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useDraftsStore } from '@/stores/useDraftsStore';
import { useBagStore, createBagItem } from '@/stores/useBagStore';
import { calculatePrice } from '@/lib/pricing';

export default function DraftsPage() {
  const drafts = useDraftsStore((state) => state.drafts);
  const removeDraft = useDraftsStore((state) => state.removeDraft);
  const addItem = useBagStore((state) => state.addItem);
  const openBag = useBagStore((state) => state.openBag);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get material icon based on material type
  const getMaterialIcon = (material: string) => {
    const materialLower = material.toLowerCase();
    const iconMap: Record<string, string> = {
      'pla': '/images/pla-icon.svg',
      'abs': '/images/abs-icon.svg',
      'petg': '/images/petg-icon.svg',
      'tpu': '/images/tpu-icon.svg',
      'resin': '/images/resin-icon.svg',
    };
    return iconMap[materialLower] || '/images/pla-icon.svg';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete draft "${name}"?`)) {
      removeDraft(id);
      setOpenDropdown(null);
    }
  };

  const handleAddToBag = (draft: typeof drafts[0]) => {
    if (!draft.modelInfo) {
      console.error('Cannot add to bag: model info not available');
      return;
    }

    const bagItem = createBagItem(
      draft.modelName,
      draft.modelInfo,
      {
        quantity: draft.config.quantity,
        quality: draft.config.quality,
        material: draft.config.material,
        color: draft.config.color,
        infillType: draft.config.infillType,
        infillDensity: draft.config.infillDensity,
      }
    );

    addItem(bagItem);
    removeDraft(draft.id);
    setOpenDropdown(null);
    openBag();
  };

  // Calculate price using real pricing logic
  const getPrice = (draft: typeof drafts[0]) => {
    if (!draft.modelInfo) return 0;

    const printConfig = {
      modelId: draft.id,
      quantity: draft.config.quantity,
      quality: draft.config.quality as any,
      material: draft.config.material as any,
      color: draft.config.color,
      infillType: draft.config.infillType as any,
      infillDensity: draft.config.infillDensity,
      designGuideImages: [],
    };

    try {
      const price = calculatePrice(printConfig, draft.modelInfo);
      return price.subtotal;
    } catch (e) {
      console.error('Error calculating price for draft:', e);
      return 0;
    }
  };

  // Empty state
  if (drafts.length === 0) {
    return (
      <div className="bg-white min-h-[calc(100vh-56px)]">
        <div className="mx-auto px-[115px] pt-[64px] pb-0 max-w-[1440px]">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex flex-col gap-3">
              <h1 className="text-[48px] font-semibold text-black leading-none">My Drafts</h1>
              <p className="text-[16px] font-normal text-[#8D8D8D]">0 drafts saved</p>
            </div>
            <Link
              href="/"
              className="px-6 py-[8px] rounded-[2px] text-[14px] font-medium tracking-[0.28px] text-white uppercase transition-all hover:opacity-90 btn-bounce"
              style={{
                background: 'linear-gradient(180deg, #464750 0%, #000000 100%)'
              }}
            >
              + New print
            </Link>
          </div>

          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-[#F5F5F5] rounded-full flex items-center justify-center mb-6 shadow-sm">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#B7B7B7" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <h2 className="text-[20px] font-medium text-[#1F1F1F] mb-2">No drafts yet</h2>
            <p className="text-[14px] text-[#7A7A7A] mb-8 text-center max-w-md">
              Save your print configurations as drafts to continue working on them later.
            </p>
            <Link
              href="/"
              className="px-8 py-[8px] rounded-[2px] text-[14px] font-medium tracking-[0.28px] text-white uppercase transition-all hover:opacity-90 btn-bounce"
              style={{
                background: 'linear-gradient(180deg, #464750 0%, #000000 100%)'
              }}
            >
              Start configuring
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-[calc(100vh-56px)]">
      <div className="mx-auto px-[115px] pt-[64px] pb-0 max-w-[1440px]">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex flex-col gap-3">
            <h1 className="text-[48px] font-semibold text-black leading-none">My Drafts</h1>
            <p className="text-[16px] font-normal text-[#8D8D8D]">
              {drafts.length} {drafts.length === 1 ? 'draft' : 'drafts'} saved
            </p>
          </div>
          <Link
            href="/"
            className="px-6 py-[8px] rounded-[2px] text-[14px] font-medium tracking-[0.28px] text-white uppercase transition-all hover:opacity-90 btn-bounce"
            style={{
              background: 'linear-gradient(180deg, #464750 0%, #000000 100%)'
            }}
          >
            + New print
          </Link>
        </div>

        {/* Table */}
        <div className="bg-[#b7b7b7] flex flex-col gap-[2px]">
          {/* Table Header */}
          <div className="bg-white px-0 py-[8px] flex items-center justify-center gap-[64px]">
            <p className="w-[240px] text-[16px] font-semibold text-[#1F1F1F] leading-[1.4]">Project</p>
            <p className="w-[80px] text-[16px] font-semibold text-[#1F1F1F] leading-[1.4]">Material</p>
            <p className="w-[80px] text-[16px] font-semibold text-[#1F1F1F] leading-[1.4]">Quantity</p>
            <p className="w-[80px] text-[16px] font-semibold text-[#1F1F1F] leading-[1.4]">Cost</p>
            <p className="w-[120px] text-[16px] font-semibold text-[#1F1F1F] leading-[1.4]">Date Created</p>
            <p className="w-[144px] text-[16px] font-semibold text-[#1F1F1F] leading-[1.4]">Action</p>
          </div>

          {/* Table Rows */}
          <div className="flex flex-col gap-px">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="bg-white px-[32px] py-[8px] flex items-center justify-center gap-[64px]"
              >
                {/* Project */}
                <div className="w-[240px] flex items-center gap-3">
                  <div className="w-[48px] h-[48px] flex items-center justify-center flex-shrink-0">
                    <Image
                      src={getMaterialIcon(draft.config.material)}
                      alt={draft.config.material}
                      width={32}
                      height={32}
                      className="object-contain"
                      unoptimized
                      onError={(e) => {
                        // Fallback to a default icon if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/pla-icon.svg';
                      }}
                    />
                  </div>
                  <p className="text-[16px] font-medium text-black truncate">
                    {draft.modelName}
                  </p>
                </div>

                {/* Material */}
                <p className="w-[80px] text-[16px] text-black leading-[1.4]">
                  {draft.config.material}
                </p>

                {/* Quantity */}
                <p className="w-[80px] text-[16px] text-black leading-[1.4]">
                  {draft.config.quantity}
                </p>

                {/* Cost */}
                <p className="w-[80px] text-[14px] text-[#1F1F1F] uppercase tracking-[0.28px] leading-[12px]">
                  ₦{getPrice(draft).toLocaleString()}
                </p>

                {/* Date Created */}
                <p className="w-[120px] text-[14px] text-[#1F1F1F] tracking-[0.28px] leading-[12px]">
                  {formatDate(draft.createdAt)}
                </p>

                {/* Action */}
                <div className="w-[144px] flex items-center gap-3 relative">
                  <Link
                    href={`/?draft=${draft.id}`}
                    className="px-6 py-[8px] rounded-[2px] text-[14px] font-medium text-[#1F1F1F] tracking-[0.28px] border border-[#464750] transition-all hover:text-white hover:border-transparent btn-bounce"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(180deg, #464750 0%, #000000 100%)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '';
                    }}
                  >
                    Resume
                  </Link>

                  {/* Three dots menu */}
                  <div className="relative" ref={openDropdown === draft.id ? dropdownRef : null}>
                    <button
                      onClick={() => setOpenDropdown(openDropdown === draft.id ? null : draft.id)}
                      className="text-[#B7B7B7] hover:text-[#1F1F1F] transition-colors p-1 btn-bounce"
                      title="More options"
                    >
                      <svg width="20" height="4" viewBox="0 0 20 4" fill="currentColor">
                        <circle cx="2" cy="2" r="2" />
                        <circle cx="10" cy="2" r="2" />
                        <circle cx="18" cy="2" r="2" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {openDropdown === draft.id && (
                      <div className="absolute right-0 top-full mt-2 bg-white rounded-[2px] shadow-[0px_8px_86.4px_0px_rgba(0,0,0,0.15)] p-1 z-50 min-w-[148px]">
                        <button
                          onClick={() => handleAddToBag(draft)}
                          className="w-full px-8 py-[8px] rounded-[2px] text-[14px] font-medium text-black text-center hover:bg-[#E6E6E6] transition-colors btn-bounce"
                        >
                          Add to bag
                        </button>
                        <button
                          onClick={() => handleDelete(draft.id, draft.modelName)}
                          className="w-full px-8 py-[8px] text-[14px] font-medium text-[#FF3333] text-center hover:bg-[#FFF5F5] transition-colors mt-2 btn-bounce"
                        >
                          Delete draft
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
