import { useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import {
  Download,
  RefreshCw,
  Monitor,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { cn } from '../lib/utils';
import PageHeader from '../components/PageHeader';
import type { WallpaperInfo } from '../types';
import { useAppStore } from '../store/appStore';

const SOURCES = [
  { id: 'bing', label: 'Bing Daily', color: 'from-blue-500 to-cyan-500' },
  { id: 'wallhaven', label: 'Wallhaven', color: 'from-orange-500 to-red-600' },
  { id: 'unsplash', label: 'Unsplash', color: 'from-purple-500 to-pink-500' },
  { id: 'pixabay', label: 'Pixabay', color: 'from-green-500 to-teal-500' },
];

export default function RandomWallpaper() {
  const {
    randomPageSource,
    setRandomPageSource,
    randomPageWallpaper,
    randomPageLoaded,
    setRandomPageWallpaper,
    setRandomPageLoaded,
  } = useAppStore();

  const [loading, setLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
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
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPreviewOpen(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    const setupListeners = async () => {
      const unlistenFetch = await listen('wallpaper-fetched', (event) => {
        setRandomPageWallpaper(event.payload as WallpaperInfo);
        setLoading(false);
      });

      const unlistenSet = await listen('wallpaper-set', () => {
        setToast({ message: '壁纸设置成功', type: 'success' });
      });

      return () => {
        unlistenFetch();
        unlistenSet();
      };
    };

    const cleanup = setupListeners();

    if (!randomPageLoaded) {
      fetchNextWallpaper(randomPageSource);
      setRandomPageLoaded(true);
    }

    return () => {
      cleanup.then((unlisten) => unlisten());
    };
  }, [
    randomPageLoaded,
    randomPageSource,
    setRandomPageWallpaper,
    setRandomPageLoaded,
  ]);

  const fetchNextWallpaper = async (targetSource: string) => {
    setLoading(true);
    try {
      await invoke('fetch_next_wallpaper', {
        source: targetSource,
        apiKey: null,
      });
    } catch (error) {
      console.error('Failed to fetch wallpaper:', error);
      setToast({ message: `获取失败: ${error}`, type: 'error' });
      setLoading(false);
    }
  };

  const handleSourceChange = (newSource: string) => {
    setRandomPageSource(newSource);
    if (newSource !== randomPageSource) {
      fetchNextWallpaper(newSource);
    }
  };

  const handleSetWallpaper = async () => {
    if (randomPageWallpaper) {
      try {
        await invoke('set_wallpaper_from_info', {
          wallpaper: randomPageWallpaper,
        });
      } catch (error) {
        console.error('Failed to set wallpaper:', error);
        setToast({ message: `设置失败: ${error}`, type: 'error' });
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 relative">
      <PageHeader
        title="随机壁纸"
        subtitle="Random"
        sources={SOURCES}
        currentSource={randomPageSource}
        onSourceChange={handleSourceChange}
      />

      <main className="flex-1 min-h-0 relative group p-4 flex items-center justify-center bg-zinc-950/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-zinc-950/50 to-zinc-950 pointer-events-none" />

        {randomPageWallpaper ? (
          <div className="relative max-w-full max-h-full flex flex-col items-center justify-center z-10 transition-all duration-500">
            <div className="relative rounded-lg overflow-hidden shadow-2xl shadow-black ring-1 ring-white/10 group-hover:ring-white/20 transition-all duration-500">
              <img
                src={randomPageWallpaper.localPath || randomPageWallpaper.url}
                alt={randomPageWallpaper.title}
                className={cn(
                  'max-w-full max-h-[calc(92vh-9rem)] w-auto h-auto object-contain transition-all duration-700 ease-out cursor-zoom-in',
                  loading
                    ? 'opacity-50 blur-lg scale-95'
                    : 'opacity-100 blur-0 scale-100'
                )}
                onClick={() => setIsPreviewOpen(true)}
              />

              <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-y-2 group-hover:translate-y-0">
                <div className="flex items-center justify-between text-white/90">
                  <span className="text-xs font-medium truncate flex-1 mr-4">
                    {randomPageWallpaper.title}
                  </span>
                  <button
                    onClick={() => setIsPreviewOpen(true)}
                    className="p-1.5 rounded-md text-white/50 hover:bg-black/50 hover:text-white transition-colors duration-200"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-zinc-600 gap-3 animate-pulse">
            <Monitor className="w-12 h-12 opacity-20" />
            <p className="text-xs font-medium tracking-widest uppercase opacity-40">
              Waiting for Signal...
            </p>
          </div>
        )}
      </main>

      <footer className="h-20 shrink-0 border-t border-zinc-800/50 bg-zinc-950/40 flex items-center justify-center gap-6 z-20">
        <button
          onClick={() => fetchNextWallpaper(randomPageSource)}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          换一张
        </button>

        <button
          onClick={handleSetWallpaper}
          disabled={!randomPageWallpaper || loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-200 text-xs font-medium rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          设为壁纸
        </button>
      </footer>

      {isPreviewOpen && randomPageWallpaper && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={() => setIsPreviewOpen(false)}
        >
          <button
            onClick={() => setIsPreviewOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <Minimize2 className="w-5 h-5" />
          </button>

          <img
            src={randomPageWallpaper.url}
            alt={randomPageWallpaper.title}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-black/60 backdrop-blur-md rounded-full">
            <p className="text-white/90 text-sm font-medium">
              {randomPageWallpaper.title}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
