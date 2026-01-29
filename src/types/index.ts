export const WallpaperSource = {
  Bing: 'bing',
  Wallhaven: 'wallhaven',
  Unsplash: 'unsplash',
  Pixabay: 'pixabay',
  Reddit: 'reddit',
} as const;

export type WallpaperSource =
  (typeof WallpaperSource)[keyof typeof WallpaperSource];

export interface WallpaperInfo {
  id: string;
  title: string;
  url: string;
  source: WallpaperSource;
  localPath?: string;
  cached: boolean;
}

export interface WallpaperListItem {
  id: string;
  title: string;
  url: string;
  thumbUrl: string;
  source: WallpaperSource;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

export interface Settings {
  source: WallpaperSource;
  wallhavenApiKey?: string;
}

export type WallpaperEvent =
  | { event: 'wallpaper-fetched'; payload: WallpaperInfo }
  | { event: 'wallpaper-set'; payload: string }
  | { event: 'fetch-wallpaper'; payload: void }
  | { event: 'open-settings'; payload: void };
