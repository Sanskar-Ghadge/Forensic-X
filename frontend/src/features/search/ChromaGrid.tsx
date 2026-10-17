import React from 'react';
import { SearchLead } from './types';
import { CameraBadge } from '@/components/forensic/CameraBadge';
import { StateBadge } from '@/components/forensic/StateBadge';
import { ConfidenceBar } from '@/components/forensic/ConfidenceBar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Clock, Eye } from 'lucide-react';

interface ChromaGridProps {
  leads: SearchLead[];
  onSelectLead: (lead: SearchLead) => void;
}

export const ChromaGrid: React.FC<ChromaGridProps> = ({ leads, onSelectLead }) => {
  if (leads.length === 0) {
    return (
      <div className="p-12 text-center text-ink-muted bg-panel-dark/40 rounded-lg border border-dashed border-grid-line">
        No leads match the current similarity cutoff or camera filters. Try lowering the threshold.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {leads.map((lead) => (
        <Card
          key={lead.id}
          surface="console"
          className="group relative overflow-hidden border border-grid-line/60 hover:border-scan/70 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-scan/10 flex flex-col"
          onClick={() => onSelectLead(lead)}
        >
          {/* Card Media Preview with Grayscale-to-Color Transition */}
          <div className="relative aspect-video bg-black overflow-hidden">
            <video
              src={lead.thumbnail_url}
              className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-105"
              muted
              playsInline
              loop
              onMouseOver={(e) => (e.currentTarget as HTMLVideoElement).play().catch(() => {})}
              onMouseOut={(e) => {
                const v = e.currentTarget as HTMLVideoElement;
                v.pause();
                v.currentTime = 0;
              }}
            />

            {/* Bounding Box Lead Overlay */}
            <div
              className="absolute border-2 border-scan/90 bg-scan/15 rounded pointer-events-none group-hover:border-cyan-400 group-hover:bg-scan/25 transition-all"
              style={{
                left: `${(lead.bbox[0] / 1280) * 100}%`,
                top: `${(lead.bbox[1] / 720) * 100}%`,
                width: `${(lead.bbox[2] / 1280) * 100}%`,
                height: `${(lead.bbox[3] / 720) * 100}%`,
              }}
            >
              <div className="absolute -top-5 left-0 px-1 py-0.2 bg-scan text-[9px] font-mono text-white rounded font-bold uppercase shadow">
                Lead
              </div>
            </div>

            {/* Top Badges Overlay */}
            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
              <CameraBadge
                channel={lead.channel}
                locationName={lead.camera_name}
                className="shadow-md bg-panel-dark/90 backdrop-blur"
              />
              <StateBadge state="lead" className="shadow-md" />
            </div>

            {/* Glare Hover Gradient Sweep */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>

          {/* Card Metadata Footer */}
          <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-mono text-ink-muted flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-scan" />
                  <span>Corrected:</span>
                  <span className="text-white font-semibold">
                    {lead.corrected_timestamp_iso.slice(11, 19)}
                  </span>
                  <span className="text-[11px] text-ink-muted">
                    ±{lead.uncertainty_seconds}s
                  </span>
                </span>
                <Badge variant="neutral" className="text-[10px] py-0 px-1.5 font-mono">
                  Pass {lead.pass_tier}
                </Badge>
              </div>

              <div className="text-xs font-mono text-ink-muted truncate">
                Raw: {lead.raw_timestamp_iso.slice(11, 19)} (DVR Clock)
              </div>
            </div>

            {/* Similarity Lead Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-soft font-mono font-medium">Appearance Match:</span>
                <span className="font-mono font-bold text-scan">
                  Lead {(lead.similarity * 100).toFixed(0)}%
                </span>
              </div>
              <ConfidenceBar
                confidence={lead.similarity}
              />
            </div>

            {/* Inspect Action */}
            <div className="pt-2 border-t border-grid-line/40 flex items-center justify-between text-xs text-ink-muted group-hover:text-white transition-colors">
              <span className="text-[11px] font-mono truncate max-w-[180px]">
                {lead.label}
              </span>
              <span className="flex items-center gap-1 text-scan font-medium text-[11px]">
                <Eye className="w-3 h-3" />
                <span>Examine</span>
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
