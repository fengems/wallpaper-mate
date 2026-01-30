import { useState, useEffect } from 'react';
import { invoke, convertFileSrc } from '@tauri-apps/api/core';
import { Trash2, FolderOpen, Heart, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppStore } from '../store/appStore';
import {
  listDownloads,
  deleteDownload,
  revealInFinder,
} from '../services/tauri';
import type { WallpaperInfo } from '../types';

export default function Downloads() {
  const { downloads, removeDownload, addDownload, isFavorite, toggleFavorite } =
    useAppStore();
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    setLoading(true);
    try {
      const files = await listDownloads();

      files.forEach(({ id, path: filePath }) => {
        const existing = downloads.find((d) => d.id === id);
        if (!existing) {
          const wallpaper: WallpaperInfo = {
            id,
            title: `Downloaded Wallpaper ${id}`,
            url: `file://${filePath}`,
            source: 'bing',
            localPath: filePath,
            cached: true,
          };
          addDownload(wallpaper, filePath);
        }
      });
    } catch (error) {
      console.error('Failed to load downloads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, _path: string) => {
    try {
      const success = await deleteDownload(id);
      if (success) {
        removeDownload(id);
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleReveal = async (path: string) => {
    try {
      await revealInFinder(path);
    } catch (error) {
      console.error('Failed to reveal:', error);
    }
  };

  const handleSetWallpaper = async (wallpaper: WallpaperInfo) => {
    try {
      await invoke('set_wallpaper_from_info', { wallpaper });
      setToast({ message: '壁纸设置成功', type: 'success' });
    } catch (error) {
      console.error('Failed to set wallpaper:', error);
      setToast({ message: `设置失败: ${error}`, type: 'error' });
    }
  };

  const handleToggleFavorite = (wallpaper: WallpaperInfo) => {
    toggleFavorite(wallpaper);
  };

  const handleImageError = (id: string) => {
    setImageErrors((prev) => new Set([...prev, id]));
  };

  return (
    <div className="flex flex-col h-full relative bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <header className="h-16 shrink-0 border-b border-white/5 bg-black/20 backdrop-blur-xl flex items-center px-6">
        <h1 className="text-lg font-semibold text-white">下载列表</h1>
        <span className="ml-3 text-xs text-zinc-500">
          {downloads.length} 张已下载
        </span>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-12 h-12 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : downloads.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900/50 flex items-center justify-center border border-white/5">
              <ImageIcon className="w-8 h-8 text-zinc-600" />
            </div>
            <p className="text-zinc-500 text-sm">暂无下载的壁纸</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
            {downloads.map((item) => {
              const hasError = imageErrors.has(item.id);
              const isLiked = isFavorite(item.id);

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
                        src={convertFileSrc(item.localPath)}
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

                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() => handleSetWallpaper(item)}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 transition-colors"
                        >
                          设为壁纸
                        </button>

                        <button
                          onClick={() => handleToggleFavorite(item)}
                          className={cn(
                            'p-2 rounded-lg transition-colors',
                            isLiked
                              ? 'bg-red-500/20 text-red-500'
                              : 'bg-white/10 text-white/70 hover:bg-white/20'
                          )}
                        >
                          <Heart
                            className={cn('w-4 h-4', isLiked && 'fill-red-500')}
                          />
                        </button>

                        <button
                          onClick={() => handleReveal(item.localPath)}
                          className="p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
                          title="在 Finder 中打开"
                        >
                          <FolderOpen className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id, item.localPath)}
                          className="p-2 rounded-lg bg-white/10 text-white/70 hover:bg-red-500/20 hover:text-red-500 transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
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
