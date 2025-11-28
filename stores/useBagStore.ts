import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BagItem, PrintConfig, ModelInfo } from '@/types';
import { calculatePrice } from '@/lib/pricing';

interface BagStore {
  items: BagItem[];
  isOpen: boolean;
  addItem: (item: Omit<BagItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearBag: () => void;
  openBag: () => void;
  closeBag: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

// Generate a unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useBagStore = create<BagStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openBag: () => set({ isOpen: true }),
      closeBag: () => set({ isOpen: false }),

      addItem: (item) => {
        const currentItems = get().items;
        
        // Check if item with same model name and config already exists (case-insensitive)
        const existingItemIndex = currentItems.findIndex(
          (existing) =>
            existing.modelName.toLowerCase() === item.modelName.toLowerCase() &&
            existing.config.material.toLowerCase() === item.config.material.toLowerCase() &&
            existing.config.quality.toLowerCase() === item.config.quality.toLowerCase() &&
            existing.config.color.toLowerCase() === item.config.color.toLowerCase()
        );

        if (existingItemIndex !== -1) {
          // Update quantity of existing item
          const existingItem = currentItems[existingItemIndex];
          const newQuantity = existingItem.config.quantity + item.config.quantity;
          
          set({
            items: currentItems.map((i, index) =>
              index === existingItemIndex
                ? {
                    ...i,
                    config: { ...i.config, quantity: newQuantity },
                    price: {
                      ...i.price,
                      quantity: newQuantity,
                      subtotal: i.price.itemTotal * newQuantity,
                    },
                  }
                : i
            ),
          });
        } else {
          // Add as new item
          const newItem: BagItem = {
            ...item,
            id: generateId(),
          };
          set({
            items: [...currentItems, newItem],
          });
        }
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          set((state) => ({
            items: state.items.filter((item) => item.id !== id),
          }));
        } else {
          // Update quantity
          set((state) => ({
            items: state.items.map((item) =>
              item.id === id
                ? {
                    ...item,
                    config: { ...item.config, quantity },
                    price: {
                      ...item.price,
                      quantity,
                      subtotal: item.price.itemTotal * quantity,
                    },
                  }
                : item
            ),
          }));
        }
      },

      clearBag: () => {
        set({ items: [] });
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.config.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price.subtotal, 0);
      },
    }),
    {
      name: 'muri-bag-storage',
    }
  )
);

// Helper function to create a BagItem from configurator data
export function createBagItem(
  modelName: string,
  modelInfo: ModelInfo,
  config: {
    quantity: number;
    quality: string;
    material: string;
    color: string;
    infillType?: string;
    infillDensity?: number;
  },
  priceBreakdown?: import('@/types').PriceBreakdown
): Omit<BagItem, 'id'> {
  const printConfig: PrintConfig = {
    modelId: generateId(),
    quantity: config.quantity,
    quality: config.quality.toLowerCase() as 'draft' | 'standard' | 'high',
    material: config.material as 'PLA' | 'PETG' | 'ABS' | 'Resin',
    color: config.color,
    infillType: (config.infillType || 'hexagonal') as 'hexagonal' | 'grid' | 'triangles' | 'gyroid',
    infillDensity: config.infillDensity || 20,
    designGuideImages: [],
  };

  // Use provided priceBreakdown (with Cloud Slicer data) or fallback to local calculation
  const price = priceBreakdown || calculatePrice(printConfig, modelInfo);

  return {
    modelId: printConfig.modelId,
    modelName,
    config: printConfig,
    price: price,
  };
}

