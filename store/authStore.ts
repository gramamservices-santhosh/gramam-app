import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  phoneNumber: string;
  _hasHydrated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setPhoneNumber: (phone: string) => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (state: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      phoneNumber: '',
      _hasHydrated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setPhoneNumber: (phoneNumber) => set({ phoneNumber }),

      setLoading: (isLoading) => set({ isLoading }),

      setHasHydrated: (_hasHydrated) => set({ _hasHydrated, isLoading: false }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          phoneNumber: '',
        }),
    }),
    {
      name: 'gramam-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
