'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBagStore } from '@/stores/useBagStore';

export default function BagPage() {
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
    if (confirm('Are you sure you want to remove this item?')) {
      removeItem(id);
    }
  };

  // Empty state
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-6 py-16 max-w-[1440px]">
        <h1 className="text-[32px] font-medium text-[#1F1F1F] mb-12">Your Bag</h1>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-24 h-24 bg-[#EDEDED] rounded-full flex items-center justify-center mb-6">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#B7B7B7" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
          <h2 className="text-[20px] font-medium text-[#1F1F1F] mb-2">Your bag is empty</h2>
          <p className="text-[14px] text-[#7A7A7A] mb-8">Upload a 3D model to get started</p>
          <Link
            href="/"
            className="px-8 py-3 text-[14px] font-medium uppercase tracking-[0.28px] text-white transition-all hover:opacity-90"
            style={{
              background: 'linear-gradient(to right, #1F1F1F 0%, #3a3a3a 100%)'
            }}
          >
            Upload Model
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-[1440px]">
      <h1 className="text-[32px] font-medium text-[#1F1F1F] mb-8">Your Bag</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items List */}
        <div className="flex-1">
          <div className="border-b border-[#E6E6E6] pb-4 mb-4">
            <span className="text-[14px] text-[#7A7A7A]">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div className="space-y-6">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="flex gap-6 pb-6 border-b border-[#E6E6E6]"
              >
                {/* Model Preview Placeholder */}
                <div className="w-[120px] h-[120px] bg-[#EDEDED] rounded flex items-center justify-center flex-shrink-0">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#B7B7B7" strokeWidth="1.5">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>

                {/* Item Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-[16px] font-medium text-[#1F1F1F]">
                      {item.modelName}
                    </h3>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-[12px] text-[#7A7A7A] hover:text-[#F4008A] transition-colors"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Config Details */}
                  <div className="space-y-1 mb-4">
                    <p className="text-[13px] text-[#7A7A7A]">
                      <span className="text-[#8D8D8D]">Material:</span> {item.config.material}
                    </p>
                    <p className="text-[13px] text-[#7A7A7A]">
                      <span className="text-[#8D8D8D]">Quality:</span> {item.config.quality}
                    </p>
                    <p className="text-[13px] text-[#7A7A7A] flex items-center gap-2">
                      <span className="text-[#8D8D8D]">Color:</span>
                      <span
                        className="w-3 h-3 rounded-full inline-block border border-[#E6E6E6]"
                        style={{ backgroundColor: item.config.color }}
                      />
                    </p>
                  </div>

                  {/* Quantity & Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-[13px] text-[#8D8D8D]">Qty:</span>
                      <div className="flex items-center gap-3 border border-[#E6E6E6] rounded px-3 py-1">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.config.quantity - 1)}
                          className="text-[#7A7A7A] hover:text-[#1F1F1F] transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
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
                          className="text-[14px] font-medium text-[#1F1F1F] w-10 text-center bg-transparent outline-none"
                        />
                        <button
                          onClick={() => handleQuantityChange(item.id, item.config.quantity + 1)}
                          className="text-[#7A7A7A] hover:text-[#1F1F1F] transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                            <rect y="5" width="12" height="2" />
                            <rect x="5" width="2" height="12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[12px] text-[#8D8D8D]">
                        ₦{item.price.itemTotal.toLocaleString()} × {item.config.quantity}
                      </p>
                      <p className="text-[16px] font-semibold text-[#1F1F1F]">
                        ₦{item.price.subtotal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Continue Shopping */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-6 text-[14px] text-[#7A7A7A] hover:text-[#F4008A] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 12L6 8l4-4" />
            </svg>
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div className="lg:w-[380px]">
          <div className="bg-[#FAFAFA] rounded-lg p-6 sticky top-[80px]">
            <h2 className="text-[18px] font-medium text-[#1F1F1F] mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-[14px]">
                <span className="text-[#7A7A7A]">Subtotal</span>
                <span className="text-[#1F1F1F]">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-[#7A7A7A]">Delivery</span>
                <span className="text-[#1F1F1F]">₦{deliveryFee.toLocaleString()}</span>
              </div>
              <div className="border-t border-[#E6E6E6] pt-4">
                <div className="flex justify-between">
                  <span className="text-[16px] font-semibold text-[#1F1F1F]">Total</span>
                  <span className="text-[18px] font-semibold text-[#1F1F1F]">₦{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full py-4 text-[14px] font-medium uppercase tracking-[0.28px] text-white transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(to right, #1F1F1F 0%, #3a3a3a 100%)'
              }}
            >
              Proceed to Checkout
            </button>

            <p className="text-[12px] text-[#8D8D8D] text-center mt-4">
              Delivery within Lagos: 2-5 business days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
