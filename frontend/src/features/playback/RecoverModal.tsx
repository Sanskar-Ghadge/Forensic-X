import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StateBadge } from '@/components/forensic/StateBadge';
import { HashChip } from '@/components/forensic/HashChip';
import {
  Flame,
  CheckCircle2,
  Play,
  X,
} from 'lucide-react';

interface RecoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  segmentId?: string;
}

export const RecoverModal: React.FC<RecoverModalProps> = ({
  isOpen,
  onClose,
  segmentId = 'SEG-002-DEL',
}) => {
  const { markClipRecovered, setTimeCursor, toggleIsPlaying } = useAppStore();

  const [stage, setStage] = useState<number>(0); // 0 = ready, 1 = scanning, 2 = found, 3 = extracted, 4 = verified
  const [isCarving, setIsCarving] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleStartCarve = () => {
    setIsCarving(true);
    setStage(1);

    setTimeout(() => setStage(2), 500); // Found MOCKDVR1 magic
    setTimeout(() => setStage(3), 1100); // Extracted 180,000 bytes
    setTimeout(() => {
      setStage(4);
      setIsCarving(false);
      setIsSuccess(true);
      markClipRecovered(segmentId);
    }, 1800);
  };

  const handlePlayRecovered = () => {
    setTimeCursor(120); // 21:42:00
    toggleIsPlaying();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-void/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-console border border-edge rounded-card max-w-lg w-full p-6 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-edge pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-mono tracking-widest text-recovered">
                Deep Sector Video Carver
              </span>
              <Badge variant="scan">Raw Disk Scanner</Badge>
            </div>
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-recovered animate-pulse" />
              <span>Recover Unindexed Deleted Footage</span>
            </h3>
          </div>

          <button onClick={onClose} className="text-ink-soft hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Missing Clip Information */}
        <div className="p-3.5 rounded-control bg-void/90 border border-edge space-y-2 text-xs font-mono">
          <div className="flex justify-between text-ink-soft">
            <span>TARGET CHANNEL:</span>
            <span className="text-white font-bold">CH 1 (Main Entrance)</span>
          </div>
          <div className="flex justify-between text-ink-soft">
            <span>DELETION TIME WINDOW:</span>
            <span className="text-rose-400 font-bold">2026-10-17 21:42:00 UTC (60s)</span>
          </div>
          <div className="flex justify-between text-ink-soft">
            <span>UNALLOCATED DISK SECTOR:</span>
            <span className="text-scan">Sectors 250,000 &rarr; 430,000</span>
          </div>
        </div>

        {/* Interactive Carving Progress Stepper */}
        <div className="space-y-2 text-xs font-mono">
          <span className="text-[10px] uppercase text-ink-faint">Carving Pipeline Stages:</span>

          <div className="space-y-1.5">
            {[
              { num: 1, label: 'Scanning raw sectors for container magic (MOCKDVR1)' },
              { num: 2, label: 'Located header signature at sector 254464' },
              { num: 3, label: 'Reassembled 180,000 byte video bitstream payload' },
              { num: 4, label: 'Validated cryptographic SHA-256 fingerprint' },
            ].map((step) => {
              const isCurrent = stage === step.num;
              const isDone = stage > step.num || isSuccess;

              return (
                <div
                  key={step.num}
                  className={`p-2.5 rounded-control border flex items-center justify-between transition-colors ${
                    isDone
                      ? 'bg-recovered/15 border-recovered/50 text-white'
                      : isCurrent
                      ? 'bg-scan/10 border-scan text-scan animate-pulse'
                      : 'bg-void/40 border-edge/60 text-ink-faint'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                        isDone
                          ? 'bg-recovered text-white'
                          : isCurrent
                          ? 'bg-scan text-void'
                          : 'bg-raised text-ink-faint'
                      }`}
                    >
                      {isDone ? '✓' : step.num}
                    </div>
                    <span>{step.label}</span>
                  </div>

                  {isCurrent && <span className="text-[10px] text-scan font-bold">RUNNING</span>}
                  {isDone && <span className="text-[10px] text-recovered font-bold">PASS</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Success Card with SHA-256 Fingerprint */}
        {isSuccess && (
          <div className="p-4 rounded-control bg-recovered/20 border border-recovered space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
                <CheckCircle2 className="w-4 h-4 text-recovered" />
                <span>DELETED VIDEO RESTORED (100% INTEGRITY)</span>
              </div>
              <StateBadge state="recovered" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-ink-faint">CARVED PAYLOAD SHA-256:</span>
              <HashChip
                hash="0b2b68602866eb8a8300d8f31a01d70c71f1cd4770c86ae3f253eab617b3f25c"
                verified={true}
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-edge">
          <Button variant="secondary" size="sm" onClick={onClose} className="text-xs">
            {isSuccess ? 'Close' : 'Cancel'}
          </Button>

          {!isSuccess ? (
            <Button
              variant="primary"
              size="sm"
              disabled={isCarving}
              onClick={handleStartCarve}
              className="text-xs shadow-glow-purple bg-recovered hover:bg-recovered/90 text-white font-semibold"
            >
              <Flame className="w-3.5 h-3.5 mr-1.5" />
              {isCarving ? 'Carving Sector Blocks...' : 'Execute Deep Sector Carve'}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handlePlayRecovered}
              className="text-xs shadow-glow-cyan font-semibold"
            >
              <Play className="w-3.5 h-3.5 mr-1.5" />
              Play Restored Video (21:42:00)
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
