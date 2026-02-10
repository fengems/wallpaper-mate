import { invoke } from '@tauri-apps/api/core';
import type {
  WallpaperInfo,
  Settings,
  WallpaperListItem,
  PaginatedResponse,
} from '../types';
import type { WallpaperSource } from '../types';

export async function fetchNextWallpaper(
  source: WallpaperSource,
  apiKey: string | null = null
): Promise<WallpaperInfo> {
  return invoke('fetch_next_wallpaper', { source, api_key: apiKey });
}

export async function fetchWallpapersList(
  source: WallpaperSource,
  page: number,
  apiKey: string | null = null
): Promise<PaginatedResponse<WallpaperListItem>> {
  return invoke('fetch_wallpapers_list', { source, page, api_key: apiKey });
}

export async function downloadWallpaper(info: WallpaperInfo): Promise<string> {
  return invoke('download_wallpaper', { wallpaper: info });
}

export async function setWallpaper(info: WallpaperInfo): Promise<void> {
  return invoke('set_wallpaper_from_info', { wallpaper: info });
}

export async function getSettings(): Promise<Settings> {
  try {
    const settings = await invoke<Settings>('get_settings');
    return settings || { source: 'bing' };
  } catch {
    return { source: 'bing' };
  }
}

export async function saveSettings(_settings: Settings): Promise<void> {}

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

export async function setAutoSwitchConfig(
  source: WallpaperSource,
  enabled: boolean,
  intervalSeconds: number
): Promise<void> {
  return invoke('set_auto_switch_config', { source, enabled, intervalSeconds });
}

export async function getAutoSwitchConfig(
  source: WallpaperSource
): Promise<{ enabled: boolean; intervalSeconds: number } | null> {
  return invoke('get_auto_switch_config', { source });
}

export async function stopAutoSwitch(source: WallpaperSource): Promise<void> {
  return invoke('stop_auto_switch', { source });
}

export async function isAutoSwitchRunning(
  source: WallpaperSource
): Promise<boolean> {
  return invoke('is_auto_switch_running', { source });
}

export async function getAutoSwitchInterval(
  source: WallpaperSource
): Promise<number | null> {
  return invoke<number | null>('get_auto_switch_interval', { source });
}

export async function listDownloads(): Promise<
  Array<{ id: string; path: string }>
> {
  const result = await invoke<Array<[string, string]>>('list_downloads');
  return result.map(([id, path]) => ({ id, path }));
}

export async function deleteDownload(id: string): Promise<boolean> {
  return invoke<boolean>('delete_download', { id });
}

export async function revealInFinder(path: string): Promise<void> {
  return invoke('reveal_in_finder', { path });
}
