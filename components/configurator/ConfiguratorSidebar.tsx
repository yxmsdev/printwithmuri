'use client';

import { ModelInfo, PrintConfig, PriceBreakdown, SlicerQuoteResponse, FileUploadResponse } from '@/types';
import { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import Image from 'next/image';
import { useBagStore, createBagItem } from '@/stores/useBagStore';
import { calculatePrice } from '@/lib/pricing';

export interface ConfigState {
  quantity: number;
  quality: string;
  material: string;
  color: string;
  infillType: string;
  infillDensity: number;
  instructions: string;
}

export interface ConfiguratorSidebarRef {
  getConfig: () => ConfigState;
}

interface ConfiguratorSidebarProps {
  fileName: string;
  file: File | null;
  modelInfo: ModelInfo | null;
  onChangeFile: (file: File) => void;
  onAddToBag: () => void;
  onSaveAsDraft: () => void;
  initialConfig?: Partial<ConfigState>;
  initialSliceResults?: SlicerQuoteResponse | null;
  initialFileId?: string | null;
}

const ConfiguratorSidebar = forwardRef<ConfiguratorSidebarRef, ConfiguratorSidebarProps>(({
  fileName,
  file,
  modelInfo,
  onChangeFile,
  onAddToBag,
  onSaveAsDraft,
  initialConfig,
  initialSliceResults,
  initialFileId,
}, ref) => {
  const [quantity, setQuantity] = useState(initialConfig?.quantity ?? 1);
  const [quality, setQuality] = useState(initialConfig?.quality ?? 'Standard');
  const [material, setMaterial] = useState(initialConfig?.material ?? 'PLA');
  
  const colors = [
    { name: 'Blue', value: '#2842AD' },
    { name: 'Pink', value: '#F4008A' },
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Red', value: '#FF0000' },
    { name: 'Green', value: '#00FF00' },
    { name: 'Yellow', value: '#FFD913' },
  ];
  
  const initialColor = initialConfig?.color 
    ? colors.find(c => c.value === initialConfig.color) || colors[0]
    : colors[0];
  
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [infillExpanded, setInfillExpanded] = useState(false);
  const [infillType, setInfillType] = useState(initialConfig?.infillType ?? 'Honeycomb');
  const [infillDensity, setInfillDensity] = useState(initialConfig?.infillDensity ?? 25);
  const [isSliderDragging, setIsSliderDragging] = useState(false);
  const [referenceExpanded, setReferenceExpanded] = useState(false);
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [isDraggingRef, setIsDraggingRef] = useState(false);
  const [instructionsExpanded, setInstructionsExpanded] = useState(initialConfig?.instructions ? true : false);
  const [instructions, setInstructions] = useState(initialConfig?.instructions ?? '');
  const [addedToBag, setAddedToBag] = useState(false);
  const [hasChanges, setHasChanges] = useState(true); // Track if user has made changes since last add
  const [dimensionUnit, setDimensionUnit] = useState<'mm' | 'cm' | 'in'>('mm');
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const referenceInputRef = useRef<HTMLInputElement>(null);

  // Two-phase architecture state
  const [fileId, setFileId] = useState<string | null>(initialFileId ?? null);
  const [hasUnsavedSettings, setHasUnsavedSettings] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSlicing, setIsSlicing] = useState(false);
  const uploadXhrRef = useRef<XMLHttpRequest | null>(null);
  const sliceXhrRef = useRef<XMLHttpRequest | null>(null);
  
  const addItem = useBagStore((state) => state.addItem);
  const openBag = useBagStore((state) => state.openBag);

  // Initialize fileId from initial fileId (from FileUpload)
  useEffect(() => {
    if (initialFileId) {
      console.log('📁 Initializing fileId from props:', initialFileId);
      setFileId(initialFileId);
    }
  }, [initialFileId]);

  // Initialize price breakdown from initial slice results (from FileUpload)
  useEffect(() => {
    if (initialSliceResults?.success && initialSliceResults.quote) {
      const quote = initialSliceResults.quote;
      console.log('📊 Initializing price from initial slice results:', quote);
      
      const initialPricing: PriceBreakdown = {
        estimatedWeight: quote.estimatedWeight,
        printTime: quote.printTime,
        machineCost: quote.machineCost,
        materialCost: quote.materialCost,
        setupFee: quote.setupFee,
        itemTotal: quote.itemTotal,
        quantity: quantity,
        subtotal: quote.itemTotal * quantity,
        quoteId: quote.quote_id,
        gcodeFile: quote.gcode_file,
        layerCount: quote.layerCount,
        source: 'server-sliced',
      };
      
      setPriceBreakdown(initialPricing);
      setHasUnsavedSettings(false);
    }
  }, [initialSliceResults]);

  // Expose getConfig method via ref
  useImperativeHandle(ref, () => ({
    getConfig: () => ({
      quantity,
      quality,
      material,
      color: selectedColor.value,
      infillType,
      infillDensity,
      instructions,
    }),
  }));

  // Convert dimensions based on selected unit
  const convertDimension = (mmValue: number): string => {
    switch (dimensionUnit) {
      case 'cm':
        return (mmValue / 10).toFixed(1);
      case 'in':
        return (mmValue / 25.4).toFixed(2);
      default:
        return mmValue.toFixed(0);
    }
  };

  // Manual slice function - called when user clicks "Slice Model" or "Re-slice Model"
  const handleSliceModel = async (providedFileId?: string) => {
    console.log('🔍 handleSliceModel called with:', { providedFileId, stateFileId: fileId });
    const fileIdToUse = providedFileId || fileId;

    if (!fileIdToUse) {
      console.error('Cannot slice: no fileId available', { providedFileId, stateFileId: fileId });
      setPriceError('File not uploaded');
      return;
    }

    console.log('🎯 Manual slice triggered with fileId:', fileIdToUse);
    setIsSlicing(true);
    setPriceError(null);

    try {
      const formData = new FormData();
      formData.append('fileId', fileIdToUse);
      formData.append('quality', quality.toLowerCase());
      formData.append('material', material);
      formData.append('infillDensity', infillDensity.toString());
      formData.append('infillType', infillType.toLowerCase());

      console.log('📤 Sending slice request with data:', {
        fileId: fileIdToUse,
        quality: quality.toLowerCase(),
        material,
        infillDensity: infillDensity.toString(),
        infillType: infillType.toLowerCase()
      });

      const data: SlicerQuoteResponse = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        sliceXhrRef.current = xhr;

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const responseData = JSON.parse(xhr.responseText);
              console.log('✅ Slice complete:', responseData);
              resolve(responseData);
            } catch (error) {
              reject(new Error('Failed to parse response'));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              console.error('❌ Slicing failed:', errorData);
              reject(new Error(errorData.error || 'Failed to slice model'));
            } catch {
              reject(new Error(`Request failed with status ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error during slice')));
        xhr.addEventListener('timeout', () => reject(new Error('Slice timeout')));

        xhr.timeout = 300000; // 5 minutes
        xhr.open('POST', '/api/slicer/slice');
        xhr.send(formData);
      });

      // Update pricing with slice results
      const slicedPricing: PriceBreakdown = {
        estimatedWeight: data.quote.estimatedWeight,
        printTime: data.quote.printTime,
        machineCost: data.quote.machineCost,
        materialCost: data.quote.materialCost,
        setupFee: data.quote.setupFee,
        itemTotal: data.quote.itemTotal,
        quantity: quantity,
        subtotal: data.quote.itemTotal * quantity,
        quoteId: data.quote.quote_id,
        gcodeFile: data.quote.gcode_file,
        layerCount: data.quote.layerCount,
        source: 'server-sliced',
      };
      setPriceBreakdown(slicedPricing);
      setHasUnsavedSettings(false);
    } catch (error) {
      console.error('❌ Slice error:', error);
      setPriceError(error instanceof Error ? error.message : 'Failed to slice model');
      setPriceBreakdown(null);
    } finally {
      setIsSlicing(false);
    }
  };

  const totalPrice = priceBreakdown?.subtotal || 0;

  const incrementQuantity = () => {
    setQuantity(q => q + 1);
    setHasChanges(true);
    // Quantity change doesn't require re-slicing, just recalculates subtotal
    if (priceBreakdown) {
      setPriceBreakdown({
        ...priceBreakdown,
        quantity: quantity + 1,
        subtotal: priceBreakdown.itemTotal * (quantity + 1),
      });
    }
  };

  const decrementQuantity = () => {
    const newQuantity = Math.max(1, quantity - 1);
    setQuantity(newQuantity);
    setHasChanges(true);
    // Quantity change doesn't require re-slicing, just recalculates subtotal
    if (priceBreakdown) {
      setPriceBreakdown({
        ...priceBreakdown,
        quantity: newQuantity,
        subtotal: priceBreakdown.itemTotal * newQuantity,
      });
    }
  };

  // Called when user changes settings that require re-slicing
  const handleSettingsChange = () => {
    setHasUnsavedSettings(true);
    setPriceBreakdown(null); // Clear price per user's request
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

    if (!modelInfo) {
      console.error('Cannot add to bag: model info not available');
      return;
    }

    if (!priceBreakdown) {
      console.error('Cannot add to bag: pricing not available');
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
        infillType,
        infillDensity,
      },
      priceBreakdown  // Pass the Cloud Slicer pricing data
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset state for new file
    setQuantity(1);
    setHasChanges(true);
    setIsUploading(true);
    setUploadProgress(0);
    setUploadedBytes(0);
    setTotalBytes(0);
    setPriceError(null);
    setPriceBreakdown(null);

    console.log('📤 Starting Phase 1: Upload file');

    try {
      // Phase 1: Upload file to server
      const formData = new FormData();
      formData.append('file', file);

      const uploadData: FileUploadResponse = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        uploadXhrRef.current = xhr;

        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            setUploadedBytes(event.loaded);
            setTotalBytes(event.total);
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
            console.log(`📤 Upload: ${percentComplete}%`);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const responseData = JSON.parse(xhr.responseText);
              console.log('✅ Upload complete:', responseData);
              resolve(responseData);
            } catch (error) {
              reject(new Error('Failed to parse response'));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              console.error('❌ Upload failed:', errorData);
              reject(new Error(errorData.error || 'Failed to upload file'));
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
        xhr.addEventListener('timeout', () => reject(new Error('Upload timeout')));

        xhr.timeout = 120000; // 2 minutes
        xhr.open('POST', '/api/slicer/upload');
        xhr.send(formData);
      });

      // Store fileId for future slicing requests
      console.log('📦 Upload response data:', uploadData);
      console.log('📝 Extracting fileId:', uploadData.fileId);
      setFileId(uploadData.fileId);
      setIsUploading(false);

      // Notify parent to update the file
      onChangeFile(file);

      console.log('✅ Phase 1 complete. File ID:', uploadData.fileId);
      console.log('🎯 Starting Phase 2: Auto-slice with default settings');

      // Phase 2: Auto-slice with current settings (pass fileId directly to avoid race condition)
      await handleSliceModel(uploadData.fileId);

    } catch (err) {
      console.error('❌ Upload error:', err);
      setPriceError(err instanceof Error ? err.message : 'Upload failed');
      setIsUploading(false);
    }
  };

  const handleReferenceFiles = (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );
    if (validFiles.length > 0) {
      setReferenceFiles(prev => [...prev, ...validFiles]);
      setHasChanges(true);
    }
  };

  const handleReferenceDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingRef(false);
    handleReferenceFiles(e.dataTransfer.files);
  };

  const removeReferenceFile = (index: number) => {
    setReferenceFiles(prev => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  return (
    <div className="w-[328px] bg-white flex flex-col max-h-[calc(100vh-72px)]">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".stl,.obj,.3mf,.fbx,.gltf"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* File name section - Fixed at top */}
      <div className="bg-white p-4 flex flex-col gap-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <p className="text-[20px] font-medium text-[#1F1F1F] tracking-[0.15px]">
            {fileName}
          </p>
          <button
            onClick={handleChangeClick}
            disabled={isUploading || isSlicing}
            className="text-[10px] font-medium text-[#7A7A7A] hover:text-[#1F1F1F] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Change
          </button>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="flex flex-col gap-1">
            <p className="text-[12px] font-medium text-[#B7B7B7] leading-none">
              {(uploadedBytes / 1024).toFixed(0)}kb of {(totalBytes / 1024 / 1024).toFixed(0)}mb
            </p>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <div className="relative h-[8px] bg-[#E6E6E6] rounded-[2px] overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full rounded-[2px] transition-all duration-300"
                    style={{
                      width: `${uploadProgress}%`,
                      background: 'linear-gradient(155deg, #34E5FF -2.79%, #0098C7 93.92%)'
                    }}
                  />
                </div>
              </div>
              <p className="text-[12px] font-medium text-[#3D3D3D] leading-none">
                {uploadProgress}%
              </p>
            </div>
          </div>
        )}

        {/* Slicing Status */}
        {isSlicing && !isUploading && (
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-solid border-[#1F1F1F] border-r-transparent"></span>
            <p className="text-[12px] font-medium text-[#1F1F1F]">Slicing model...</p>
          </div>
        )}
      </div>

      {/* Decorative color stripes - Fixed below title */}
      <div className="h-px relative w-full overflow-hidden flex-shrink-0" style={{ mixBlendMode: 'multiply' }}>
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
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Quantity */}
        <div className="px-4 py-4 border-b border-[#E6E6E6] flex items-center justify-between">
          <div className="flex items-center gap-1">
            <label className="text-[14px] font-medium text-[#7A7A7A] capitalize leading-[12px]">Quantity</label>
            <Image src="/images/icons/info.svg" alt="" width={12} height={12} />
          </div>
          <div className="flex items-center gap-3 border-[0.75px] border-[#B7B7B7] rounded-[2px] px-3 py-1">
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
              onChange={(e) => { setQuality(e.target.value); handleSettingsChange(); }}
              className="w-full bg-[#EFEFEF] px-2 py-1 rounded-[2px] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] appearance-none cursor-pointer leading-[25.2px] pr-7"
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
              onChange={(e) => { setMaterial(e.target.value); handleSettingsChange(); }}
              className="w-full bg-[#EFEFEF] px-2 py-1 rounded-[2px] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] appearance-none cursor-pointer leading-[25.2px] pr-7"
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
              className="w-full bg-[#EFEFEF] px-2 py-1 rounded-[2px] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] appearance-none cursor-pointer pl-7 pr-7 leading-[25.2px]"
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
        <div className={`px-4 py-4 border-b border-[#E6E6E6] flex flex-col gap-3 ${infillExpanded ? '' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <label className="text-[14px] font-medium text-[#7A7A7A] capitalize leading-[12px]">Infill Density</label>
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

          {/* Expanded Content */}
          {infillExpanded && (
            <div 
              className="flex flex-col gap-4"
              style={{
                animation: 'expandContent 0.3s ease-out forwards'
              }}
            >
              {/* Infill Type Dropdown */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
                  Infill Type
                </label>
                <div className="relative">
                  <select
                    value={infillType}
                    onChange={(e) => { setInfillType(e.target.value); handleSettingsChange(); }}
                    className="w-full bg-[#EFEFEF] px-2 py-1 text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] appearance-none cursor-pointer leading-[1.8] pr-7"
                  >
                    <option>Cubic</option>
                    <option>Gyroid</option>
                    <option>Honeycomb</option>
                    <option>Rectilinear</option>
                    <option>Grid</option>
                    <option>Line</option>
                    <option>Triangles</option>
                    <option>Concentric</option>
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

              {/* Infill Density Slider */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
                  Infill Density
                </label>
                <div className="flex justify-between text-[10px] font-light text-[#8D8D8D] tracking-[-0.2px]">
                  <span>Low</span>
                  <span>High</span>
                </div>
                <div className="relative h-6">
                  {/* Slider Track Background with Tick Marks */}
                  <div className="absolute inset-0 bg-[#EFEFEF] border-[0.5px] border-[#E6E6E6] rounded-[2px] px-6 flex items-center justify-between">
                    {[...Array(9)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-[#D9D9D9]"
                        style={{
                          width: '1.5px',
                          height: i % 2 === 0 ? '18px' : '12px'
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Pink Gradient Fill - covers tick marks */}
                  <div
                    className="absolute left-0 top-0 h-full rounded-[2px] flex items-center"
                    style={{
                      width: `max(26px, ${infillDensity}%)`,
                      background: 'linear-gradient(to right, #F4008A 0%, #F76EB3 50%, #FE62BA 100%)'
                    }}
                  >
                    {/* Percentage text - white, centered, follows drag */}
                    {isSliderDragging && (
                      <span 
                        className="absolute text-[10px] font-medium text-white tracking-[-0.2px] whitespace-nowrap leading-none pointer-events-none"
                        style={{ 
                          right: '10px',
                          animation: 'badgePop 0.35s ease-out forwards'
                        }}
                      >
                        {infillDensity}%
                      </span>
                    )}
                    
                    {/* Dark Pink Handle Indicator - at right edge of gradient */}
                    <div
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-[2px] h-[11px] bg-[#B40066] rounded-[2px]"
                      style={{ right: '4px' }}
                    />
                  </div>
                  
                  {/* Hidden Range Input */}
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={infillDensity}
                    onChange={(e) => { setInfillDensity(parseInt(e.target.value)); handleSettingsChange(); }}
                    onMouseDown={() => setIsSliderDragging(true)}
                    onMouseUp={() => setIsSliderDragging(false)}
                    onMouseLeave={() => setIsSliderDragging(false)}
                    onTouchStart={() => setIsSliderDragging(true)}
                    onTouchEnd={() => setIsSliderDragging(false)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reference - Expandable */}
        <div className={`px-4 py-4 border-b border-[#E6E6E6] flex flex-col gap-3`}>
          <div className="flex items-center justify-between">
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

          {/* Expanded Content - Upload Dropzone */}
          {referenceExpanded && (
            <div 
              className="flex flex-col gap-3"
              style={{ animation: 'expandContent 0.3s ease-out forwards' }}
            >
              {/* Hidden file input */}
              <input
                ref={referenceInputRef}
                type="file"
                accept="image/*,.pdf"
                multiple
                onChange={(e) => e.target.files && handleReferenceFiles(e.target.files)}
                className="hidden"
              />

              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDraggingRef(true); }}
                onDragLeave={() => setIsDraggingRef(false)}
                onDrop={handleReferenceDrop}
                onClick={() => referenceInputRef.current?.click()}
                className={`
                  border border-dashed rounded-[2px] py-6 text-center cursor-pointer transition-all
                  ${isDraggingRef 
                    ? 'border-[#F4008A] bg-pink-50' 
                    : 'border-[#8D8D8D] hover:border-[#F4008A]'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#8D8D8D]">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="text-[12px] text-[#8D8D8D]">
                    Drop images or <span className="text-[#F4008A] underline">browse</span>
                  </p>
                  <p className="text-[10px] text-[#B0B0B0]">PNG, JPG, PDF supported</p>
                </div>
              </div>

              {/* Uploaded Files List */}
              {referenceFiles.length > 0 && (
                <div className="flex flex-col gap-2">
                  {referenceFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-[#EFEFEF] px-3 py-2 rounded-[2px]">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#8D8D8D] flex-shrink-0">
                          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                          <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-[12px] text-[#1F1F1F] truncate">{file.name}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeReferenceFile(index); }}
                        className="text-[#8D8D8D] hover:text-[#F4008A] transition-colors flex-shrink-0 ml-2"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions - Expandable */}
        <div className={`px-4 py-4 border-b border-[#E6E6E6] flex flex-col gap-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <label className="text-[14px] font-medium text-[#7A7A7A] capitalize leading-[12px]">Instructions</label>
              <Image src="/images/icons/info.svg" alt="" width={12} height={12} />
            </div>
            <button
              onClick={() => setInstructionsExpanded(!instructionsExpanded)}
              className="w-[14px] h-[14px] flex items-center justify-center"
            >
              <Image
                src="/images/icons/chevron.svg"
                alt=""
                width={11}
                height={11}
                className={`transition-transform ${instructionsExpanded ? 'rotate-45' : 'rotate-[270deg]'}`}
              />
            </button>
          </div>

          {/* Expanded Content */}
          {instructionsExpanded && (
            <div 
              className="flex flex-col gap-2"
              style={{
                animation: 'expandContent 0.3s ease-out forwards'
              }}
            >
              <textarea
                value={instructions}
                onChange={(e) => { setInstructions(e.target.value); setHasChanges(true); }}
                placeholder="E.g., specific color requests, surface finish preferences, assembly notes..."
                className="w-full bg-[#EFEFEF] px-3 py-2 text-[14px] text-[#1F1F1F] tracking-[-0.28px] resize-none min-h-[80px] focus:outline-none focus:ring-1 focus:ring-[#F4008A] placeholder:text-[#B0B0B0] placeholder:text-[12px]"
                rows={3}
              />
            </div>
          )}
        </div>
      </div>

      {/* Model Info & Actions Footer - Fixed at bottom */}
      <div className="bg-white p-4 flex flex-col gap-4 flex-shrink-0 border-t border-[#E6E6E6]">
        {/* Model Info */}
        {modelInfo && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between py-1">
              <button
                onClick={() => {
                  const units: ('mm' | 'cm' | 'in')[] = ['mm', 'cm', 'in'];
                  const currentIndex = units.indexOf(dimensionUnit);
                  setDimensionUnit(units[(currentIndex + 1) % units.length]);
                }}
                className="text-[14px] text-[#8D8D8D] tracking-[0.28px] hover:text-[#1F1F1F] transition-colors"
              >
                Dimension (<span className="underline underline-offset-2">{dimensionUnit}</span>)
              </button>
              <span className="text-[14px] text-[#8D8D8D]">
                {convertDimension(modelInfo.dimensions.length)}L × {convertDimension(modelInfo.dimensions.width)}W × {convertDimension(modelInfo.dimensions.height)}H
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-[14px] text-[#8D8D8D] capitalize tracking-[0.28px]">Weight</span>
              <span className="text-[14px] text-[#8D8D8D]">
                {priceBreakdown?.estimatedWeight ? (
                  `${priceBreakdown.estimatedWeight.toFixed(1)}g`
                ) : (
                  '--'
                )}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-1">
                <span className="text-[14px] font-semibold text-[#1F1F1F] capitalize tracking-[0.28px]">Cost</span>
                {priceBreakdown?.source === 'server-sliced' && (
                  <span className="text-[9px] text-green-600 font-medium">✓ SLICED</span>
                )}
              </div>
              <span className="text-[14px] font-semibold text-[#1F1F1F] uppercase">
                ₦{totalPrice.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={hasUnsavedSettings ? () => handleSliceModel() : handleAddToBag}
            disabled={isSlicing || isUploading}
            className="w-[207px] px-6 py-2 rounded-[2px] text-[14px] font-medium uppercase tracking-[0.28px] leading-[1.37] transition-all hover:opacity-90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: addedToBag
                ? 'linear-gradient(to right, #22C55E 0%, #16A34A 100%)'
                : hasUnsavedSettings
                ? 'linear-gradient(to right, #F4008A 0%, #CF2886 100%)'
                : 'linear-gradient(to right, #1F1F1F 0%, #3a3a3a 100%)'
            }}
          >
            {isSlicing ? 'Slicing...' :
             addedToBag ? 'Added!' :
             hasUnsavedSettings ? 'Re-slice Model' :
             'Add to Bag'}
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
});

ConfiguratorSidebar.displayName = 'ConfiguratorSidebar';

export default ConfiguratorSidebar;
