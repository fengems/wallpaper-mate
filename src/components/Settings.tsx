import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useSettingsStore } from '@/store/settings';
import { WallpaperSource } from '@/types';
import { saveSettings } from '@/services/tauri';

export default function Settings() {
  const { source, wallhavenApiKey, setSource, setWallhavenApiKey } = useSettingsStore();
  const [saved, setSaved] = useState(false);

  const handleSourceChange = (newSource: string) => {
    setSource(newSource as WallpaperSource);
  };

  const handleSave = async () => {
    await saveSettings();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 text-gray-100">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-6">设置</h1>

        <div className="space-y-6">
          <div>
            <Label>壁纸来源</Label>
            <Select value={source} onValueChange={handleSourceChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={WallpaperSource.Bing}>Bing Daily</SelectItem>
                <SelectItem value={WallpaperSource.Wallhaven}>Wallhaven</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {source === WallpaperSource.Wallhaven && (
            <div>
              <Label>Wallhaven API Key（可选）</Label>
              <Input
                type="password"
                value={wallhavenApiKey}
                onChange={(e) => setWallhavenApiKey((e.target as HTMLInputElement).value)}
                placeholder="输入您的 Wallhaven API Key"
              />
            </div>
          )}

          <div className="flex gap-4">
            <Button variant="outline" className="flex-1" onClick={() => window.close()}>
              取消
            </Button>
            <Button className="flex-1" onClick={handleSave}>
              {saved ? '已保存！' : '保存'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
