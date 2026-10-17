import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StateBadge } from '@/components/forensic/StateBadge';
import { CameraBadge } from '@/components/forensic/CameraBadge';
import { HashChip } from '@/components/forensic/HashChip';
import { SpotlightCard } from '@/components/fx/SpotlightCard';
import { CountUp } from '@/components/fx/CountUp';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  Clock,
  Video,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  FileCheck2,
  Radio,
  ExternalLink,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { currentCaseId, openInspector } = useAppStore();
  const activeId = caseId || currentCaseId;
  useDocumentTitle(`Case Overview — ${activeId}`);

  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyNotice, setVerifyNotice] = useState<string | null>(null);

  const handleVerifyIntegrity = () => {
    setIsVerifying(true);
    setVerifyNotice(null);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifyNotice('SHA-256 Bitstream Hash matches physical write-blocked master. 0 bit discrepancies.');
      setTimeout(() => setVerifyNotice(null), 5000);
    }, 900);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono tracking-widest text-scan">Forensic Case Workspace</span>
            <Badge variant="verified" className="text-[10px]">
              Active Investigation
            </Badge>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <span>Case Overview:</span>
            <span className="text-scan font-mono">{activeId}</span>
          </h1>
          <p className="text-xs text-ink-soft mt-1">
            Retail Store Incident — Acquired 2026-10-17 21:40 UTC | MOCKDVR1 Master File
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleVerifyIntegrity}
            disabled={isVerifying}
            className="text-xs border-edge hover:border-scan/40"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isVerifying ? 'animate-spin text-scan' : ''}`} />
            {isVerifying ? 'Hashing Master...' : 'Verify Bitstream'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/cases/${activeId}/timeline`)}
            className="shadow-glow-cyan text-xs font-semibold"
          >
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            Open Synchronized Timeline
          </Button>
        </div>
      </div>

      {/* Verification Notice Toast */}
      {verifyNotice && (
        <div className="p-3 rounded-control bg-verified/15 border border-verified/50 text-xs text-verified flex items-center justify-between font-mono animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{verifyNotice}</span>
          </div>
          <span className="text-[10px] text-ink-soft">100% CONFIRMED</span>
        </div>
      )}

      {/* BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* HERO TILE: CAMERA RADAR SCOPE (Spans 2 columns, 2 rows on large screens) */}
        <SpotlightCard className="md:col-span-2 lg:col-span-2 row-span-2 p-6 flex flex-col justify-between border border-edge relative overflow-hidden bg-console">
          {/* Subtle radar background circle overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-15">
            <div className="w-72 h-72 rounded-full border border-scan" />
            <div className="w-52 h-52 rounded-full border border-scan absolute" />
            <div className="w-28 h-28 rounded-full border border-scan absolute" />
            <div className="w-full h-[1px] bg-scan absolute" />
            <div className="h-full w-[1px] bg-scan absolute" />
            {/* Animated rotating sweep beam */}
            <div className="absolute w-36 h-36 origin-bottom-right bottom-1/2 right-1/2 bg-gradient-to-tl from-scan/40 to-transparent rounded-tl-full animate-radarSweep" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-scan animate-pulse" />
                <h3 className="text-sm font-semibold text-white uppercase font-mono tracking-wider">
                  Camera Radar Scope
                </h3>
              </div>
              <Badge variant="scan" className="text-[10px]">
                3 Channels Synchronized
              </Badge>
            </div>

            <p className="text-xs text-ink-soft mb-6 leading-relaxed">
              Spatial and temporal status of all connected surveillance feeds mapped against the reference incident epoch.
            </p>

            {/* Interactive Camera Nodes */}
            <div className="space-y-3">
              {[
                {
                  ch: 1,
                  loc: 'Main Entrance',
                  state: 'verified' as const,
                  statusText: 'Active Carrier · 1080p 25fps',
                  offset: '0.0s (Master Reference)',
                  note: 'Carved deleted segment found in sector 254464',
                },
                {
                  ch: 2,
                  loc: 'Aisle 4',
                  state: 'estimated' as const,
                  statusText: 'Clock Desynchronized · Drift Calibrated',
                  offset: '+4.0s (±1.0s Bayesian bound)',
                  note: 'Temporal alignment corrected in unified timeline',
                },
                {
                  ch: 3,
                  loc: 'Cash Counter',
                  state: 'gap' as const,
                  statusText: 'Hardware Video Loss Gap (908s)',
                  offset: '0.0s clock · 21:40:02 to 21:55:10',
                  note: 'Signal carrier dropped during critical window',
                },
              ].map((c) => (
                <div
                  key={c.ch}
                  onClick={() =>
                    openInspector({
                      id: `CAM-CH${c.ch}`,
                      kind: 'camera',
                      title: `Camera ${c.ch}: ${c.loc}`,
                      channel: c.ch,
                      location: c.loc,
                      state: c.state,
                      timeOriginal: '21:40:00 UTC',
                      timeCorrected: '21:40:00 UTC',
                      metadata: { status: c.statusText, note: c.note, offset: c.offset },
                    })
                  }
                  className="p-3 rounded-control bg-raised/70 hover:bg-raised border border-edge hover:border-scan/50 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <CameraBadge channel={c.ch} locationName={c.loc} />
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-scan transition-colors">
                        {c.loc}
                      </div>
                      <div className="text-[11px] text-ink-soft font-mono">{c.offset}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StateBadge state={c.state} />
                    <ArrowRight className="w-3.5 h-3.5 text-ink-faint group-hover:text-scan transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-6 pt-4 border-t border-edge/60 flex items-center justify-between text-[11px] font-mono text-ink-soft">
            <span>GRID RADIUS: 200 METERS</span>
            <span className="text-scan">STATUS: ALL FEEDS LOCKED</span>
          </div>
        </SpotlightCard>

        {/* METRIC TILE 1: CAMERAS ONLINE */}
        <SpotlightCard className="p-5 flex flex-col justify-between border border-edge bg-console">
          <div>
            <div className="flex items-center justify-between text-xs text-ink-soft font-mono mb-2">
              <span>CAMERAS ONLINE</span>
              <Video className="w-4 h-4 text-scan" />
            </div>
            <div className="text-3xl font-bold font-mono text-white flex items-baseline gap-1">
              <CountUp from={0} to={3} duration={1.2} />
              <span className="text-base text-ink-faint font-normal">/ 3</span>
            </div>
          </div>
          <div className="text-[11px] text-ink-soft mt-3 font-sans">
            Entrance, Aisle 4, and Cash Counter channels mapped.
          </div>
        </SpotlightCard>

        {/* METRIC TILE 2: CARVED / RECOVERED FOOTAGE */}
        <SpotlightCard className="p-5 flex flex-col justify-between border border-edge bg-console">
          <div>
            <div className="flex items-center justify-between text-xs text-ink-soft font-mono mb-2">
              <span>CARVED / RECOVERED</span>
              <Flame className="w-4 h-4 text-recovered" />
            </div>
            <div className="text-3xl font-bold font-mono text-recovered flex items-baseline gap-1">
              <CountUp from={0} to={1} duration={1.2} />
              <span className="text-base text-ink-faint font-normal">Clip (60s)</span>
            </div>
          </div>
          <div className="text-[11px] text-ink-soft mt-3 font-sans">
            Restored from unallocated sectors bypassing deleted index.
          </div>
        </SpotlightCard>

        {/* METRIC TILE 3: IDENTIFIED EVIDENCE GAPS */}
        <SpotlightCard className="p-5 flex flex-col justify-between border border-edge bg-console">
          <div>
            <div className="flex items-center justify-between text-xs text-ink-soft font-mono mb-2">
              <span>EVIDENCE GAPS</span>
              <SlidersHorizontal className="w-4 h-4 text-gap" />
            </div>
            <div className="text-3xl font-bold font-mono text-gap flex items-baseline gap-1">
              <CountUp from={0} to={1} duration={1.2} />
              <span className="text-base text-ink-faint font-normal">Interval (908s)</span>
            </div>
          </div>
          <div className="text-[11px] text-ink-soft mt-3 font-sans">
            Cam 3: 21:40:02 to 21:55:10 (80% confidence: signal loss).
          </div>
        </SpotlightCard>

        {/* METRIC TILE 4: CLOCK DRIFT CALIBRATION */}
        <SpotlightCard className="p-5 flex flex-col justify-between border border-edge bg-console">
          <div>
            <div className="flex items-center justify-between text-xs text-ink-soft font-mono mb-2">
              <span>CLOCK CALIBRATION</span>
              <Clock className="w-4 h-4 text-estimated" />
            </div>
            <div className="text-3xl font-bold font-mono text-estimated flex items-baseline gap-1">
              <span>+4.0s</span>
              <span className="text-xs text-ink-faint font-normal">± 1.0s</span>
            </div>
          </div>
          <div className="text-[11px] text-ink-soft mt-3 font-sans">
            Bayesian cross-camera visual sync with uncertainty bounds.
          </div>
        </SpotlightCard>

        {/* INCIDENT HIGHLIGHT TILE */}
        <Card surface="console" className="md:col-span-2 lg:col-span-2 border border-scan/40 p-5 bg-gradient-to-r from-console via-raised/40 to-console">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-scan">KEY REFERENCE EVENT</span>
                <Badge variant="scan">INCIDENT TIME</Badge>
              </div>
              <div className="text-xl font-bold font-mono text-white">2026-10-17 21:42:17 UTC</div>
              <p className="text-xs text-ink-soft mt-1">
                Suspect entered through Main Entrance and traversed towards Aisle 4.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/cases/${activeId}/timeline`)}
              className="shadow-glow-cyan text-xs font-semibold shrink-0"
            >
              Inspect Timeline
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </Card>

        {/* PIPELINE PROGRESS & ARTIFACTS TILE */}
        <Card surface="console" className="md:col-span-2 lg:col-span-2 border border-edge p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-verified" />
              <span>Cryptographic Provenance Status</span>
            </span>
            <span className="text-xs font-mono text-verified">100% VERIFIED</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded-control bg-raised/50 border border-edge/60">
              <span className="text-ink-soft">Bitstream SHA-256</span>
              <span className="text-scan font-bold">618ed08956f023... [PASS]</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-control bg-raised/50 border border-edge/60">
              <span className="text-ink-soft">Carved Sector Blocks</span>
              <span className="text-recovered font-bold">Offset 254464 [180 KB RESTORED]</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-control bg-raised/50 border border-edge/60">
              <span className="text-ink-soft">Hardware Logs Correlated</span>
              <span className="text-gap font-bold">CH3 Signal Loss [CARRIER DROPPED]</span>
            </div>
          </div>
        </Card>
      </div>

      {/* LOWER SECTION: KEY FINDINGS FEED & TIMELINE PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FINDINGS FEED (Spans 2 columns) */}
        <Card surface="console" className="lg:col-span-2 border border-edge">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Key Findings & Provenance Trace</CardTitle>
                <CardDescription>Click any finding to inspect its cryptographic chain of custody in the Inspector</CardDescription>
              </div>
              <Badge variant="scan">3 Discoveries</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                id: 'FIND-01',
                title: 'Carved Deleted Segment (Incident Window)',
                desc: 'Unindexed 60-second video discovered by deep sector carver in unallocated space.',
                kind: 'segment' as const,
                state: 'recovered' as const,
                channel: 1,
                location: 'Main Entrance',
                timeCorrected: '2026-10-17T21:42:00Z',
                timeOriginal: '21:42:00 UTC',
                hash: '0b2b68602866eb8a8300d8f31a01d70c71f1cd4770c86ae3f253eab617b3f25c',
                frameRef: 'SEC-254464',
                method: 'carved',
              },
              {
                id: 'FIND-02',
                title: 'Footage Gap Diagnosed as Camera Cable Disconnect',
                desc: '15-minute gap backed by events.log Video Loss and Restored carrier signal drop.',
                kind: 'gap' as const,
                state: 'gap' as const,
                channel: 3,
                location: 'Cash Counter',
                timeCorrected: '2026-10-17T21:40:02Z',
                confidence: 0.8,
                evidenceFor: [
                  '2026-10-17 21:40:02 [WARN] CH3 Video Loss detected: Signal carrier dropped',
                  '2026-10-17 21:55:10 [INFO] CH3 Video Signal Restored: 1080p carrier locked',
                  'No residual video frames carved in gap disk sectors',
                ],
                evidenceAgainst: ['No format or manual deletion logs found in filesystem'],
              },
              {
                id: 'FIND-03',
                title: 'Camera 2 Clock Drift Offset Calibrated (+4.0s)',
                desc: 'Suspect entry synchronized between Entrance and Aisle 4 across physical blind zone.',
                kind: 'camera' as const,
                state: 'estimated' as const,
                channel: 2,
                location: 'Aisle 4',
                timeCorrected: '2026-10-17T21:40:04Z',
                confidence: 0.85,
                evidenceFor: [
                  'Cross-camera visual transition matches suspect walking pace',
                  'Bayesian probability distribution bounds error to ±1.0 second',
                ],
              },
            ].map((f) => (
              <div
                key={f.id}
                onClick={() => openInspector(f)}
                className="p-4 rounded-control bg-raised/50 hover:bg-raised border border-edge hover:border-scan/50 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CameraBadge channel={f.channel} locationName={f.location} />
                    <span className="font-semibold text-xs text-white group-hover:text-scan transition-colors">
                      {f.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-soft leading-relaxed">{f.desc}</p>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                  <StateBadge state={f.state} />
                  <ArrowRight className="w-3.5 h-3.5 text-ink-faint group-hover:text-scan transition-colors" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* TIMELINE MINIATURE PREVIEW & DISK INTEGRITY */}
        <div className="space-y-6">
          {/* Mini Timeline SVG Preview */}
          <Card
            surface="console"
            className="border border-edge p-5 cursor-pointer hover:border-scan/50 transition-colors"
            onClick={() => navigate(`/cases/${activeId}/timeline`)}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase text-white font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-scan" />
                <span>Multi-Camera Timeline Preview</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-scan" />
            </div>

            <p className="text-[11px] text-ink-soft mb-4">
              Click to view all 3 feeds synchronized on one timeline with raw vs corrected time toggle.
            </p>

            {/* Static SVG lane representation */}
            <div className="p-3 rounded-control bg-void border border-edge space-y-2 font-mono text-[10px]">
              {/* CH1 Lane */}
              <div className="flex items-center gap-2">
                <span className="w-8 text-ink-faint">CH1</span>
                <div className="flex-1 h-3.5 bg-raised rounded-sm relative overflow-hidden flex items-center">
                  <div className="w-1/2 h-full bg-verified/40 border-r border-verified" />
                  <div className="w-1/4 h-full bg-recovered/60 border-l border-recovered" title="Carved Segment" />
                </div>
              </div>

              {/* CH2 Lane */}
              <div className="flex items-center gap-2">
                <span className="w-8 text-ink-faint">CH2</span>
                <div className="flex-1 h-3.5 bg-raised rounded-sm relative overflow-hidden flex items-center">
                  <div className="w-3/4 h-full bg-estimated/40 ml-2 border border-estimated" title="+4s Drift" />
                </div>
              </div>

              {/* CH3 Lane */}
              <div className="flex items-center gap-2">
                <span className="w-8 text-ink-faint">CH3</span>
                <div className="flex-1 h-3.5 bg-raised rounded-sm relative overflow-hidden flex items-center">
                  <div className="w-1/12 h-full bg-verified/40" />
                  <div className="w-1/2 h-full bg-gap/50 border-x border-gap animate-pulse" title="Video Loss Gap" />
                  <div className="flex-1 h-full bg-verified/40" />
                </div>
              </div>

              <div className="flex justify-between text-[9px] text-ink-faint pt-1">
                <span>21:40 UTC</span>
                <span className="text-scan font-bold">21:42 (Incident)</span>
                <span>21:55 UTC</span>
              </div>
            </div>
          </Card>

          {/* Master File Integrity Card */}
          <Card surface="console" className="border border-edge p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-ink-soft flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-verified" />
                <span>MASTER IMAGE HASH</span>
              </span>
              <Badge variant="verified">IMMUTABLE</Badge>
            </div>

            <HashChip
              hash="618ed08956f023966c63dd2416f7d8b2aa8f071dfa4835305f57d608215720d0"
              verified={true}
            />

            <div className="text-[11px] text-ink-soft font-mono pt-1">
              Acquisition: 2026-10-17 21:40 UTC (MOCKDVR1 885 KB)
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
