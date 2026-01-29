import { invoke } from '@tauri-apps/api/core';
import type { WallpaperInfo, Settings, WallpaperListItem, PaginatedResponse } from '../types';
import type { WallpaperSource } from '../types';

export async function fetchNextWallpaper(source: WallpaperSource, apiKey: string | null = null): Promise<WallpaperInfo> {
  return invoke('fetch_next_wallpaper', { source: source === 'bing' ? 'bing' : 'wallhaven', apiKey });
}

export async function fetchWallpapersList(
  source: WallpaperSource, 
  page: number, 
  apiKey: string | null = null
): Promise<PaginatedResponse<WallpaperListItem>> {
  return invoke('fetch_wallpapers_list', { source, page, apiKey });
}

export async function setWallpaper(info: WallpaperInfo): Promise<void> {
  return invoke('set_wallpaper_from_info', { wallpaper: info });
}

export async function getSettings(): Promise<Settings> {
  return { source: 'bing' };
}

export async function saveSettings(_settings: Settings): Promise<void> {
}

export async function listenToEvents(callbacks: {
  onWallpaperFetched: (info: WallpaperInfo) => void;
  onWallpaperSet: (path: string) => void;
}): Promise<() => void> {
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
