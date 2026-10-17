import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SideRail } from './SideRail';
import { TopBar } from './TopBar';
import { Inspector } from './Inspector';
import { PlaybackStrip } from './PlaybackStrip';
import { CommandPalette } from './CommandPalette';
import { ShortcutsModal } from './ShortcutsModal';
import { DemoController } from '@/features/demo/DemoController';
import { useAppStore } from '@/lib/store';
import { useHotkeys } from '@/hooks/useHotkeys';
import { useMotion } from '@/hooks/useMotion';
import { FpsMeter } from '@/components/fx/FpsMeter';

export const Shell: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentCaseId, toggleInspector, setCommandPaletteOpen, isCommandPaletteOpen, toggleDemoMode } =
    useAppStore();
  const { mode, setMotionMode } = useMotion();
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Register global shortcuts
  useHotkeys({
    'mod+k': () => setCommandPaletteOpen(!isCommandPaletteOpen),
    i: () => toggleInspector(),
    '?': () => setIsShortcutsOpen((prev) => !prev),
    d: () => toggleDemoMode(),
    m: () => {
      const next = mode === 'full' ? 'reduced' : mode === 'reduced' ? 'off' : 'full';
      setMotionMode(next);
    },
    // Direct numerical shortcuts
    '1': () => navigate(`/cases/${currentCaseId}`),
    '2': () => navigate(`/cases/${currentCaseId}/cameras`),
    '3': () => navigate(`/cases/${currentCaseId}/timeline`),
    '4': () => navigate(`/cases/${currentCaseId}/search`),
    '5': () => navigate(`/cases/${currentCaseId}/graph`),
    '6': () => navigate(`/cases/${currentCaseId}/report`),
  });

  const showPlayback = location.pathname.includes('/timeline') || location.pathname.includes('/playback');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-void text-ink font-sans">
      <FpsMeter />
      <CommandPalette />
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
      <DemoController />

      {/* Left Collapsible Rail */}
      <SideRail />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Bar */}
        <TopBar onOpenShortcuts={() => setIsShortcutsOpen(true)} />

        {/* Scrollable Center Canvas */}
        <main className="flex-1 overflow-y-auto min-h-0 bg-void relative">
          <Outlet />
        </main>

        {/* Bottom Playback Strip on Timeline */}
        {showPlayback && <PlaybackStrip />}
      </div>

      {/* Right Provenance Context Inspector */}
      <Inspector />
    </div>
  );
};

