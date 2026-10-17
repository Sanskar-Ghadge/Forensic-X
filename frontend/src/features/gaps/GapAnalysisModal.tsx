import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { CameraBadge } from '@/components/forensic/CameraBadge';
import { StateBadge } from '@/components/forensic/StateBadge';
import { ConfidenceBar } from '@/components/forensic/ConfidenceBar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ZapOff,
  CheckCircle2,
  ShieldCheck,
  X,
} from 'lucide-react';

interface GapAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  gapId?: string;
}

export const GapAnalysisModal: React.FC<GapAnalysisModalProps> = ({
  isOpen,
  onClose,
  gapId = 'GAP-CH3-01',
}) => {
  const { gapReviews, updateGapReview } = useAppStore();

  const currentReview = gapReviews[gapId] || {
    verdict: 'physical_camera_disconnect',
    status: 'accepted',
    notes: 'Hardware log Video Loss matches carrier drop. Concluded camera physical disconnect.',
  };

  const [selectedVerdict, setSelectedVerdict] = useState<string>(currentReview.verdict);
  const [reviewStatus, setReviewStatus] = useState<string>(currentReview.status);
  const [notes, setNotes] = useState<string>(currentReview.notes);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSaveReview = () => {
    updateGapReview(gapId, selectedVerdict, reviewStatus, notes);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-void/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-console border border-edge rounded-card max-w-2xl w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-edge pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <CameraBadge channel={3} locationName="Cash Counter" />
              <StateBadge state="gap" label="DISCONNECTION" />
              <Badge variant="gap">908s Gap</Badge>
            </div>
            <h2 className="text-xl font-bold font-display text-white tracking-tight flex items-center gap-2">
              <ZapOff className="w-5 h-5 text-gap" />
              <span>Evidence Gap Analysis & Causal Reasoning</span>
            </h2>
            <p className="text-xs text-ink-soft mt-1">
              Time Interval: <span className="font-mono text-white">2026-10-17 21:40:02 to 21:55:10 UTC</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-ink-soft hover:text-white p-1 rounded-control hover:bg-raised transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Causal Diagnosis Candidates */}
        <div className="space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-ink-soft font-semibold">
            Ranked Hypotheses (Bayesian Causal Inference)
          </span>

          {/* Candidate 1: Physical Camera Disconnect */}
          <div className="p-4 rounded-control bg-raised/50 border border-gap/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gap/20 text-gap flex items-center justify-center font-bold text-xs">
                  #1
                </div>
                <span className="text-sm font-semibold text-white">
                  Physical Camera Disconnect / Signal Carrier Drop
                </span>
              </div>
              <Badge variant="gap">Primary Finding</Badge>
            </div>

            <ConfidenceBar confidence={0.8} label="Confidence Score" />

            {/* Supporting Clues */}
            <div className="space-y-1.5 text-xs font-mono">
              <span className="text-[10px] text-verified font-bold uppercase">Supporting Evidence (+):</span>
              <div className="space-y-1 pl-2 border-l border-verified/40 text-ink">
                <div>• 2026-10-17 21:40:02 [WARN] CH3 Video Loss detected: Signal carrier dropped</div>
                <div>• 2026-10-17 21:55:10 [INFO] CH3 Video Signal Restored: 1080p 25fps carrier locked</div>
                <div>• Deep sector carving found 0 unindexed frames (proves hardware stopped writing)</div>
              </div>
            </div>

            {/* Contradicting Clues */}
            <div className="space-y-1.5 text-xs font-mono pt-1">
              <span className="text-[10px] text-ink-faint font-bold uppercase">Contradicting Evidence (-):</span>
              <div className="pl-2 border-l border-edge text-ink-soft text-[11px]">
                <div>• No filesystem format, overwrite, or manual operator deletion logs in DVR system audit</div>
              </div>
            </div>
          </div>

          {/* Candidate 2: Scheduled Off-Hours */}
          <div className="p-3.5 rounded-control bg-raised/20 border border-edge opacity-70 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-ink-soft">Scheduled Recording Profile Suppression</span>
              <p className="text-[10px] text-ink-faint mt-0.5">Motion threshold not reached during time window.</p>
            </div>
            <div className="w-32">
              <ConfidenceBar confidence={0.15} label="" />
            </div>
          </div>

          {/* Candidate 3: Operator Tampering */}
          <div className="p-3.5 rounded-control bg-raised/20 border border-edge opacity-50 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-ink-soft">Manual Filesystem Wipe / Tampering</span>
              <p className="text-[10px] text-ink-faint mt-0.5">Disproved by sector 0 intact index table.</p>
            </div>
            <div className="w-32">
              <ConfidenceBar confidence={0.05} label="" />
            </div>
          </div>
        </div>

        {/* Cross-Camera Corroboration */}
        <div className="p-3 rounded-control bg-void/80 border border-edge text-xs space-y-1">
          <span className="font-mono text-[10px] uppercase text-scan font-bold">Cross-Camera Context</span>
          <p className="text-ink-soft leading-relaxed">
            While Channel 3 was offline, Channel 1 (Entrance) and Channel 2 (Aisle 4) remained fully operational with
            normal carrier lock, confirming this was an isolated single-camera connection disruption, not a facility-wide
            power outage.
          </p>
        </div>

        {/* Investigator Review Panel */}
        <div className="p-4 rounded-control bg-raised/40 border border-edge space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-scan" />
              <span>Investigator Adjudication & Notes</span>
            </span>
            <span className="text-[10px] font-mono text-ink-faint">Admissible under court audit standards</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[10px] font-mono text-ink-soft">DETERMINED VERDICT</label>
              <select
                value={selectedVerdict}
                onChange={(e) => setSelectedVerdict(e.target.value)}
                className="w-full mt-1 p-2 bg-void border border-edge rounded-control text-xs font-mono text-white focus:border-scan focus:outline-none"
              >
                <option value="physical_camera_disconnect">Camera Disconnect / Cable Pull</option>
                <option value="motion_schedule">Motion Threshold Suppressed</option>
                <option value="tampering">Malicious Disruption</option>
                <option value="undetermined">Cause Undetermined</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-ink-soft">REVIEW STATUS</label>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value)}
                className="w-full mt-1 p-2 bg-void border border-edge rounded-control text-xs font-mono text-white focus:border-scan focus:outline-none"
              >
                <option value="accepted">Accepted (Verified by Clues)</option>
                <option value="unreviewed">Unreviewed</option>
                <option value="disputed">Disputed</option>
                <option value="requires_inspection">Requires On-Site Physical Inspection</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono text-ink-soft">CASE NARRATIVE / INVESTIGATOR NOTE</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full mt-1 p-2 bg-void border border-edge rounded-control text-xs text-white focus:border-scan focus:outline-none"
              placeholder="Enter forensic remarks for inclusion in sealed report..."
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-edge">
          <Button variant="secondary" size="sm" onClick={onClose} className="text-xs">
            Dismiss
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveReview}
            className="text-xs shadow-glow-cyan font-semibold"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            {isSaved ? 'Review Saved!' : 'Save Forensic Review'}
          </Button>
        </div>
      </div>
    </div>
  );
};
