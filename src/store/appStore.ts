import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  WallpaperListItem,
  WallpaperInfo,
  PaginatedResponse,
} from '../types';

// 带完整信息的收藏项
export interface FavoriteItem extends WallpaperInfo {
  likedAt: number;
}

// 下载记录项
export interface DownloadItem extends WallpaperInfo {
  downloadedAt: number;
  localPath: string;
}

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
  // 收藏列表（包含完整壁纸信息）
  favorites: FavoriteItem[];
  // 下载列表
  downloads: DownloadItem[];
  /* 页面数据 - 不持久化，应用重启时重置 */
  listPageData: ListPageData;
  randomPageWallpaper: WallpaperInfo | null;
  randomPageLoaded: boolean;
}

export interface AppActions {
  setRandomPageSource: (source: string) => void;
  setListPageSource: (source: string) => void;
  setSelectedInterval: (interval: number) => void;
  // 收藏操作
  toggleFavorite: (wallpaper: WallpaperInfo) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  // 下载操作
  addDownload: (wallpaper: WallpaperInfo, localPath: string) => void;
  removeDownload: (id: string) => void;
  isDownloaded: (id: string) => boolean;
  getDownloadLocalPath: (id: string) => string | undefined;
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
  downloads: [],
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      listPageData: initialListPageData,
      randomPageWallpaper: null,
      randomPageLoaded: false,

      setRandomPageSource: (source) => set({ randomPageSource: source }),

      setListPageSource: (source) => set({ listPageSource: source }),

      setSelectedInterval: (interval) => set({ selectedInterval: interval }),

      // 切换收藏状态
      toggleFavorite: (wallpaper) =>
        set((state) => {
          const exists = state.favorites.find((f) => f.id === wallpaper.id);
          if (exists) {
            return {
              favorites: state.favorites.filter((f) => f.id !== wallpaper.id),
            };
          } else {
            const newItem: FavoriteItem = {
              ...wallpaper,
              likedAt: Date.now(),
            };
            return {
              favorites: [newItem, ...state.favorites],
            };
          }
        }),

      // 移除收藏
      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== id),
        })),

      // 检查是否已收藏
      isFavorite: (id) => {
        return get().favorites.some((f) => f.id === id);
      },

      // 添加下载记录
      addDownload: (wallpaper, localPath) =>
        set((state) => {
          const exists = state.downloads.find((d) => d.id === wallpaper.id);
          if (exists) {
            // 更新现有记录的本地路径
            return {
              downloads: state.downloads.map((d) =>
                d.id === wallpaper.id ? { ...d, localPath } : d
              ),
            };
          } else {
            const newItem: DownloadItem = {
              ...wallpaper,
              downloadedAt: Date.now(),
              localPath,
            };
            return {
              downloads: [newItem, ...state.downloads],
            };
          }
        }),

      // 移除下载记录
      removeDownload: (id) =>
        set((state) => ({
          downloads: state.downloads.filter((d) => d.id !== id),
        })),

      // 检查是否已下载
      isDownloaded: (id) => {
        return get().downloads.some((d) => d.id === id);
      },

      // 获取下载的本地路径
      getDownloadLocalPath: (id) => {
        const download = get().downloads.find((d) => d.id === id);
        return download?.localPath;
      },

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
        downloads: state.downloads,
      }),
    }
  )
);
