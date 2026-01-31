import { useState, useEffect, useCallback } from 'react';
import {
  fetchWallpapersList,
  setWallpaper,
  downloadWallpaper,
} from '../services/tauri';
import type {
  WallpaperSource,
  WallpaperListItem,
  WallpaperInfo,
} from '../types';
import PreviewModal from '../components/PreviewModal';
import PageHeader from '../components/PageHeader';
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  RefreshCw,
  ExternalLink,
  Heart,
  DownloadCloud,
  Loader2,
  Check,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppStore } from '../store/appStore';
import { getCachedImage, setCachedImage } from '../utils/imageCache';

const SOURCES = [
  {
    id: 'bing' as const,
    label: 'Bing Daily',
    color: 'from-blue-500 to-cyan-500',
    supportsPagination: false,
  },
  {
    id: 'wallhaven' as const,
    label: 'Wallhaven',
    color: 'from-orange-500 to-red-600',
    supportsPagination: true,
  },
  {
    id: 'unsplash' as const,
    label: 'Unsplash',
    color: 'from-purple-500 to-pink-500',
    supportsPagination: false,
  },
  {
    id: 'pixabay' as const,
    label: 'Pixabay',
    color: 'from-green-500 to-teal-500',
    supportsPagination: false,
  },
];

const supportsPagination = (sourceId: string): boolean => {
  return SOURCES.find((s) => s.id === sourceId)?.supportsPagination ?? false;
};

