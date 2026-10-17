import React, { useState } from 'react';
import { SearchLead, TrajectoryHop } from './types';
import { CameraBadge } from '@/components/forensic/CameraBadge';
import { StateBadge } from '@/components/forensic/StateBadge';
import { Button } from '@/components/ui/Button';
import {
  Clock,
  AlertTriangle,
  Play,
  Eye,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface PathViewProps {
  leads: SearchLead[];
  hops: TrajectoryHop[];
  onSelectLead: (lead: SearchLead) => void;
  onPlayLead: (lead: SearchLead) => void;
}

export const PathView: React.FC<PathViewProps> = ({
  leads,
  hops,
  onSelectLead,
  onPlayLead,
}) => {
  const [simulateAnomaly, setSimulateAnomaly] = useState(false);

  // Chronologically sorted leads
  const sortedLeads = [...leads].sort((a, b) => a.corrected_sec - b.corrected_sec);

  // If anomaly simulated, inject an artificial rapid jump between node 1 and 2 (e.g. 8 seconds)
  const displayHops = hops.map((h, idx) => {
    if (simulateAnomaly && idx === 0) {
      return {
        ...h,
        elapsed_seconds: 8,
        is_plausible: false,
        warning_reason:
          'Transit time (8s) is faster than minimum physical walking time (30s) between Entrance and Aisle 4; verify this match.',
      };
    }
    return h;
  });

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `+${m}m ${s.toString().padStart(2, '0')}s`;
  };

  if (sortedLeads.length === 0) {
    return (
      <div className="p-12 text-center text-ink-muted bg-panel-dark/40 rounded-lg border border-dashed border-grid-line">
        No leads available to construct trajectory. Adjust similarity threshold to populate path.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Demo Toggle & Plausibility Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-panel-dark/90 border border-grid-line/60">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold text-white text-sm">
              Cross-Camera Trajectory & Physical Plausibility Map
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-scan/20 text-scan border border-scan/40">
              {sortedLeads.length} Waypoints
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            Path is evaluated against architectural walking distances. Implausible transit speeds are automatically flagged.
          </p>
        </div>

        {/* Demo Toggle to Trigger Implausible Hop Alert */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setSimulateAnomaly(!simulateAnomaly)}
          className={`text-xs gap-1.5 transition-colors ${
            simulateAnomaly
              ? 'border-amber-500/80 bg-amber-500/20 text-amber-300'
              : 'border-grid-line text-ink-soft hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{simulateAnomaly ? 'Reset Real Plausibility' : 'Simulate Rapid Hop Anomaly'}</span>
        </Button>
      </div>

      {/* Main Trajectory Canvas */}
      <div className="relative p-6 rounded-xl bg-panel-dark/60 border border-grid-line/60 overflow-x-auto">
        {/* Horizontal Node Stepper */}
        <div className="min-w-[720px] flex items-center justify-between relative py-6">
          {sortedLeads.map((lead, idx) => {
            const hopBefore = idx > 0 ? displayHops[idx - 1] : null;

            return (
              <React.Fragment key={lead.id}>
                {/* Connecting Hop Connector */}
                {hopBefore && (
                  <div className="flex-1 flex flex-col items-center px-4 relative">
                    {/* Transit time label above line */}
                    <div
                      className={`text-[11px] font-mono mb-1.5 px-2 py-0.5 rounded border ${
                        hopBefore.is_plausible
                          ? 'bg-panel-dark text-cyan-400 border-cyan-500/30'
                          : 'bg-amber-950/80 text-amber-300 border-amber-500/60 animate-pulse font-bold'
                      }`}
                    >
                      {formatElapsed(hopBefore.elapsed_seconds)}
                    </div>

                    {/* Path Line */}
                    <div className="w-full relative flex items-center">
                      <div
                        className={`w-full h-1 rounded ${
                          hopBefore.is_plausible
                            ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 shadow-sm shadow-cyan-500/30'
                            : 'border-b-2 border-dashed border-amber-400 animate-pulse h-0.5'
                        }`}
                      />
                      <div
                        className={`absolute right-0 w-2 h-2 rounded-full transform translate-x-1/2 ${
                          hopBefore.is_plausible ? 'bg-cyan-400' : 'bg-amber-400'
                        }`}
                      />
                    </div>

                    {/* Plausibility Warning Label below line */}
                    {!hopBefore.is_plausible && (
                      <div className="mt-2 text-[10px] text-amber-400 font-mono flex items-center gap-1 text-center max-w-[190px]">
                        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                        <span>Faster than walking time (min {hopBefore.min_expected_walking_sec}s)</span>
                      </div>
                    )}
                    {hopBefore.is_plausible && (
                      <div className="mt-1 text-[10px] text-ink-muted font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-status-active" />
                        <span>Physically plausible</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Waypoint Camera Card */}
                <div
                  className="flex flex-col items-center group cursor-pointer"
                  onClick={() => onSelectLead(lead)}
                >
                  {/* Waypoint Number Badge */}
                  <div className="relative mb-2">
                    <div className="w-8 h-8 rounded-full bg-panel-dark border-2 border-scan text-white font-mono text-xs font-bold flex items-center justify-center shadow-md group-hover:scale-110 group-hover:border-cyan-400 transition-transform">
                      {idx + 1}
                    </div>
                  </div>

                  {/* Waypoint Mini Card */}
                  <div className="w-56 p-3 rounded-lg bg-panel-dark border border-grid-line/60 hover:border-scan/80 group-hover:shadow-md group-hover:shadow-scan/10 transition-all space-y-2">
                    <div className="relative aspect-video rounded overflow-hidden bg-black border border-grid-line/40">
                      <video
                        src={lead.thumbnail_url}
                        className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all"
                        muted
                      />
                      <div className="absolute top-1 left-1">
                        <StateBadge state="lead" />
                      </div>
                      <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 rounded text-[10px] font-mono text-scan font-bold">
                        {(lead.similarity * 100).toFixed(0)}% Match
                      </div>
                    </div>

                    <div className="space-y-1">
                      <CameraBadge
                        channel={lead.channel}
                        locationName={lead.camera_name}
                        className="w-full justify-start text-[11px]"
                      />
                      <div className="flex items-center justify-between text-[11px] font-mono text-ink-muted">
                        <span className="flex items-center gap-1 text-white">
                          <Clock className="w-3 h-3 text-scan" />
                          <span>{lead.corrected_timestamp_iso.slice(11, 19)}</span>
                        </span>
                        <span>±{lead.uncertainty_seconds}s</span>
                      </div>
                    </div>

                    {/* Quick Card Actions */}
                    <div className="pt-2 border-t border-grid-line/30 flex items-center justify-between">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayLead(lead);
                        }}
                        className="h-6 px-2 text-[10px] gap-1"
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>Play Here</span>
                      </Button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLead(lead);
                        }}
                        className="text-[11px] text-ink-muted hover:text-white flex items-center gap-1 font-mono"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Detail</span>
                      </button>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Trajectory Plausibility Summary Alert */}
      {displayHops.some((h) => !h.is_plausible) && (
        <div className="p-4 rounded-lg bg-amber-950/40 border border-amber-500/60 text-amber-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-white">
              Physical Speed Anomaly Detected in Trajectory
            </div>
            <p className="text-amber-300/90 leading-relaxed">
              One or more transit intervals are shorter than architectural walking thresholds between camera points. This indicates either a false-positive visual match on different individuals wearing similar clothing, or clock calibration drift. Verify candidate leads before submitting to evidence chain.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
