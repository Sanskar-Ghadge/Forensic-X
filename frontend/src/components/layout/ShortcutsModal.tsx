import React, { useEffect } from 'react';
import { Keyboard, Command, Video, Navigation, ShieldCheck, X } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: 'Global Controls',
      icon: Command,
      shortcuts: [
        { keys: ['⌘', 'K'], label: 'Open Command Palette' },
        { keys: ['?'], label: 'Toggle Keyboard Shortcuts' },
        { keys: ['I'], label: 'Toggle Provenance Context Inspector' },
        { keys: ['M'], label: 'Cycle Motion Mode (Full → Reduced → Off)' },
        { keys: ['Esc'], label: 'Close Active Modal / Overlay' },
      ],
    },
    {
      title: 'Multi-Camera Timeline & Video Wall',
      icon: Video,
      shortcuts: [
        { keys: ['Space'], label: 'Play / Pause Synchronized Feeds' },
        { keys: ['J'], label: 'Step Back 1.0s' },
        { keys: ['L'], label: 'Step Forward 1.0s' },
        { keys: ['K'], label: 'Pause Video Playback' },
        { keys: ['←', '→'], label: 'Scrub Timeline 5.0s' },
      ],
    },
    {
      title: 'Direct Screen Navigation',
      icon: Navigation,
      shortcuts: [
        { keys: ['1'], label: 'Case Dashboard' },
        { keys: ['2'], label: 'Camera Matrix Grid' },
        { keys: ['3'], label: 'Synchronized Timeline' },
        { keys: ['4'], label: 'Entity Appearance Search' },
        { keys: ['5'], label: 'Evidence Lineage Graph (DAG)' },
        { keys: ['6'], label: 'Court Audit Report & Metrics' },
      ],
    },
    {
      title: 'Forensic Actions & Certification',
      icon: ShieldCheck,
      shortcuts: [
        { keys: ['⌘', 'C'], label: 'Copy SHA-256 Hash when hovered' },
        { keys: ['⌘', 'P'], label: 'Print / Export Forensic Court Certificate' },
      ],
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-2xl bg-console border border-edge text-ink p-6 rounded-card shadow-2xl">
        <div className="border-b border-edge/60 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-scan/10 border border-scan/30 text-scan">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 id="shortcuts-dialog-title" className="text-lg font-bold text-white tracking-wide font-display">
                Keyboard Shortcuts & Commands
              </h2>
              <p className="text-xs text-ink-soft font-mono mt-0.5">
                Investigator hotkey controls for rapid video inspection and timeline navigation.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-ink-soft hover:text-white rounded-control hover:bg-raised transition-colors focus-visible:ring-2 focus-visible:ring-scan/80 focus-visible:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[65vh] overflow-y-auto pr-1">
          {shortcutGroups.map((group, idx) => {
            const Icon = group.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-control bg-void/70 border border-edge/70 flex flex-col justify-between"
              >
                <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-scan font-mono uppercase tracking-wider">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{group.title}</span>
                </div>
                <div className="space-y-2">
                  {group.shortcuts.map((sc, sIdx) => (
                    <div
                      key={sIdx}
                      className="flex items-center justify-between text-xs font-sans text-ink-soft hover:text-ink transition-colors"
                    >
                      <span className="truncate pr-2">{sc.label}</span>
                      <div className="flex items-center gap-1 shrink-0 font-mono">
                        {sc.keys.map((k, kIdx) => (
                          <kbd
                            key={kIdx}
                            className="px-1.5 py-0.5 rounded bg-raised border border-edge text-[11px] font-semibold text-white shadow-xs"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-edge/60 flex items-center justify-between text-xs text-ink-faint font-mono">
          <span>
            Press <kbd className="px-1 py-0.5 rounded bg-raised border border-edge text-[10px] text-ink">Esc</kbd> or{' '}
            <kbd className="px-1 py-0.5 rounded bg-raised border border-edge text-[10px] text-ink">?</kbd> to dismiss
          </span>
          <span className="text-scan">FORENSIC-X v1.0.0</span>
        </div>
      </div>
    </div>
  );
};
