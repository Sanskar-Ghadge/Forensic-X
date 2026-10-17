import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Search,
  Sparkles,
  Paperclip,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Cpu,
} from 'lucide-react';

interface QueryComposerProps {
  query: string;
  onQueryChange: (q: string) => void;
  onSearch: (q: string) => void;
  isLoading: boolean;
  activeCamera: string;
  onCameraChange: (cam: string) => void;
  totalMatches: number;
}

export const QueryComposer: React.FC<QueryComposerProps> = ({
  query,
  onQueryChange,
  onSearch,
  isLoading,
  activeCamera,
  onCameraChange,
  totalMatches,
}) => {
  const [traceOpen, setTraceOpen] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const exampleChips = [
    'person in red jacket',
    'red backpack',
    'dark cap',
    'individual at cash register',
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setElapsedMs(0);
      interval = setInterval(() => {
        setElapsedMs((prev) => prev + 45);
      }, 45);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Prompt Bar */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
            <Search className="w-4 h-4 text-scan" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Type a description (e.g. 'person in red jacket', 'red backpack') or attach reference..."
            className="w-full pl-10 pr-28 py-3 bg-panel-dark/90 border border-grid-line/60 rounded-lg text-sm text-white placeholder-ink-muted focus:outline-none focus:border-scan/80 focus:ring-1 focus:ring-scan/50 shadow-inner"
          />
          <div className="absolute inset-y-0 right-2 flex items-center gap-1.5">
            <button
              type="button"
              title="Attach reference photo or crop"
              className="p-1.5 text-ink-muted hover:text-white rounded hover:bg-panel-light/40 transition-colors"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isLoading || !query.trim()}
              className="px-3 py-1.5 h-8 text-xs font-medium"
            >
              {isLoading ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin mr-1.5" />
                  Searching...
                </>
              ) : (
                'Search Leads'
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Scope Chips & Quick Prompts */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-ink-muted mr-1">Quick Prompts:</span>
          {exampleChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                onQueryChange(chip);
                onSearch(chip);
              }}
              className="px-2.5 py-1 rounded-full bg-panel-dark border border-grid-line/60 text-ink-soft hover:text-white hover:border-scan/60 hover:bg-panel-light/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-3 h-3 inline mr-1 text-scan/70" />
              {chip}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-ink-muted">Scope:</span>
          <select
            value={activeCamera}
            onChange={(e) => onCameraChange(e.target.value)}
            className="bg-panel-dark border border-grid-line/60 text-xs text-white rounded px-2 py-1 focus:outline-none focus:border-scan/70"
          >
            <option value="all">@All Cameras (3)</option>
            <option value="CAM-01">@CAM 01: Entrance</option>
            <option value="CAM-02">@CAM 02: Aisle 4</option>
            <option value="CAM-03">@CAM 03: Cash Counter</option>
          </select>
          <Badge variant="neutral" className="text-[11px] py-0.5">
            /last 20 mins
          </Badge>
        </div>
      </div>

      {/* Thought Line (Reasoning Trace) */}
      {(isLoading || traceOpen || totalMatches > 0) && (
        <div className="rounded-lg border border-grid-line/60 bg-panel-dark/50 p-2.5 text-xs text-ink-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-scan" />
              <span className="font-mono font-medium text-white">
                Reasoning Trace:
              </span>
              <span className="text-ink-muted">
                {isLoading
                  ? `Embedding query & searching cross-camera vectors (${(elapsedMs / 1000).toFixed(2)}s)...`
                  : `Matched ${totalMatches} candidate leads across 3 synchronized cameras (0.34s)`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setTraceOpen(!traceOpen)}
              className="flex items-center gap-1 text-[11px] text-ink-muted hover:text-white"
            >
              {traceOpen ? 'Hide steps' : 'View steps'}
              {traceOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {traceOpen && (
            <div className="mt-2.5 pt-2 border-t border-grid-line/40 space-y-1.5 font-mono text-[11px] text-ink-muted">
              <div className="flex items-center gap-2 text-ink-soft">
                <CheckCircle2 className="w-3 h-3 text-status-active" />
                <span>Computed 512-d normalized embedding using CLIP ViT-B/32 & OSNet-IBN-x1_0</span>
              </div>
              <div className="flex items-center gap-2 text-ink-soft">
                <CheckCircle2 className="w-3 h-3 text-status-active" />
                <span>Queried FAISS Flat-IP index across 3 cameras (Entrance, Aisle 4, Cash Counter)</span>
              </div>
              <div className="flex items-center gap-2 text-ink-soft">
                <CheckCircle2 className="w-3 h-3 text-status-active" />
                <span>Sorted match candidates chronologically by canonical corrected time</span>
              </div>
              <div className="flex items-center gap-2 text-ink-soft">
                <CheckCircle2 className="w-3 h-3 text-status-active" />
                <span>Evaluated physical transit times against camera topological walking model</span>
              </div>
              <div className="flex items-center gap-2 text-scan">
                <Clock className="w-3 h-3" />
                <span>Latency: 340ms | Memory Index: In-Memory Cosine Flat</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
