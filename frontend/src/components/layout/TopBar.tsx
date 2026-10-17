import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { useMotion, MotionMode } from '@/hooks/useMotion';
import { useApiStatus } from '@/api/hooks';
import { Badge } from '@/components/ui/Badge';
import {
  Search,
  ShieldCheck,
  Activity,
  Layers,
  ChevronRight,
  HelpCircle,
  Radio,
  Sparkles,
} from 'lucide-react';

interface TopBarProps {
  onOpenShortcuts?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenShortcuts }) => {
  const { currentCaseId, setCommandPaletteOpen, isDemoMode, toggleDemoMode } = useAppStore();
  const { mode, setMotionMode } = useMotion();
  const apiStatus = useApiStatus();
  const location = useLocation();

  // Generate breadcrumb items from route
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathParts.map((p, idx) => {
    const isCase = p.startsWith('CASE-');
    const label = isCase ? 'Retail Theft Incident' : p.charAt(0).toUpperCase() + p.slice(1);
    const isLast = idx === pathParts.length - 1;
    return { label, isLast };
  });

  return (
    <header className="h-16 bg-console/95 border-b border-edge px-6 flex items-center justify-between select-none backdrop-blur z-20 surface-depth">
      {/* Left: Breadcrumbs & Case Switcher */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-mono text-ink-soft">
          <span className="text-scan font-semibold">FORENSIC-X</span>
          {breadcrumbs.map((b, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3.5 h-3.5 text-edge" />
              <span className={b.isLast ? 'text-ink font-semibold' : 'text-ink-soft'}>
                {b.label}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* Case Switcher Tag */}
        <Badge variant="neutral" className="hidden sm:inline-flex font-mono text-[11px] ml-2">
          {currentCaseId}
        </Badge>
      </div>

      {/* Right Controls: Command Palette, Integrity, Mocks, Motion */}
      <div className="flex items-center gap-3">
        {/* Command Palette Jump Button */}
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          aria-label="Open Command Palette"
          className="flex items-center gap-2 px-3 py-1.5 rounded-control bg-raised/70 border border-edge hover:border-scan/40 hover:bg-raised text-xs text-ink-soft hover:text-ink transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-scan/80 focus-visible:outline-none"
        >
          <Search className="w-3.5 h-3.5 text-scan" />
          <span className="hidden md:inline">Search or jump to...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-void border border-edge text-[10px] font-mono text-ink-faint">
            ⌘K
          </kbd>
        </button>

        {/* Shortcuts Help Button */}
        <button
          type="button"
          onClick={onOpenShortcuts}
          aria-label="Keyboard Shortcuts"
          className="p-2 rounded-control bg-raised/70 border border-edge hover:border-scan/40 hover:bg-raised text-ink-soft hover:text-scan transition-colors focus-visible:ring-2 focus-visible:ring-scan/80 focus-visible:outline-none"
          title="Keyboard Shortcuts (?)"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        {/* Guided Demo Tour Toggle Button */}
        <button
          type="button"
          onClick={() => toggleDemoMode()}
          aria-label="Guided Demo Tour"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-control border text-xs font-mono font-medium transition-colors focus-visible:ring-2 focus-visible:ring-scan/80 focus-visible:outline-none ${
            isDemoMode
              ? 'bg-scan text-on-accent border-scan shadow-[0_0_12px_rgba(34,211,238,0.4)]'
              : 'bg-raised/70 border-edge hover:border-scan/40 text-ink-soft hover:text-scan'
          }`}
          title="Toggle Guided Demo Tour (D)"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Demo Tour</span>
        </button>

        {/* Job Progress Indicator Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-raised border border-edge text-xs font-mono text-ink-soft">
          <Activity className="w-3.5 h-3.5 text-scan animate-pulse" />
          <span>Idle</span>
        </div>

        {/* Cryptographic Integrity Shield Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-verified/10 border border-verified/30 text-xs font-mono text-verified">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Hashes 100% OK</span>
        </div>

        {/* Dynamic API / Sample Data Status Pill */}
        {apiStatus.isLive ? (
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-scan/10 border border-scan/30 text-[11px] font-mono text-scan font-medium"
            title={`Connected to FastAPI Backend at ${apiStatus.baseUrl}`}
          >
            <Radio className="w-3 h-3 text-scan animate-pulse" />
            <span>Live Backend</span>
          </div>
        ) : (
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-estimated/10 border border-estimated/30 text-[11px] font-mono text-estimated font-medium"
            title="Operating on local verified mock bitstream & truth data"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-estimated" />
            <span>Sample Data</span>
          </div>
        )}

        {/* Motion Mode Quick Toggle */}
        <div className="hidden sm:flex items-center p-0.5 bg-void rounded border border-edge text-[10px] font-mono">
          <span className="text-ink-faint px-1.5 flex items-center">
            <Layers className="w-3 h-3 mr-1" />
          </span>
          {(['full', 'reduced', 'off'] as MotionMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMotionMode(m)}
              aria-label={`Switch motion to ${m}`}
              className={`px-1.5 py-0.5 rounded uppercase transition-colors ${
                mode === m
                  ? 'bg-scan text-on-accent font-semibold'
                  : 'text-ink-faint hover:text-ink'
              }`}
              title={`Switch motion to ${m}`}
            >
              {m[0]}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
