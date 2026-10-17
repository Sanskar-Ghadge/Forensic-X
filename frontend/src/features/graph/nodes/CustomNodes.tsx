import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
  Shield,
  HardDrive,
  Video,
  FileVideo,
  AlertTriangle,
  Sparkles,
  KeyRound,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import {
  IncidentNodeData,
  RecorderNodeData,
  CameraNodeData,
  SegmentNodeData,
  GapNodeData,
  LeadNodeData,
  HashNodeData,
} from '../types';

export const IncidentNode: React.FC<NodeProps> = ({ data, selected }) => {
  const d = data as IncidentNodeData;
  const isDimmed = d.isDimmed;
  const isPulsing = d.isPulsing;

  return (
    <div
      className={`relative min-w-[220px] p-3.5 rounded-xl bg-panel-dark/95 border-2 transition-all duration-300 shadow-xl ${
        selected || isPulsing
          ? 'border-scan ring-4 ring-scan/30 scale-105'
          : 'border-scan/70'
      } ${isDimmed ? 'opacity-30 filter grayscale' : 'opacity-100'}`}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <div className="p-1.5 rounded-lg bg-scan/20 text-scan border border-scan/40">
          <Shield className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[10px] uppercase font-mono tracking-wider text-scan font-bold">
            Root Incident
          </div>
          <div className="text-xs font-semibold text-white truncate max-w-[150px]">
            {d.label}
          </div>
        </div>
      </div>

      <div className="space-y-1 text-[11px] font-mono text-ink-muted border-t border-grid-line/50 pt-2">
        <div className="text-white truncate">Case: {d.caseId}</div>
        <div>Window: {d.timeRange}</div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5 h-2.5 bg-scan border border-white"
      />
    </div>
  );
};

