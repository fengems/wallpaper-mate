import { useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import {
  Image as ImageIcon,
  Download,
  RefreshCw,
  Monitor,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { cn } from '../lib/utils';

interface WallpaperInfo {
  id: string;
  url: string;
  thumbUrl: string;
  title: string;
  source: string;
  localPath?: string; // Optional local path if cached
  cached: boolean;
}

const SOURCES = [
  { id: 'bing', label: 'Bing Daily', color: 'from-blue-500 to-cyan-500' },
  { id: 'wallhaven', label: 'Wallhaven', color: 'from-orange-500 to-red-600' },
];

export default function RandomWallpaper() {
  const [currentWallpaper, setCurrentWallpaper] =
    useState<WallpaperInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState('bing');
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

  // 监听 ESC 键关闭全屏预览
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
        setCurrentWallpaper(event.payload as WallpaperInfo);
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

    fetchNextWallpaper();

    return () => {
      cleanup.then((unlisten) => unlisten());
    };
  }, []);

  const fetchNextWallpaper = async (targetSource = source) => {
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
    setSource(newSource);
    if (newSource !== source) {
      fetchNextWallpaper(newSource);
    }
  };

  const handleSetWallpaper = async () => {
    if (currentWallpaper) {
      try {
        await invoke('set_wallpaper_from_info', {
          wallpaper: currentWallpaper,
        });
      } catch (error) {
        console.error('Failed to set wallpaper:', error);
        setToast({ message: `设置失败: ${error}`, type: 'error' });
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 relative">
      <header className="h-16 shrink-0 border-b border-white/5 flex items-center justify-between px-6 bg-black/20 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center border border-white/10">
              <ImageIcon className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-100 tracking-tight">
              随机壁纸
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-wider">
              Random
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {SOURCES.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSourceChange(s.id)}
              className={cn(
                'relative px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-300',
                source === s.id
                  ? 'text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              {source === s.id && (
                <span
                  className={cn(
                    'absolute inset-0 bg-gradient-to-r rounded-lg opacity-90',
                    s.color
                  )}
                />
              )}
              <span className="relative">{s.label}</span>
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 min-h-0 relative group p-4 flex items-center justify-center bg-zinc-950/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-zinc-950/50 to-zinc-950 pointer-events-none" />

        {currentWallpaper ? (
          <div className="relative max-w-full max-h-full flex flex-col items-center justify-center z-10 transition-all duration-500">
            <div className="relative rounded-lg overflow-hidden shadow-2xl shadow-black ring-1 ring-white/10 group-hover:ring-white/20 transition-all duration-500">
              <img
                src={currentWallpaper.localPath || currentWallpaper.url}
                alt={currentWallpaper.title}
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
                    {currentWallpaper.title}
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
          onClick={() => fetchNextWallpaper()}
          disabled={loading}
          className="group flex flex-col items-center gap-1.5 p-2 rounded-xl text-zinc-500 hover:text-zinc-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:bg-zinc-800 group-hover:border-zinc-700 transition-all group-active:scale-95">
            <RefreshCw
              className={cn(
                'w-4 h-4 transition-transform duration-700',
                loading && 'animate-spin'
              )}
            />
          </div>
          <span className="text-[10px] font-medium">换一张</span>
        </button>

        <button
          onClick={handleSetWallpaper}
          disabled={!currentWallpaper || loading}
          className="group flex flex-col items-center gap-1.5 p-2 rounded-xl text-zinc-300 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center shadow-lg shadow-white/5 group-hover:shadow-white/20 group-hover:scale-105 transition-all group-active:scale-95">
            <Download className="w-5 h-5 text-black" />
          </div>
          <span className="text-[10px] font-medium">设为壁纸</span>
        </button>
      </footer>

      {toast && (
        <div
          className={cn(
            'absolute top-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full backdrop-blur-md border shadow-xl text-xs font-medium z-50 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300',
            toast.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          )}
        >
          {toast.type === 'success' && (
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          )}
          {toast.type === 'error' && (
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          )}
          {toast.message}
        </div>
      )}

      {isPreviewOpen && currentWallpaper && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-300 cursor-zoom-out"
          onClick={() => setIsPreviewOpen(false)}
        >
          <button
            onClick={() => setIsPreviewOpen(false)}
            className="absolute top-6 right-6 p-1.5 rounded-md text-white/50 hover:bg-zinc-800/50 hover:text-white transition-colors duration-200 z-50"
          >
            <Minimize2 className="w-5 h-5" />
          </button>

          <img
            src={currentWallpaper.localPath || currentWallpaper.url}
            alt={currentWallpaper.title}
            className="max-w-full max-h-screen w-auto h-auto object-contain shadow-2xl"
          />

          <div
            className="absolute bottom-12 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full bg-zinc-950/30 backdrop-blur-xl border border-white/10 text-white/90 text-sm font-medium shadow-2xl shadow-black/20 animate-in slide-in-from-bottom-4 fade-in duration-500 hover:bg-zinc-950/50 transition-colors cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="drop-shadow-md tracking-wide">
              {currentWallpaper.title}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
