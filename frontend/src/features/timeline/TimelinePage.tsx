import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore, InspectorItem } from '@/lib/store';
import { CameraBadge } from '@/components/forensic/CameraBadge';
import { StateBadge } from '@/components/forensic/StateBadge';
import { HashChip } from '@/components/forensic/HashChip';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Clock,
  Play,
  Pause,
  Table as TableIcon,
  Flame,
  ZapOff,
  Crosshair,
} from 'lucide-react';

interface TimelineSegment {
  id: string;
  channel: number;
  cameraName: string;
  startSec: number; // Seconds from 21:40:00 (base = 0)
  durationSec: number;
  status: 'active' | 'recovered';
  method: 'index' | 'carved';
  hash: string;
  label: string;
}

interface TimelineGap {
  id: string;
  channel: number;
  cameraName: string;
  startSec: number;
  durationSec: number;
  verdict: string;
  confidence: number;
  evidenceFor: string[];
  evidenceAgainst: string[];
}

const TOTAL_TIMELINE_SPAN_S = 1200; // 20 minutes (21:40:00 to 22:00:00)
const INCIDENT_EPOCH_OFFSET_S = 137; // 21:42:17 is 137s from 21:40:00

export const TimelinePage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const { currentCaseId, openInspector, timeCursor, setTimeCursor } = useAppStore();
  const activeId = caseId || currentCaseId;

  // View settings
  const [isCorrectedTime, setIsCorrectedTime] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'visual' | 'table'>('visual');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Manual Nudge offset for Cam 2
  const [cam2ManualOffset, setCam2ManualOffset] = useState<number>(4.0);

  // Layer Visibility Toggles
  const [showFootage, setShowFootage] = useState(true);
  const [showRecovered, setShowRecovered] = useState(true);
  const [showGaps, setShowGaps] = useState(true);
  const [showUncertainty, setShowUncertainty] = useState(true);

  // Base Data
  const segments: TimelineSegment[] = useMemo(
    () => [
      // CH1: Main Entrance
      {
        id: 'SEG-001',
        channel: 1,
        cameraName: 'Main Entrance',
        startSec: 0, // 21:40:00
        durationSec: 120,
        status: 'active',
        method: 'index',
        hash: 'e18f6301aec7b13595aa1fa6dd2637a7553a94f4b1b81c2bc272432734c29ccf',
        label: 'Active Continuous (120s)',
      },
      {
        id: 'SEG-002-DEL',
        channel: 1,
        cameraName: 'Main Entrance',
        startSec: 120, // 21:42:00
        durationSec: 60,
        status: 'recovered',
        method: 'carved',
        hash: '0b2b68602866eb8a8300d8f31a01d70c71f1cd4770c86ae3f253eab617b3f25c',
        label: 'Carved Deleted Footage (60s)',
      },
      // CH2: Aisle 4
      {
        id: 'SEG-003-DRIFT',
        channel: 2,
        cameraName: 'Aisle 4',
        // In raw time it is at 4s; in corrected time it shifts back by cam2ManualOffset
        startSec: isCorrectedTime ? 4 - cam2ManualOffset : 4,
        durationSec: 120,
        status: 'active',
        method: 'index',
        hash: 'ffd6c9a60c3b028576e85d40afe7decf76633971b53266acadfc5759fa093810',
        label: isCorrectedTime ? 'Drift Corrected (+4.0s)' : 'Raw Unaligned (+4s)',
      },
      // CH3: Cash Counter
      {
        id: 'SEG-004-PRE-GAP',
        channel: 3,
        cameraName: 'Cash Counter',
        startSec: 0,
        durationSec: 2,
        status: 'active',
        method: 'index',
        hash: 'ec091024bd561f3ab606ca917b0f109227c20151728ab49bd045eed35e1d020f',
        label: 'Pre-Loss Frame (2s)',
      },
      {
        id: 'SEG-005-POST-GAP',
        channel: 3,
        cameraName: 'Cash Counter',
        startSec: 910, // 21:55:10
        durationSec: 120,
        status: 'active',
        method: 'index',
        hash: 'd9753683ca9bbf07f4a5b17d1fe881fcbc645758163da358abcee67bca133f57',
        label: 'Post-Restoration (120s)',
      },
    ],
    [isCorrectedTime, cam2ManualOffset]
  );

  const gaps: TimelineGap[] = useMemo(
    () => [
      {
        id: 'GAP-CH3-01',
        channel: 3,
        cameraName: 'Cash Counter',
        startSec: 2, // 21:40:02
        durationSec: 908, // 15m 08s
        verdict: 'physical_camera_disconnect',
        confidence: 0.8,
        evidenceFor: [
          '2026-10-17 21:40:02 [WARN] CH3 Video Loss detected: Signal carrier dropped',
          '2026-10-17 21:55:10 [INFO] CH3 Video Signal Restored: 1080p carrier locked',
          'Sector carve scan confirms no video frames in unallocated disk blocks',
        ],
        evidenceAgainst: ['No storage format or operator manual deletion logs'],
      },
    ],
    []
  );

  // Playback timer simulation
  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isPlaying) {
      interval = setInterval(() => {
        const cur = useAppStore.getState().timeCursor;
        setTimeCursor(cur >= TOTAL_TIMELINE_SPAN_S ? 0 : cur + 1);
      }, 250);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, setTimeCursor]);

  // Handle click on canvas
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    const newCursorSec = Math.round(fraction * TOTAL_TIMELINE_SPAN_S);
    setTimeCursor(newCursorSec);
  };

  const handleSelectSegment = (seg: TimelineSegment) => {
    const item: InspectorItem = {
      id: seg.id,
      kind: 'segment',
      title: `${seg.cameraName} · ${seg.label}`,
      channel: seg.channel,
      location: seg.cameraName,
      state: seg.status === 'recovered' ? 'recovered' : 'verified',
      hash: seg.hash,
      timeOriginal: `21:40:${String(seg.startSec).padStart(2, '0')}`,
      timeCorrected: `21:40:${String(seg.startSec).padStart(2, '0')} UTC`,
      method: seg.method,
      metadata: {
        duration: `${seg.durationSec}s`,
        sectorOffset: seg.status === 'recovered' ? 254464 : 4096,
        hashVerified: true,
      },
    };
    openInspector(item);
  };

  const handleSelectGap = (gap: TimelineGap) => {
    const item: InspectorItem = {
      id: gap.id,
      kind: 'gap',
      title: `Footage Gap · ${gap.cameraName} (908s)`,
      channel: gap.channel,
      location: gap.cameraName,
      state: 'gap',
      confidence: gap.confidence,
      timeOriginal: '21:40:02 UTC',
      timeCorrected: '21:40:02 to 21:55:10 UTC',
      evidenceFor: gap.evidenceFor,
      evidenceAgainst: gap.evidenceAgainst,
      metadata: {
        duration: `${gap.durationSec} seconds (15m 08s)`,
        inferredCause: 'Physical camera signal drop / cable disconnected',
      },
    };
    openInspector(item);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono tracking-widest text-scan">Synchronized Canvas</span>
            <Badge variant="verified" className="text-[10px]">
              Multi-Camera Calibration
            </Badge>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Clock className="w-7 h-7 text-scan" />
            <span>Multi-Camera Forensic Timeline</span>
          </h1>
          <p className="text-xs text-ink-soft mt-1">
            Case <span className="text-scan font-mono">{activeId}</span> · Unified temporal plane aligning 3 surveillance feeds, carved unindexed video, and hardware disconnect intervals.
          </p>
        </div>

        {/* View Mode & Time Alignment Switch */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Alignment Moment: Raw vs Corrected Switch */}
          <div className="flex items-center p-1 rounded-control bg-raised border border-edge">
            <button
              onClick={() => setIsCorrectedTime(false)}
              className={`px-3 py-1 text-xs font-mono rounded-control transition-all ${
                !isCorrectedTime
                  ? 'bg-amber-500/20 text-estimated border border-estimated/50 font-bold'
                  : 'text-ink-soft hover:text-white'
              }`}
            >
              Raw Recorder Clock
            </button>
            <button
              onClick={() => setIsCorrectedTime(true)}
              className={`px-3 py-1 text-xs font-mono rounded-control transition-all ${
                isCorrectedTime
                  ? 'bg-scan/20 text-scan border border-scan/50 font-bold shadow-glow-cyan'
                  : 'text-ink-soft hover:text-white'
              }`}
            >
              Corrected Time (+4.0s Calibrated)
            </button>
          </div>

          {/* Table / Visual Toggle */}
          <div className="flex items-center p-1 rounded-control bg-raised border border-edge">
            <button
              onClick={() => setViewMode('visual')}
              className={`px-2.5 py-1 text-xs font-mono rounded-control transition-colors ${
                viewMode === 'visual' ? 'bg-scan/20 text-scan font-semibold' : 'text-ink-soft'
              }`}
            >
              Lanes
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 text-xs font-mono rounded-control transition-colors ${
                viewMode === 'table' ? 'bg-scan/20 text-scan font-semibold' : 'text-ink-soft'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5 inline mr-1" />
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Control Strip & Reference Banner */}
      <div className="p-3 rounded-card bg-console border border-edge flex flex-wrap items-center justify-between gap-4">
        {/* Playback & Cursor Readout */}
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-xs font-mono border-edge text-scan"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 mr-1" /> : <Play className="w-3.5 h-3.5 mr-1" />}
            {isPlaying ? 'Pause' : 'Sync Play'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setTimeCursor(INCIDENT_EPOCH_OFFSET_S)}
            className="text-xs border-edge text-ink-soft hover:text-white"
          >
            <Crosshair className="w-3.5 h-3.5 mr-1 text-rose-400" />
            Jump to Incident (21:42:17)
          </Button>

          <div className="text-xs font-mono text-ink-soft border-l border-edge pl-3">
            <span>CURSOR: </span>
            <span className="text-white font-bold">21:40:{String(timeCursor % 60).padStart(2, '0')}</span>
            <span className="text-ink-faint ml-1">({timeCursor}s)</span>
          </div>
        </div>

        {/* Nudge Cam 2 Offset Control */}
        <div className="flex items-center gap-2 border-l border-edge pl-3 text-xs font-mono">
          <span className="text-ink-faint">CAM 2 DRIFT NUDGE:</span>
          <button
            onClick={() => setCam2ManualOffset((p) => Math.max(0, p - 0.5))}
            className="px-1.5 py-0.5 rounded bg-raised border border-edge text-ink-soft hover:text-white"
          >
            -0.5s
          </button>
          <span className="text-estimated font-bold">+{cam2ManualOffset.toFixed(1)}s</span>
          <button
            onClick={() => setCam2ManualOffset((p) => p + 0.5)}
            className="px-1.5 py-0.5 rounded bg-raised border border-edge text-ink-soft hover:text-white"
          >
            +0.5s
          </button>
        </div>

        {/* Layer Checkboxes */}
        <div className="flex items-center gap-3 text-xs font-mono text-ink-soft">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showFootage}
              onChange={(e) => setShowFootage(e.target.checked)}
              className="rounded bg-void border-edge text-scan focus:ring-0"
            />
            <span className="text-scan">Active</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showRecovered}
              onChange={(e) => setShowRecovered(e.target.checked)}
              className="rounded bg-void border-edge text-recovered focus:ring-0"
            />
            <span className="text-recovered">Carved</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showGaps}
              onChange={(e) => setShowGaps(e.target.checked)}
              className="rounded bg-void border-edge text-gap focus:ring-0"
            />
            <span className="text-gap">Gaps</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showUncertainty}
              onChange={(e) => setShowUncertainty(e.target.checked)}
              className="rounded bg-void border-edge text-estimated focus:ring-0"
            />
            <span className="text-estimated">±1.0s Error</span>
          </label>
        </div>
      </div>

      {viewMode === 'visual' ? (
        /* VISUAL LANES TIMELINE */
        <div className="space-y-4">
          {/* Minimap Viewport Strip */}
          <div className="p-2 rounded-control bg-console border border-edge space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-ink-faint">
              <span>MINIMAP OVERVIEW (21:40:00 &rarr; 22:00:00 UTC)</span>
              <span className="text-scan">WINDOW: 100% VISIBLE</span>
            </div>
            <div
              onClick={handleTimelineClick}
              className="w-full h-5 rounded bg-void border border-edge relative cursor-pointer overflow-hidden"
            >
              {/* Incident Line in minimap */}
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-rose-500 z-10"
                style={{ left: `${(INCIDENT_EPOCH_OFFSET_S / TOTAL_TIMELINE_SPAN_S) * 100}%` }}
              />
              {/* Play cursor in minimap */}
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-scan z-20"
                style={{ left: `${(timeCursor / TOTAL_TIMELINE_SPAN_S) * 100}%` }}
              />
              {/* Mini blocks */}
              <div
                className="absolute top-1 bottom-1 bg-scan/30 rounded-sm"
                style={{ left: '0%', width: '15%' }}
              />
              <div
                className="absolute top-1 bottom-1 bg-recovered/60 rounded-sm"
                style={{ left: '10%', width: '5%' }}
              />
              <div
                className="absolute top-1 bottom-1 bg-gap/40 border border-gap rounded-sm"
                style={{ left: '0.1%', width: '75%' }}
              />
            </div>
          </div>

          {/* MAIN TIMELINE LANES CONTAINER */}
          <div className="rounded-card bg-console border border-edge overflow-hidden">
            {/* Time Axis Header */}
            <div className="flex border-b border-edge bg-raised/30 font-mono text-[11px] text-ink-soft">
              <div className="w-56 p-3 border-r border-edge shrink-0 font-bold text-white uppercase tracking-wider">
                Surveillance Feeds
              </div>
              <div
                onClick={handleTimelineClick}
                className="flex-1 relative h-10 flex items-center cursor-pointer select-none px-2"
              >
                {/* Ticks */}
                {[0, 120, 240, 360, 480, 600, 720, 840, 960, 1080, 1200].map((sec) => (
                  <div
                    key={sec}
                    className="absolute text-[10px] text-ink-faint flex flex-col items-center -translate-x-1/2"
                    style={{ left: `${(sec / TOTAL_TIMELINE_SPAN_S) * 100}%` }}
                  >
                    <span>{sec === 0 ? '21:40' : sec === 120 ? '21:42' : `${21 + Math.floor(sec / 3600)}:${40 + Math.floor((sec % 3600) / 60)}`}</span>
                    <div className="w-[1px] h-2 bg-edge mt-0.5" />
                  </div>
                ))}

                {/* Incident Label in Ruler */}
                <div
                  className="absolute top-1 -translate-x-1/2 bg-rose-500/20 text-rose-400 border border-rose-500/50 px-1.5 py-0.5 rounded text-[9px] font-bold z-20"
                  style={{ left: `${(INCIDENT_EPOCH_OFFSET_S / TOTAL_TIMELINE_SPAN_S) * 100}%` }}
                >
                  INCIDENT 21:42:17
                </div>
              </div>
            </div>

            {/* LANES */}
            <div className="relative">
              {/* VERTICAL INCIDENT LINE */}
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-rose-500/80 z-20 pointer-events-none"
                style={{
                  left: `calc(14rem + ${(INCIDENT_EPOCH_OFFSET_S / TOTAL_TIMELINE_SPAN_S)} * (100% - 14rem))`,
                }}
              >
                <div className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-rose-500 shadow-glow-rose" />
              </div>

              {/* VERTICAL TIME CURSOR LINE */}
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-scan z-30 pointer-events-none transition-all duration-75"
                style={{
                  left: `calc(14rem + ${(timeCursor / TOTAL_TIMELINE_SPAN_S)} * (100% - 14rem))`,
                }}
              >
                <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 rounded-full bg-scan shadow-glow-cyan flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-void" />
                </div>
              </div>

              {/* LANE 1: MAIN ENTRANCE */}
              <div className="flex border-b border-edge/60 group hover:bg-raised/20 transition-colors">
                <div className="w-56 p-3.5 border-r border-edge shrink-0 flex items-center justify-between">
                  <CameraBadge channel={1} locationName="Entrance" />
                  <span className="text-[10px] font-mono text-verified">0.0s (REF)</span>
                </div>
                <div
                  onClick={handleTimelineClick}
                  className="flex-1 relative h-16 cursor-pointer overflow-hidden p-2"
                >
                  {/* Active Segment 1 */}
                  {showFootage && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectSegment(segments[0]);
                      }}
                      className="absolute top-3.5 h-9 rounded bg-scan/20 border border-scan hover:border-white transition-all cursor-pointer flex items-center px-2 text-xs font-mono text-scan shadow-sm"
                      style={{
                        left: `${(segments[0].startSec / TOTAL_TIMELINE_SPAN_S) * 100}%`,
                        width: `${(segments[0].durationSec / TOTAL_TIMELINE_SPAN_S) * 100}%`,
                      }}
                      title="Active Segment (120s)"
                    >
                      <span className="truncate">Active (120s)</span>
                    </div>
                  )}

                  {/* Carved Recovered Segment */}
                  {showRecovered && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectSegment(segments[1]);
                      }}
                      className="absolute top-3.5 h-9 rounded bg-recovered/30 border border-recovered hover:border-white transition-all cursor-pointer flex items-center px-2 text-xs font-mono text-recovered font-bold shadow-glow-purple z-10"
                      style={{
                        left: `${(segments[1].startSec / TOTAL_TIMELINE_SPAN_S) * 100}%`,
                        width: `${(segments[1].durationSec / TOTAL_TIMELINE_SPAN_S) * 100}%`,
                      }}
                      title="Carved Deleted Clip (60s) restored from unallocated disk space"
                    >
                      <Flame className="w-3.5 h-3.5 mr-1.5 text-recovered shrink-0 animate-pulse" />
                      <span className="truncate">Carved Deleted Clip (60s)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* LANE 2: AISLE 4 (DRIFT COMPENSATED) */}
              <div className="flex border-b border-edge/60 group hover:bg-raised/20 transition-colors">
                <div className="w-56 p-3.5 border-r border-edge shrink-0 flex items-center justify-between">
                  <CameraBadge channel={2} locationName="Aisle 4" />
                  <span className="text-[10px] font-mono text-estimated font-bold">
                    +{cam2ManualOffset.toFixed(1)}s Drift
                  </span>
                </div>
                <div
                  onClick={handleTimelineClick}
                  className="flex-1 relative h-16 cursor-pointer overflow-hidden p-2"
                >
                  {/* Uncertainty Fringe Overlay */}
                  {showUncertainty && isCorrectedTime && (
                    <div
                      className="absolute top-2 h-12 rounded bg-estimated/10 border border-dashed border-estimated/40 pointer-events-none"
                      style={{
                        left: `${((segments[2].startSec - 1) / TOTAL_TIMELINE_SPAN_S) * 100}%`,
                        width: `${((segments[2].durationSec + 2) / TOTAL_TIMELINE_SPAN_S) * 100}%`,
                      }}
                      title="Bayesian Uncertainty Window (±1.0s error bound)"
                    />
                  )}

                  {/* Segment with Animated Position Shift */}
                  {showFootage && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectSegment(segments[2]);
                      }}
                      className="absolute top-3.5 h-9 rounded bg-scan/20 border border-scan hover:border-white transition-all duration-300 cursor-pointer flex items-center px-2 text-xs font-mono text-white shadow-sm"
                      style={{
                        left: `${(segments[2].startSec / TOTAL_TIMELINE_SPAN_S) * 100}%`,
                        width: `${(segments[2].durationSec / TOTAL_TIMELINE_SPAN_S) * 100}%`,
                      }}
                      title={`Aisle 4 Segment: ${isCorrectedTime ? 'Corrected (-4s offset applied)' : 'Raw unaligned (+4s drift)'}`}
                    >
                      <span className="truncate">{segments[2].label}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* LANE 3: CASH COUNTER (SIGNAL LOSS GAP) */}
              <div className="flex group hover:bg-raised/20 transition-colors">
                <div className="w-56 p-3.5 border-r border-edge shrink-0 flex items-center justify-between">
                  <CameraBadge channel={3} locationName="Cash Counter" />
                  <span className="text-[10px] font-mono text-gap">1 Gap (908s)</span>
                </div>
                <div
                  onClick={handleTimelineClick}
                  className="flex-1 relative h-16 cursor-pointer overflow-hidden p-2"
                >
                  {/* Pre-loss short clip */}
                  {showFootage && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectSegment(segments[3]);
                      }}
                      className="absolute top-3.5 h-9 rounded bg-scan/20 border border-scan hover:border-white cursor-pointer px-1 flex items-center text-[10px] font-mono text-scan"
                      style={{
                        left: `${(segments[3].startSec / TOTAL_TIMELINE_SPAN_S) * 100}%`,
                        width: '0.8%',
                      }}
                      title="Pre-Loss Frame"
                    />
                  )}

                  {/* Hardware Disconnect Gap Bar */}
                  {showGaps && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectGap(gaps[0]);
                      }}
                      className="absolute top-2.5 h-11 rounded border-2 border-dashed border-gap bg-gap/20 hover:bg-gap/30 transition-all cursor-pointer flex items-center px-3 text-xs font-mono text-gap font-bold shadow-glow-rose"
                      style={{
                        left: `${(gaps[0].startSec / TOTAL_TIMELINE_SPAN_S) * 100}%`,
                        width: `${(gaps[0].durationSec / TOTAL_TIMELINE_SPAN_S) * 100}%`,
                      }}
                      title="Hardware Signal Loss Gap (21:40:02 to 21:55:10) — 80% confidence"
                    >
                      <ZapOff className="w-4 h-4 mr-2 text-gap shrink-0 animate-pulse" />
                      <span className="truncate">
                        Hardware Signal Loss Gap · 908s Disconnect (21:40:02 &rarr; 21:55:10 UTC)
                      </span>
                    </div>
                  )}

                  {/* Post-restoration clip */}
                  {showFootage && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectSegment(segments[4]);
                      }}
                      className="absolute top-3.5 h-9 rounded bg-scan/20 border border-scan hover:border-white cursor-pointer px-2 flex items-center text-xs font-mono text-scan"
                      style={{
                        left: `${(segments[4].startSec / TOTAL_TIMELINE_SPAN_S) * 100}%`,
                        width: `${(segments[4].durationSec / TOTAL_TIMELINE_SPAN_S) * 100}%`,
                      }}
                      title="Post-Restoration Segment (120s)"
                    >
                      <span className="truncate">Signal Restored (120s)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ACCESSIBLE FORENSIC EVIDENCE TABLE VIEW */
        <div className="rounded-card bg-console border border-edge overflow-hidden">
          <div className="p-4 border-b border-edge flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white font-mono uppercase">
              Forensic Evidence Segments & Gaps Master Index
            </h3>
            <Badge variant="verified">5 Records Synchronized</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-raised/60 text-ink-soft border-b border-edge">
                <tr>
                  <th className="p-3">IDENTIFIER</th>
                  <th className="p-3">CHANNEL</th>
                  <th className="p-3">LOCATION</th>
                  <th className="p-3">RAW TIME</th>
                  <th className="p-3">CORRECTED TIME</th>
                  <th className="p-3">DURATION</th>
                  <th className="p-3">STATUS</th>
                  <th className="p-3">METHOD</th>
                  <th className="p-3">SHA-256 HASH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge/50">
                {segments.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => handleSelectSegment(s)}
                    className="hover:bg-raised/40 cursor-pointer transition-colors"
                  >
                    <td className="p-3 text-scan font-bold">{s.id}</td>
                    <td className="p-3">CH{s.channel}</td>
                    <td className="p-3 text-white">{s.cameraName}</td>
                    <td className="p-3 text-ink-soft">21:40:{String(s.startSec).padStart(2, '0')}</td>
                    <td className="p-3 text-white font-semibold">21:40:{String(s.startSec).padStart(2, '0')}</td>
                    <td className="p-3">{s.durationSec}s</td>
                    <td className="p-3">
                      <StateBadge state={s.status === 'recovered' ? 'recovered' : 'verified'} />
                    </td>
                    <td className="p-3 uppercase text-[10px] text-ink-faint">{s.method}</td>
                    <td className="p-3">
                      <HashChip hash={s.hash} verified={true} leadChars={6} tailChars={4} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Legend & Forensic Provenance Summary */}
      <div className="p-4 rounded-control bg-raised/30 border border-edge flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded bg-scan/30 border border-scan" />
            <span className="text-white">Active Indexed Video</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded bg-recovered/40 border border-recovered" />
            <span className="text-recovered">Carved Deleted Video (Unallocated Blocks)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded border border-dashed border-gap bg-gap/30" />
            <span className="text-gap">Hardware Disconnect Gap (Carrier Loss)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded border border-dashed border-estimated bg-estimated/20" />
            <span className="text-estimated">Bayesian Uncertainty Bound (±1.0s)</span>
          </div>
        </div>

        <div className="text-[11px] text-ink-soft">
          Incident: <span className="text-rose-400 font-bold">2026-10-17 21:42:17 UTC</span>
        </div>
      </div>
    </div>
  );
};
