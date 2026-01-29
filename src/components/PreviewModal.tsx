import { Minimize2, Image as ImageIcon, Download } from 'lucide-react';
import { useState, useCallback } from 'react';
import type { WallpaperInfo } from '../types';

interface PreviewModalProps {
  wallpaper: WallpaperInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onSetWallpaper: () => Promise<void>;
  loading?: boolean;
}

export default function PreviewModal({
  wallpaper,
  isOpen,
  onClose,
  onSetWallpaper,
}: PreviewModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [settingWallpaper, setSettingWallpaper] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(false);
  }, []);

  const handleRetry = useCallback(() => {
    setImageError(false);
    setImageLoaded(false);
    setImageUrl(null);
  }, []);

  const handleSetWallpaper = async () => {
    setSettingWallpaper(true);
    try {
      await onSetWallpaper();
      onClose();
    } catch (error) {
      console.error('Failed to set wallpaper:', error);
    } finally {
      setSettingWallpaper(false);
    }
  };

  if (!isOpen || !wallpaper) return null;

  const currentImageUrl = imageUrl || wallpaper.localPath || wallpaper.url;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-300 cursor-zoom-out"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-1.5 rounded-md text-white/50 hover:bg-zinc-800/50 hover:text-white transition-colors duration-200 z-50"
      >
        <Minimize2 className="w-5 h-5" />
      </button>

      <div className="relative">
        {imageError ? (
          <div
            className="flex flex-col items-center justify-center gap-4 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleRetry();
            }}
          >
            <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-zinc-600" />
            </div>
            <div className="text-center">
              <p className="text-zinc-400 text-sm">图片加载失败</p>
              <p className="text-zinc-600 text-xs mt-1">点击重试</p>
            </div>
          </div>
        ) : (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
              </div>
            )}
            <img
              src={currentImageUrl}
              alt={wallpaper.title}
              className={`max-w-full max-h-screen w-auto h-auto object-contain shadow-2xl transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </>
        )}
      </div>

      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-zinc-950/30 backdrop-blur-xl border border-white/10 text-white/90 text-sm font-medium shadow-2xl shadow-black/20 animate-in slide-in-from-bottom-4 fade-in duration-500 flex items-center gap-4 hover:bg-zinc-950/50 transition-colors cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="drop-shadow-md tracking-wide flex-1">
          {wallpaper.title}
        </span>
        <button
          onClick={handleSetWallpaper}
          disabled={settingWallpaper}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors"
        >
          <Download
            className={`w-4 h-4 transition-transform duration-300 ${settingWallpaper ? 'animate-spin' : ''}`}
          />
          {settingWallpaper ? '设置中...' : '设为壁纸'}
        </button>
      </div>
    </div>
  );
}
