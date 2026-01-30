import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  WallpaperListItem,
  WallpaperInfo,
  PaginatedResponse,
} from '../types';

/* 列表页面数据状态 */
export interface ListPageData {
  wallpapers: WallpaperListItem[];
  page: number;
  pagination: Omit<PaginatedResponse<any>, 'data'> | null;
  loaded: boolean;
}

export interface AppState {
  randomPageSource: string;
  listPageSource: string;
  selectedInterval: number;
  favorites: string[];
  /* 页面数据 - 不持久化，应用重启时重置 */
  listPageData: ListPageData;
  randomPageWallpaper: WallpaperInfo | null;
  randomPageLoaded: boolean;
}

export interface AppActions {
  setRandomPageSource: (source: string) => void;
  setListPageSource: (source: string) => void;
  setSelectedInterval: (interval: number) => void;
  toggleFavorite: (id: string) => void;
  /* 列表页面数据操作 */
  setListPageData: (data: Partial<ListPageData>) => void;
  resetListPageData: () => void;
  /* 随机壁纸页面数据操作 */
  setRandomPageWallpaper: (wallpaper: WallpaperInfo | null) => void;
  setRandomPageLoaded: (loaded: boolean) => void;
  resetRandomPageData: () => void;
}

export type AppStore = AppState & AppActions;

const initialListPageData: ListPageData = {
  wallpapers: [],
  page: 1,
  pagination: null,
  loaded: false,
};

const initialState: Omit<
  AppState,
  'listPageData' | 'randomPageWallpaper' | 'randomPageLoaded'
> = {
  randomPageSource: 'bing',
  listPageSource: 'bing',
  selectedInterval: 3600,
  favorites: [],
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...initialState,
      listPageData: initialListPageData,
      randomPageWallpaper: null,
      randomPageLoaded: false,

      setRandomPageSource: (source) => set({ randomPageSource: source }),

      setListPageSource: (source) => set({ listPageSource: source }),

      setSelectedInterval: (interval) => set({ selectedInterval: interval }),

      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((f) => f !== id)
            : [...state.favorites, id],
        })),

      /* 列表页面数据操作 */
      setListPageData: (data) =>
        set((state) => ({
          listPageData: { ...state.listPageData, ...data },
        })),

      resetListPageData: () =>
        set({
          listPageData: initialListPageData,
        }),

      /* 随机壁纸页面数据操作 */
      setRandomPageWallpaper: (wallpaper) =>
        set({ randomPageWallpaper: wallpaper }),

      setRandomPageLoaded: (loaded) => set({ randomPageLoaded: loaded }),

      resetRandomPageData: () =>
        set({
          randomPageWallpaper: null,
          randomPageLoaded: false,
        }),
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
