import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { SpotlightCard } from '@/components/fx/SpotlightCard';
import { CameraBadge } from '@/components/forensic/CameraBadge';
import { StateBadge } from '@/components/forensic/StateBadge';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Video,
  Clock,
  ExternalLink,
  SlidersHorizontal,
  LayoutGrid,
  List as ListIcon,
  HardDrive,
  Info,
} from 'lucide-react';

interface CameraFeedData {
  channel: number;
  location: string;
  recorder: string;
  status: 'ok' | 'drift' | 'gap';
  statusText: string;
  clockOffset: string;
  videoSrc: string;
  coverage: {
    activeRanges: { startPct: number; widthPct: number }[];
    gapRanges: { startPct: number; widthPct: number }[];
  };
  gapCount: number;
  segmentsCount: number;
  resolution: string;
}

const CAMERAS_DATA: CameraFeedData[] = [
  {
    channel: 1,
    location: 'Main Entrance',
    recorder: 'MOCKDVR1 (REC-01)',
    status: 'ok',
    statusText: 'Carrier Active · 1080p 25fps',
    clockOffset: '0.0s (Master Reference)',
    videoSrc: '/sample/cam1_entrance.mp4',
    coverage: {
      activeRanges: [
        { startPct: 0, widthPct: 55 },
        { startPct: 55, widthPct: 40 }, // Carved segment
      ],
      gapRanges: [],
    },
    gapCount: 0,
    segmentsCount: 2,
    resolution: '1920x1080 @ 25fps',
  },
  {
    channel: 2,
    location: 'Aisle 4',
    recorder: 'MOCKDVR1 (REC-01)',
    status: 'drift',
    statusText: 'Desynchronized · Drift Compensated',
    clockOffset: '+4.0s (±1.0s Bayesian Error)',
    videoSrc: '/sample/cam2_aisle4_deleted.mp4',
    coverage: {
      activeRanges: [{ startPct: 5, widthPct: 85 }],
      gapRanges: [],
    },
    gapCount: 0,
    segmentsCount: 1,
    resolution: '1920x1080 @ 25fps',
  },
  {
    channel: 3,
    location: 'Cash Counter',
    recorder: 'MOCKDVR1 (REC-01)',
    status: 'gap',
    statusText: 'Signal Carrier Loss · Disconnected',
    clockOffset: '0.0s · Hardware Disconnect Gap',
    videoSrc: '/sample/cam3_counter.mp4',
    coverage: {
      activeRanges: [
        { startPct: 0, widthPct: 15 },
        { startPct: 85, widthPct: 15 },
      ],
      gapRanges: [{ startPct: 15, widthPct: 70 }],
    },
    gapCount: 1,
    segmentsCount: 2,
    resolution: '1920x1080 @ 25fps',
  },
];

