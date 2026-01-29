import { ImageIcon, ChevronDown } from 'lucide-react';

interface Source {
  id: string;
  label: string;
  color: string;
}

interface PageHeaderProps {
  title: string;
  subtitle: string;
  sources: Source[];
  currentSource: string;
  onSourceChange: (sourceId: string) => void;
}

export default function PageHeader({
  title,
  subtitle,
  sources,
  currentSource,
  onSourceChange,
}: PageHeaderProps) {
  return (
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
            {title}
          </h1>
          <p className="text-[10px] text-zinc-500 font-mono tracking-wider">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="relative group">
        <select
          value={currentSource}
          onChange={(e) => onSourceChange(e.target.value)}
          className="appearance-none bg-zinc-800/90 border border-white/10 text-zinc-200 text-xs font-medium rounded-lg pl-4 pr-8 py-2 cursor-pointer hover:bg-zinc-700/90 hover:border-white/15 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        >
          {sources.map((source) => (
            <option key={source.id} value={source.id}>
              {source.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none group-hover:text-zinc-300 transition-colors" />
      </div>
    </header>
  );
}
