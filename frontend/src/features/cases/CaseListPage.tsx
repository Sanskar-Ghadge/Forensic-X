import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, CaseSummary } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StateBadge } from '@/components/forensic/StateBadge';
import { HashChip } from '@/components/forensic/HashChip';
import { SpotlightCard } from '@/components/fx/SpotlightCard';
import {
  FolderLock,
  Plus,
  Search,
  Video,
  HardDrive,
  Calendar,
  ArrowRight,
  Trash2,
  Copy,
  FolderOpen,
  Sparkles,
} from 'lucide-react';

export const CaseListPage: React.FC = () => {
  const navigate = useNavigate();
  const { cases, setCurrentCaseId, deleteCase, addCase } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'processing' | 'new'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter cases
  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.sha256.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenCase = (caseItem: CaseSummary) => {
    setCurrentCaseId(caseItem.id);
    navigate(`/cases/${caseItem.id}`);
  };

  const handleDuplicate = (c: CaseSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    const dup: CaseSummary = {
      ...c,
      id: `${c.id}-COPY`,
      name: `${c.name} (Copy)`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
    };
    addCase(dup);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deletingId === id) {
      deleteCase(id);
      setDeletingId(null);
    } else {
      setDeletingId(id);
      setTimeout(() => setDeletingId(null), 4000);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono tracking-widest text-scan">Forensic Evidence Repository</span>
            <Badge variant="verified" className="text-[10px]">
              Write-Blocked Vault
            </Badge>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <FolderLock className="w-7 h-7 text-scan" />
            <span>Active Cases & Chain of Custody</span>
          </h1>
          <p className="text-xs text-ink-soft mt-1">
            Cryptographically signed CCTV recorder acquisitions and unallocated sector recovery cases.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleOpenCase(cases[0])}
            className="border-edge hover:border-scan/40 text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-scan" />
            Open Demo Case
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/cases/new')}
            className="shadow-glow-cyan text-xs font-semibold"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Case Intake
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-3 rounded-card bg-console border border-edge">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
          <input
            type="text"
            placeholder="Filter cases by title, ID, or SHA-256..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-void/80 border border-edge rounded-control text-ink placeholder:text-ink-faint focus:outline-none focus:border-scan transition-colors font-mono"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'ready', 'processing', 'new'] as const).map((status) => {
            const count = status === 'all' ? cases.length : cases.filter((c) => c.status === status).length;
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-control text-xs font-mono capitalize transition-all ${
                  isActive
                    ? 'bg-scan/20 text-scan border border-scan/50'
                    : 'bg-raised/40 text-ink-soft hover:text-ink border border-transparent'
                }`}
              >
                {status} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Case Grid */}
      {filteredCases.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredCases.map((c) => (
            <SpotlightCard
              key={c.id}
              className="p-5 flex flex-col justify-between group cursor-pointer border border-edge hover:border-scan/50 transition-all duration-200"
              onClick={() => handleOpenCase(c)}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-control bg-scan/10 border border-scan/30 flex items-center justify-center text-scan">
                      <FolderOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold text-scan tracking-wider">{c.id}</span>
                      <h3 className="font-display font-semibold text-base text-white group-hover:text-scan transition-colors">
                        {c.name}
                      </h3>
                    </div>
                  </div>

                  <StateBadge state={c.status === 'ready' ? 'verified' : c.status === 'processing' ? 'estimated' : 'verified'} />
                </div>

                <p className="text-xs text-ink-soft line-clamp-2 mb-4 leading-relaxed font-sans">{c.notes}</p>

                {/* Evidence Metrics Badge Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 rounded-control bg-void/60 border border-edge/60 mb-4 text-[11px] font-mono">
                  <div className="flex items-center gap-1.5 text-ink-soft">
                    <HardDrive className="w-3.5 h-3.5 text-scan" />
                    <span>{c.recorderCount} Recorder</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-ink-soft">
                    <Video className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{c.cameraCount} Channels</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-ink-soft col-span-2 sm:col-span-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>{c.createdAt.slice(0, 10)}</span>
                  </div>
                </div>

                {/* Cryptographic Hash */}
                <div className="space-y-1 mb-2">
                  <div className="flex items-center justify-between text-[10px] text-ink-faint font-mono">
                    <span>EVIDENCE DISK HASH (SHA-256)</span>
                    <span className="text-verified">IMMUTABLE</span>
                  </div>
                  <HashChip hash={c.sha256} verified={true} />
                </div>
              </div>

              {/* Footer actions */}
              <div className="pt-4 mt-3 border-t border-edge/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDuplicate(c, e)}
                    title="Duplicate Case"
                    className="p-1.5 rounded-control text-ink-soft hover:text-white hover:bg-raised/80 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(c.id, e)}
                    title={deletingId === c.id ? 'Click again to confirm delete' : 'Delete Case'}
                    className={`p-1.5 rounded-control transition-colors ${
                      deletingId === c.id
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                        : 'text-ink-soft hover:text-rose-400 hover:bg-raised/80'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {deletingId === c.id && (
                    <span className="text-[10px] text-rose-400 font-mono animate-pulse">Confirm delete?</span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-scan group-hover:translate-x-1 transition-transform">
                  <span>Enter Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>
      ) : (
        <Card surface="console" className="p-12 text-center space-y-4 border border-dashed border-edge">
          <div className="w-12 h-12 rounded-full bg-raised/80 border border-edge mx-auto flex items-center justify-center text-ink-soft">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">No forensic cases found</h3>
            <p className="text-xs text-ink-soft mt-1">
              No cases matched your filter query. Create a new intake or reset the search filter.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="secondary" size="sm" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}>
              Reset Filters
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/cases/new')}>
              <Plus className="w-4 h-4 mr-1.5" />
              New Case Intake
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

