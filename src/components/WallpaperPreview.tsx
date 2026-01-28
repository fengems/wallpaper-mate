import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useWallpaperStore } from '@/store/wallpaper';
import { setWallpaper } from '@/services/tauri';

interface WallpaperPreviewProps {
  wallpaper: {
    id: string;
    title: string;
    url: string;
    source: string;
    cached: boolean;
  } | null;
  onSetWallpaper: () => void;
}

export default function WallpaperPreview({ wallpaper, onSetWallpaper }: WallpaperPreviewProps) {
  const { loading } = useWallpaperStore();

  if (!wallpaper) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-gray-100">
        <Card className="p-8 text-center">
          <p>正在获取壁纸...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 text-gray-100">
      <Card className="p-8 w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4">{wallpaper.title}</h2>
        
        <div className="mb-6">
          <img
            src={wallpaper.url}
            alt={wallpaper.title}
            className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
            loading="lazy"
          />
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            onClick={onSetWallpaper}
            disabled={loading}
            className="flex-1"
          >
            {loading ? '设置中...' : '设为壁纸'}
          </Button>
          <Button
            variant="outline"
            onClick={() => window.close()}
            disabled={loading}
          >
            关闭
          </Button>
        </div>

        <p className="text-sm text-gray-400 mt-4 text-center">
          来源: {wallpaper.source === 'bing' ? 'Bing Daily' : 'Wallhaven'}
        </p>
      </Card>
    </div>
  );
}
