import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { formatTimeCode } from '@/lib/time';
import { TimeCode } from '@/components/forensic/TimeCode';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const PlaybackStrip: React.FC = () => {
  const { timeCursor, setTimeCursor } = useAppStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);

  // Total duration of demo window: 4 minutes (240 seconds)
  const maxSeconds = 240;

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

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
          onClick={togglePlay}
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
              onClick={() => setSpeed(s)}
              className={cn(
                'px-1.5 py-0.5 rounded transition-colors',
                speed === s
                  ? 'bg-scan text-on-accent font-semibold'
                  : 'text-ink-soft hover:text-ink'
              )}
            >
              {s}x
            </button>
          ))}
        </div>
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
            {/* Disconnection gap region (rose) */}
            <div className="absolute left-[35%] w-[20%] inset-y-0 bg-gap/40 border-l border-r border-gap" />
            {/* Recovered clip region (violet) */}
            <div className="absolute left-[50%] w-[15%] inset-y-0 bg-recovered/50" />
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
