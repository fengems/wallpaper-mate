import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { Settings } from '../types';
import { WallpaperSource } from '../types';

interface SettingsState {
  source: WallpaperSource;
  wallhavenApiKey: string;
  load: () => Promise<void>;
  save: () => Promise<void>;
  setSource: (source: WallpaperSource) => void;
  setWallhavenApiKey: (key: string) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  source: WallpaperSource.Bing,
  wallhavenApiKey: '',

  load: async () => {
    try {
      const settings = await invoke<Settings>('get_settings');
      if (settings) {
        set({ source: settings.source, wallhavenApiKey: settings.wallhavenApiKey || '' });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  },

  save: async () => {
    try {
      const { source, wallhavenApiKey } = get();
      await invoke('save_settings', {
        settings: { source, wallhavenApiKey: wallhavenApiKey || undefined },
      });
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  },

  setSource: (source) => set({ source }),

  setWallhavenApiKey: (key) => set({ wallhavenApiKey: key }),
}));
