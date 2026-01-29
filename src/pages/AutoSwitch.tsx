import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { Play, Pause, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import type { WallpaperSource } from '../types';
import {
  setAutoSwitchConfig,
  getAutoSwitchConfig,
  fetchNextWallpaper,
} from '../services/tauri';

const SOURCES = [
  { id: 'bing', label: 'Bing Daily', color: 'from-blue-500 to-cyan-500' },
  { id: 'wallhaven', label: 'Wallhaven', color: 'from-orange-500 to-red-600' },
  { id: 'unsplash', label: 'Unsplash', color: 'from-purple-500 to-pink-500' },
  { id: 'pixabay', label: 'Pixabay', color: 'from-green-500 to-teal-500' },
];

const INTERVALS = [
  { label: '10分钟', value: 600 },
  { label: '30分钟', value: 1800 },
  { label: '1小时', value: 3600 },
  { label: '3小时', value: 10800 },
  { label: '6小时', value: 21600 },
  { label: '12小时', value: 43200 },
  { label: '1天', value: 86400 },
  { label: '3天', value: 259200 },
];

export default function AutoSwitch() {
  const [source, setSource] = useState<WallpaperSource>('bing');
  const [interval, setIntervalValue] = useState<number>(3600);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSourceChange = (newSource: string) => {
    setSource(newSource as WallpaperSource);
  };

  const handleIntervalChange = (newInterval: number) => {
    setIntervalValue(newInterval);
  };

  const handleToggle = async () => {
    setLoading(true);
    try {
      const newEnabled = !isRunning;
      await setAutoSwitchConfig(source, newEnabled, interval);
      setIsRunning(newEnabled);
    } catch (error) {
      console.error('Failed to toggle auto switch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const config = await getAutoSwitchConfig(source);
        if (config) {
          setIsRunning(config.enabled);
          setIntervalValue(config.intervalSeconds);
        }
      } catch (error) {
        console.error('Failed to check auto switch status:', error);
      }
    };

    checkStatus();
  }, [source]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(async () => {
      try {
        await fetchNextWallpaper(source, null);
      } catch (error) {
        console.error('Auto switch failed:', error);
      }
    }, interval * 1000);

    return () => clearInterval(timer);
  }, [isRunning, interval, source]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <PageHeader
        title="自动切换"
        subtitle="Auto Switch"
        sources={SOURCES}
        currentSource={source}
        onSourceChange={handleSourceChange}
      />

      <main className="flex-1 overflow-y-auto p-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.08),transparent_50%)]" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl">
            <div className="flex flex-col items-center gap-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {isRunning ? '正在自动切换壁纸' : '自动切换已停止'}
                </h2>
                <p className="text-zinc-400 text-sm">
                  当前来源:{' '}
                  <span className="text-white font-medium">
                    {SOURCES.find((s) => s.id === source)?.label}
                  </span>
                </p>
              </div>

              <div className="w-64 h-64 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-2 border-indigo-500/30 flex items-center justify-center">
                {isRunning ? (
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center animate-pulse">
                    <Clock className="w-20 h-20 text-white" />
                  </div>
                ) : (
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
                    <Clock className="w-20 h-20 text-zinc-400" />
                  </div>
                )}
              </div>

              <div className="w-full space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-3">
                    切换间隔
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {INTERVALS.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => handleIntervalChange(item.value)}
                        disabled={loading || isRunning}
                        className={cn(
                          'px-3 py-2 rounded-lg text-xs font-medium transition-all',
                          interval === item.value
                            ? 'bg-indigo-600 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300',
                          'disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleToggle}
                  disabled={loading}
                  className={cn(
                    'w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-sm font-medium transition-all',
                    isRunning
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : isRunning ? (
                    <>
                      <Pause className="w-5 h-5" />
                      停止自动切换
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      开始自动切换
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
