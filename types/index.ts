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
  quality: 'draft' | 'standard' | 'high' | 'ultra';
  material: 'PLA' | 'PETG' | 'ABS' | 'Resin';
  color: string;                         // hex
  infillType: 'hexagonal' | 'grid' | 'lines' | 'triangles' | 'cubic';
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
  quoteId?: string;           // Quote ID from slicer
  gcodeFile?: string;         // G-code filename if sliced
  layerCount?: number;        // Number of layers (from slicing)
  source: 'server-sliced' | 'local-estimation';  // Source of pricing
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

// Draft Types
export interface Draft {
  id: string;
  modelName: string;
  modelFileUrl?: string; // For future: store file in cloud
  modelInfo: ModelInfo | null;
  config: {
    quantity: number;
    quality: string;
    material: string;
    color: string;
    infillType: string;
    infillDensity: number;
    instructions: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Server-Side Slicer Types
export interface SlicerQuoteResponse {
  success: boolean;
  quote: {
    quote_id: string;
    gcode_file: string;
    estimatedWeight: number;
    printTime: number;
    machineCost: number;
    materialCost: number;
    setupFee: number;
    itemTotal: number;
    currency: string;
    slicingDuration?: number;
    layerCount?: number;
  };
}

export interface SlicerError {
  error: string;
  details?: string;
  status?: number;
}

// Two-Phase Slicing Types
export interface FileUploadResponse {
  success: boolean;
  fileId: string;
  fileName: string;
  fileSize: number;
  fileExtension: string;
  expiresAt: string;
}

export interface SliceRequest {
  fileId: string;
  quality: string;
  material: string;
  infillDensity: number;
  infillType: string;
}

export interface TempUpload {
  id: string;
  fileId: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  fileExtension: string;
  expiresAt: string;
  createdAt: string;
}
