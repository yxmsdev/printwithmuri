'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useDraftsStore } from '@/stores/useDraftsStore';
import { useBagStore, createBagItem } from '@/stores/useBagStore';

export default function DraftsPage() {
  const drafts = useDraftsStore((state) => state.drafts);
  const removeDraft = useDraftsStore((state) => state.removeDraft);
  const addItem = useBagStore((state) => state.addItem);
  const openBag = useBagStore((state) => state.openBag);
  
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    const bagItem = createBagItem(
      draft.modelName,
      draft.modelInfo,
      {
        quantity: draft.config.quantity,
        quality: draft.config.quality,
        material: draft.config.material,
        color: draft.config.color,
      },
      17000
    );
    
    addItem(bagItem);
    removeDraft(draft.id);
    setOpenDropdown(null);
    openBag();
  };

  // Mock price calculation
  const calculatePrice = (quantity: number) => {
    return 17000 * quantity;
  };

  // Empty state
  if (drafts.length === 0) {
    return (
      <div className="bg-[#EDEDED]">
        <div className="container mx-auto px-6 py-14 pb-20 max-w-[1128px]">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex flex-col gap-3">
              <h1 className="text-[42px] font-semibold text-black leading-none">My Drafts</h1>
              <p className="text-[16px] font-semibold text-[#8D8D8D]">0 drafts saved</p>
            </div>
            <Link
              href="/"
              className="px-6 py-3 text-[14px] font-medium uppercase tracking-[0.28px] text-white transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(to right, #1F1F1F 0%, #3a3a3a 100%)'
              }}
            >
              + New Print
            </Link>
          </div>

          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
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
              className="px-8 py-3 text-[14px] font-medium uppercase tracking-[0.28px] text-white transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(to right, #1F1F1F 0%, #3a3a3a 100%)'
              }}
            >
              Start Configuring
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#EDEDED]">
      <div className="container mx-auto px-6 py-14 pb-20 max-w-[1128px]">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex flex-col gap-3">
            <h1 className="text-[42px] font-semibold text-black leading-none">My Drafts</h1>
            <p className="text-[16px] font-semibold text-[#8D8D8D]">
              {drafts.length} {drafts.length === 1 ? 'draft' : 'drafts'} saved
            </p>
          </div>
          <Link
            href="/"
            className="px-6 py-3 text-[14px] font-medium uppercase tracking-[0.28px] text-white transition-all hover:opacity-90"
            style={{
              background: 'linear-gradient(to right, #1F1F1F 0%, #3a3a3a 100%)'
            }}
          >
            + New Print
          </Link>
        </div>

        {/* Table */}
        <div className="flex flex-col gap-1">
          {/* Table Header */}
          <div className="bg-white px-8 py-2 flex items-center gap-16">
            <p className="w-[240px] text-[14px] text-black leading-[1.4]">Project</p>
            <p className="w-[80px] text-[14px] text-black text-center leading-[1.4]">Material</p>
            <p className="w-[80px] text-[14px] text-black text-center leading-[1.4]">Quantity</p>
            <p className="w-[80px] text-[14px] text-black text-center leading-[1.4]">Cost</p>
            <p className="w-[120px] text-[14px] text-black text-center leading-[1.4]">Date Created</p>
            <p className="w-[120px] text-[14px] text-black text-center leading-[1.4]">Action</p>
          </div>

          {/* Table Rows */}
          <div className="flex flex-col gap-[2px]">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="bg-white px-8 py-2 flex items-center gap-16"
              >
                {/* Project */}
                <div className="w-[240px] flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#FAFAFA] rounded flex items-center justify-center flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.5">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                  </div>
                  <p className="text-[16px] font-medium text-black truncate">
                    {draft.modelName}
                  </p>
                </div>

                {/* Material */}
                <p className="w-[80px] text-[16px] text-black text-center leading-[1.4]">
                  {draft.config.material}
                </p>

                {/* Quantity */}
                <p className="w-[80px] text-[16px] text-black text-center leading-[1.4]">
                  {draft.config.quantity}
                </p>

                {/* Cost */}
                <p className="w-[80px] text-[14px] text-[#1F1F1F] text-center uppercase tracking-[0.28px]">
                  ₦{calculatePrice(draft.config.quantity).toLocaleString()}
                </p>

                {/* Date Created */}
                <p className="w-[120px] text-[14px] text-[#1F1F1F] text-center uppercase tracking-[0.28px]">
                  {formatDate(draft.createdAt)}
                </p>

                {/* Action */}
                <div className="w-[120px] flex items-center justify-center gap-3 relative">
                  <Link
                    href={`/?draft=${draft.id}`}
                    className="px-6 py-3 text-[14px] font-medium text-[#1F1F1F] uppercase tracking-[0.28px] border border-[#464750] hover:bg-[#1F1F1F] hover:text-white transition-all"
                  >
                    Resume
                  </Link>
                  
                  {/* Three dots menu */}
                  <div className="relative" ref={openDropdown === draft.id ? dropdownRef : null}>
                    <button
                      onClick={() => setOpenDropdown(openDropdown === draft.id ? null : draft.id)}
                      className="text-[#B7B7B7] hover:text-[#1F1F1F] transition-colors p-1"
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
                      <div className="absolute right-0 top-full mt-2 bg-white rounded-[4px] shadow-[0px_8px_86.4px_0px_rgba(0,0,0,0.15)] p-1 z-50 min-w-[148px]">
                        <button
                          onClick={() => handleAddToBag(draft)}
                          className="w-full px-8 py-2 rounded-[2px] text-[13px] font-medium text-black text-center capitalize hover:bg-[#E6E6E6] transition-colors"
                        >
                          Add to Bag
                        </button>
                        <button
                          onClick={() => handleDelete(draft.id, draft.modelName)}
                          className="w-full px-8 py-2 text-[13px] font-medium text-[#FF3333] text-center capitalize hover:bg-[#FFF5F5] transition-colors mt-2"
                        >
                          Delete Draft
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
