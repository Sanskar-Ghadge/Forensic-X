import React, { useEffect } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { useMotion } from '@/hooks/useMotion';
import {
  LayoutDashboard,
  FolderLock,
  Video,
  Clock,
  ScanSearch,
  GitBranch,
  FileText,
  Palette,
  Layers,
  Fingerprint,
  Zap,
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    currentCaseId,
    toggleInspector,
    toggleDemoMode,
  } = useAppStore();
  const { setMotionMode } = useMotion();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const runCommand = (action: () => void) => {
    action();
    setCommandPaletteOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-void/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-in fade-in-0 duration-fast">
      <div
        className="w-full max-w-xl bg-console rounded-panel border border-edge shadow-2xl overflow-hidden surface-depth"
        onClick={(e) => e.stopPropagation()}
      >
        <Command className="w-full bg-transparent font-sans">
          <div className="flex items-center px-4 border-b border-edge bg-console/80">
            <Command.Input
              autoFocus
              placeholder="Type a screen, command, or jump to timestamp..."
              className="w-full h-12 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint font-sans"
            />
            <kbd className="px-1.5 py-0.5 rounded bg-raised border border-edge text-[10px] font-mono text-ink-faint">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 space-y-1 text-xs">
            <Command.Empty className="p-4 text-center text-ink-faint font-mono text-xs">
              No matching forensic screens or actions found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="text-[11px] font-mono uppercase text-ink-faint px-2 py-1">
              <Command.Item
                onSelect={() => runCommand(() => navigate(`/cases/${currentCaseId}`))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-control text-ink hover:bg-raised hover:text-scan cursor-pointer transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-scan shrink-0" />
                <span>Case Overview Dashboard</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate(`/cases/${currentCaseId}/timeline`))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-control text-ink hover:bg-raised hover:text-scan cursor-pointer transition-colors"
              >
                <Clock className="w-4 h-4 text-scan shrink-0" />
                <span>Multi-Camera Synchronized Timeline</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate(`/cases/${currentCaseId}/cameras`))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-control text-ink hover:bg-raised hover:text-scan cursor-pointer transition-colors"
              >
                <Video className="w-4 h-4 text-scan shrink-0" />
                <span>Camera Stream Grid</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate(`/cases/${currentCaseId}/search`))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-control text-ink hover:bg-raised hover:text-scan cursor-pointer transition-colors"
              >
                <ScanSearch className="w-4 h-4 text-scan shrink-0" />
                <span>Cross-Camera Visual & Text Search</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate(`/cases/${currentCaseId}/graph`))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-control text-ink hover:bg-raised hover:text-scan cursor-pointer transition-colors"
              >
                <GitBranch className="w-4 h-4 text-scan shrink-0" />
                <span>Traceable Evidence Graph</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate(`/cases/${currentCaseId}/report`))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-control text-ink hover:bg-raised hover:text-scan cursor-pointer transition-colors"
              >
                <FileText className="w-4 h-4 text-scan shrink-0" />
                <span>Audit Report Preview & PDF Export</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate('/cases'))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-control text-ink hover:bg-raised hover:text-scan cursor-pointer transition-colors"
              >
                <FolderLock className="w-4 h-4 text-scan shrink-0" />
                <span>Cases Repository</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate('/design'))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-control text-ink hover:bg-raised hover:text-scan cursor-pointer transition-colors"
              >
                <Palette className="w-4 h-4 text-scan shrink-0" />
                <span>Living Style Guide (/design)</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Actions & Settings" className="text-[11px] font-mono uppercase text-ink-faint px-2 py-1 pt-2 border-t border-edge/40">
              <Command.Item
                onSelect={() => runCommand(toggleInspector)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-control text-ink hover:bg-raised hover:text-scan cursor-pointer transition-colors"
              >
                <Fingerprint className="w-4 h-4 text-scan shrink-0" />
                <span>Toggle Provenance Inspector (I)</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(toggleDemoMode)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-control text-ink hover:bg-raised hover:text-scan cursor-pointer transition-colors"
              >
                <Zap className="w-4 h-4 text-scan shrink-0" />
                <span>Toggle 5-Minute Guided Presenter Tour (D)</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(useAppStore.getState().resetDemoState)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-control text-ink hover:bg-raised hover:text-alert cursor-pointer transition-colors"
              >
                <Fingerprint className="w-4 h-4 text-alert shrink-0" />
                <span>Reset Demo State (Clean Rehearsal) (R)</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => setMotionMode('off'))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-control text-ink hover:bg-raised hover:text-scan cursor-pointer transition-colors"
              >
                <Layers className="w-4 h-4 text-scan shrink-0" />
                <span>Disable All Animations (Low Power Mode)</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
};
