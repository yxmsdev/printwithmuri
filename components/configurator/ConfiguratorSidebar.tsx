'use client';

import { ModelInfo } from '@/types';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { useBagStore, createBagItem } from '@/stores/useBagStore';

interface ConfiguratorSidebarProps {
  fileName: string;
  modelInfo: ModelInfo | null;
  onChangeFile: (file: File) => void;
  onAddToBag: () => void;
  onSaveAsDraft: () => void;
}

export default function ConfiguratorSidebar({
  fileName,
  modelInfo,
  onChangeFile,
  onAddToBag,
  onSaveAsDraft,
}: ConfiguratorSidebarProps) {
  const [quantity, setQuantity] = useState(1);
  const [quality, setQuality] = useState('Standard');
  const [material, setMaterial] = useState('PLA');
  const [selectedColor, setSelectedColor] = useState({ name: 'Blue', value: '#2842AD' });
  const [infillExpanded, setInfillExpanded] = useState(false);
  const [referenceExpanded, setReferenceExpanded] = useState(false);
  const [addedToBag, setAddedToBag] = useState(false);
  const [hasChanges, setHasChanges] = useState(true); // Track if user has made changes since last add
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const addItem = useBagStore((state) => state.addItem);
  const openBag = useBagStore((state) => state.openBag);

  const colors = [
    { name: 'Blue', value: '#2842AD' },
    { name: 'Pink', value: '#F4008A' },
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Red', value: '#FF0000' },
    { name: 'Green', value: '#00FF00' },
    { name: 'Yellow', value: '#FFD913' },
  ];

  // Mock price calculation (₦17,000 per unit from Figma)
  const pricePerUnit = 17000;
  const totalPrice = pricePerUnit * quantity;

  const incrementQuantity = () => {
    setQuantity(q => q + 1);
    setHasChanges(true);
  };
  const decrementQuantity = () => {
    setQuantity(q => Math.max(1, q - 1));
    setHasChanges(true);
  };

  const handleChangeClick = () => {
    fileInputRef.current?.click();
  };

  const handleAddToBag = () => {
    // Don't add if no changes have been made since last add
    if (!hasChanges) {
      // Just open the bag to show existing items
      openBag();
      return;
    }
    
    const bagItem = createBagItem(
      fileName,
      modelInfo,
      {
        quantity,
        quality,
        material,
        color: selectedColor.value,
      },
      pricePerUnit
    );
    
    addItem(bagItem);
    setAddedToBag(true);
    setHasChanges(false); // Reset changes flag after adding
    
    // Open the bag modal
    openBag();
    
    // Reset feedback after 2 seconds
    setTimeout(() => setAddedToBag(false), 2000);
    
    // Call the parent callback
    onAddToBag();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Reset quantity to 1 when changing model
      setQuantity(1);
      setHasChanges(true); // New file means changes to add
      onChangeFile(file);
    }
  };

  return (
    <div className="w-[313px] bg-white h-full flex flex-col">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".stl,.obj,.3mf,.fbx,.gltf"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* File name section */}
      <div className="bg-white p-4 flex items-center justify-between">
        <p className="text-[20px] font-medium text-[#1F1F1F] tracking-[0.15px]">
          {fileName}
        </p>
        <button
          onClick={handleChangeClick}
          className="text-[10px] font-medium text-[#7A7A7A] hover:text-[#1F1F1F]"
        >
          Change
        </button>
      </div>

      {/* Decorative color stripes - overlapping to create blended colors */}
      <div className="h-px relative w-full overflow-hidden" style={{ mixBlendMode: 'multiply' }}>
        <div className="absolute left-0 w-[28px] h-px bg-[#FFD913] opacity-80" />
        <div className="absolute left-[26px] w-[28px] h-px bg-[#CF2886] opacity-80" />
        <div className="absolute left-[52px] w-[28px] h-px bg-[#41D4EA] opacity-80" />
        <div className="absolute left-[78px] w-[28px] h-px bg-[#FFD913] opacity-80" />
        <div className="absolute left-[104px] w-[28px] h-px bg-[#CF2886] opacity-80" />
        <div className="absolute left-[130px] w-[28px] h-px bg-[#41D4EA] opacity-80" />
        <div className="absolute left-[156px] w-[28px] h-px bg-[#FFD913] opacity-80" />
        <div className="absolute left-[182px] w-[28px] h-px bg-[#CF2886] opacity-80" />
        <div className="absolute left-[208px] w-[28px] h-px bg-[#41D4EA] opacity-80" />
        <div className="absolute left-[234px] w-[28px] h-px bg-[#FFD913] opacity-80" />
        <div className="absolute left-[260px] w-[28px] h-px bg-[#CF2886] opacity-80" />
        <div className="absolute left-[286px] w-[28px] h-px bg-[#41D4EA] opacity-80" />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Quantity */}
        <div className="px-4 py-4 border-b border-[#E6E6E6] flex items-center justify-between">
          <div className="flex items-center gap-1">
            <label className="text-[14px] font-medium text-[#7A7A7A] capitalize leading-[12px]">Quantity</label>
            <Image src="/images/icons/info.svg" alt="" width={12} height={12} />
          </div>
          <div className="flex items-center gap-3 border-[0.75px] border-[#B7B7B7] rounded px-3 py-1">
            <button onClick={decrementQuantity} className="w-3 h-3">
              <Image src="/images/icons/plus.svg" alt="Decrease" width={8} height={2} className="w-3 h-auto" />
            </button>
            <input
              type="text"
              inputMode="numeric"
              value={quantity}
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty or numeric input
                if (value === '' || /^\d+$/.test(value)) {
                  const val = parseInt(value) || 0;
                  setQuantity(val < 1 ? 1 : val);
                  setHasChanges(true);
                }
              }}
              onBlur={(e) => {
                // Ensure minimum of 1 on blur
                if (!e.target.value || parseInt(e.target.value) < 1) {
                  setQuantity(1);
                }
              }}
              className="text-[15px] font-medium text-[#1F1F1F] tracking-[-0.15px] w-10 text-center leading-normal bg-transparent outline-none"
            />
            <button onClick={incrementQuantity} className="w-3 h-3">
              <Image src="/images/icons/minus.svg" alt="Increase" width={9} height={9} className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Quality */}
        <div className="px-4 py-4 border-b border-[#E6E6E6] flex items-center gap-3">
          <div className="flex items-center gap-1 w-[120px]">
            <label className="text-[14px] font-medium text-[#7A7A7A] capitalize leading-[12px]">Quality</label>
            <Image src="/images/icons/info.svg" alt="" width={12} height={12} />
          </div>
          <div className="relative flex-1">
            <select
              value={quality}
              onChange={(e) => { setQuality(e.target.value); setHasChanges(true); }}
              className="w-full bg-[#EFEFEF] px-2 py-1 rounded text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] appearance-none cursor-pointer leading-[25.2px] pr-7"
            >
              <option>Draft</option>
              <option>Standard</option>
              <option>High</option>
              <option>Ultra</option>
            </select>
            <Image
              src="/images/icons/dropdown.svg"
              alt=""
              width={10}
              height={6}
              className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
            />
          </div>
        </div>

        {/* Material */}
        <div className="px-4 py-4 border-b border-[#E6E6E6] flex items-center gap-3">
          <label className="text-[14px] font-medium text-[#7A7A7A] capitalize w-[120px] leading-[12px]">Material</label>
          <div className="relative flex-1">
            <select
              value={material}
              onChange={(e) => { setMaterial(e.target.value); setHasChanges(true); }}
              className="w-full bg-[#EFEFEF] px-2 py-1 rounded text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] appearance-none cursor-pointer leading-[25.2px] pr-7"
            >
              <option>PLA</option>
              <option>ABS</option>
              <option>PETG</option>
              <option>Resin</option>
            </select>
            <Image
              src="/images/icons/dropdown.svg"
              alt=""
              width={10}
              height={6}
              className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
            />
          </div>
        </div>

        {/* Color */}
        <div className="px-4 py-4 border-b border-[#E6E6E6] flex items-center gap-3">
          <label className="text-[14px] font-medium text-[#7A7A7A] capitalize w-[120px] leading-[12px]">Color</label>
          <div className="relative flex-1">
            <select
              value={selectedColor.name}
              onChange={(e) => {
                const color = colors.find(c => c.name === e.target.value);
                if (color) {
                  setSelectedColor(color);
                  setHasChanges(true);
                }
              }}
              className="w-full bg-[#EFEFEF] px-2 py-1 rounded text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] appearance-none cursor-pointer pl-7 pr-7 leading-[25.2px]"
            >
              {colors.map(color => (
                <option key={color.name} value={color.name}>
                  {color.name} {color.value}
                </option>
              ))}
            </select>
            <div
              className="absolute left-2 top-1/2 -translate-y-1/2 w-[12.24px] h-[12.24px] rounded-full"
              style={{ backgroundColor: selectedColor.value }}
            />
            <Image
              src="/images/icons/dropdown.svg"
              alt=""
              width={10}
              height={6}
              className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
            />
          </div>
        </div>

        {/* Infill Density - Expandable */}
        <div className="px-4 py-4 border-b border-[#E6E6E6] flex items-center justify-between">
          <div className="flex items-center gap-1">
            <label className="text-[14px] font-medium text-[#7A7A7A] capitalize leading-[12px]">Infill density</label>
            <Image src="/images/icons/info.svg" alt="" width={12} height={12} />
          </div>
          <button
            onClick={() => setInfillExpanded(!infillExpanded)}
            className="w-[14px] h-[14px] flex items-center justify-center"
          >
            <Image
              src="/images/icons/chevron.svg"
              alt=""
              width={11}
              height={11}
              className={`transition-transform ${infillExpanded ? 'rotate-45' : 'rotate-[270deg]'}`}
            />
          </button>
        </div>

        {/* Reference - Expandable */}
        <div className="px-4 py-4 border-b border-[#E6E6E6] flex items-center justify-between">
          <div className="flex items-center gap-1">
            <label className="text-[14px] font-medium text-[#7A7A7A] capitalize leading-[12px]">Reference</label>
            <Image src="/images/icons/info.svg" alt="" width={12} height={12} />
          </div>
          <button
            onClick={() => setReferenceExpanded(!referenceExpanded)}
            className="w-[14px] h-[14px] flex items-center justify-center"
          >
            <Image
              src="/images/icons/chevron.svg"
              alt=""
              width={11}
              height={11}
              className={`transition-transform ${referenceExpanded ? 'rotate-45' : 'rotate-[270deg]'}`}
            />
          </button>
        </div>
      </div>

      {/* Model Info & Actions Footer */}
      <div className="bg-white p-4 flex flex-col gap-4">
        {/* Model Info */}
        {modelInfo && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-1">
                <span className="text-[14px] text-[#8D8D8D] capitalize tracking-[0.28px]">Dimension(mm)</span>
                <Image src="/images/icons/dropdown-grey.svg" alt="" width={14} height={14} />
              </div>
              <span className="text-[14px] text-[#8D8D8D]">
                {modelInfo.dimensions.length.toFixed(0)}L × {modelInfo.dimensions.width.toFixed(0)}W × {modelInfo.dimensions.height.toFixed(0)}H
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-[14px] text-[#8D8D8D] capitalize tracking-[0.28px]">Weight</span>
              <span className="text-[14px] text-[#8D8D8D]">12g</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-[14px] font-semibold text-[#1F1F1F] capitalize tracking-[0.28px]">Cost</span>
              <span className="text-[14px] font-semibold text-[#1F1F1F] uppercase">₦{totalPrice.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleAddToBag}
            className="w-[207px] py-3 px-6 text-[14px] font-medium uppercase tracking-[0.28px] leading-[1.37] transition-all hover:opacity-90 text-white"
            style={{
              background: addedToBag 
                ? 'linear-gradient(to right, #22C55E 0%, #16A34A 100%)'
                : 'linear-gradient(to right, #1F1F1F 0%, #3a3a3a 100%)'
            }}
          >
            {addedToBag ? 'Added!' : 'Add to Bag'}
          </button>

          <button
            onClick={onSaveAsDraft}
            className="text-[10px] font-medium text-[#1F1F1F] uppercase tracking-[0.6px] underline hover:text-[#F4008A] transition-colors"
          >
            Save as Draft
          </button>
        </div>
      </div>
    </div>
  );
}