export const RecorderNode: React.FC<NodeProps> = ({ data, selected }) => {
  const d = data as RecorderNodeData;
  const isDimmed = d.isDimmed;
  const isPulsing = d.isPulsing;

  return (
    <div
      className={`relative min-w-[230px] p-3.5 rounded-xl bg-panel-dark/95 border transition-all duration-300 shadow-lg ${
        selected || isPulsing
          ? 'border-cyan-400 ring-4 ring-cyan-500/30 scale-105'
          : 'border-grid-line/80'
      } ${isDimmed ? 'opacity-30 filter grayscale' : 'opacity-100'}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5 h-2.5 bg-scan border border-white"
      />

      <div className="flex items-center gap-2.5 mb-2">
        <div className="p-1.5 rounded-lg bg-panel-light/30 text-white border border-grid-line/60">
          <HardDrive className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <div className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-bold">
            Physical Storage
          </div>
          <div className="text-xs font-semibold text-white truncate max-w-[150px]">
            {d.label}
          </div>
        </div>
      </div>

      <div className="space-y-1 text-[11px] font-mono text-ink-muted border-t border-grid-line/50 pt-2">
        <div className="text-white">Adapter: {d.brand}</div>
        <div className="truncate">Hash: {d.imageHash.slice(0, 16)}...</div>
        <div>Sectors: {d.sectors.toLocaleString()} (RAW)</div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5 h-2.5 bg-cyan-400 border border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="w-2.5 h-2.5 bg-verified border border-white"
      />
    </div>
  );
};

export const CameraNode: React.FC<NodeProps> = ({ data, selected }) => {
  const d = data as CameraNodeData;
  const isDimmed = d.isDimmed;
  const isPulsing = d.isPulsing;

  const statusColor =
    d.status === 'ok'
      ? 'text-status-active bg-status-active/20 border-status-active/40'
      : d.status === 'recovered'
      ? 'text-violet-400 bg-violet-500/20 border-violet-500/40'
      : 'text-rose-400 bg-rose-500/20 border-rose-500/40';

  return (
    <div
      className={`relative min-w-[210px] p-3 rounded-xl bg-panel-dark/95 border transition-all duration-300 shadow-md ${
        selected || isPulsing
          ? 'border-scan ring-4 ring-scan/30 scale-105'
          : 'border-grid-line/80'
      } ${isDimmed ? 'opacity-30 filter grayscale' : 'opacity-100'}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5 h-2.5 bg-cyan-400 border border-white"
      />

      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-panel-light/30 text-white">
            <Video className="w-3.5 h-3.5 text-scan" />
          </div>
          <span className="text-xs font-bold text-white">CH {d.channel}</span>
        </div>
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase ${statusColor}`}>
          {d.status}
        </span>
      </div>

      <div className="text-xs font-semibold text-white truncate mb-1">
        {d.label.split(': ')[1] || d.label}
      </div>

      <div className="text-[11px] font-mono text-ink-muted">
        Clock Drift: {d.offsetSec > 0 ? `+${d.offsetSec}s` : '0.0s (NTP)'}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5 h-2.5 bg-scan border border-white"
      />
    </div>
  );
};

export const SegmentNode: React.FC<NodeProps> = ({ data, selected }) => {
  const d = data as SegmentNodeData;
  const isDimmed = d.isDimmed;
  const isPulsing = d.isPulsing;
  const isRecovered = d.status === 'recovered';

  return (
    <div
      className={`relative min-w-[220px] p-3 rounded-xl bg-panel-dark/95 border transition-all duration-300 shadow-md ${
        isRecovered
          ? 'border-violet-500/80 bg-violet-950/20'
          : 'border-status-active/70 bg-emerald-950/10'
      } ${selected || isPulsing ? 'ring-4 ring-scan/40 scale-105' : ''} ${
        isDimmed ? 'opacity-30 filter grayscale' : 'opacity-100'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5 h-2.5 bg-scan border border-white"
      />

      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <FileVideo
            className={`w-4 h-4 ${isRecovered ? 'text-violet-400' : 'text-status-active'}`}
          />
          <span className="text-xs font-bold text-white">{d.label}</span>
        </div>
      </div>

      <div className="space-y-0.5 text-[11px] font-mono text-ink-muted">
        <div className="text-white">Start: {d.timeStart} ({d.duration})</div>
        {d.method && <div className="text-violet-300">Method: {d.method}</div>}
        <div className="truncate text-[10px]">SHA: {d.hash.slice(0, 14)}...</div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5 h-2.5 bg-scan border border-white"
      />
    </div>
  );
};

export const GapNode: React.FC<NodeProps> = ({ data, selected }) => {
  const d = data as GapNodeData;
  const isDimmed = d.isDimmed;
  const isPulsing = d.isPulsing;

  return (
    <div
      className={`relative min-w-[220px] p-3 rounded-xl bg-panel-dark/95 border-2 border-dashed border-rose-500/80 transition-all duration-300 shadow-md ${
        selected || isPulsing ? 'ring-4 ring-rose-500/30 scale-105' : ''
      } ${isDimmed ? 'opacity-30 filter grayscale' : 'opacity-100'}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5 h-2.5 bg-rose-500 border border-white"
      />

      <div className="flex items-center gap-2 mb-1.5 text-rose-400">
        <AlertTriangle className="w-4 h-4" />
        <span className="text-xs font-bold text-white">{d.label}</span>
      </div>

      <div className="space-y-0.5 text-[11px] font-mono text-ink-muted">
        <div className="text-rose-300">Cause: {d.verdict.replace('_', ' ')}</div>
        <div>Estimate Confidence: {(d.confidence * 100).toFixed(0)}%</div>
        <div>Time: {d.timeStart} &rarr; {d.timeEnd}</div>
      </div>
    </div>
  );
};

export const LeadNode: React.FC<NodeProps> = ({ data, selected }) => {
  const d = data as LeadNodeData;
  const isDimmed = d.isDimmed;
  const isPulsing = d.isPulsing;

  return (
    <div
      className={`relative min-w-[220px] p-3 rounded-xl bg-panel-dark/95 border border-cyan-500/70 transition-all duration-300 shadow-md ${
        selected || isPulsing ? 'ring-4 ring-cyan-500/40 scale-105' : ''
      } ${isDimmed ? 'opacity-30 filter grayscale' : 'opacity-100'}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5 h-2.5 bg-cyan-400 border border-white"
      />

      <div className="flex items-center gap-2 mb-1.5">
        <Sparkles className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-bold text-white truncate max-w-[160px]">{d.label}</span>
      </div>

      <div className="space-y-0.5 text-[11px] font-mono text-ink-muted">
        <div className="text-cyan-300 font-bold">
          Match Lead: {(d.similarity * 100).toFixed(0)}%
        </div>
        <div>Time: {d.timestamp}</div>
        <div className="text-[10px] text-ink-muted truncate">Model: {d.model}</div>
      </div>
    </div>
  );
};

export const HashNode: React.FC<NodeProps> = ({ data, selected }) => {
  const d = data as HashNodeData;
  const isDimmed = d.isDimmed;
  const isPulsing = d.isPulsing;
  const isVerified = d.isVerified !== false;

  return (
    <div
      className={`relative min-w-[210px] p-3 rounded-xl bg-panel-dark/95 border transition-all duration-300 shadow-md ${
        isVerified
          ? 'border-status-active/80 bg-emerald-950/20'
          : 'border-amber-500/80 bg-amber-950/20'
      } ${selected || isPulsing ? 'ring-4 ring-status-active/40 scale-105' : ''} ${
        isDimmed ? 'opacity-30 filter grayscale' : 'opacity-100'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5 h-2.5 bg-status-active border border-white"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="w-2.5 h-2.5 bg-status-active border border-white"
      />

      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-status-active">
          <KeyRound className="w-3.5 h-3.5" />
          <span className="text-[11px] font-mono font-bold uppercase">{d.label}</span>
        </div>
        {isVerified ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-status-active" />
        ) : (
          <Lock className="w-3.5 h-3.5 text-amber-400" />
        )}
      </div>

      <div className="text-[10px] font-mono text-white bg-black/60 p-1.5 rounded border border-grid-line/50 truncate">
        {d.hash}
      </div>

      <div className="mt-1 text-[10px] font-mono text-status-active flex items-center gap-1">
        <span>&bull; Sealed Cryptographic Record</span>
      </div>
    </div>
  );
};
