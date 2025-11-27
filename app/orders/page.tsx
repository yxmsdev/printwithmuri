'use client';

import Link from 'next/link';
import { useOrdersStore, orderStatusConfig } from '@/stores/useOrdersStore';

export default function OrdersPage() {
  const orders = useOrdersStore((state) => state.orders);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="bg-[#EDEDED]">
        <div className="container mx-auto px-6 py-14 pb-20 max-w-[1128px]">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex flex-col gap-3">
              <h1 className="text-[42px] font-semibold text-black leading-none">My Orders</h1>
              <p className="text-[16px] font-semibold text-[#8D8D8D]">0 orders</p>
            </div>
            <Link
              href="/"
              className="px-6 py-3 text-[14px] font-medium uppercase tracking-[0.28px] text-white transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(to right, #1F1F1F 0%, #3a3a3a 100%)'
              }}
            >
              + New Order
            </Link>
          </div>

          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#B7B7B7" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <h2 className="text-[20px] font-medium text-[#1F1F1F] mb-2">No orders yet</h2>
            <p className="text-[14px] text-[#7A7A7A] mb-8 text-center max-w-md">
              Your order history will appear here once you place an order.
            </p>
            <Link
              href="/"
              className="px-8 py-3 text-[14px] font-medium uppercase tracking-[0.28px] text-white transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(to right, #1F1F1F 0%, #3a3a3a 100%)'
              }}
            >
              Start Shopping
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
            <h1 className="text-[42px] font-semibold text-black leading-none">My Orders</h1>
            <p className="text-[16px] font-semibold text-[#8D8D8D]">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'}
            </p>
          </div>
          <Link
            href="/"
            className="px-6 py-3 text-[14px] font-medium uppercase tracking-[0.28px] text-white transition-all hover:opacity-90"
            style={{
              background: 'linear-gradient(to right, #1F1F1F 0%, #3a3a3a 100%)'
            }}
          >
            + New Order
          </Link>
        </div>

        {/* Table */}
        <div className="flex flex-col gap-1">
          {/* Table Header */}
          <div className="bg-white px-8 py-2 flex items-center gap-16">
            <p className="w-[200px] text-[14px] text-black leading-[1.4]">Order ID</p>
            <p className="w-[80px] text-[14px] text-black text-center leading-[1.4]">Items</p>
            <p className="w-[100px] text-[14px] text-black text-center leading-[1.4]">Total</p>
            <p className="w-[140px] text-[14px] text-black text-center leading-[1.4]">Status</p>
            <p className="w-[120px] text-[14px] text-black text-center leading-[1.4]">Date</p>
            <p className="w-[120px] text-[14px] text-black text-center leading-[1.4]">Action</p>
          </div>

          {/* Table Rows */}
          <div className="flex flex-col gap-[2px]">
            {orders.map((order) => {
              const statusInfo = orderStatusConfig[order.status];
              const totalItems = order.items.reduce((sum, item) => sum + item.config.quantity, 0);

              return (
                <div
                  key={order.id}
                  className="bg-white px-8 py-2 flex items-center gap-16"
                >
                  {/* Order ID */}
                  <div className="w-[200px] flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#FAFAFA] rounded flex items-center justify-center flex-shrink-0">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.5">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 01-8 0" />
                      </svg>
                    </div>
                    <p className="text-[14px] font-medium text-black truncate">
                      {order.orderNumber}
                    </p>
                  </div>

                  {/* Items */}
                  <p className="w-[80px] text-[14px] text-black text-center leading-[1.4]">
                    {totalItems}
                  </p>

                  {/* Total */}
                  <p className="w-[100px] text-[14px] text-[#1F1F1F] text-center uppercase tracking-[0.28px]">
                    ₦{order.total.toLocaleString()}
                  </p>

                  {/* Status */}
                  <div className="w-[140px] flex justify-center">
                    <span
                      className="px-3 py-1 text-[11px] font-medium rounded-full"
                      style={{
                        color: statusInfo.color,
                        backgroundColor: statusInfo.bgColor,
                      }}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Date */}
                  <p className="w-[120px] text-[14px] text-[#1F1F1F] text-center uppercase tracking-[0.28px]">
                    {formatDate(order.createdAt)}
                  </p>

                  {/* Action */}
                  <div className="w-[120px] flex items-center justify-center">
                    <Link
                      href={`/orders/${order.id}`}
                      className="px-6 py-3 text-[14px] font-medium text-[#1F1F1F] uppercase tracking-[0.28px] border border-[#464750] hover:bg-[#1F1F1F] hover:text-white transition-all"
                    >
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
