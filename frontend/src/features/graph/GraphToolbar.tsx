import React from 'react';
import { Button } from '@/components/ui/Button';
import {
  Search,
  GitBranch,
  ShieldCheck,
  ListTree,
  Network,
  Download,
  Share2,
} from 'lucide-react';
import { EvidenceNodeKind } from './types';

interface GraphToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedKind: 'all' | EvidenceNodeKind;
  onKindSelect: (kind: 'all' | EvidenceNodeKind) => void;
  onTraceToSource: () => void;
  isTracing: boolean;
  onVerifyChain: () => void;
  isVerifying: boolean;
  isTreeView: boolean;
  onToggleTreeView: () => void;
  onExport: () => void;
  hasSelection: boolean;
}

export const GraphToolbar: React.FC<GraphToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedKind,
  onKindSelect,
  onTraceToSource,
  isTracing,
  onVerifyChain,
  isVerifying,
  isTreeView,
  onToggleTreeView,
  onExport,
  hasSelection,
}) => {
  const kinds: Array<{ id: 'all' | EvidenceNodeKind; label: string }> = [
    { id: 'all', label: 'All Entities' },
    { id: 'incident', label: 'Incidents' },
    { id: 'recorder', label: 'Storage' },
    { id: 'camera', label: 'Cameras' },
    { id: 'segment', label: 'Clips' },
    { id: 'gap', label: 'Gaps' },
    { id: 'lead', label: 'AI Leads' },
    { id: 'hash', label: 'Hashes' },
  ];

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 rounded-xl bg-panel-dark/90 border border-grid-line/60 shadow-md">
      {/* Search Input & Kind Filters */}
      <div className="flex flex-wrap items-center gap-2 flex-1">
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search entity, ID, or SHA-256..."
            className="w-full pl-9 pr-3 py-1.5 bg-panel-light/20 border border-grid-line/50 rounded-lg text-xs text-white placeholder-ink-muted focus:outline-none focus:border-scan/70"
          />
        </div>

        {/* Kind Filters */}
        <div className="flex flex-wrap items-center gap-1">
          {kinds.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => onKindSelect(k.id)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                selectedKind === k.id
                  ? 'bg-scan text-white font-medium shadow-sm'
                  : 'bg-panel-light/20 text-ink-muted hover:text-white'
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="secondary"
          size="sm"
          onClick={onTraceToSource}
          disabled={!hasSelection || isTracing}
          className="text-xs gap-1.5 h-8 font-mono border-grid-line"
          title="Highlight lineage back to root physical storage"
        >
          <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isTracing ? 'Tracing Pulse...' : 'Trace to Source'}</span>
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onVerifyChain}
          disabled={isVerifying}
          className="text-xs gap-1.5 h-8 font-mono border-grid-line"
          title="Re-verify all SHA-256 cryptographic digests in chain"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-status-active" />
          <span>{isVerifying ? 'Verifying Hashes...' : 'Verify Chain'}</span>
        </Button>

        <div className="h-5 w-px bg-grid-line/60 mx-1 hidden sm:block" />

        <Button
          variant="secondary"
          size="sm"
          onClick={onToggleTreeView}
          className="text-xs gap-1.5 h-8 font-mono border-grid-line"
          title="Toggle between Interactive Canvas and Screen-Reader Tree View"
        >
          {isTreeView ? (
            <>
              <Network className="w-3.5 h-3.5 text-scan" />
              <span>Canvas View</span>
            </>
          ) : (
            <>
              <ListTree className="w-3.5 h-3.5 text-scan" />
              <span>Tree View</span>
            </>
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onExport}
          className="text-xs gap-1 h-8 text-ink-muted hover:text-white"
          title="Export graph provenance manifest"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Case provenance link copied to clipboard!');
          }}
          className="text-xs gap-1 h-8 text-ink-muted hover:text-white"
          title="Copy case link"
        >
          <Share2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
