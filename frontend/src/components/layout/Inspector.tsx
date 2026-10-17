import React from 'react';
import { useAppStore } from '@/lib/store';
import { HashChip } from '@/components/forensic/HashChip';
import { TimeCode } from '@/components/forensic/TimeCode';
import { StateBadge } from '@/components/forensic/StateBadge';
import { ConfidenceBar } from '@/components/forensic/ConfidenceBar';
import { Button } from '@/components/ui/Button';
import {
  X,
  Fingerprint,
  Play,
  FileCheck2,
  Clock,
  Video,
} from 'lucide-react';

export const Inspector: React.FC = () => {
  const { inspectorItem, isInspectorOpen, closeInspector } = useAppStore();

  if (!isInspectorOpen || !inspectorItem) {
    return null;
  }

  return (
    <aside className="w-[360px] h-screen bg-console border-l border-edge flex flex-col z-30 select-none surface-depth shrink-0 overflow-y-auto animate-in slide-in-from-right-4 duration-fast">
      {/* Header */}
      <div className="p-4 border-b border-edge/60 flex items-center justify-between bg-console/90 sticky top-0 z-10 backdrop-blur">
        <div className="flex items-center gap-2 overflow-hidden">
          <Fingerprint className="w-4 h-4 text-scan shrink-0" />
          <h2 className="font-semibold text-sm text-ink truncate font-sans">
            {inspectorItem.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={closeInspector}
          className="p-1 rounded hover:bg-raised text-ink-soft hover:text-ink transition-colors"
          title="Close inspector (I)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 flex-1 text-xs">
        {/* Status & Category */}
        <div className="flex items-center justify-between pb-3 border-b border-edge/40">
          <span className="text-ink-soft font-mono uppercase text-[11px]">Evidence State</span>
          {inspectorItem.state && <StateBadge state={inspectorItem.state} />}
        </div>

        {/* Temporal Calibration */}
        {(inspectorItem.timeCorrected || inspectorItem.timeOriginal) && (
          <div className="space-y-2 bg-raised/50 p-3 rounded-control border border-edge/60">
            <div className="flex items-center gap-1.5 font-semibold text-ink text-[11px] uppercase tracking-wider font-mono">
              <Clock className="w-3.5 h-3.5 text-scan" />
              <span>Temporal Calibration</span>
            </div>

            {inspectorItem.timeCorrected && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-ink-soft">Corrected:</span>
                <TimeCode time={inspectorItem.timeCorrected} isEstimated uncertaintyS={1} />
              </div>
            )}

            {inspectorItem.timeOriginal && (
              <div className="flex items-center justify-between">
                <span className="text-ink-soft">Raw (Recorded):</span>
                <span className="font-mono text-ink-faint tabular-nums">
                  {inspectorItem.timeOriginal}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Provenance & Cryptographic Anchor */}
        <div className="space-y-3">
          <div className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider font-mono">
            Cryptographic Provenance
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-ink-soft">Source SHA-256:</span>
            </div>
            {inspectorItem.hash ? (
              <HashChip hash={inspectorItem.hash} className="w-full justify-between" />
            ) : (
              <span className="text-ink-faint font-mono">Pending verification</span>
            )}

            {inspectorItem.frameRef && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-ink-soft">Frame Anchor:</span>
                <span className="font-mono text-scan font-semibold">{inspectorItem.frameRef}</span>
              </div>
            )}

            {inspectorItem.method && (
              <div className="flex items-center justify-between">
                <span className="text-ink-soft">Extraction Method:</span>
                <span className="capitalize font-mono text-ink">{inspectorItem.method}</span>
              </div>
            )}
          </div>
        </div>

        {/* Camera Details */}
        {(inspectorItem.channel || inspectorItem.location) && (
          <div className="space-y-2 pt-2 border-t border-edge/40">
            <div className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-scan" />
              <span>Camera Channel</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-soft">Channel:</span>
              <span className="font-mono font-semibold text-scan">CH {inspectorItem.channel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-soft">Location:</span>
              <span className="text-ink font-medium">{inspectorItem.location}</span>
            </div>
          </div>
        )}

        {/* Gap Confidence & Reasoning */}
        {inspectorItem.confidence !== undefined && (
          <div className="space-y-2 pt-2 border-t border-edge/40">
            <span className="text-ink-soft font-mono uppercase text-[11px]">Verdict Confidence</span>
            <ConfidenceBar confidence={inspectorItem.confidence} />
          </div>
        )}

        {/* Evidence For / Against */}
        {inspectorItem.evidenceFor && inspectorItem.evidenceFor.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-edge/40">
            <span className="text-verified font-mono uppercase text-[11px] font-semibold">Supporting Clues</span>
            <ul className="space-y-1 pl-4 list-disc text-ink-soft">
              {inspectorItem.evidenceFor.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {inspectorItem.evidenceAgainst && inspectorItem.evidenceAgainst.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-gap font-mono uppercase text-[11px] font-semibold">Contradicting Clues</span>
            <ul className="space-y-1 pl-4 list-disc text-ink-soft">
              {inspectorItem.evidenceAgainst.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t border-edge/60 space-y-2">
          <Button variant="primary" size="sm" className="w-full gap-2">
            <Play className="w-3.5 h-3.5" />
            <span>Play from this Moment</span>
          </Button>

          <Button variant="secondary" size="sm" className="w-full gap-2">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Add to Investigation Audit</span>
          </Button>
        </div>
      </div>
    </aside>
  );
};
