import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';

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
  const [isOpen, setIsOpen] = useState(false);
  const selectedSource = sources.find((s) => s.id === currentSource);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (sourceId: string) => {
    onSourceChange(sourceId);
    setIsOpen(false);
  };

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
        <button
          onClick={handleToggle}
          className={cn(
            'relative flex items-center gap-2.5 bg-zinc-800/90 border border-white/10 text-zinc-200 text-xs font-medium rounded-lg pl-4 pr-3 py-2.5 cursor-pointer transition-all',
            isOpen
              ? 'bg-zinc-700/90 border-white/20 text-white'
              : 'hover:bg-zinc-700/90 hover:border-white/15'
          )}
        >
          <span className="flex items-center gap-2.5">
            {selectedSource?.label || sources[0]?.label}
          </span>
          <div
            className={cn(
              'w-4 h-4 transition-transform duration-200',
              isOpen ? 'rotate-180' : ''
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 9l6 6 6-6"
              />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-40 bg-zinc-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
            <div className="p-1">
              {sources.map((source) => (
                <button
                  key={source.id}
                  onClick={() => handleSelect(source.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-2.5 text-xs rounded-lg transition-colors',
                    source.id === currentSource
                      ? 'bg-gradient-to-r text-white from-indigo-500 to-purple-500'
                      : 'text-zinc-300 hover:bg-zinc-700/60 hover:text-zinc-200'
                  )}
                >
                  <span>{source.label}</span>
                  {source.id === currentSource && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
