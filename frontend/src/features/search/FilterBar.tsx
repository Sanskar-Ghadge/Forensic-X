import React from 'react';
import {
  LayoutGrid,
  List,
  GitBranch,
  Filter,
  ShieldCheck,
} from 'lucide-react';

interface FilterBarProps {
  similarityCutoff: number; // 0.0 to 1.0
  onCutoffChange: (val: number) => void;
  hiddenCount: number;
  totalCount: number;
  onlyPlausible: boolean;
  onOnlyPlausibleChange: (val: boolean) => void;
  passTier2Only: boolean;
  onPassTier2Change: (val: boolean) => void;
  activeView: 'grid' | 'list' | 'path';
  onViewChange: (view: 'grid' | 'list' | 'path') => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  similarityCutoff,
  onCutoffChange,
  hiddenCount,
  totalCount,
  onlyPlausible,
  onOnlyPlausibleChange,
  passTier2Only,
  onPassTier2Change,
  activeView,
  onViewChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3.5 rounded-lg bg-panel-dark/80 border border-grid-line/60">
      {/* Similarity Threshold Slider */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <Filter className="w-4 h-4 text-ink-muted" />
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink-soft font-mono">
              Similarity Threshold:{' '}
              <span className="text-scan font-bold">{(similarityCutoff * 100).toFixed(0)}%</span>
            </span>
            {hiddenCount > 0 && (
              <span className="text-amber-400 font-mono text-[11px]">
                {hiddenCount} below cutoff
              </span>
            )}
          </div>
          <input
            type="range"
            min="40"
            max="95"
            step="1"
            value={similarityCutoff * 100}
            onChange={(e) => onCutoffChange(Number(e.target.value) / 100)}
            className="w-full accent-scan h-1.5 bg-panel-light/30 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-ink-soft">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyPlausible}
            onChange={(e) => onOnlyPlausibleChange(e.target.checked)}
            className="rounded bg-panel-dark border-grid-line text-scan focus:ring-scan/30"
          />
          <ShieldCheck className="w-3.5 h-3.5 text-status-active" />
          <span>Only physically plausible paths</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={passTier2Only}
            onChange={(e) => onPassTier2Change(e.target.checked)}
            className="rounded bg-panel-dark border-grid-line text-scan focus:ring-scan/30"
          />
          <span>Pass 2 Re-ID only</span>
        </label>
      </div>

      {/* View Switcher */}
      <div className="flex items-center p-1 bg-panel-light/20 rounded-md border border-grid-line/50">
        <button
          type="button"
          onClick={() => onViewChange('grid')}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded transition-all ${
            activeView === 'grid'
              ? 'bg-scan text-white font-medium shadow-sm'
              : 'text-ink-muted hover:text-white'
          }`}
          title="Grid View (Chroma Grid)"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Grid</span>
        </button>

        <button
          type="button"
          onClick={() => onViewChange('list')}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded transition-all ${
            activeView === 'list'
              ? 'bg-scan text-white font-medium shadow-sm'
              : 'text-ink-muted hover:text-white'
          }`}
          title="List View (Sortable Table)"
        >
          <List className="w-3.5 h-3.5" />
          <span>List</span>
        </button>

        <button
          type="button"
          onClick={() => onViewChange('path')}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded transition-all ${
            activeView === 'path'
              ? 'bg-scan text-white font-medium shadow-sm'
              : 'text-ink-muted hover:text-white'
          }`}
          title="Path View (Building Transit Trajectory)"
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Path ({totalCount})</span>
        </button>
      </div>
    </div>
  );
};
