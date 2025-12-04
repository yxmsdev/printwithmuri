import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProfileImageState {
  profileImage: string | null;
  setProfileImage: (image: string | null) => void;
  clearProfileImage: () => void;
}

export const useProfileImageStore = create<ProfileImageState>()(
  persist(
    (set) => ({
      profileImage: null,
      setProfileImage: (image) => set({ profileImage: image }),
      clearProfileImage: () => set({ profileImage: null }),
    }),
    {
      name: 'profile-image-storage',
    }
  )
);
