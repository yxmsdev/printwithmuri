import { create } from 'zustand';

interface LandingState {
  isLandingPage: boolean;
  setIsLandingPage: (value: boolean) => void;
}

export const useLandingStore = create<LandingState>((set) => ({
  isLandingPage: true,
  setIsLandingPage: (value) => set({ isLandingPage: value }),
}));
