import React, { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Tv,
  X,
  Sparkles,
  Info,
} from 'lucide-react';

export interface DemoBeat {
  id: number;
  title: string;
  route: string;
  timeBudget: string;
  talkingPoint: string;
  honestyLine: string;
  actionHint: string;
}

export const DEMO_BEATS: DemoBeat[] = [
  {
    id: 1,
    title: 'Intake & Cryptographic Master Seal',
    route: '/cases/CASE-2026-APEX-01',
    timeBudget: '0:45',
    talkingPoint:
      'We begin by ingesting the raw DVR bitstream image under write-blocked conditions. The SHA-256 hash verifies integrity with zero bit divergence.',
    honestyLine:
      'Proprietary vendor formats are reverse-engineered via vendor adapters; unindexed structures safely fall back to raw carving.',
    actionHint: 'Inspect the Master Storage Bitstream card and SHA-256 hash chip.',
  },
  {
    id: 2,
    title: 'Multi-Camera Clock Normalization',
    route: '/cases/CASE-2026-APEX-01/cameras',
    timeBudget: '0:45',
    talkingPoint:
      'CCTV recorder hardware clocks drift relentlessly. Camera 2 is 4.0s fast. We calibrate clock offsets with an honest residual uncertainty bound of ±0.05s.',
    honestyLine:
      'Clock offsets are never reported with false precision: we always display ± error margins derived from optical sync flash events.',
    actionHint: 'Observe the clock offset badge (+4.00s ± 0.05s) on Channel 2.',
  },
  {
    id: 3,
    title: 'Synchronized Multi-Camera Timeline',
    route: '/cases/CASE-2026-APEX-01/timeline',
    timeBudget: '0:45',
    talkingPoint:
      'The multi-camera timeline displays raw and corrected time side-by-side. Notice the red gap on Camera 1 right at the incident time.',
    honestyLine:
      'Visual timeline aligns multiple continuous and fragmented streams into one unified incident chronology.',
    actionHint: 'Toggle between Raw DVR Clock and Corrected Master Time.',
  },
  {
    id: 4,
    title: 'Deep Carver Deleted Footage Recovery',
    route: '/cases/CASE-2026-APEX-01/timeline',
    timeBudget: '0:45',
    talkingPoint:
      'A clip was deleted from the DVR index. The deep carver scans unallocated disk blocks, reconstructs the H.264 bitstream, and restores the clip without corrupting metadata.',
    honestyLine:
      'Deleted video is recoverable only as long as raw sectors have not been overwritten by continuous loop recording.',
    actionHint: 'Click "Recover Deleted Clip" to trigger bitstream carving.',
  },
  {
    id: 5,
    title: 'Explainable Gap Causal Diagnosis',
    route: '/cases/CASE-2026-APEX-01/timeline',
    timeBudget: '0:45',
    talkingPoint:
      'Why is Camera 3 missing 15 minutes of footage? Instead of guessing, FORENSIC-X cross-references DVR hardware logs: 80% confidence physical camera disconnect.',
    honestyLine:
      'Causal attribution is probabilistic: if clues are insufficient, the system reports "Cause undetermined", which is an honest verdict.',
    actionHint: 'Inspect the Gap Attribution panel and supporting evidence logs.',
  },
  {
    id: 6,
    title: 'Cross-Camera Appearance Search',
    route: '/cases/CASE-2026-APEX-01/search',
    timeBudget: '0:45',
    talkingPoint:
      'Investigators query "person in red jacket". Two-pass detection gates motion with YOLO11, followed by OSNet person re-ID, generating a chronological trajectory with walking speed plausibility.',
    honestyLine:
      'Visual re-identification matches are leads for investigator verification, never conclusive legal proof.',
    actionHint: 'View suspect trajectory in Path View across Entrance → Aisle 4 → Cash Counter.',
  },
  {
    id: 7,
    title: 'Evidence Lineage Graph (DAG)',
    route: '/cases/CASE-2026-APEX-01/graph',
    timeBudget: '0:30',
    talkingPoint:
      'Every single lead, cropped frame, and carved clip traces back along an immutable DAG directly to the physical storage master image.',
    honestyLine:
      'Chain of custody is mathematically unbroken from master sector to court exhibit.',
    actionHint: 'Click "Trace Lineage to Root" to pulse provenance back to the root hash.',
  },
  {
    id: 8,
    title: 'Section 65B Certified Court Report',
    route: '/cases/CASE-2026-APEX-01/report',
    timeBudget: '0:30',
    talkingPoint:
      'With one click, the examiner cryptographically seals the findings and downloads a court-admissible PDF certificate compliant with Section 65B Indian Evidence Act & FRE 902.',
    honestyLine:
      'Audit reports lock examiner credentials, disk hashes, and synchronization calibration tables into an unalterable judicial record.',
    actionHint: 'Click "Seal & Sign Certificate" and "Download Sealed PDF".',
  },
];

