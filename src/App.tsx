import { useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';

interface WallpaperInfo {
  id: string;
  title: string;
  url: string;
  source: string;
  localPath?: string;
  cached: boolean;
}

function AppComponent() {
  const [currentWallpaper, setCurrentWallpaper] = useState<WallpaperInfo | null>(null);

  useEffect(() => {
    const unlisten = async () => {
      const unlistenFetch = await listen('wallpaper-fetched', (event) => {
        setCurrentWallpaper(event.payload as WallpaperInfo);
      });

      return () => {
        unlistenFetch();
      };
    };

    unlisten();

    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  const handleSetWallpaper = async () => {
    if (currentWallpaper) {
      console.log('Setting wallpaper:', currentWallpaper);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Wallpaper Mate</h1>
      {currentWallpaper ? (
        <div className="space-y-4">
          <img
            src={currentWallpaper.url}
            alt={currentWallpaper.title}
            className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
          />
          <button
            onClick={handleSetWallpaper}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            设为壁纸
          </button>
          <p className="text-sm text-gray-600">
            {currentWallpaper.title} - {currentWallpaper.source}
          </p>
        </div>
      ) : (
        <div>
          <p className="text-gray-500">正在获取壁纸...</p>
        </div>
      )}
    </div>
  );
}

export default AppComponent;
