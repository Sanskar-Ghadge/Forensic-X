import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SideRail } from './SideRail';
import { TopBar } from './TopBar';
import { Inspector } from './Inspector';
import { PlaybackStrip } from './PlaybackStrip';
import { CommandPalette } from './CommandPalette';
import { useAppStore } from '@/lib/store';
import { useHotkeys } from '@/hooks/useHotkeys';
import { useMotion } from '@/hooks/useMotion';
import { FpsMeter } from '@/components/fx/FpsMeter';

export const Shell: React.FC = () => {
  const location = useLocation();
  const { toggleInspector, setCommandPaletteOpen, isCommandPaletteOpen } = useAppStore();
  const { mode, setMotionMode } = useMotion();

  // Register global shortcuts
  useHotkeys({
    'mod+k': () => setCommandPaletteOpen(!isCommandPaletteOpen),
    i: () => toggleInspector(),
    m: () => {
      const next = mode === 'full' ? 'reduced' : mode === 'reduced' ? 'off' : 'full';
      setMotionMode(next);
    },
  });

  const showPlayback = location.pathname.includes('/timeline') || location.pathname.includes('/playback');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-void text-ink font-sans">
      <FpsMeter />
      <CommandPalette />

      {/* Left Collapsible Rail */}
      <SideRail />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Bar */}
        <TopBar />

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
