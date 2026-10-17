import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { HashChip } from '@/components/forensic/HashChip';

interface ReportPreviewProps {
  caseId: string;
  examinerName: string;
  examinerAgency: string;
  customNotes: string;
  includedSections: Record<string, boolean>;
  isSealed: boolean;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({
  caseId,
  examinerName,
  examinerAgency,
  customNotes,
  includedSections,
  isSealed,
}) => {
  const currentDate = new Date().toUTCString();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Document Page Canvas (High-Fidelity Court Certificate) */}
      <div className="p-8 sm:p-12 rounded-xl bg-slate-900 border border-grid-line/80 shadow-2xl text-slate-200 font-sans space-y-6 relative overflow-hidden">
        {/* Official Header */}
        <div className="text-center pb-6 border-b border-slate-700/80 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Digital Evidence Certificate of Authenticity</span>
          </div>

          <h1 className="font-display text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            FORENSIC-X DIGITAL EVIDENCE AUDIT REPORT
          </h1>

          <p className="text-xs text-slate-400 font-mono">
            Compliant with Section 65B Indian Evidence Act (BSA Section 63) & Federal Rules of Evidence 902(11)/902(14)
          </p>
        </div>

        {/* Case Metadata Table */}
        {includedSections.metadata && (
          <div className="space-y-2">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <span>1. Judicial Case Coordinates</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[11px]">Case Reference ID:</span>
                <span className="text-white font-bold">{caseId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Certification Timestamp:</span>
                <span className="text-white">{currentDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Lead Forensic Examiner:</span>
                <span className="text-white font-semibold">{examinerName || 'Certified Digital Examiner'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Investigating Laboratory:</span>
                <span className="text-white">{examinerAgency || 'Digital Forensics Unit'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Physical Storage & Hashes */}
        {includedSections.hashes && (
          <div className="space-y-2">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <span>2. Physical Storage & Cryptographic Verification</span>
            </h2>
            <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-3 text-xs font-mono">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-white font-semibold">Master Disk Bitstream Image (mock_dvr.img)</div>
                  <div className="text-[11px] text-slate-400">153.6 MB &bull; 300,000 sectors &bull; Read-only acquisition</div>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>SEAL VERIFIED</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">SHA-256 Master Digest:</span>
                <HashChip hash="618ed08956f023966c63dd2416f7d8b2aa8f071dfa4835305f57d608215720d0" />
              </div>
            </div>
          </div>
        )}

        {/* Synchronization Matrix */}
        {includedSections.sync && (
          <div className="space-y-2">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <span>3. Multi-Camera Synchronization Calibration</span>
            </h2>
            <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/70 text-xs font-mono">
              <table className="w-full text-left">
                <thead className="bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 uppercase">
                  <tr>
                    <th className="p-2.5">Camera / Location</th>
                    <th className="p-2.5">Raw DVR Clock</th>
                    <th className="p-2.5">Calculated Offset</th>
                    <th className="p-2.5">Residual Error</th>
                    <th className="p-2.5">Anchor Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-[11px]">
                  <tr>
                    <td className="p-2.5 text-white font-semibold">CH 01: Main Entrance</td>
                    <td className="p-2.5 text-slate-400">21:40:00 UTC</td>
                    <td className="p-2.5 text-emerald-400">0.00s</td>
                    <td className="p-2.5">±0.05s</td>
                    <td className="p-2.5 text-slate-300">NTP Master Server</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-white font-semibold">CH 02: Aisle 4</td>
                    <td className="p-2.5 text-slate-400">21:40:04 UTC</td>
                    <td className="p-2.5 text-amber-400 font-bold">+4.00s (Fast)</td>
                    <td className="p-2.5">±0.05s</td>
                    <td className="p-2.5 text-slate-300">Optical Flash Anchor</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-white font-semibold">CH 03: Cash Counter</td>
                    <td className="p-2.5 text-slate-400">21:40:00 UTC</td>
                    <td className="p-2.5 text-emerald-400">0.00s</td>
                    <td className="p-2.5">±0.08s</td>
                    <td className="p-2.5 text-slate-300">Kernel Timestamp</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Evidence Extractions & Gaps */}
        {includedSections.findings && (
          <div className="space-y-2">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <span>4. Forensic Carving & Discontinuity Findings</span>
            </h2>
            <div className="space-y-2.5 text-xs font-mono">
              {/* Carved Clip Finding */}
              <div className="p-3 rounded-lg bg-violet-950/20 border border-violet-500/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-violet-300">
                    Finding #1: Restored Deleted Footage (SEG-002-DEL)
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/40">
                    SECTOR 254464
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                  Located proprietary signature MOCKDVR1 in raw unallocated space. Successfully stitched 180,000 bytes spanning 21:45:00 to 21:48:00 UTC on Channel 2 (Aisle 4). Validated decoded bitstream without corruption.
                </p>
                <div className="pt-1">
                  <HashChip hash="0b2b68603632cf4b64fcad18a6dfc9247d8ff60f04c6e9a7e6b0253457b3f25c" />
                </div>
              </div>

              {/* Hardware Gap Finding */}
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-300">
                    Finding #2: 908-Second Hardware Signal Disconnect (GAP-CH3-01)
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    80% CONFIDENCE
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                  Camera 3 (Cash Counter) ceased transmission from 21:40:02 to 21:55:10 UTC. DVR kernel log Video-Loss interrupt confirms physical carrier drop. Zero tampering or format records found; intentional deletion ruled out.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Custom Investigator Notes */}
        {customNotes && (
          <div className="space-y-1.5 border-t border-slate-800 pt-3">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
              5. Examiner Supplemental Commentary
            </h2>
            <p className="text-xs text-slate-300 font-sans leading-relaxed p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              {customNotes}
            </p>
          </div>
        )}

        {/* Examiner Signature & Digital Seal Block */}
        <div className="pt-6 border-t-2 border-slate-700 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <div>
              <div className="text-slate-400 text-[11px]">CERTIFICATION STATUS:</div>
              <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSealed ? 'CRYPTOGRAPHICALLY SEALED' : 'READY FOR COURT SEAL'}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-slate-400 text-[11px]">SECURITY TOKEN:</div>
              <div className="text-slate-300 text-[10px] font-mono">SHA-256 SEED VALIDATED</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-4">
            <div className="border-t border-slate-700 pt-2 text-[11px] font-mono text-slate-400">
              <span className="text-white font-semibold">{examinerName || 'Lead Examiner'}</span>
              <div>Examiner Signature & Bar ID</div>
            </div>
            <div className="border-t border-slate-700 pt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <div>
                <span className="text-white font-semibold">Digital Chain of Custody</span>
                <div>Forensic Science Laboratory Seal</div>
              </div>
              <Lock className="w-5 h-5 text-cyan-400 opacity-60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