export default function WallpaperList() {
  const {
    listPageSource,
    setListPageSource,
    toggleFavorite,
    isFavorite,
    listPageData,
    setListPageData,
    addDownload,
    isDownloaded,
  } = useAppStore();

  const [loading, setLoading] = useState<boolean>(false);
  const [previewWallpaper, setPreviewWallpaper] =
    useState<WallpaperInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [imageLoading, setImageLoading] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<Set<string>>(new Set());
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

  const { wallpapers, page, pagination, loaded } = listPageData;

  const fetchWallpapers = useCallback(
    async (
      targetPage: number = page,
      targetSource: string = listPageSource
    ) => {
      setLoading(true);
      try {
        const response = await fetchWallpapersList(
          targetSource as WallpaperSource,
          targetPage
        );
        setListPageData({
          wallpapers: response.data,
          page: response.currentPage,
          pagination: {
            currentPage: response.currentPage,
            lastPage: response.lastPage,
            perPage: response.perPage,
            total: response.total,
          },
          loaded: true,
        });
        setImageErrors(new Set());
        setImageLoading(new Set());
      } catch (_error) {
        console.error('Failed to fetch wallpapers:', _error);
        setListPageData({
          wallpapers: [],
          pagination: null,
        });
      } finally {
        setLoading(false);
      }
    },
    [listPageSource, page, setListPageData]
  );

  useEffect(() => {
    if (!loaded) {
      fetchWallpapers(1);
    }
  }, [loaded, fetchWallpapers]);

  const handleRefresh = () => {
    fetchWallpapers(page);
  };

  const handleDownload = async (item: WallpaperListItem) => {
    if (downloading.has(item.id)) return;

    const newDownloading = new Set(downloading);
    newDownloading.add(item.id);
    setDownloading(newDownloading);

    try {
      const wallpaperInfo: WallpaperInfo = {
        id: item.id,
        title: item.title,
        url: item.url,
        source: item.source,
        localPath: undefined,
        cached: false,
      };

      const localPath = await downloadWallpaper(wallpaperInfo);

      const downloadedInfo: WallpaperInfo = {
        ...wallpaperInfo,
        localPath,
        cached: true,
      };

      addDownload(downloadedInfo, localPath);
      setToast({ message: '下载成功', type: 'success' });
    } catch (error) {
      console.error('Download failed:', error);
      setToast({ message: `下载失败: ${error}`, type: 'error' });
    } finally {
      const newDownloading2 = new Set(downloading);
      newDownloading2.delete(item.id);
      setDownloading(newDownloading2);
    }
  };

  const handleSourceChange = (newSource: string) => {
    setListPageSource(newSource);
    setListPageData({ page: 1 });
    setTimeout(() => fetchWallpapers(1, newSource), 0);
  };

  const handlePrevPage = () => {
    if (page > 1) {
      const newPage = page - 1;
      setListPageData({ page: newPage });
      setTimeout(() => fetchWallpapers(newPage), 0);
    }
  };

  const handleNextPage = () => {
    if (pagination && page < pagination.lastPage) {
      const newPage = page + 1;
      setListPageData({ page: newPage });
      setTimeout(() => fetchWallpapers(newPage), 0);
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

  const handleImageLoadStart = async (id: string, url: string) => {
    setImageLoading((prev) => new Set([...prev, id]));

    const cachedUrl = getCachedImage(url);
    if (!cachedUrl) {
      await setCachedImage(url);
    }
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
        setToast({ message: '壁纸设置成功', type: 'success' });
        closePreviewModal();
      } catch (error) {
        console.error('Failed to set wallpaper:', error);
        setToast({ message: `设置失败: ${error}`, type: 'error' });
      }
    }
  };

  return (
    <div className="flex flex-col h-full relative bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <PageHeader
        title="壁纸探索"
        subtitle="Explorer"
        sources={SOURCES}
        currentSource={listPageSource}
        onSourceChange={handleSourceChange}
      />

      <main className="flex-1 overflow-y-auto p-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.08),transparent_50%)]" />

        {loading ? (
          <div className="relative z-10 flex justify-center items-center h-full">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-xs font-medium tracking-widest uppercase text-zinc-500">
                加载中...
              </p>
            </div>
          </div>
        ) : loaded && wallpapers.length === 0 ? (
          <div className="relative z-10 flex flex-col justify-center items-center h-full gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900/50 flex items-center justify-center border border-white/5">
              <ImageIcon className="w-8 h-8 text-zinc-600" />
            </div>
            <p className="text-zinc-500 text-sm">暂无壁纸</p>
          </div>
        ) : !loaded ? (
          <div className="relative z-10 flex justify-center items-center h-full">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-xs font-medium tracking-widest uppercase text-zinc-500">
                加载中...
              </p>
            </div>
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
                  className="group relative"
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="relative rounded-2xl overflow-hidden bg-zinc-900/50 border border-white/[0.05] transition-all duration-500 ease-out group-hover:border-white/[0.1] group-hover:shadow-2xl group-hover:shadow-indigo-500/10">
                    <div
                      className="relative aspect-[16/10] overflow-hidden cursor-pointer"
                      onClick={() => handleWallpaperClick(item)}
                    >
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
                            onLoadStart={() =>
                              handleImageLoadStart(item.id, item.thumbUrl)
                            }
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
                          <ExternalLink
                            className="w-3 h-3 text-white/50 cursor-pointer hover:text-white/80 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(item.url, '_blank');
                            }}
                          />
                          <Heart
                            className={cn(
                              'w-3 h-3 cursor-pointer transition-colors',
                              isFavorite(item.id)
                                ? 'text-red-500 fill-red-500'
                                : 'text-white/50 hover:text-white/80'
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              const wallpaperInfo: WallpaperInfo = {
                                id: item.id,
                                title: item.title,
                                url: item.url,
                                source: item.source,
                                localPath: undefined,
                                cached: false,
                              };
                              toggleFavorite(wallpaperInfo);
                            }}
                          />
                          {downloading.has(item.id) ? (
                            <Loader2 className="w-3 h-3 text-white/80 animate-spin" />
                          ) : isDownloaded(item.id) ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <DownloadCloud
                              className="w-3 h-3 text-white/50 hover:text-white/80 cursor-pointer transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(item);
                              }}
                            />
                          )}
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

      <footer className="h-16 shrink-0 border-t border-white/5 bg-black/20 backdrop-blur-xl flex items-center justify-between px-6 z-20">
        <div className="w-24" />

        {supportsPagination(listPageSource) ? (
          <div className="flex items-center gap-6">
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
          </div>
        ) : (
          <div className="text-xs text-zinc-500">
            {wallpapers.length > 0 && `${wallpapers.length} 张壁纸`}
          </div>
        )}

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="group flex items-center gap-2 px-4 py-2 rounded-xl text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all w-24 justify-end"
          title="刷新壁纸列表"
        >
          <span className="text-xs font-medium">刷新</span>
          <div className="w-8 h-8 rounded-lg bg-zinc-800/50 border border-white/5 flex items-center justify-center group-hover:bg-zinc-700/50 transition-colors">
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
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
