import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { HashChip } from '@/components/forensic/HashChip';
import {
  ShieldCheck,
  HardDrive,
  Clock,
  Flame,
  CheckCircle2,
  FileText,
  Filter,
} from 'lucide-react';

interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  category: 'intake' | 'calibration' | 'carve' | 'review' | 'export';
  action: string;
  hash?: string;
  status: 'verified' | 'logged';
}

const AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'AUD-001',
    timestamp: '2026-10-17 21:40:00 UTC',
    actor: 'Lead Examiner (EnCE)',
    category: 'intake',
    action: 'Acquired bitstream image mock_dvr.img (153.6 MB) via hardware write-blocker.',
    hash: '618ed08956f023966c63dd2416f7d8b2aa8f071dfa4835305f57d608215720d0',
    status: 'verified',
  },
  {
    id: 'AUD-002',
    timestamp: '2026-10-17 21:41:30 UTC',
    actor: 'Forensic-X Core Engine',
    category: 'intake',
    action: 'Parsed proprietary Hikvision index tables: 3 channels detected, 3 continuous segments mapped.',
    status: 'logged',
  },
  {
    id: 'AUD-003',
    timestamp: '2026-10-17 21:42:10 UTC',
    actor: 'Temporal Calibration Module',
    category: 'calibration',
    action: 'Computed Channel 2 clock offset (+4.00s ahead) using optical sync flash anchor at 21:42:00 UTC.',
    status: 'verified',
  },
  {
    id: 'AUD-004',
    timestamp: '2026-10-17 21:45:15 UTC',
    actor: 'Deep Sector Carver',
    category: 'carve',
    action: 'Located proprietary magic header MOCKDVR1 at sector 254464. Restored 180,000 bytes deleted footage.',
    hash: '0b2b68603632cf4b64fcad18a6dfc9247d8ff60f04c6e9a7e6b0253457b3f25c',
    status: 'verified',
  },
  {
    id: 'AUD-005',
    timestamp: '2026-10-17 21:48:00 UTC',
    actor: 'Investigator Adjudication',
    category: 'review',
    action: 'Reviewed Channel 3 908-second gap. Verified video-loss log interrupt; confirmed camera disconnect fault.',
    status: 'verified',
  },
  {
    id: 'AUD-006',
    timestamp: '2026-10-17 21:50:20 UTC',
    actor: 'AI Re-ID Module',
    category: 'review',
    action: 'Executed cross-camera appearance query "person in red jacket". Flagged 3 consistent waypoint matches.',
    status: 'logged',
  },
  {
    id: 'AUD-007',
    timestamp: '2026-10-17 21:52:00 UTC',
    actor: 'Court Certification Subsystem',
    category: 'export',
    action: 'Sealed forensic chain of custody under Section 65B Indian Evidence Act / FRE 902. Report generated.',
    hash: 'e7a9b2c1f4e5a8d9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5',
    status: 'verified',
  },
];

export const AuditTrailPanel: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredEvents = AUDIT_EVENTS.filter((e) => {
    if (filterCategory === 'all') return true;
    return e.category === filterCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'intake':
        return <HardDrive className="w-3.5 h-3.5 text-cyan-400" />;
      case 'calibration':
        return <Clock className="w-3.5 h-3.5 text-blue-400" />;
      case 'carve':
        return <Flame className="w-3.5 h-3.5 text-violet-400" />;
      case 'review':
        return <CheckCircle2 className="w-3.5 h-3.5 text-status-active" />;
      case 'export':
        return <FileText className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-scan" />;
    }
  };

  return (
    <div className="p-6 rounded-xl bg-panel-dark border border-grid-line/80 shadow-xl space-y-5 font-mono text-xs text-white">
      {/* Header & Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-grid-line/50">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-scan" />
            <h3 className="font-display font-bold text-base text-white">
              Cryptographic Chain of Custody Audit Log
            </h3>
          </div>
          <p className="text-xs text-ink-muted font-sans mt-0.5">
            Immutable evidentiary sequence of all examiner interactions, extractions, and calibrations.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-ink-muted mr-1" />
          {['all', 'intake', 'calibration', 'carve', 'review', 'export'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 rounded text-[11px] uppercase transition-colors ${
                filterCategory === cat
                  ? 'bg-scan text-white font-bold shadow-sm'
                  : 'bg-panel-light/20 text-ink-muted hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Timeline */}
      <div className="space-y-4">
        {filteredEvents.map((event, idx) => (
          <div
            key={event.id}
            className="flex items-start gap-3 p-3.5 rounded-lg bg-panel-light/20 border border-grid-line/50 hover:border-scan/60 transition-colors"
          >
            {/* Step Counter */}
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-panel-dark border border-grid-line flex items-center justify-center text-[10px] font-bold text-scan">
                {idx + 1}
              </div>
              {idx < filteredEvents.length - 1 && (
                <div className="w-0.5 h-8 bg-grid-line/40 my-1" />
              )}
            </div>

            {/* Event Content */}
            <div className="flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-panel-dark border border-grid-line/40">
                    {getCategoryIcon(event.category)}
                  </div>
                  <span className="font-bold text-white uppercase text-[11px]">
                    {event.category}
                  </span>
                  <span className="text-ink-muted text-[11px]">&bull; {event.actor}</span>
                </div>

                <div className="text-ink-muted text-[11px]">{event.timestamp}</div>
              </div>

              <p className="text-ink-soft text-xs font-sans leading-relaxed">
                {event.action}
              </p>

              {event.hash && (
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-[10px] text-ink-muted">Sealed Digest:</span>
                  <HashChip hash={event.hash} />
                </div>
              )}
            </div>

            {/* Verification Badge */}
            <div className="shrink-0">
              <Badge variant="verified" className="text-[10px] py-0.5">
                VERIFIED
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
