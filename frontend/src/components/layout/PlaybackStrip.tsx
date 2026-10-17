import React, { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { formatTimeCode } from '@/lib/time';
import { TimeCode } from '@/components/forensic/TimeCode';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  LayoutGrid,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const PlaybackStrip: React.FC = () => {
  const {
    timeCursor,
    setTimeCursor,
    isPlaying,
    toggleIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    isVideoWallOpen,
    toggleVideoWall,
  } = useAppStore();

  // Total duration of case window: 20 minutes (1200 seconds)
  const maxSeconds = 1200;

  // Real-time playback ticker
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (isPlaying) {
      const intervalMs = Math.round(1000 / playbackSpeed);
      timer = setInterval(() => {
        const cur = useAppStore.getState().timeCursor;
        if (cur >= maxSeconds) {
          setTimeCursor(0);
        } else {
          setTimeCursor(cur + 1);
        }
      }, intervalMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, playbackSpeed, setTimeCursor]);

  const stepSeconds = (delta: number) => {
    setTimeCursor(Math.max(0, Math.min(maxSeconds, timeCursor + delta)));
  };

  return (
    <div className="h-14 bg-console/90 border-t border-edge px-6 flex items-center justify-between select-none backdrop-blur z-20 surface-depth">
      {/* Left: Playback Controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => stepSeconds(-5)}
          className="p-1.5 rounded hover:bg-raised text-ink-soft hover:text-ink transition-colors"
          title="Step back 5s (J)"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={toggleIsPlaying}
          className="w-8 h-8 rounded-full bg-scan text-on-accent flex items-center justify-center hover:bg-scan/90 shadow-[0_0_12px_rgba(34,211,238,0.3)] transition-all"
          title="Play / Pause (Space)"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        <button
          type="button"
          onClick={() => stepSeconds(5)}
          className="p-1.5 rounded hover:bg-raised text-ink-soft hover:text-ink transition-colors"
          title="Step forward 5s (L)"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Speed Picker */}
        <div className="flex items-center ml-2 p-0.5 bg-void rounded border border-edge text-[10px] font-mono">
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => setPlaybackSpeed(s)}
              className={cn(
                'px-1.5 py-0.5 rounded transition-colors',
                playbackSpeed === s
                  ? 'bg-scan text-on-accent font-semibold'
                  : 'text-ink-soft hover:text-ink'
              )}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Video Wall Toggle Button */}
        <button
          type="button"
          onClick={toggleVideoWall}
          className={cn(
            'ml-3 px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 border transition-all',
            isVideoWallOpen
              ? 'bg-scan/20 text-scan border-scan/50 font-bold shadow-glow-cyan'
              : 'bg-void text-ink-soft hover:text-white border-edge'
          )}
          title="Toggle Multi-Camera Video Wall"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>3-Up Wall</span>
        </button>
      </div>

      {/* Center: Synchronized Scrubber Bar */}
      <div className="flex-1 max-w-xl mx-8 flex items-center gap-3">
        <span className="font-mono text-xs tabular-nums text-scan">
          {formatTimeCode(timeCursor)}
        </span>

        <div className="flex-1 relative flex items-center h-5">
          {/* Timeline track with gap (rose) & recovered (violet) regions */}
          <div className="w-full h-1.5 rounded-full bg-void border border-edge relative overflow-hidden">
            {/* Active footage background */}
            <div className="absolute inset-0 bg-scan/20" />
            {/* Disconnection gap region (rose: 2s to 910s = ~75%) */}
            <div className="absolute left-[0.2%] w-[75%] inset-y-0 bg-gap/40 border-l border-r border-gap" />
            {/* Recovered clip region (violet: 120s to 180s = 10% to 15%) */}
            <div className="absolute left-[10%] w-[5%] inset-y-0 bg-recovered/60" />
            {/* Scrubber progress */}
            <div
              className="h-full bg-scan transition-all duration-75"
              style={{ width: `${(timeCursor / maxSeconds) * 100}%` }}
            />
          </div>

          <input
            type="range"
            min={0}
            max={maxSeconds}
            value={timeCursor}
            onChange={(e) => setTimeCursor(Number(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
        </div>

        <span className="font-mono text-xs tabular-nums text-ink-faint">
          {formatTimeCode(maxSeconds)}
        </span>
      </div>

      {/* Right: Master Corrected Timestamp with Uncertainty */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-[10px] uppercase font-mono text-ink-faint">Synchronized Master Clock</div>
          <TimeCode time="2026-10-17T21:42:17Z" uncertaintyS={1} isEstimated className="text-sm font-semibold text-white" />
        </div>
      </div>
    </div>
  );
};
