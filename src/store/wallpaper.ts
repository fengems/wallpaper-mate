import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { WallpaperInfo } from '../types';

interface WallpaperState {
  current: WallpaperInfo | null;
  loading: boolean;
  error: string | null;
  fetchNext: (source: string) => Promise<void>;
  setWallpaper: (info: WallpaperInfo) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useWallpaperStore = create<WallpaperState>((set) => ({
  current: null,
  loading: false,
  error: null,

  fetchNext: async (source) => {
    set({ loading: true, error: null });

    try {
      const wallpaper = await invoke<WallpaperInfo>('fetch_next_wallpaper', { source });
      set({ current: wallpaper, loading: false });
    } catch (err) {
      set({ loading: false, error: `Failed to fetch wallpaper: ${err}` });
    }
  },

  setWallpaper: async (info) => {
    try {
      await invoke('set_wallpaper_from_info', { wallpaper: info });
    } catch (err) {
      throw new Error(`Failed to set wallpaper: ${err}`);
    }
  },

  setError: (error) => set({ error }),
}));
