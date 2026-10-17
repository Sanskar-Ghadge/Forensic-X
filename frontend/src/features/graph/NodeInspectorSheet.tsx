import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { HashChip } from '@/components/forensic/HashChip';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  X,
  GitBranch,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { CustomNodeData } from './types';

interface NodeInspectorSheetProps {
  nodeId: string | null;
  nodeData: CustomNodeData | null;
  onClose: () => void;
  onTrace: () => void;
}

export const NodeInspectorSheet: React.FC<NodeInspectorSheetProps> = ({
  nodeId,
  nodeData,
  onClose,
  onTrace,
}) => {
  const navigate = useNavigate();
  const { caseId } = useParams<{ caseId: string }>();
  const activeCase = caseId || 'CASE-2026-APEX-01';
  const { setTimeCursor } = useAppStore();

  if (!nodeId || !nodeData) return null;

  const handleOpenTimeline = () => {
    // Jump to timeline at target time
    if ('timeStart' in nodeData && typeof nodeData.timeStart === 'string') {
      if (nodeData.timeStart.includes('21:45')) {
        setTimeCursor(300); // 5 mins in
      } else if (nodeData.timeStart.includes('21:55')) {
        setTimeCursor(910);
      } else {
        setTimeCursor(0);
      }
    }
    navigate(`/cases/${activeCase}/timeline`);
  };

  return (
    <div className="absolute top-16 right-4 bottom-4 z-20 w-80 md:w-96 bg-panel-dark/95 border border-grid-line/80 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fade-in text-white font-sans backdrop-blur-md">
      {/* Header */}
      <div className="p-4 border-b border-grid-line/60 flex items-center justify-between bg-panel-light/20">
        <div className="flex items-center gap-2">
          <Badge variant="scan" className="text-[10px] uppercase font-mono">
            {nodeData.kind}
          </Badge>
          <span className="font-mono text-xs text-ink-muted truncate max-w-[170px]">
            {nodeId}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded text-ink-muted hover:text-white hover:bg-panel-light/30 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto text-xs">
        <div>
          <h3 className="font-display font-bold text-base text-white">
            {nodeData.label}
          </h3>
          <p className="text-ink-muted text-xs mt-0.5">
            Node Entity in Evidence Lineage Graph
          </p>
        </div>

        {/* Specific Metadata Fields based on Node Kind */}
        <div className="space-y-2 p-3 rounded-lg bg-panel-light/20 border border-grid-line/50 font-mono text-[11px]">
          {nodeData.kind === 'incident' && (
            <>
              <div className="flex justify-between">
                <span className="text-ink-muted">Case ID:</span>
                <span className="text-white font-semibold">{(nodeData as any).caseId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Window:</span>
                <span className="text-white">{(nodeData as any).timeRange}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Jurisdiction:</span>
                <span className="text-white">{(nodeData as any).jurisdiction}</span>
              </div>
            </>
          )}

          {nodeData.kind === 'recorder' && (
            <>
              <div className="flex justify-between">
                <span className="text-ink-muted">Brand/Profile:</span>
                <span className="text-white">{(nodeData as any).brand}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Disk Sectors:</span>
                <span className="text-white">{(nodeData as any).sectors?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Size:</span>
                <span className="text-white">153.6 MB (Raw Disk)</span>
              </div>
            </>
          )}

          {nodeData.kind === 'camera' && (
            <>
              <div className="flex justify-between">
                <span className="text-ink-muted">Channel:</span>
                <span className="text-white">Channel {(nodeData as any).channel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Clock Drift:</span>
                <span className="text-white">+{(nodeData as any).offsetSec}s (Ahead)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Status:</span>
                <span className="text-status-active uppercase">{(nodeData as any).status}</span>
              </div>
            </>
          )}

          {nodeData.kind === 'segment' && (
            <>
              <div className="flex justify-between">
                <span className="text-ink-muted">Camera:</span>
                <span className="text-white">{(nodeData as any).cameraName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Start Time:</span>
                <span className="text-white">{(nodeData as any).timeStart}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Duration:</span>
                <span className="text-white">{(nodeData as any).duration}</span>
              </div>
              {(nodeData as any).sector && (
                <div className="flex justify-between text-violet-300">
                  <span>Carve Sector:</span>
                  <span>Sector {(nodeData as any).sector}</span>
                </div>
              )}
            </>
          )}

          {nodeData.kind === 'gap' && (
            <>
              <div className="flex justify-between">
                <span className="text-ink-muted">Cause Verdict:</span>
                <span className="text-rose-400 font-bold">{(nodeData as any).verdict}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Confidence:</span>
                <span className="text-white">{((nodeData as any).confidence * 100).toFixed(0)}% (estimate)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Duration:</span>
                <span className="text-white">908s (15m 08s)</span>
              </div>
            </>
          )}

          {nodeData.kind === 'lead' && (
            <>
              <div className="flex justify-between">
                <span className="text-ink-muted">Match Score:</span>
                <span className="text-cyan-300 font-bold">{((nodeData as any).similarity * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Model:</span>
                <span className="text-white">{(nodeData as any).model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Detected At:</span>
                <span className="text-white">{(nodeData as any).timestamp}</span>
              </div>
            </>
          )}

          {nodeData.kind === 'hash' && (
            <>
              <div className="flex justify-between">
                <span className="text-ink-muted">Algorithm:</span>
                <span className="text-white font-bold">SHA-256</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Status:</span>
                <span className="text-status-active font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified Match</span>
                </span>
              </div>
            </>
          )}
        </div>

        {/* Cryptographic Hash section if applicable */}
        {'hash' in nodeData && typeof (nodeData as any).hash === 'string' && (
          <div className="space-y-1.5">
            <span className="text-ink-muted font-mono text-[11px] block">
              Cryptographic Provenance:
            </span>
            <HashChip hash={(nodeData as any).hash} />
          </div>
        )}
        {'imageHash' in nodeData && typeof (nodeData as any).imageHash === 'string' && (
          <div className="space-y-1.5">
            <span className="text-ink-muted font-mono text-[11px] block">
              Root Storage Hash:
            </span>
            <HashChip hash={(nodeData as any).imageHash} />
          </div>
        )}

        <div className="p-3 rounded-lg bg-panel-dark/80 border border-scan/20 text-[11px] text-ink-soft space-y-1">
          <div className="flex items-center gap-1.5 text-white font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-scan" />
            <span>Traceability Guarantee</span>
          </div>
          <p className="leading-relaxed">
            All nodes in this graph maintain cryptographic continuity back to the physical disk image sector coordinates.
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-grid-line/60 bg-panel-light/20 flex items-center justify-between gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onTrace}
          className="text-xs gap-1.5 font-mono flex-1 border-grid-line"
        >
          <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
          <span>Trace Source</span>
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenTimeline}
          className="text-xs gap-1.5 font-mono flex-1"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Timeline</span>
        </Button>
      </div>
    </div>
  );
};
