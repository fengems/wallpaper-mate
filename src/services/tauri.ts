import { invoke } from '@tauri-apps/api/core';
import type { WallpaperInfo, Settings } from '../types';
import type { WallpaperSource } from '../types';

export async function fetchNextWallpaper(source: WallpaperSource): Promise<WallpaperInfo> {
  return invoke('fetch_next_wallpaper', { source: source === 'bing' ? 'bing' : 'wallhaven' });
}

export async function setWallpaper(info: WallpaperInfo): Promise<void> {
  return invoke('set_wallpaper_from_info', { wallpaper: info });
}

export async function getSettings(): Promise<Settings> {
  return invoke('get_settings');
}

export async function saveSettings(settings: Settings): Promise<void> {
  return invoke('save_settings', { settings });
}

export async function listenToEvents(callbacks: {
  onWallpaperFetched: (info: WallpaperInfo) => void;
  onWallpaperSet: (path: string) => void;
}): Promise<() => void> {
  await Promise.all([
    invoke('plugin:register', {
      pluginName: 'wallpaper',
      events: [
        { name: 'wallpaper-fetched', type: 'sync' },
        { name: 'wallpaper-set', type: 'sync' },
      ],
    }),
  ]);

  const { listen } = await import('@tauri-apps/api/event');

  const unlistenFetched = await listen('wallpaper-fetched', (event) => {
    callbacks.onWallpaperFetched(event.payload as WallpaperInfo);
  });

  const unlistenSet = await listen('wallpaper-set', (event) => {
    callbacks.onWallpaperSet(event.payload as string);
  });

  return () => {
    unlistenFetched();
    unlistenSet();
  };
}
