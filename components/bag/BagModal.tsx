'use client';

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
        <div className="w-20 h-20 bg-[#EDEDED] rounded-full flex items-center justify-center mb-4">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#B7B7B7" strokeWidth="1.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
        </div>
        <h2 className="text-[18px] font-medium text-[#1F1F1F] mb-2">Your bag is empty</h2>
        <p className="text-[13px] text-[#7A7A7A] mb-6">Upload a 3D model to get started</p>
        <button
          onClick={onClose}
          className="px-6 py-2.5 text-[13px] font-medium uppercase tracking-[0.28px] text-white transition-all hover:opacity-90"
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
        <div className="border-b border-[#E6E6E6] pb-3 mb-4">
          <span className="text-[13px] text-[#7A7A7A]">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="flex gap-4 pb-4 border-b border-[#E6E6E6]"
            >
              {/* Model Preview Placeholder */}
              <div className="w-[80px] h-[80px] bg-[#EDEDED] rounded flex items-center justify-center flex-shrink-0">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#B7B7B7" strokeWidth="1.5">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>

              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-[14px] font-medium text-[#1F1F1F] truncate pr-2">
                    {item.modelName}
                  </h3>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-[11px] text-[#7A7A7A] hover:text-[#F4008A] transition-colors flex-shrink-0"
                  >
                    Remove
                  </button>
                </div>

                {/* Config Details */}
                <div className="flex gap-3 text-[11px] text-[#8D8D8D] mb-3">
                  <span>{item.config.material}</span>
                  <span>•</span>
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
                    <div className="flex items-center gap-2 border border-[#E6E6E6] rounded px-2 py-0.5">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.config.quantity - 1)}
                        className="text-[#7A7A7A] hover:text-[#1F1F1F] transition-colors"
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
                        className="text-[#7A7A7A] hover:text-[#1F1F1F] transition-colors"
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
          <div className="flex justify-between text-[13px]">
            <span className="text-[#7A7A7A]">Subtotal</span>
            <span className="text-[#1F1F1F]">₦{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[13px]">
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
          className="w-full py-3 text-[13px] font-medium uppercase tracking-[0.28px] text-white transition-all hover:opacity-90 mb-3"
          style={{
            background: 'linear-gradient(to right, #1F1F1F 0%, #3a3a3a 100%)'
          }}
        >
          Proceed to Checkout
        </button>

        <button
          onClick={onClose}
          className="w-full text-[12px] text-[#7A7A7A] hover:text-[#F4008A] transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

