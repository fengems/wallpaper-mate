const CACHE_PREFIX = 'wallpaper_cache_';
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export interface CacheEntry {
  url: string;
  timestamp: number;
}

export function getCachedImage(url: string): string | null {
  const cachedUrl = localStorage.getItem(`${CACHE_PREFIX}${url}`);
  const cachedTimestamp = localStorage.getItem(
    `${CACHE_PREFIX}timestamp_${url}`
  );

  if (!cachedUrl || !cachedTimestamp) return null;

  const now = Date.now();
  if (now - parseInt(cachedTimestamp) > CACHE_DURATION) {
    localStorage.removeItem(`${CACHE_PREFIX}${url}`);
    localStorage.removeItem(`${CACHE_PREFIX}timestamp_${url}`);
    return null;
  }

  return cachedUrl;
}

export async function setCachedImage(url: string): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    localStorage.setItem(`${CACHE_PREFIX}${url}`, objectUrl);
    localStorage.setItem(
      `${CACHE_PREFIX}timestamp_${url}`,
      Date.now().toString()
    );
  } catch (error) {
    console.error('Failed to cache image:', error);
  }
}

export function clearExpiredCache(): void {
  const now = Date.now();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(CACHE_PREFIX)) continue;

    const timestampKey = `${CACHE_PREFIX}timestamp_${key.substring(CACHE_PREFIX.length)}`;
    const timestamp = localStorage.getItem(timestampKey);
    if (timestamp && now - parseInt(timestamp) > CACHE_DURATION) {
      localStorage.removeItem(key);
      localStorage.removeItem(timestampKey);
    }
  }
}
