import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NewsletterStore {
  hasSubmittedNewsletter: boolean;
  markAsSubmitted: () => void;
  reset: () => void;
}

export const useNewsletterStore = create<NewsletterStore>()(
  persist(
    (set) => ({
      hasSubmittedNewsletter: false,

      markAsSubmitted: () => set({ hasSubmittedNewsletter: true }),

      reset: () => set({ hasSubmittedNewsletter: false }),
    }),
    {
      name: 'muri-newsletter-storage',
    }
  )
);
