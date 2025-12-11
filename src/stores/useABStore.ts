import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
type Variant = 'A' | 'B';
interface ABState {
  variant: Variant;
  initializeVariant: () => void;
  toggleVariant: () => void; // For testing purposes
}
export const useABStore = create<ABState>()(
  persist(
    (set, get) => ({
      variant: 'A',
      initializeVariant: () => {
        // Only randomize if it's the first time (or not persisted)
        // The check for 'A' is a simple way to see if it's the default initial state.
        if (get().variant === 'A' && typeof window !== 'undefined' && !localStorage.getItem('vonbusch-ab-storage')) {
          set({ variant: Math.random() < 0.5 ? 'A' : 'B' });
        }
      },
      toggleVariant: () => set((state) => ({ variant: state.variant === 'A' ? 'B' : 'A' })),
    }),
    {
      name: 'vonbusch-ab-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
// Initialize variant on load
if (typeof window !== 'undefined') {
  useABStore.getState().initializeVariant();
}
// Primitive selectors
export const useABVariant = () => useABStore((state) => state.variant);