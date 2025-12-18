'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useOrdersStore } from '@/stores/useOrdersStore';
import { Order } from '@/types';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const getOrder = useOrdersStore((state) => state.getOrder);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const orderId = searchParams.get('order');
    if (orderId) {
      const foundOrder = getOrder(orderId);
      if (foundOrder) {
        setOrder(foundOrder);
      }
    } else {
      // Mock order for preview
      const mockOrder: Order = {
        id: 'mock-order-123',
        userId: 'mock-user',
        orderNumber: 'MUR-PREVIEW-1234',
        status: 'received',
        items: [
          {
            id: 'mock-item-1',
            modelId: 'mock-model-1',
            modelName: 'Preview Model',
            config: {
              modelId: 'mock-model-1',
              quantity: 1,
              quality: 'standard',
              material: 'PLA',
              color: '#F4008A',
              infillType: 'grid',
              infillDensity: 20,
              designGuideImages: []
            },
            price: {
              estimatedWeight: 100,
              printTime: 5,
              machineCost: 2000,
              materialCost: 1000,
              setupFee: 500,
              itemTotal: 3500,
              quantity: 1,
              subtotal: 3500,
              source: 'local-estimation'
            }
          }
        ],
        subtotal: 3500,
        deliveryFee: 1500,
        total: 5000,
        deliveryAddress: {
          fullName: 'Preview User',
          phone: '+234 800 000 0000',
          address: '123 Preview St',
          city: 'Lagos',
          state: 'Lagos'
        },
        paymentReference: 'REF-PREVIEW-123',
        paymentStatus: 'success',
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setOrder(mockOrder);
    }
  }, [searchParams, getOrder]);

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-[#EDEDED] p-8">
      <div className="bg-white p-8 rounded-[2px] shadow-sm text-center max-w-lg w-full">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-green-600">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="text-[28px] font-medium text-[#1F1F1F] mb-2">Order Confirmed!</h1>
        <p className="text-[14px] text-[#8D8D8D] mb-6">
          Thank you for your order. We&apos;ve received your payment and will start processing your print job shortly.
        </p>

        {/* Order Number */}
        <div className="bg-[#EFEFEF] p-4 rounded-[2px] mb-6">
          <p className="text-[12px] text-[#8D8D8D] mb-1">Order Number</p>
          <p className="text-[18px] font-medium text-[#1F1F1F] font-mono">
            {order?.orderNumber || 'Loading...'}
          </p>
        </div>

        {/* Order Summary */}
        {order && (
          <div className="bg-[#FAFAFA] p-4 rounded-[2px] mb-6 text-left">
            <div className="flex justify-between text-[14px] mb-2">
              <span className="text-[#8D8D8D]">Items</span>
              <span className="text-[#1F1F1F]">{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
            </div>
            <div className="flex justify-between text-[14px] mb-2">
              <span className="text-[#8D8D8D]">Delivery to</span>
              <span className="text-[#1F1F1F]">{order.deliveryAddress.city}, {order.deliveryAddress.state}</span>
            </div>
            <div className="flex justify-between text-[14px] font-semibold pt-2 border-t border-[#E6E6E6]">
              <span className="text-[#1F1F1F]">Total Paid</span>
              <span className="text-[#1F1F1F]">₦{order.total.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* What's Next */}
        <div className="text-left mb-8">
          <h3 className="text-[14px] font-medium text-[#1F1F1F] mb-4">What happens next?</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-[#F4008A] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="rounded-[2px] text-[10px] font-bold text-white">1</span>
              </div>
              <div>
                <p className="text-[14px] font-medium text-[#1F1F1F]">Order Review</p>
                <p className="text-[12px] text-[#8D8D8D]">We&apos;ll review your 3D files for printability</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-[#F4008A] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="rounded-[2px] text-[10px] font-bold text-white">2</span>
              </div>
              <div>
                <p className="text-[14px] font-medium text-[#1F1F1F]">Production</p>
                <p className="text-[12px] text-[#8D8D8D]">Your models will be printed with care (2-5 business days)</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-[#F4008A] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="rounded-[2px] text-[10px] font-bold text-white">3</span>
              </div>
              <div>
                <p className="text-[14px] font-medium text-[#1F1F1F]">Shipping</p>
                <p className="text-[12px] text-[#8D8D8D]">We&apos;ll ship your prints to your address</p>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Email Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-[2px] p-4 mb-6 text-left">
          <div className="flex gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-blue-600 flex-shrink-0 mt-0.5">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <p className="text-[14px] font-medium text-blue-800">Check your email</p>
              <p className="text-[12px] text-blue-600">We&apos;ve sent a confirmation email with your order details and tracking information.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={order ? `/orders/${order.id}` : '/orders'}
            className="rounded-[2px] flex-1 py-[8px] px-8 text-[14px] font-medium text-white tracking-[0.28px] text-center transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(to right, #1F1F1F 0%, #3a3a3a 100%)' }}
          >
            Track Order
          </Link>
          <Link
            href="/"
            className="rounded-[2px] flex-1 py-[8px] px-8 text-[14px] font-medium text-[#1F1F1F] tracking-[0.28px] text-center border border-[#1F1F1F] hover:bg-[#1F1F1F] hover:text-white transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
