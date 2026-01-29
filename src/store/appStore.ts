import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppState {
  selectedSource: string;
  selectedInterval: number;
  favorites: string[];
}

export interface AppActions {
  setSelectedSource: (source: string) => void;
  setSelectedInterval: (interval: number) => void;
  toggleFavorite: (id: string) => void;
}

export type AppStore = AppState & AppActions;

const initialState: AppState = {
  selectedSource: 'bing',
  selectedInterval: 3600,
  favorites: [],
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...initialState,

      setSelectedSource: (source) => set({ selectedSource: source }),

      setSelectedInterval: (interval) => set({ selectedInterval: interval }),

      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((f) => f !== id)
            : [...state.favorites, id],
        })),
    }),
    {
      name: 'wallpaper-mate-storage',
      partialize: (state) => ({
        selectedSource: state.selectedSource,
        selectedInterval: state.selectedInterval,
        favorites: state.favorites,
      }),
    }
  )
);
