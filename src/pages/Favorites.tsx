import { useState, useEffect } from 'react';
import { invoke, convertFileSrc } from '@tauri-apps/api/core';
import { Heart, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppStore } from '../store/appStore';
import type { WallpaperInfo } from '../types';

export default function Favorites() {
  const { favorites, removeFavorite, isDownloaded, getDownloadLocalPath } =
    useAppStore();
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSetWallpaper = async (wallpaper: WallpaperInfo) => {
    try {
      await invoke('set_wallpaper_from_info', { wallpaper });
      setToast({ message: '壁纸设置成功', type: 'success' });
    } catch (error) {
      console.error('Failed to set wallpaper:', error);
      setToast({ message: `设置失败: ${error}`, type: 'error' });
    }
  };

  const handleRemoveFavorite = (id: string) => {
    removeFavorite(id);
  };

  const handleImageError = (id: string) => {
    setImageErrors((prev) => new Set([...prev, id]));
  };

  const getImageUrl = (item: WallpaperInfo) => {
    if (item.localPath) {
      return convertFileSrc(item.localPath);
    }
    const localPath = getDownloadLocalPath(item.id);
    if (localPath) {
      return convertFileSrc(localPath);
    }
    return item.url;
  };

  return (
    <div className="flex flex-col h-full relative bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <header className="h-16 shrink-0 border-b border-white/5 bg-black/20 backdrop-blur-xl flex items-center px-6">
        <h1 className="text-lg font-semibold text-white">Like 列表</h1>
        <span className="ml-3 text-xs text-zinc-500">
          {favorites.length} 张已收藏
        </span>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        {favorites.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900/50 flex items-center justify-center border border-white/5">
              <Heart className="w-8 h-8 text-zinc-600" />
            </div>
            <p className="text-zinc-500 text-sm">暂无收藏的壁纸</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
            {favorites.map((item) => {
              const hasError = imageErrors.has(item.id);
              const downloaded = isDownloaded(item.id);
              const imageUrl = getImageUrl(item);

              return (
                <div
                  key={item.id}
                  className="group relative rounded-2xl overflow-hidden bg-zinc-900/50 border border-white/[0.05]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {hasError ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80">
                        <ImageIcon className="w-8 h-8 text-zinc-600" />
                      </div>
                    ) : (
                      <img
                        src={imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(item.id)}
                      />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                      <p className="text-white/90 text-sm font-medium truncate">
                        {item.title}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/70 text-[10px]">
                          {item.source}
                        </span>
                        {downloaded && (
                          <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px]">
                            已下载
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() => handleSetWallpaper(item)}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 transition-colors"
                        >
                          设为壁纸
                        </button>

                        <button
                          onClick={() => handleRemoveFavorite(item.id)}
                          className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
                          title="取消收藏"
                        >
                          <Heart className="w-4 h-4 fill-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={cn(
              'px-4 py-2 rounded-lg shadow-lg text-sm font-medium',
              toast.type === 'success'
                ? 'bg-emerald-500/90 text-white'
                : 'bg-red-500/90 text-white'
            )}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
