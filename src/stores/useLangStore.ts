import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Language } from '@/lib/i18n';


interface LangState {
  lang: Language;
  toggleLang: () => void;
  setLang: (lang: Language) => void;
}
export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: 'de',
      toggleLang: () =>
        set((state) => ({
          lang: state.lang === 'de' ? 'en' : 'de',
        })),
      setLang: (lang) => set({ lang }),
    }),
    {
      name: 'vonbusch-language-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// HMR compatibility: clear persisted storage on module dispose
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    // @ts-expect-error – `persist` may be undefined in non-persisted builds
    useLangStore.persist?.clearStorage?.();
  });
}
// Primitive selector hooks to prevent unnecessary re-renders and stabilize usage
export const useCurrentLang = () => useLangStore((state) => state.lang);
export const useToggleLang = () => useLangStore((state) => state.toggleLang);
export const useSetLang = () => useLangStore((state) => state.setLang);