import React, { useRef, useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { CameraBadge } from '@/components/forensic/CameraBadge';
import { StateBadge } from '@/components/forensic/StateBadge';
import { HashChip } from '@/components/forensic/HashChip';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Camera,
  CameraOff,
  X,
  Scan,
  ShieldCheck,
} from 'lucide-react';

interface SynchronizedPlayerProps {
  onClose?: () => void;
}

export const SynchronizedPlayer: React.FC<SynchronizedPlayerProps> = ({ onClose }) => {
  const { timeCursor, isPlaying, setVideoWallOpen } = useAppStore();

  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const video3Ref = useRef<HTMLVideoElement>(null);

  const [showAiBoxes, setShowAiBoxes] = useState<boolean>(true);
  const [capturedSnapshot, setCapturedSnapshot] = useState<{
    camera: string;
    channel: number;
    time: string;
    hash: string;
    dataUrl: string;
  } | null>(null);

  // Synchronize video currentTime with timeCursor
  useEffect(() => {
    // Cam 1 duration ~ 180s
    if (video1Ref.current) {
      const v1Time = Math.max(0, timeCursor % 180);
      if (Math.abs(video1Ref.current.currentTime - v1Time) > 0.4) {
        video1Ref.current.currentTime = v1Time;
      }
      if (isPlaying && video1Ref.current.paused) video1Ref.current.play().catch(() => {});
      if (!isPlaying && !video1Ref.current.paused) video1Ref.current.pause();
    }

    // Cam 2 (+4s drift compensation)
    if (video2Ref.current) {
      const v2Time = Math.max(0, (timeCursor + 4) % 180);
      if (Math.abs(video2Ref.current.currentTime - v2Time) > 0.4) {
        video2Ref.current.currentTime = v2Time;
      }
      if (isPlaying && video2Ref.current.paused) video2Ref.current.play().catch(() => {});
      if (!isPlaying && !video2Ref.current.paused) video2Ref.current.pause();
    }

    // Cam 3 (Signal drop between 2s and 910s)
    if (video3Ref.current) {
      const isGap = timeCursor > 2 && timeCursor < 910;
      if (!isGap) {
        const v3Time = timeCursor <= 2 ? timeCursor : (timeCursor - 908) % 120;
        if (Math.abs(video3Ref.current.currentTime - v3Time) > 0.4) {
          video3Ref.current.currentTime = v3Time;
        }
        if (isPlaying && video3Ref.current.paused) video3Ref.current.play().catch(() => {});
      } else {
        if (!video3Ref.current.paused) video3Ref.current.pause();
      }
    }
  }, [timeCursor, isPlaying]);

  const handleCaptureSnapshot = (channel: number, cameraName: string, videoEl: HTMLVideoElement | null) => {
    if (!videoEl) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth || 640;
    canvas.height = videoEl.videoHeight || 360;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
      // Watermark with forensic timestamp
      ctx.fillStyle = 'rgba(7, 11, 20, 0.75)';
      ctx.fillRect(10, canvas.height - 35, 340, 25);
      ctx.fillStyle = '#22D3EE';
      ctx.font = '12px monospace';
      ctx.fillText(`CH${channel} · 2026-10-17 21:40:${String(timeCursor).padStart(2, '0')} UTC · VALIDATED`, 16, canvas.height - 18);

      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedSnapshot({
        channel,
        camera: cameraName,
        time: `2026-10-17 21:40:${String(timeCursor).padStart(2, '0')} UTC`,
        hash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
        dataUrl,
      });
    }
  };

  const isCam3InGap = timeCursor > 2 && timeCursor < 910;

  return (
    <div className="rounded-card bg-console border border-edge overflow-hidden shadow-2xl relative mb-6">
      {/* Wall Header */}
      <div className="p-3.5 bg-raised/70 border-b border-edge flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-verified animate-pulse" />
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              Synchronized Multi-Camera Video Wall (3-Up)
            </span>
          </div>
          <Badge variant="verified" className="text-[10px]">
            Clock Sync Locked
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          {/* AI Box Overlay Toggle */}
          <button
            onClick={() => setShowAiBoxes(!showAiBoxes)}
            className={`px-2.5 py-1 rounded-control text-xs font-mono flex items-center gap-1.5 transition-colors ${
              showAiBoxes
                ? 'bg-scan/20 text-scan border border-scan/40 font-semibold'
                : 'bg-void text-ink-soft border border-edge'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>AI Bounding Boxes</span>
          </button>

          <button
            onClick={() => {
              if (onClose) onClose();
              else setVideoWallOpen(false);
            }}
            className="p-1.5 rounded-control text-ink-soft hover:text-white hover:bg-raised transition-colors"
            title="Close Video Wall"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3-Up Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-void/80">
        {/* PLAYER 1: ENTRANCE */}
        <div className="relative rounded-control overflow-hidden bg-void border border-edge aspect-video flex flex-col justify-between group">
          <video
            ref={video1Ref}
            src="/sample/cam1_entrance.mp4"
            muted
            playsInline
            loop
            className="w-full h-full object-cover"
          />

          {/* AI Detection Overlay Simulation */}
          {showAiBoxes && (
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute border-2 border-scan rounded bg-scan/10 transition-all duration-300"
                style={{ top: '30%', left: '40%', width: '22%', height: '55%' }}
              >
                <div className="absolute -top-5 left-0 bg-scan text-void px-1 text-[9px] font-mono font-bold rounded-t">
                  PERSON #1 · 0.94
                </div>
              </div>
            </div>
          )}

          {/* Top Info Bar */}
          <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none">
            <CameraBadge channel={1} locationName="Main Entrance" />
            <StateBadge state="verified" label="MASTER REF" />
          </div>

          {/* Bottom Watermark & Capture Button */}
          <div className="absolute bottom-2 inset-x-2 flex items-center justify-between">
            <span className="text-[10px] font-mono text-white/90 bg-void/80 px-1.5 py-0.5 rounded border border-edge/60 backdrop-blur-sm">
              CH1 · 1080p · 0.0s OFFSET
            </span>

            <button
              onClick={() => handleCaptureSnapshot(1, 'Main Entrance', video1Ref.current)}
              className="p-1 rounded bg-void/80 hover:bg-scan text-white hover:text-void border border-edge transition-colors shadow"
              title="Capture Evidence Snapshot"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* PLAYER 2: AISLE 4 (DRIFT CORRECTED) */}
        <div className="relative rounded-control overflow-hidden bg-void border border-edge aspect-video flex flex-col justify-between group">
          <video
            ref={video2Ref}
            src="/sample/cam2_aisle4_deleted.mp4"
            muted
            playsInline
            loop
            className="w-full h-full object-cover"
          />

          {/* AI Detection Overlay Simulation */}
          {showAiBoxes && (
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute border-2 border-cyan-400 rounded bg-cyan-400/10 transition-all duration-300"
                style={{ top: '25%', left: '35%', width: '24%', height: '60%' }}
              >
                <div className="absolute -top-5 left-0 bg-cyan-400 text-void px-1 text-[9px] font-mono font-bold rounded-t">
                  RE-ID MATCH · 0.88
                </div>
              </div>
            </div>
          )}

          {/* Top Info Bar */}
          <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none">
            <CameraBadge channel={2} locationName="Aisle 4" />
            <StateBadge state="estimated" label="+4.0s DRIFT" />
          </div>

          {/* Bottom Watermark & Capture Button */}
          <div className="absolute bottom-2 inset-x-2 flex items-center justify-between">
            <span className="text-[10px] font-mono text-estimated bg-void/80 px-1.5 py-0.5 rounded border border-edge/60 backdrop-blur-sm">
              CH2 · CALIBRATED (±1.0s)
            </span>

            <button
              onClick={() => handleCaptureSnapshot(2, 'Aisle 4', video2Ref.current)}
              className="p-1 rounded bg-void/80 hover:bg-scan text-white hover:text-void border border-edge transition-colors shadow"
              title="Capture Evidence Snapshot"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* PLAYER 3: CASH COUNTER (SIGNAL DROP / GAP MONITOR) */}
        <div className="relative rounded-control overflow-hidden bg-void border border-edge aspect-video flex flex-col justify-between group">
          {isCam3InGap ? (
            /* Signal Drop / Hardware Disconnect Placeholder */
            <div className="w-full h-full flex flex-col items-center justify-center bg-void/95 p-4 text-center space-y-2">
              <CameraOff className="w-8 h-8 text-rose-500 animate-pulse" />
              <div className="text-xs font-mono font-bold text-rose-400">CAMERA SIGNAL LOSS DETECTED</div>
              <p className="text-[10px] text-ink-soft leading-tight">
                Physical Carrier Dropped at 21:40:02 UTC.
                <br />
                Restored at 21:55:10 UTC (Duration: 908s).
              </p>
              <Badge variant="gap" className="text-[9px]">
                80% Confidence: Cable Pull
              </Badge>
            </div>
          ) : (
            <video
              ref={video3Ref}
              src="/sample/cam3_counter.mp4"
              muted
              playsInline
              loop
              className="w-full h-full object-cover"
            />
          )}

          {/* Top Info Bar */}
          <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none">
            <CameraBadge channel={3} locationName="Cash Counter" />
            <StateBadge state={isCam3InGap ? 'gap' : 'verified'} label={isCam3InGap ? 'SIGNAL DROP' : 'ACTIVE'} />
          </div>

          {/* Bottom Watermark & Capture Button */}
          <div className="absolute bottom-2 inset-x-2 flex items-center justify-between">
            <span className="text-[10px] font-mono text-white/90 bg-void/80 px-1.5 py-0.5 rounded border border-edge/60 backdrop-blur-sm">
              CH3 · {isCam3InGap ? 'CARRIER OFF' : 'LOCKED'}
            </span>

            {!isCam3InGap && (
              <button
                onClick={() => handleCaptureSnapshot(3, 'Cash Counter', video3Ref.current)}
                className="p-1 rounded bg-void/80 hover:bg-scan text-white hover:text-void border border-edge transition-colors shadow"
                title="Capture Evidence Snapshot"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Snapshot Preview Modal */}
      {capturedSnapshot && (
        <div className="fixed inset-0 z-50 bg-void/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-console border border-edge rounded-card max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-edge pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-scan" />
                <h3 className="font-semibold text-sm text-white font-mono">
                  Evidence Snapshot Captured: CH{capturedSnapshot.channel}
                </h3>
              </div>
              <button
                onClick={() => setCapturedSnapshot(null)}
                className="text-ink-soft hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-control overflow-hidden border border-edge">
              <img src={capturedSnapshot.dataUrl} alt="Snapshot" className="w-full object-contain" />
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-ink-soft">
                <span>TIMESTAMP:</span>
                <span className="text-white font-bold">{capturedSnapshot.time}</span>
              </div>
              <div className="flex justify-between text-ink-soft">
                <span>CAMERA:</span>
                <span className="text-white">{capturedSnapshot.camera}</span>
              </div>
              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-ink-faint">CRYPTOGRAPHIC ARTIFACT HASH:</span>
                <HashChip hash={capturedSnapshot.hash} verified={true} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-edge">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCapturedSnapshot(null)}
                className="text-xs"
              >
                Dismiss
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  alert('Snapshot saved and indexed in Court Audit Report evidence binder.');
                  setCapturedSnapshot(null);
                }}
                className="text-xs shadow-glow-cyan"
              >
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Add to Evidence Binder
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
