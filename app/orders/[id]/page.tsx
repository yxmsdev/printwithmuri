'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useOrdersStore, orderStatusConfig, orderStatusSteps } from '@/stores/useOrdersStore';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const getOrder = useOrdersStore((state) => state.getOrder);
  const order = getOrder(orderId);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Order not found
  if (!order) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-[#EDEDED]">
        <div className="container mx-auto px-6 py-12 max-w-[900px]">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#B7B7B7" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <h2 className="text-[20px] font-medium text-[#1F1F1F] mb-2">Order not found</h2>
            <p className="text-[14px] text-[#7A7A7A] mb-8">This order doesn&apos;t exist or has been removed.</p>
            <Link
              href="/orders"
              className="px-8 py-3 text-[14px] font-medium uppercase tracking-[0.28px] text-white transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(to right, #1F1F1F 0%, #3a3a3a 100%)'
              }}
            >
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStatusIndex = orderStatusSteps.indexOf(order.status);
  const statusInfo = orderStatusConfig[order.status];
  const totalItems = order.items.reduce((sum, item) => sum + item.config.quantity, 0);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#EDEDED]">
      <div className="container mx-auto px-6 py-12 max-w-[900px]">
        {/* Back Link */}
        <Link href="/orders" className="text-[12px] text-[#8D8D8D] hover:text-[#1F1F1F] transition-colors">
          ← Back to orders
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mt-4 mb-8">
          <div>
            <h1 className="text-[28px] font-medium text-[#1F1F1F]">{order.orderNumber}</h1>
            <p className="text-[14px] text-[#7A7A7A] mt-1">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <span
            className="px-3 py-1 text-[12px] font-medium rounded-full"
            style={{
              color: statusInfo.color,
              backgroundColor: statusInfo.bgColor,
            }}
          >
            {statusInfo.label}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Timeline & Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Timeline */}
            <div className="bg-white p-6 shadow-sm">
              <h2 className="text-[16px] font-medium text-[#1F1F1F] mb-6">Order Status</h2>
              
              <div className="relative">
                {orderStatusSteps.map((status, index) => {
                  const stepInfo = orderStatusConfig[status];
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const isLast = index === orderStatusSteps.length - 1;

                  return (
                    <div key={status} className="flex gap-4 relative">
                      {/* Vertical Line */}
                      {!isLast && (
                        <div
                          className="absolute left-[11px] top-[24px] w-[2px] h-[calc(100%-8px)]"
                          style={{
                            backgroundColor: isCompleted && index < currentStatusIndex ? '#22C55E' : '#E6E6E6',
                          }}
                        />
                      )}

                      {/* Circle */}
                      <div
                        className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCompleted
                            ? isCurrent
                              ? 'bg-[#F4008A]'
                              : 'bg-[#22C55E]'
                            : 'bg-[#E6E6E6]'
                        }`}
                      >
                        {isCompleted && !isCurrent && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-white">
                            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                        {isCurrent && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>

                      {/* Content */}
                      <div className={`pb-6 ${isCurrent ? '' : 'opacity-60'}`}>
                        <p className={`text-[14px] ${isCurrent ? 'font-medium text-[#1F1F1F]' : 'text-[#7A7A7A]'}`}>
                          {stepInfo.label}
                        </p>
                        {isCurrent && (
                          <p className="text-[12px] text-[#8D8D8D] mt-0.5">
                            {status === 'received' && 'Your order has been received and is being processed'}
                            {status === 'reviewing' && 'Our team is reviewing your 3D files for printability'}
                            {status === 'printing' && 'Your models are currently being printed'}
                            {status === 'quality_check' && 'Prints are being inspected for quality'}
                            {status === 'ready_for_delivery' && 'Your order is packed and ready to ship'}
                            {status === 'out_for_delivery' && 'Your order is on its way to you'}
                            {status === 'delivered' && 'Your order has been delivered'}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {order.estimatedDelivery && order.status !== 'delivered' && (
                <div className="mt-4 pt-4 border-t border-[#E6E6E6]">
                  <p className="text-[12px] text-[#8D8D8D]">
                    Estimated delivery: <span className="text-[#1F1F1F] font-medium">{formatShortDate(order.estimatedDelivery)}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="bg-white p-6 shadow-sm">
              <h2 className="text-[16px] font-medium text-[#1F1F1F] mb-4">
                Items ({totalItems})
              </h2>
              
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-[#E6E6E6] last:border-0 last:pb-0">
                    {/* Model Preview Placeholder */}
                    <div className="w-16 h-16 bg-[#FAFAFA] rounded flex items-center justify-center flex-shrink-0">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.5">
                        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                      </svg>
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[14px] font-medium text-[#1F1F1F] truncate">
                        {item.modelName}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-[11px] text-[#7A7A7A]">{item.config.material}</span>
                        <span className="text-[11px] text-[#B7B7B7]">•</span>
                        <span className="text-[11px] text-[#7A7A7A] capitalize">{item.config.quality}</span>
                        <span className="text-[11px] text-[#B7B7B7]">•</span>
                        <span
                          className="w-3 h-3 rounded-full border border-[#E6E6E6]"
                          style={{ backgroundColor: item.config.color }}
                        />
                      </div>
                      <p className="text-[12px] text-[#8D8D8D] mt-1">
                        Qty: {item.config.quantity} × ₦{item.price.itemTotal.toLocaleString()}
                      </p>
                    </div>

                    {/* Price */}
                    <p className="text-[14px] font-medium text-[#1F1F1F]">
                      ₦{item.price.subtotal.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white p-6 shadow-sm">
              <h2 className="text-[16px] font-medium text-[#1F1F1F] mb-4">Delivery Address</h2>
              <div className="text-[13px] text-[#7A7A7A] space-y-1">
                <p className="text-[#1F1F1F] font-medium">{order.deliveryAddress.fullName}</p>
                <p>{order.deliveryAddress.address}</p>
                <p>{order.deliveryAddress.city}, {order.deliveryAddress.state}</p>
                <p>{order.deliveryAddress.phone}</p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white p-6 shadow-sm">
              <h2 className="text-[16px] font-medium text-[#1F1F1F] mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#7A7A7A]">Subtotal</span>
                  <span className="text-[#1F1F1F]">₦{order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#7A7A7A]">Delivery</span>
                  <span className="text-[#1F1F1F]">₦{order.deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[14px] font-semibold pt-3 border-t border-[#E6E6E6]">
                  <span className="text-[#1F1F1F]">Total</span>
                  <span className="text-[#1F1F1F]">₦{order.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#E6E6E6]">
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#8D8D8D]">Payment</span>
                  <span className={`font-medium ${order.paymentStatus === 'success' ? 'text-green-600' : 'text-[#1F1F1F]'}`}>
                    {order.paymentStatus === 'success' ? 'Paid' : order.paymentStatus}
                  </span>
                </div>
                <p className="text-[11px] text-[#B7B7B7] mt-1">
                  Ref: {order.paymentReference}
                </p>
              </div>
            </div>

            {/* Support */}
            <div className="bg-white p-6 shadow-sm">
              <h2 className="text-[16px] font-medium text-[#1F1F1F] mb-2">Need Help?</h2>
              <p className="text-[13px] text-[#7A7A7A] mb-4">
                Contact our support team for any questions about your order.
              </p>
              <Link
                href="/support"
                className="block w-full py-2.5 text-center text-[12px] font-medium text-[#1F1F1F] border border-[#E6E6E6] hover:border-[#1F1F1F] transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