export const DemoController: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isDemoMode,
    toggleDemoMode,
    demoBeatIndex,
    setDemoBeatIndex,
    isPresenterNotesOpen,
    togglePresenterNotes,
    isProjectorMode,
    toggleProjectorMode,
    resetDemoState,
  } = useAppStore();

  const currentBeat = DEMO_BEATS[demoBeatIndex] || DEMO_BEATS[0];

  // Navigate to beat's route
  const goToBeat = useCallback(
    (index: number) => {
      const targetIndex = Math.max(0, Math.min(DEMO_BEATS.length - 1, index));
      setDemoBeatIndex(targetIndex);
      const beat = DEMO_BEATS[targetIndex];
      if (location.pathname !== beat.route) {
        navigate(beat.route);
      }
    },
    [location.pathname, navigate, setDemoBeatIndex]
  );

  const handleNext = useCallback(() => {
    if (demoBeatIndex < DEMO_BEATS.length - 1) {
      goToBeat(demoBeatIndex + 1);
    }
  }, [demoBeatIndex, goToBeat]);

  const handlePrev = useCallback(() => {
    if (demoBeatIndex > 0) {
      goToBeat(demoBeatIndex - 1);
    }
  }, [demoBeatIndex, goToBeat]);

  const handleReset = useCallback(() => {
    resetDemoState();
    goToBeat(0);
  }, [resetDemoState, goToBeat]);

  // Projector mode styling effect
  useEffect(() => {
    if (isProjectorMode) {
      document.documentElement.classList.add('projector-mode');
    } else {
      document.documentElement.classList.remove('projector-mode');
    }
  }, [isProjectorMode]);

  // Keyboard navigation for demo mode
  useEffect(() => {
    if (!isDemoMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'ArrowRight' && (e.ctrlKey || e.metaKey || e.altKey)) {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' && (e.ctrlKey || e.metaKey || e.altKey)) {
        e.preventDefault();
        handlePrev();
      } else if (e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        togglePresenterNotes();
      } else if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleReset();
      } else if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDemoMode, handleNext, handlePrev, handleReset, togglePresenterNotes]);

  if (!isDemoMode) return null;

  return (
    <>
      {/* Floating Presenter Notes HUD */}
      {isPresenterNotesOpen && (
        <div
          role="complementary"
          aria-label="Presenter Notes HUD"
          className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] z-50 bg-console/95 border border-scan/40 p-4 rounded-card shadow-2xl backdrop-blur-md text-ink animate-slide-up"
        >
          <div className="flex items-center justify-between border-b border-edge pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-scan" />
              <span className="font-display font-bold text-xs uppercase tracking-wider text-scan">
                Presenter Notes • Beat {currentBeat.id}/8
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-ink-soft bg-raised px-1.5 py-0.5 rounded border border-edge">
                {currentBeat.timeBudget}
              </span>
              <button
                type="button"
                onClick={togglePresenterNotes}
                className="text-ink-soft hover:text-ink p-1 rounded hover:bg-raised"
                title="Hide notes (N)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase text-ink-faint block mb-1">
                Speaking Cue:
              </span>
              <p className="font-sans text-ink leading-relaxed bg-void/60 p-2.5 rounded border border-edge/60">
                "{currentBeat.talkingPoint}"
              </p>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-verified block mb-1">
                Honesty Disclaimer (Judge Defense):
              </span>
              <p className="font-sans text-ink-soft italic leading-relaxed bg-verified/5 p-2 rounded border border-verified/20">
                "{currentBeat.honestyLine}"
              </p>
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] text-scan font-mono">
              <span>Next action: {currentBeat.actionHint}</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Guided Tour Dock */}
      <div
        role="region"
        aria-label="Guided Demo Controller"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-console/95 border border-scan/50 shadow-[0_0_24px_rgba(34,211,238,0.25)] backdrop-blur-md select-none"
      >
        {/* Demo Mode Badge */}
        <div className="flex items-center gap-1.5 pr-2 border-r border-edge text-xs font-mono text-scan font-bold">
          <span className="w-2 h-2 rounded-full bg-scan animate-pulse" />
          <span className="hidden sm:inline">DEMO TOUR</span>
        </div>

        {/* Previous Beat */}
        <Button
          size="sm"
          variant="secondary"
          onClick={handlePrev}
          disabled={demoBeatIndex === 0}
          aria-label="Previous Demo Beat"
          className="h-8 w-8 p-0 rounded-full border border-edge hover:border-scan text-ink-soft hover:text-ink"
          title="Previous Beat (Alt+←)"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Beat Title & Indicator */}
        <div className="flex items-center gap-2 px-2 max-w-[280px] sm:max-w-md truncate">
          <Badge variant="scan" className="font-mono text-[10px] px-1.5 py-0.5 shrink-0">
            {currentBeat.id}/8
          </Badge>
          <span className="text-xs font-medium text-white truncate">{currentBeat.title}</span>
        </div>

        {/* Next Beat */}
        <Button
          size="sm"
          variant="primary"
          onClick={handleNext}
          disabled={demoBeatIndex === DEMO_BEATS.length - 1}
          aria-label="Next Demo Beat"
          className="h-8 px-3 rounded-full font-mono text-xs flex items-center gap-1"
          title="Next Beat (Alt+→)"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>

        {/* Separator */}
        <div className="h-4 w-px bg-edge mx-1" />

        {/* Presenter Notes Button */}
        <Button
          size="sm"
          variant={isPresenterNotesOpen ? 'primary' : 'secondary'}
          onClick={togglePresenterNotes}
          aria-label="Toggle Presenter Notes HUD"
          className={`h-8 w-8 p-0 rounded-full border border-edge ${
            isPresenterNotesOpen ? 'bg-scan text-on-accent' : 'text-ink-soft hover:text-scan'
          }`}
          title="Presenter Notes (N)"
        >
          <Info className="w-4 h-4" />
        </Button>

        {/* Projector Mode Button */}
        <Button
          size="sm"
          variant={isProjectorMode ? 'primary' : 'secondary'}
          onClick={toggleProjectorMode}
          aria-label="Toggle Projector High-Contrast Mode"
          className={`h-8 w-8 p-0 rounded-full border border-edge ${
            isProjectorMode ? 'bg-scan text-on-accent' : 'text-ink-soft hover:text-scan'
          }`}
          title="Projector Mode (115% scale, high contrast)"
        >
          <Tv className="w-4 h-4" />
        </Button>

        {/* 1-Click State Reset */}
        <Button
          size="sm"
          variant="secondary"
          onClick={handleReset}
          aria-label="Reset Demo State"
          className="h-8 w-8 p-0 rounded-full border border-edge hover:border-alert text-ink-soft hover:text-alert"
          title="Reset Demo State (R)"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>

        {/* Close Demo Mode */}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => toggleDemoMode()}
          aria-label="Exit Demo Mode"
          className="h-8 w-8 p-0 rounded-full border border-edge hover:bg-alert/10 text-ink-soft hover:text-alert"
          title="Exit Demo Mode"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </>
  );
};
