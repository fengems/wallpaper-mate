import { Minimize2 } from 'lucide-react';
import type { WallpaperInfo } from '../types';

interface PreviewModalProps {
  wallpaper: WallpaperInfo | null;
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSetWallpaper: () => void;
  loading?: boolean;
}

export default function PreviewModal({
  wallpaper,
  isOpen,
  onClose,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSetWallpaper,
}: PreviewModalProps) {
  if (!isOpen || !wallpaper) return null;

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

      <img
        src={wallpaper.localPath || wallpaper.url}
        alt={wallpaper.title}
        className="max-w-full max-h-screen w-auto h-auto object-contain shadow-2xl"
      />

      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full bg-zinc-950/30 backdrop-blur-xl border border-white/10 text-white/90 text-sm font-medium shadow-2xl shadow-black/20 animate-in slide-in-from-bottom-4 fade-in duration-500 hover:bg-zinc-950/50 transition-colors cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="drop-shadow-md tracking-wide">{wallpaper.title}</span>
      </div>
    </div>
  );
}
