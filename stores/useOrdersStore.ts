import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order, OrderStatus, BagItem } from '@/types';

interface OrdersStore {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  getOrder: (id: string) => Order | undefined;
  getOrderByNumber: (orderNumber: string) => Order | undefined;
  clearOrders: () => void;
}

// Generate a unique ID
const generateId = () => `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Generate order number
export const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MUR-${timestamp}-${random}`;
};

export const useOrdersStore = create<OrdersStore>()(
  persist(
    (set, get) => ({
      orders: [],

      addOrder: (orderData) => {
        const id = generateId();
        const now = new Date();
        
        const newOrder: Order = {
          ...orderData,
          id,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));

        return id;
      },

      updateOrderStatus: (id, status) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id
              ? {
                  ...order,
                  status,
                  updatedAt: new Date(),
                }
              : order
          ),
        }));
      },

      getOrder: (id) => {
        return get().orders.find((order) => order.id === id);
      },

      getOrderByNumber: (orderNumber) => {
        return get().orders.find((order) => order.orderNumber === orderNumber);
      },

      clearOrders: () => {
        set({ orders: [] });
      },
    }),
    {
      name: 'muri-orders-storage',
      // Custom serialization to handle Date objects
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const data = JSON.parse(str);
          // Convert date strings back to Date objects
          if (data.state?.orders) {
            data.state.orders = data.state.orders.map((order: Order) => ({
              ...order,
              createdAt: new Date(order.createdAt),
              updatedAt: new Date(order.updatedAt),
              estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery) : undefined,
            }));
          }
          return data;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);

// Helper to create an order from checkout data
export function createOrderFromCheckout(
  items: BagItem[],
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
  },
  subtotal: number,
  deliveryFee: number,
  paymentReference: string
): Omit<Order, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    userId: '', // Will be set when auth is implemented
    orderNumber: generateOrderNumber(),
    status: 'received',
    items,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    deliveryAddress: {
      fullName: shippingAddress.fullName,
      phone: shippingAddress.phone,
      address: shippingAddress.address,
      city: shippingAddress.city,
      state: shippingAddress.state,
    },
    paymentReference,
    paymentStatus: 'success',
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
  };
}

// Status display helpers
export const orderStatusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
  received: { label: 'Order Received', color: '#1F1F1F', bgColor: '#E6E6E6' },
  reviewing: { label: 'Reviewing Files', color: '#EA9000', bgColor: '#FFF0C8' },
  printing: { label: 'Printing', color: '#F4008A', bgColor: '#FDE8F3' },
  quality_check: { label: 'Quality Check', color: '#EA9000', bgColor: '#FFF0C8' },
  ready_for_delivery: { label: 'Ready for Delivery', color: '#3B82F6', bgColor: '#DBEAFE' },
  out_for_delivery: { label: 'Out for Delivery', color: '#8B5CF6', bgColor: '#EDE9FE' },
  delivered: { label: 'Delivered', color: '#22C55E', bgColor: '#DCFCE7' },
};

export const orderStatusSteps: OrderStatus[] = [
  'received',
  'reviewing',
  'printing',
  'quality_check',
  'ready_for_delivery',
  'out_for_delivery',
  'delivered',
];

