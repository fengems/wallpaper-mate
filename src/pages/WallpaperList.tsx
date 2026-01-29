import { useState, useEffect, useCallback } from 'react';
import { fetchWallpapersList, setWallpaper } from '../services/tauri';
import type {
  WallpaperSource,
  WallpaperListItem,
  PaginatedResponse,
  WallpaperInfo,
} from '../types';
import PreviewModal from '../components/PreviewModal';
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { cn } from '../lib/utils';

const SOURCES = [
  {
    id: 'wallhaven' as const,
    label: 'Wallhaven',
    color: 'from-orange-500 to-red-600',
  },
  {
    id: 'bing' as const,
    label: 'Bing Daily',
    color: 'from-blue-500 to-cyan-500',
  },
];

export default function WallpaperList() {
  const [source, setSource] = useState<WallpaperSource>('wallhaven');
  const [wallpapers, setWallpapers] = useState<WallpaperListItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<Omit<
    PaginatedResponse<any>,
    'data'
  > | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [previewWallpaper, setPreviewWallpaper] =
    useState<WallpaperInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [imageLoading, setImageLoading] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const fetchWallpapers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchWallpapersList(source, page);
      setWallpapers(response.data);
      setPagination({
        currentPage: response.currentPage,
        lastPage: response.lastPage,
        perPage: response.perPage,
        total: response.total,
      });
      setImageErrors(new Set());
      setImageLoading(new Set());
    } catch (_error) {
      console.error('Failed to fetch wallpapers:', _error);
      setWallpapers([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [source, page]);

  useEffect(() => {
    fetchWallpapers();
  }, [fetchWallpapers]);

  const handleSourceChange = (newSource: WallpaperSource) => {
    setSource(newSource);
    setPage(1);
  };

  const handlePrevPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    if (pagination && page < pagination.lastPage) {
      setPage((prev) => prev + 1);
    }
  };

  const handleWallpaperClick = (item: WallpaperListItem) => {
    const wallpaperInfo: WallpaperInfo = {
      id: item.id,
      title: item.title,
      url: item.url,
      source: item.source,
      localPath: undefined,
      cached: false,
    };
    setPreviewWallpaper(wallpaperInfo);
    setIsModalOpen(true);
  };

  const closePreviewModal = () => {
    setPreviewWallpaper(null);
    setIsModalOpen(false);
  };

  const handleImageError = (id: string) => {
    setImageErrors((prev) => new Set([...prev, id]));
    setImageLoading((prev) => {
      const newSet = new Set([...prev]);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleImageLoadStart = (id: string) => {
    setImageLoading((prev) => new Set([...prev, id]));
  };

  const handleImageLoad = (id: string) => {
    setImageLoading((prev) => {
      const newSet = new Set([...prev]);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleImageRetry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setImageErrors((prev) => {
      const newSet = new Set([...prev]);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleSetWallpaper = async () => {
    if (previewWallpaper) {
      try {
        await setWallpaper(previewWallpaper);
        closePreviewModal();
      } catch (error) {
        console.error('Failed to set wallpaper:', error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
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
              壁纸探索
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-wider">
              Explorer
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

      <main className="flex-1 overflow-y-auto p-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.08),transparent_50%)]" />

        {loading ? (
          <div className="relative z-10 flex justify-center items-center h-full">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-xs text-zinc-500 font-medium">加载中...</p>
            </div>
          </div>
        ) : wallpapers.length === 0 ? (
          <div className="relative z-10 flex flex-col justify-center items-center h-full gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900/50 flex items-center justify-center border border-white/5">
              <ImageIcon className="w-8 h-8 text-zinc-600" />
            </div>
            <p className="text-zinc-500 text-sm">暂无壁纸</p>
          </div>
        ) : (
          <div className="relative z-10 grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
            {wallpapers.map((item) => {
              const hasError = imageErrors.has(item.id);
              const isLoading = imageLoading.has(item.id);
              const isHovered = hoveredId === item.id;

              return (
                <div
                  key={item.id}
                  className="group relative cursor-pointer"
                  onClick={() => handleWallpaperClick(item)}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="relative rounded-2xl overflow-hidden bg-zinc-900/50 border border-white/[0.05] transition-all duration-500 ease-out group-hover:border-white/[0.1] group-hover:shadow-2xl group-hover:shadow-indigo-500/10">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {hasError ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-900/80">
                          <div className="w-12 h-12 rounded-xl bg-zinc-800/50 flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-zinc-600" />
                          </div>
                          <button
                            onClick={(e) => handleImageRetry(item.id, e)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-zinc-400 text-xs hover:bg-white/10 hover:text-zinc-200 transition-colors"
                          >
                            <RefreshCw className="w-3 h-3" />
                            重试
                          </button>
                        </div>
                      ) : (
                        <>
                          <img
                            src={item.thumbUrl}
                            alt={item.title}
                            className={cn(
                              'w-full h-full object-cover transition-all duration-700 ease-out',
                              isLoading
                                ? 'opacity-0 scale-105'
                                : 'opacity-100 scale-100',
                              isHovered && 'scale-110'
                            )}
                            loading="lazy"
                            onLoad={() => handleImageLoad(item.id)}
                            onLoadStart={() => handleImageLoadStart(item.id)}
                            onError={() => handleImageError(item.id)}
                          />
                          {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50">
                              <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                            </div>
                          )}
                        </>
                      )}

                      <div
                        className={cn(
                          'absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300',
                          isHovered ? 'opacity-100' : 'opacity-0'
                        )}
                      />

                      <div
                        className={cn(
                          'absolute bottom-0 left-0 right-0 p-4 transition-all duration-300',
                          isHovered
                            ? 'translate-y-0 opacity-100'
                            : 'translate-y-4 opacity-0'
                        )}
                      >
                        <p className="text-white/90 text-sm font-medium line-clamp-2 drop-shadow-lg">
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm text-white/70 text-[10px] font-medium">
                            {item.source}
                          </span>
                          <ExternalLink className="w-3 h-3 text-white/50" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="h-16 shrink-0 border-t border-white/5 bg-black/20 backdrop-blur-xl flex items-center justify-center gap-6 z-20">
        <button
          onClick={handlePrevPage}
          disabled={page === 1 || loading}
          className="group flex items-center gap-2 px-4 py-2 rounded-xl text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-800/50 border border-white/5 flex items-center justify-center group-hover:bg-zinc-700/50 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium">上一页</span>
        </button>

        <div className="flex flex-col items-center min-w-[80px]">
          <span className="text-lg font-bold text-white tabular-nums">
            {page}
          </span>
          <span className="text-[10px] text-zinc-500">
            / {pagination?.lastPage || 1}
          </span>
        </div>

        <button
          onClick={handleNextPage}
          disabled={page === (pagination?.lastPage || 1) || loading}
          className="group flex items-center gap-2 px-4 py-2 rounded-xl text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <span className="text-xs font-medium">下一页</span>
          <div className="w-8 h-8 rounded-lg bg-zinc-800/50 border border-white/5 flex items-center justify-center group-hover:bg-zinc-700/50 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>
      </footer>

      {previewWallpaper && (
        <PreviewModal
          wallpaper={previewWallpaper}
          isOpen={isModalOpen}
          onClose={closePreviewModal}
          onSetWallpaper={handleSetWallpaper}
        />
      )}
    </div>
  );
}
