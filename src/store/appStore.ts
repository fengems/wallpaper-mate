import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppState {
  randomPageSource: string;
  listPageSource: string;
  selectedInterval: number;
  favorites: string[];
}

export interface AppActions {
  setRandomPageSource: (source: string) => void;
  setListPageSource: (source: string) => void;
  setSelectedInterval: (interval: number) => void;
  toggleFavorite: (id: string) => void;
}

export type AppStore = AppState & AppActions;

const initialState: AppState = {
  randomPageSource: 'bing',
  listPageSource: 'bing',
  selectedInterval: 3600,
  favorites: [],
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...initialState,

      setRandomPageSource: (source) => set({ randomPageSource: source }),

      setListPageSource: (source) => set({ listPageSource: source }),

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
        randomPageSource: state.randomPageSource,
        listPageSource: state.listPageSource,
        selectedInterval: state.selectedInterval,
        favorites: state.favorites,
      }),
    }
  )
);
