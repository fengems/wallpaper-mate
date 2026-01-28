import { useEffect, useState, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { Image as ImageIcon, Download, RefreshCw, ChevronDown, Monitor, Maximize2, Minimize2, Check } from 'lucide-react';
import { cn } from './lib/utils';

interface WallpaperInfo {
  id: string;
  title: string;
  url: string;
  source: string;
  localPath?: string;
  cached: boolean;
}

const SOURCES = [
  { id: 'bing', label: 'Bing Daily' },
  { id: 'wallhaven', label: 'Wallhaven' },
];

function AppComponent() {
  const [currentWallpaper, setCurrentWallpaper] = useState<WallpaperInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState('bing');
  const [isSourceMenuOpen, setIsSourceMenuOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const sourceMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sourceMenuRef.current && !sourceMenuRef.current.contains(event.target as Node)) {
        setIsSourceMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      cleanup.then(unlisten => unlisten());
    };
  }, []); // 移除 source 依赖，防止切换源时自动刷新，改为用户手动触发或后续逻辑控制

  const fetchNextWallpaper = async (targetSource = source) => {
    setLoading(true);
    try {
      await invoke('fetch_next_wallpaper', { source: targetSource, apiKey: null });
    } catch (error) {
      console.error('Failed to fetch wallpaper:', error);
      setToast({ message: `获取失败: ${error}`, type: 'error' });
      setLoading(false);
    }
  };

  const handleSourceChange = (newSource: string) => {
    setSource(newSource);
    setIsSourceMenuOpen(false);
    // 切换源后自动获取一张新壁纸
    if (newSource !== source) {
      fetchNextWallpaper(newSource);
    }
  };

  const handleSetWallpaper = async () => {
    if (currentWallpaper) {
      try {
        await invoke('set_wallpaper_from_info', { wallpaper: currentWallpaper });
      } catch (error) {
        console.error('Failed to set wallpaper:', error);
        setToast({ message: `设置失败: ${error}`, type: 'error' });
      }
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-black flex items-center justify-center p-4 selection:bg-zinc-800">
      {/* 悬浮主容器 */}
      <div className="w-full max-w-[1280px] h-[92vh] flex flex-col bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/60 rounded-3xl shadow-2xl overflow-hidden relative">
        
        {/* 顶部栏 */}
        <header className="h-16 shrink-0 border-b border-zinc-800/50 flex items-center justify-between px-6 bg-zinc-950/40 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center ring-1 ring-inset ring-white/5">
              <ImageIcon className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-zinc-200 tracking-tight">Wallpaper Mate</h1>
              <p className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">v1.0.0</p>
            </div>
          </div>
          
          {/* 自定义 Select */}
          <div className="relative" ref={sourceMenuRef}>
            <button
              onClick={() => setIsSourceMenuOpen(!isSourceMenuOpen)}
              className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 text-zinc-300 text-xs font-medium rounded-lg pl-3 pr-2 py-1.5 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-700 transition-all active:scale-95"
            >
              <span>{SOURCES.find(s => s.id === source)?.label}</span>
              <ChevronDown className={cn("w-3.5 h-3.5 text-zinc-500 transition-transform duration-300", isSourceMenuOpen && "rotate-180")} />
            </button>

            {isSourceMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-1">
                  {SOURCES.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSourceChange(item.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors",
                        source === item.id 
                          ? "bg-zinc-800 text-white font-medium" 
                          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                      )}
                    >
                      {item.label}
                      {source === item.id && <Check className="w-3 h-3 text-emerald-500" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* 中间图片区域 */}
        <main className="flex-1 min-h-0 relative group p-4 flex items-center justify-center bg-zinc-950/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-zinc-950/50 to-zinc-950 pointer-events-none" />
          
          {currentWallpaper ? (
            <div className="relative max-w-full max-h-full flex flex-col items-center justify-center z-10 transition-all duration-500">
               <div className="relative rounded-lg overflow-hidden shadow-2xl shadow-black ring-1 ring-white/10 group-hover:ring-white/20 transition-all duration-500">
                 <img
                   src={currentWallpaper.localPath || currentWallpaper.url}
                   alt={currentWallpaper.title}
                   className={cn(
                     "max-w-full max-h-[calc(92vh-9rem)] w-auto h-auto object-contain transition-all duration-700 ease-out cursor-zoom-in",
                     loading ? "opacity-50 blur-lg scale-95" : "opacity-100 blur-0 scale-100"
                   )}
                   onClick={() => setIsPreviewOpen(true)}
                 />
                 
                 <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-y-2 group-hover:translate-y-0">
                    <div className="flex items-center justify-between text-white/90">
                      <span className="text-xs font-medium truncate flex-1 mr-4">{currentWallpaper.title}</span>
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
              <p className="text-xs font-medium tracking-widest uppercase opacity-40">Waiting for Signal...</p>
            </div>
          )}
        </main>

        {/* 底部操作栏 */}
        <footer className="h-20 shrink-0 border-t border-zinc-800/50 bg-zinc-950/40 flex items-center justify-center gap-6 z-20">
          <button
            onClick={() => fetchNextWallpaper()}
            disabled={loading}
            className="group flex flex-col items-center gap-1.5 p-2 rounded-xl text-zinc-500 hover:text-zinc-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:bg-zinc-800 group-hover:border-zinc-700 transition-all group-active:scale-95">
              <RefreshCw className={cn("w-4 h-4 transition-transform duration-700", loading && "animate-spin")} />
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

        {/* Toast 提示 */}
        {toast && (
          <div className={cn(
            "absolute top-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full backdrop-blur-md border shadow-xl text-xs font-medium z-50 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300",
            toast.type === 'success' 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-red-500/10 border-red-500/20 text-red-400"
          )}>
            {toast.type === 'success' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
            {toast.type === 'error' && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
            {toast.message}
          </div>
        )}
      </div>

      {/* 全屏预览 Modal */}
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
            <span className="drop-shadow-md tracking-wide">{currentWallpaper.title}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppComponent;
