import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppStore } from '../store/appStore';

const API_KEY_FIELDS = [
  {
    id: 'wallhaven',
    label: 'Wallhaven',
    storeKey: 'wallhavenApiKey',
    setter: 'setWallhavenApiKey',
    placeholder: '输入 Wallhaven API Key',
  },
  {
    id: 'unsplash',
    label: 'Unsplash',
    storeKey: 'unsplashApiKey',
    setter: 'setUnsplashApiKey',
    placeholder: '输入 Unsplash Access Key',
  },
  {
    id: 'pixabay',
    label: 'Pixabay',
    storeKey: 'pixabayApiKey',
    setter: 'setPixabayApiKey',
    placeholder: '输入 Pixabay API Key',
  },
  {
    id: 'pexels',
    label: 'Pexels',
    storeKey: 'pexelsApiKey',
    setter: 'setPexelsApiKey',
    placeholder: '输入 Pexels API Key',
  },
] as const;

type FieldId = (typeof API_KEY_FIELDS)[number]['id'];

export default function Settings() {
  const store = useAppStore();

  const [keys, setKeys] = useState<Record<FieldId, string>>({
    wallhaven: '',
    unsplash: '',
    pixabay: '',
    pexels: '',
  });
  const [visible, setVisible] = useState<Record<FieldId, boolean>>({
    wallhaven: false,
    unsplash: false,
    pixabay: false,
    pexels: false,
  });
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setKeys({
      wallhaven: store.wallhavenApiKey,
      unsplash: store.unsplashApiKey,
      pixabay: store.pixabayApiKey,
      pexels: store.pexelsApiKey,
    });
  }, [
    store.wallhavenApiKey,
    store.unsplashApiKey,
    store.pixabayApiKey,
    store.pexelsApiKey,
  ]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleChange = (id: FieldId, value: string) => {
    setKeys((prev) => ({ ...prev, [id]: value }));
  };

  const toggleVisibility = (id: FieldId) => {
    setVisible((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = () => {
    store.setWallhavenApiKey(keys.wallhaven);
    store.setUnsplashApiKey(keys.unsplash);
    store.setPixabayApiKey(keys.pixabay);
    store.setPexelsApiKey(keys.pexels);
    setToast('API Keys 已保存');
  };

  return (
    <div className="flex flex-col h-full relative bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <header className="h-16 shrink-0 border-b border-white/5 bg-black/20 backdrop-blur-xl flex items-center px-6 gap-3">
        <SettingsIcon className="w-5 h-5 text-zinc-400" />
        <h1 className="text-lg font-semibold text-white">设置</h1>
        <span className="text-xs text-zinc-500">Settings</span>
      </header>

      <main className="flex-1 overflow-y-auto p-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.08),transparent_50%)]" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-base font-semibold text-white mb-6">
              API Keys
            </h2>

            <div className="space-y-5">
              {API_KEY_FIELDS.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    {field.label}
                  </label>
                  <div className="relative">
                    <input
                      type={visible[field.id] ? 'text' : 'password'}
                      value={keys[field.id]}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full bg-zinc-800/60 border border-white/5 rounded-lg px-4 py-2.5 pr-10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => toggleVisibility(field.id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {visible[field.id] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSave}
              className="mt-8 w-full px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </main>

      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={cn(
              'px-4 py-2 rounded-lg shadow-lg text-sm font-medium',
              'bg-emerald-500/90 text-white'
            )}
          >
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