export const CamerasPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { currentCaseId, openInspector } = useAppStore();
  const activeId = caseId || currentCaseId;

  const [filter, setFilter] = useState<'all' | 'ok' | 'drift' | 'gap'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredCameras = CAMERAS_DATA.filter((c) => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono tracking-widest text-scan">Surveillance Topology</span>
            <Badge variant="scan" className="text-[10px]">Case Feeds</Badge>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Video className="w-7 h-7 text-scan" />
            <span>Camera Feeds & Coverage</span>
          </h1>
          <p className="text-xs text-ink-soft mt-1">
            3 Synchronized Video Feeds · 1 Forensic Master Recorder · 1 Hardware Signal Loss Gap
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/cases/${activeId}/timeline`)}
            className="text-xs border-edge"
          >
            <Clock className="w-3.5 h-3.5 mr-1.5 text-scan" />
            Switch to Timeline
          </Button>

          {/* View mode toggle */}
          <div className="flex items-center p-0.5 rounded-control bg-raised border border-edge">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-control transition-colors ${
                viewMode === 'grid' ? 'bg-scan/20 text-scan' : 'text-ink-soft hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-control transition-colors ${
                viewMode === 'list' ? 'bg-scan/20 text-scan' : 'text-ink-soft hover:text-white'
              }`}
              title="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-card bg-console border border-edge">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-ink-soft" />
          <span className="text-xs font-mono text-ink-soft uppercase">Filter Feeds:</span>
        </div>

        <div className="flex items-center gap-1.5">
          {[
            { id: 'all', label: `All Feeds (${CAMERAS_DATA.length})` },
            { id: 'ok', label: 'Carrier Locked (1)' },
            { id: 'drift', label: 'Drift Compensated (1)' },
            { id: 'gap', label: 'Signal Loss Gaps (1)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`px-3 py-1 rounded-control text-xs font-mono transition-all ${
                filter === tab.id
                  ? 'bg-scan/20 text-scan border border-scan/50'
                  : 'bg-raised/40 text-ink-soft hover:text-ink border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cameras Grid / List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCameras.map((cam) => (
            <SpotlightCard
              key={cam.channel}
              className="p-5 flex flex-col justify-between border border-edge hover:border-scan/50 transition-all bg-console group"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <CameraBadge channel={cam.channel} locationName={cam.location} />
                  <StateBadge
                    state={cam.status === 'ok' ? 'verified' : cam.status === 'drift' ? 'estimated' : 'gap'}
                  />
                </div>

                {/* Video Monitor Box */}
                <div className="relative rounded-control overflow-hidden bg-void border border-edge aspect-video mb-3.5 flex items-center justify-center">
                  <video
                    src={cam.videoSrc}
                    muted
                    loop
                    playsInline
                    autoPlay
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />

                  {/* Rec badge on top right */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-void/80 border border-edge text-[9px] font-mono text-white backdrop-blur-sm">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        cam.status === 'gap' ? 'bg-rose-500 animate-ping' : 'bg-verified animate-pulse'
                      }`}
                    />
                    <span>{cam.status === 'gap' ? 'SIGNAL DROP' : 'REC'}</span>
                  </div>

                  {/* Timestamp overlay */}
                  <div className="absolute bottom-2 left-2 text-[10px] font-mono text-scan/90 bg-void/80 px-1.5 py-0.5 rounded border border-edge/60 backdrop-blur-sm">
                    CH{cam.channel} · 2026-10-17 21:42:17 UTC
                  </div>
                </div>

                {/* Status and Parameters */}
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-ink-soft">
                    <span className="text-[10px] text-ink-faint">CLOCK DRIFT:</span>
                    <span
                      className={`font-semibold ${
                        cam.status === 'drift' ? 'text-estimated font-bold' : 'text-white'
                      }`}
                    >
                      {cam.clockOffset}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-ink-soft">
                    <span className="text-[10px] text-ink-faint">CARRIER STATUS:</span>
                    <span className={cam.status === 'gap' ? 'text-gap' : 'text-verified'}>
                      {cam.statusText}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-ink-soft">
                    <span className="text-[10px] text-ink-faint">RECORDER:</span>
                    <span className="text-white flex items-center gap-1">
                      <HardDrive className="w-3 h-3 text-scan" />
                      <span>{cam.recorder}</span>
                    </span>
                  </div>
                </div>

                {/* Coverage Mini Strip */}
                <div className="mt-4 pt-3 border-t border-edge/60 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-ink-faint">
                    <span>COVERAGE (21:40 &rarr; 21:58 UTC)</span>
                    <span>{cam.segmentsCount} CLIPS</span>
                  </div>
                  <div className="w-full h-3 rounded-sm bg-void border border-edge relative overflow-hidden flex">
                    {cam.coverage.activeRanges.map((rng, i) => (
                      <div
                        key={i}
                        className="h-full bg-scan/40 border-r border-scan/60"
                        style={{
                          marginLeft: `${rng.startPct}%`,
                          width: `${rng.widthPct}%`,
                        }}
                        title="Recorded Footage Block"
                      />
                    ))}
                    {cam.coverage.gapRanges.map((g, i) => (
                      <div
                        key={i}
                        className="h-full bg-gap/60 border border-gap animate-pulse"
                        style={{
                          marginLeft: `${g.startPct}%`,
                          width: `${g.widthPct}%`,
                        }}
                        title="Hardware Video Loss Gap (908s)"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-edge/60 flex items-center justify-between">
                <button
                  onClick={() =>
                    openInspector({
                      id: `CAM-CH${cam.channel}`,
                      kind: 'camera',
                      title: `Camera ${cam.channel}: ${cam.location}`,
                      channel: cam.channel,
                      location: cam.location,
                      state: cam.status === 'ok' ? 'verified' : cam.status === 'drift' ? 'estimated' : 'gap',
                      timeOriginal: '21:40:00 UTC',
                      timeCorrected: '21:40:00 UTC',
                      metadata: {
                        resolution: cam.resolution,
                        statusText: cam.statusText,
                        clockOffset: cam.clockOffset,
                        recorder: cam.recorder,
                      },
                    })
                  }
                  className="text-xs text-ink-soft hover:text-white flex items-center gap-1 font-mono transition-colors"
                >
                  <Info className="w-3.5 h-3.5 text-scan" />
                  <span>Inspect</span>
                </button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/cases/${activeId}/timeline`)}
                  className="text-xs shadow-glow-cyan"
                >
                  <span>Open in Timeline</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </SpotlightCard>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredCameras.map((cam) => (
            <div
              key={cam.channel}
              className="p-4 rounded-card bg-console border border-edge hover:border-scan/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-28 h-16 rounded-control bg-void border border-edge overflow-hidden shrink-0">
                  <video src={cam.videoSrc} muted loop autoPlay className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CameraBadge channel={cam.channel} locationName={cam.location} />
                    <StateBadge
                      state={cam.status === 'ok' ? 'verified' : cam.status === 'drift' ? 'estimated' : 'gap'}
                    />
                  </div>
                  <div className="text-xs text-ink-soft mt-1 font-mono">
                    <span>{cam.statusText}</span> · <span className="text-scan">{cam.clockOffset}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    openInspector({
                      id: `CAM-CH${cam.channel}`,
                      kind: 'camera',
                      title: `Camera ${cam.channel}: ${cam.location}`,
                      channel: cam.channel,
                      location: cam.location,
                      state: cam.status === 'ok' ? 'verified' : cam.status === 'drift' ? 'estimated' : 'gap',
                      timeOriginal: '21:40:00 UTC',
                      timeCorrected: '21:40:00 UTC',
                      metadata: {
                        resolution: cam.resolution,
                        statusText: cam.statusText,
                        clockOffset: cam.clockOffset,
                        recorder: cam.recorder,
                      },
                    })
                  }
                  className="text-xs"
                >
                  Inspect
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/cases/${activeId}/timeline`)}
                  className="text-xs shadow-glow-cyan"
                >
                  <span>Open in Timeline</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
