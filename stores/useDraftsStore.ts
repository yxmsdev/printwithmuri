import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Draft, ModelInfo } from '@/types';

interface DraftsStore {
  drafts: Draft[];
  addDraft: (draft: Omit<Draft, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateDraft: (id: string, updates: Partial<Omit<Draft, 'id' | 'createdAt'>>) => void;
  removeDraft: (id: string) => void;
  getDraft: (id: string) => Draft | undefined;
  clearDrafts: () => void;
}

// Generate a unique ID
const generateId = () => `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useDraftsStore = create<DraftsStore>()(
  persist(
    (set, get) => ({
      drafts: [],

      addDraft: (draftData) => {
        const id = generateId();
        const now = new Date().toISOString();
        
        const newDraft: Draft = {
          ...draftData,
          id,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          drafts: [newDraft, ...state.drafts],
        }));

        return id;
      },

      updateDraft: (id, updates) => {
        set((state) => ({
          drafts: state.drafts.map((draft) =>
            draft.id === id
              ? {
                  ...draft,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : draft
          ),
        }));
      },

      removeDraft: (id) => {
        set((state) => ({
          drafts: state.drafts.filter((draft) => draft.id !== id),
        }));
      },

      getDraft: (id) => {
        return get().drafts.find((draft) => draft.id === id);
      },

      clearDrafts: () => {
        set({ drafts: [] });
      },
    }),
    {
      name: 'muri-drafts-storage',
    }
  )
);

// Helper function to create a draft from configurator data
export function createDraftData(
  modelName: string,
  modelInfo: ModelInfo | null,
  config: {
    quantity: number;
    quality: string;
    material: string;
    color: string;
    infillType: string;
    infillDensity: number;
    instructions: string;
  }
): Omit<Draft, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    modelName,
    modelInfo,
    config,
  };
}

