import React, { useState } from 'react';
import {
  Shield,
  HardDrive,
  Video,
  FileVideo,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { HashChip } from '@/components/forensic/HashChip';

interface ProvenanceTreeViewProps {
  onSelectNode: (nodeId: string) => void;
  searchQuery: string;
}

export const ProvenanceTreeView: React.FC<ProvenanceTreeViewProps> = ({
  onSelectNode,
  searchQuery,
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    incident: true,
    storage: true,
    cam1: true,
    cam2: true,
    cam3: true,
  });

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-6 rounded-xl bg-panel-dark border border-grid-line/80 shadow-xl space-y-4 max-w-4xl mx-auto font-mono text-xs text-white">
      <div className="flex items-center justify-between pb-3 border-b border-grid-line/50">
        <div>
          <h3 className="font-display font-bold text-base text-white">
            Hierarchical Evidence Provenance Tree
          </h3>
          <p className="text-xs text-ink-muted font-sans mt-0.5">
            Linear audit tree tracking evidence links from Root Case down to cryptographic block digests.
          </p>
        </div>
        <Badge variant="verified">Audit Lineage</Badge>
      </div>

      {/* Root Node: Incident */}
      <div className="space-y-3">
        <div
          className="flex items-center gap-2 p-2.5 rounded-lg bg-panel-light/30 border border-scan/50 cursor-pointer hover:border-scan"
          onClick={() => {
            toggle('incident');
            onSelectNode('node-incident');
          }}
        >
          {expanded.incident ? <ChevronDown className="w-4 h-4 text-scan" /> : <ChevronRight className="w-4 h-4 text-scan" />}
          <Shield className="w-4 h-4 text-scan" />
          <span className="font-bold text-white">Incident: Retail Store Incident</span>
          <span className="text-ink-muted text-[11px]">(21:40:00 &rarr; 22:00:00 UTC)</span>
        </div>

        {/* Level 1: Storage */}
        {expanded.incident && (
          <div className="pl-6 border-l-2 border-grid-line/50 ml-4 space-y-3">
            <div
              className="flex items-center gap-2 p-2.5 rounded-lg bg-panel-light/20 border border-grid-line/60 cursor-pointer hover:border-cyan-400"
              onClick={() => {
                toggle('storage');
                onSelectNode('node-recorder');
              }}
            >
              {expanded.storage ? <ChevronDown className="w-4 h-4 text-cyan-400" /> : <ChevronRight className="w-4 h-4 text-cyan-400" />}
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white">Physical DVR Raw Image</span>
              <span className="text-ink-muted text-[11px]">(MOCK-DVR, 300,000 Sectors)</span>
            </div>

            {/* Level 2: Cameras */}
            {expanded.storage && (
              <div className="pl-6 border-l-2 border-grid-line/50 ml-4 space-y-3">
                {/* Camera 1 */}
                <div className="space-y-2">
                  <div
                    className="flex items-center gap-2 p-2 rounded bg-panel-light/10 border border-grid-line/40 cursor-pointer hover:border-scan"
                    onClick={() => {
                      toggle('cam1');
                      onSelectNode('node-cam-01');
                    }}
                  >
                    {expanded.cam1 ? <ChevronDown className="w-3.5 h-3.5 text-scan" /> : <ChevronRight className="w-3.5 h-3.5 text-scan" />}
                    <Video className="w-3.5 h-3.5 text-scan" />
                    <span className="font-semibold text-white">CAM 01: Entrance</span>
                    <Badge variant="verified" className="text-[10px] py-0">Synchronized</Badge>
                  </div>

                  {expanded.cam1 && (
                    <div className="pl-6 border-l border-grid-line/40 ml-3 space-y-2 text-[11px]">
                      <div
                        className="p-2 rounded bg-panel-dark border border-grid-line/50 flex items-center justify-between cursor-pointer hover:border-scan"
                        onClick={() => onSelectNode('node-seg-001')}
                      >
                        <div className="flex items-center gap-1.5">
                          <FileVideo className="w-3.5 h-3.5 text-status-active" />
                          <span>Clip SEG-001 (Active Video, 300s)</span>
                        </div>
                        <HashChip hash="3b7a1e0f8c9d2a4e6b5c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a" />
                      </div>

                      <div
                        className="p-2 rounded bg-cyan-950/20 border border-cyan-500/40 flex items-center justify-between cursor-pointer hover:border-cyan-400"
                        onClick={() => onSelectNode('node-lead-001')}
                      >
                        <div className="flex items-center gap-1.5 text-cyan-300">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Observed Lead: Person in Red Jacket (0.92 Match)</span>
                        </div>
                        <span className="text-[10px] text-ink-muted">21:42:15 UTC</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Camera 2 */}
                <div className="space-y-2">
                  <div
                    className="flex items-center gap-2 p-2 rounded bg-panel-light/10 border border-grid-line/40 cursor-pointer hover:border-violet-400"
                    onClick={() => {
                      toggle('cam2');
                      onSelectNode('node-cam-02');
                    }}
                  >
                    {expanded.cam2 ? <ChevronDown className="w-3.5 h-3.5 text-violet-400" /> : <ChevronRight className="w-3.5 h-3.5 text-violet-400" />}
                    <Video className="w-3.5 h-3.5 text-violet-400" />
                    <span className="font-semibold text-white">CAM 02: Aisle 4 (Beverages)</span>
                    <Badge variant="recovered" className="text-[10px] py-0">+4s Clock Drift</Badge>
                  </div>

                  {expanded.cam2 && (
                    <div className="pl-6 border-l border-grid-line/40 ml-3 space-y-2 text-[11px]">
                      <div
                        className="p-2 rounded bg-violet-950/20 border border-violet-500/50 flex items-center justify-between cursor-pointer hover:border-violet-400"
                        onClick={() => onSelectNode('node-seg-002-del')}
                      >
                        <div className="flex items-center gap-1.5 text-violet-300">
                          <FileVideo className="w-3.5 h-3.5 text-violet-400" />
                          <span>Carved Clip SEG-002-DEL (Sector 254464, 180s)</span>
                        </div>
                        <HashChip hash="0b2b68603632cf4b64fcad18a6dfc9247d8ff60f04c6e9a7e6b0253457b3f25c" />
                      </div>

                      <div
                        className="p-2 rounded bg-cyan-950/20 border border-cyan-500/40 flex items-center justify-between cursor-pointer hover:border-cyan-400"
                        onClick={() => onSelectNode('node-lead-002')}
                      >
                        <div className="flex items-center gap-1.5 text-cyan-300">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Observed Lead: Person with Red Backpack (0.88 Match)</span>
                        </div>
                        <span className="text-[10px] text-ink-muted">21:46:18 UTC</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Camera 3 */}
                <div className="space-y-2">
                  <div
                    className="flex items-center gap-2 p-2 rounded bg-panel-light/10 border border-grid-line/40 cursor-pointer hover:border-rose-400"
                    onClick={() => {
                      toggle('cam3');
                      onSelectNode('node-cam-03');
                    }}
                  >
                    {expanded.cam3 ? <ChevronDown className="w-3.5 h-3.5 text-rose-400" /> : <ChevronRight className="w-3.5 h-3.5 text-rose-400" />}
                    <Video className="w-3.5 h-3.5 text-rose-400" />
                    <span className="font-semibold text-white">CAM 03: Cash Counter</span>
                    <Badge variant="gap" className="text-[10px] py-0">Signal Loss Window</Badge>
                  </div>

                  {expanded.cam3 && (
                    <div className="pl-6 border-l border-grid-line/40 ml-3 space-y-2 text-[11px]">
                      <div
                        className="p-2 rounded bg-rose-950/20 border border-dashed border-rose-500/60 flex items-center justify-between cursor-pointer hover:border-rose-400"
                        onClick={() => onSelectNode('node-gap-ch3')}
                      >
                        <div className="flex items-center gap-1.5 text-rose-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Signal Loss Gap (908s) — Cause: Camera Disconnected (80%)</span>
                        </div>
                        <span className="text-[10px] text-ink-muted">21:40:02 &rarr; 21:55:10</span>
                      </div>

                      <div
                        className="p-2 rounded bg-panel-dark border border-grid-line/50 flex items-center justify-between cursor-pointer hover:border-scan"
                        onClick={() => onSelectNode('node-seg-003')}
                      >
                        <div className="flex items-center gap-1.5">
                          <FileVideo className="w-3.5 h-3.5 text-status-active" />
                          <span>Clip SEG-003 (Resumed Video, 290s)</span>
                        </div>
                        <HashChip hash="9f8e7d6c5b4a3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {searchQuery && (
        <div className="p-2 rounded bg-panel-light/10 text-ink-muted text-[11px]">
          Filtered tree view for query: <span className="text-scan font-bold">{searchQuery}</span>
        </div>
      )}
    </div>
  );
};
