import React, { useState } from 'react';
import { SearchLead } from './types';
import { CameraBadge } from '@/components/forensic/CameraBadge';
import { StateBadge } from '@/components/forensic/StateBadge';
import { HashChip } from '@/components/forensic/HashChip';
import { ConfidenceBar } from '@/components/forensic/ConfidenceBar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  X,
  Play,
  BookmarkPlus,
  ThumbsDown,
  Clock,
  ShieldCheck,
  Cpu,
  Layers,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';

interface MatchDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: SearchLead | null;
  onPlayLead: (lead: SearchLead) => void;
  onAddFinding: (lead: SearchLead) => void;
  onMarkWrongMatch: (leadId: string) => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
  isOpen,
  onClose,
  lead,
  onPlayLead,
  onAddFinding,
  onMarkWrongMatch,
}) => {
  const [activeTab, setActiveTab] = useState<'evidence' | 'provenance'>('evidence');
  const [findingAdded, setFindingAdded] = useState(false);
  const [markedWrong, setMarkedWrong] = useState(false);

  if (!isOpen || !lead) return null;

  const handleAddFinding = () => {
    onAddFinding(lead);
    setFindingAdded(true);
    setTimeout(() => setFindingAdded(false), 2500);
  };

  const handleMarkWrong = () => {
    onMarkWrongMatch(lead.id);
    setMarkedWrong(true);
    setTimeout(() => {
      setMarkedWrong(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-panel-dark border border-grid-line/80 rounded-xl shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="p-4 border-b border-grid-line/60 flex items-center justify-between bg-panel-dark/95 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <CameraBadge channel={lead.channel} locationName={lead.camera_name} />
            <StateBadge state="lead" />
            <span className="font-mono text-xs text-ink-muted">ID: {lead.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-ink-muted hover:text-white rounded-lg hover:bg-panel-light/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Top Video Preview & Bounding Box Inspection */}
          <div className="relative aspect-video rounded-lg overflow-hidden bg-black border border-grid-line shadow-inner flex items-center justify-center">
            <video
              src={lead.thumbnail_url}
              className="w-full h-full object-contain"
              autoPlay
              muted
              loop
              playsInline
            />

            {/* Bounding Box Overlay */}
            <div
              className="absolute border-2 border-scan bg-scan/20 rounded pointer-events-none"
              style={{
                left: `${(lead.bbox[0] / 1280) * 100}%`,
                top: `${(lead.bbox[1] / 720) * 100}%`,
                width: `${(lead.bbox[2] / 1280) * 100}%`,
                height: `${(lead.bbox[3] / 720) * 100}%`,
              }}
            >
              <div className="absolute -top-6 left-0 px-1.5 py-0.5 bg-scan text-[10px] font-mono text-white rounded font-bold uppercase shadow">
                Lead: {(lead.similarity * 100).toFixed(0)}%
              </div>
            </div>

            {/* Quick Play Trigger Overlay */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onPlayLead(lead);
              }}
              className="absolute bottom-3 right-3 px-3 py-1.5 bg-scan/90 hover:bg-scan text-white rounded text-xs font-mono flex items-center gap-1.5 shadow-lg backdrop-blur transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play From Here</span>
            </button>
          </div>

          {/* Tab Switcher: Evidence Metadata vs Model Provenance */}
          <div className="flex items-center gap-2 border-b border-grid-line/60 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('evidence')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                activeTab === 'evidence'
                  ? 'bg-panel-light/40 text-scan font-bold border border-scan/40'
                  : 'text-ink-muted hover:text-white'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Evidentiary Metadata</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('provenance')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                activeTab === 'provenance'
                  ? 'bg-panel-light/40 text-scan font-bold border border-scan/40'
                  : 'text-ink-muted hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>AI Model Provenance & Parameters</span>
            </button>
          </div>

          {/* Tab 1: Evidence Metadata */}
          {activeTab === 'evidence' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-lg bg-panel-dark/60 border border-grid-line/50 space-y-2">
                <div className="text-ink-muted flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-scan" />
                  <span>Corrected Reference Time</span>
                </div>
                <div className="text-white text-base font-bold">
                  {lead.corrected_timestamp_iso.replace('T', ' ').slice(0, 19)} UTC
                </div>
                <div className="text-ink-muted text-[11px]">
                  Uncertainty error: ±{lead.uncertainty_seconds}s (calibrated NTP/Flash anchor)
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-panel-dark/60 border border-grid-line/50 space-y-2">
                <div className="text-ink-muted flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>DVR Clock (Raw Timestamp)</span>
                </div>
                <div className="text-white text-base font-bold">
                  {lead.raw_timestamp_iso.replace('T', ' ').slice(0, 19)}
                </div>
                <div className="text-ink-muted text-[11px]">
                  Channel {lead.channel} Clock Offset: +{(lead.channel === 2 ? 4.0 : 0.0).toFixed(1)}s ahead
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-panel-dark/60 border border-grid-line/50 space-y-2">
                <div className="text-ink-muted">Appearance Similarity Score</div>
                <div className="flex items-center justify-between">
                  <span className="text-scan text-base font-bold">
                    Lead {(lead.similarity * 100).toFixed(1)}% Match
                  </span>
                  <Badge variant="neutral">Tier {lead.pass_tier} Candidate</Badge>
                </div>
                <ConfidenceBar confidence={lead.similarity} />
              </div>

              <div className="p-3.5 rounded-lg bg-panel-dark/60 border border-grid-line/50 space-y-2">
                <div className="text-ink-muted">Cryptographic Clip Provenance</div>
                <div className="pt-0.5">
                  <HashChip hash={lead.clip_hash} />
                </div>
                <div className="text-[10px] text-ink-muted">
                  SHA-256 sealed source file bitstream digest
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Model Provenance & Parameters */}
          {activeTab === 'provenance' && (
            <div className="p-4 rounded-lg bg-panel-dark/60 border border-grid-line/50 space-y-3 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-2.5 bg-panel-light/20 rounded border border-grid-line/40">
                  <span className="text-ink-muted block text-[11px]">Object Detection Model</span>
                  <span className="text-white font-semibold">{lead.model_detector}</span>
                </div>
                <div className="p-2.5 bg-panel-light/20 rounded border border-grid-line/40">
                  <span className="text-ink-muted block text-[11px]">Re-ID / Embedding Model</span>
                  <span className="text-white font-semibold">{lead.model_embedder}</span>
                </div>
                <div className="p-2.5 bg-panel-light/20 rounded border border-grid-line/40">
                  <span className="text-ink-muted block text-[11px]">Vector Indexing Algorithm</span>
                  <span className="text-white font-semibold">FAISS Flat-IP (Normalized Cosine)</span>
                </div>
                <div className="p-2.5 bg-panel-light/20 rounded border border-grid-line/40">
                  <span className="text-ink-muted block text-[11px]">Detection Bounding Box</span>
                  <span className="text-white font-semibold">
                    [{lead.bbox.join(', ')}] (px)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-ink-soft text-[11px] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-status-active" />
                <span>Deterministic offline inference. Weights frozen and hash-pinned in container manifest.</span>
              </div>
            </div>
          )}

          {/* Pinned Honest Forensic Notice */}
          <div className="p-3.5 rounded-lg bg-panel-light/20 border border-scan/30 flex items-start gap-2.5 text-xs text-ink-soft">
            <Layers className="w-4 h-4 text-scan flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-white">Forensic Lead Notice:</strong> Matches are calculated using visual similarity vectors and must be verified by a certified investigator. Appearance match scores are investigative leads, never conclusive proof of identity.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-grid-line/60 bg-panel-dark/95 flex flex-wrap items-center justify-between gap-3 sticky bottom-0">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleMarkWrong}
              disabled={markedWrong}
              className={`text-xs gap-1.5 transition-colors ${
                markedWrong
                  ? 'border-red-500 bg-red-500/20 text-red-300'
                  : 'border-grid-line text-ink-muted hover:text-red-400'
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>{markedWrong ? 'Marked as Wrong Match' : 'Mark as Wrong Match'}</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAddFinding}
              disabled={findingAdded}
              className={`text-xs gap-1.5 transition-colors ${
                findingAdded
                  ? 'border-status-active bg-status-active/20 text-status-active'
                  : 'border-grid-line text-white hover:border-scan'
              }`}
            >
              {findingAdded ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-status-active" />
                  <span>Added to Findings!</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Add to Case Findings</span>
                </>
              )}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onPlayLead(lead);
              }}
              className="text-xs gap-1.5 font-medium px-4"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play From Here</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
