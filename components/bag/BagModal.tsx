'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useBagStore } from '@/stores/useBagStore';

interface BagModalProps {
  onClose: () => void;
}

export default function BagModal({ onClose }: BagModalProps) {
  const router = useRouter();
  const items = useBagStore((state) => state.items);
  const removeItem = useBagStore((state) => state.removeItem);
  const updateQuantity = useBagStore((state) => state.updateQuantity);

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

  // Calculate totals
  const subtotal = items.reduce((total, item) => total + item.price.subtotal, 0);
  const deliveryFee = items.length > 0 ? 2500 : 0;
  const total = subtotal + deliveryFee;

  const handleQuantityChange = (id: string, newQuantity: number) => {
    updateQuantity(id, newQuantity);
  };

  const handleRemove = (id: string) => {
    removeItem(id);
  };

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="mb-4">
          <Image src="/images/Bag_icon.svg" alt="Empty bag" width={80} height={80} />
        </div>
        <h2 className="text-[18px] font-medium text-[#1F1F1F] mb-2">Your bag is empty</h2>
        <p className="text-[14px] text-[#7A7A7A] mb-6">Upload a 3D model to get started</p>
        <button
          onClick={onClose}
          className="px-8 py-[8px] rounded-[2px] text-[14px] font-medium tracking-[0.28px] text-white transition-all hover:opacity-90 btn-bounce"
          style={{
            background: 'linear-gradient(to right, #1F1F1F 0%, #3a3a3a 100%)'
          }}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-[70vh]">
      {/* Items List */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 pb-4 border-b border-[#E6E6E6]"
            >
              {/* Model Preview Placeholder */}
              <div className="w-[80px] h-[80px] flex items-center justify-center flex-shrink-0">
                <Image
                  src={getMaterialIcon(item.config.material)}
                  alt={item.config.material}
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>

              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-[14px] font-medium text-[#1F1F1F] truncate pr-2">
                    {item.modelName}
                  </h3>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-[11px] text-[#7A7A7A] hover:text-[#F4008A] transition-colors flex-shrink-0 btn-bounce"
                  >
                    Remove
                  </button>
                </div>

                {/* Config Details */}
                <div className="flex gap-3 items-center text-[11px] text-[#8D8D8D] mb-3">
                  <span className="capitalize">{item.config.quality}</span>
                  <span>•</span>
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block border border-[#E6E6E6]"
                    style={{ backgroundColor: item.config.color }}
                  />
                </div>

                {/* Quantity & Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 border border-[#E6E6E6] rounded-[2px] px-2 py-0.5">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.config.quantity - 1)}
                        className="text-[#7A7A7A] hover:text-[#1F1F1F] transition-colors btn-bounce"
                      >
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
                          <rect y="5" width="12" height="2" />
                        </svg>
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={item.config.quantity}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow empty or numeric input
                          if (value === '' || /^\d+$/.test(value)) {
                            const val = parseInt(value) || 0;
                            handleQuantityChange(item.id, val);
                          }
                        }}
                        className="text-[12px] font-medium text-[#1F1F1F] w-8 text-center bg-transparent outline-none"
                      />
                      <button
                        onClick={() => handleQuantityChange(item.id, item.config.quantity + 1)}
                        className="text-[#7A7A7A] hover:text-[#1F1F1F] transition-colors btn-bounce"
                      >
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
                          <rect y="5" width="12" height="2" />
                          <rect x="5" width="2" height="12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <p className="text-[14px] font-semibold text-[#1F1F1F]">
                    ₦{item.price.subtotal.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="border-t border-[#E6E6E6] pt-4 mt-4">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-[14px]">
            <span className="text-[#7A7A7A]">Subtotal</span>
            <span className="text-[#1F1F1F]">₦{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[14px]">
            <span className="text-[#7A7A7A]">Delivery</span>
            <span className="text-[#1F1F1F]">₦{deliveryFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-[#E6E6E6]">
            <span className="text-[14px] font-semibold text-[#1F1F1F]">Total</span>
            <span className="text-[16px] font-semibold text-[#1F1F1F]">₦{total.toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={() => {
            onClose();
            router.push('/checkout');
          }}
          className="w-full py-[8px] rounded-[2px] text-[14px] font-medium tracking-[0.28px] text-white transition-all hover:opacity-90 mb-3 btn-bounce"
          style={{
            background: 'linear-gradient(to right, #1F1F1F 0%, #3a3a3a 100%)'
          }}
        >
          Proceed to Checkout
        </button>

        <button
          onClick={onClose}
          className="w-full text-[12px] text-[#7A7A7A] hover:text-[#F4008A] transition-colors btn-bounce"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

