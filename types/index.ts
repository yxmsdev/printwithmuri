// Model and Configuration Types
export interface ModelInfo {
  volume: number;        // mm³
  surfaceArea: number;   // mm²
  dimensions: {
    length: number;      // mm
    width: number;       // mm
    height: number;      // mm
  };
  triangleCount: number;
  isManifold: boolean;
}

export interface PrintConfig {
  modelId: string;
  quantity: number;                      // 1-100
  quality: 'draft' | 'standard' | 'high';
  material: 'PLA' | 'PETG' | 'ABS' | 'Resin';
  color: string;                         // hex
  infillType: 'hexagonal' | 'grid' | 'triangles' | 'gyroid';
  infillDensity: number;                 // 5-100 (percentage)
  designGuideImages: File[];
}

export interface PriceBreakdown {
  estimatedWeight: number;    // grams
  printTime: number;          // hours
  machineCost: number;        // ₦
  materialCost: number;       // ₦
  setupFee: number;           // ₦
  itemTotal: number;          // ₦
  quantity: number;
  subtotal: number;           // ₦
}

export interface BagItem {
  id: string;
  modelId: string;
  modelName: string;
  thumbnailUrl?: string;
  config: PrintConfig;
  price: PriceBreakdown;
}

// Order Types
export type OrderStatus =
  | 'received'
  | 'reviewing'
  | 'printing'
  | 'quality_check'
  | 'ready_for_delivery'
  | 'out_for_delivery'
  | 'delivered';

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  items: BagItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
  };
  paymentReference: string;
  paymentStatus: 'pending' | 'success' | 'failed';
  estimatedDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  notes?: string;
  createdAt: Date;
}

// User Types
export interface UserProfile {
  id: string;
  fullName?: string;
  phone?: string;
  defaultAddress?: {
    address: string;
    city: string;
    state: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
