import React, { useState } from 'react';
import { useMotion, MotionMode } from '@/hooks/useMotion';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Panel } from '@/components/ui/Panel';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';
import { HashChip } from '@/components/forensic/HashChip';
import { TimeCode } from '@/components/forensic/TimeCode';
import { StateBadge, ForensicState } from '@/components/forensic/StateBadge';
import { ConfidenceBar } from '@/components/forensic/ConfidenceBar';
import { CameraBadge } from '@/components/forensic/CameraBadge';
import { ProvenanceLink } from '@/components/forensic/ProvenanceLink';
import { Animated } from '@/components/fx/Animated';
import { BackgroundFx } from '@/components/fx/BackgroundFx';
import { FpsMeter } from '@/components/fx/FpsMeter';
import { DecryptedText } from '@/components/fx/DecryptedText';
import { CountUp } from '@/components/fx/CountUp';
import { SpotlightCard } from '@/components/fx/SpotlightCard';
import { ShinyText } from '@/components/fx/ShinyText';
import { ShieldCheck, Activity, Zap, Layers, RefreshCw, Sparkles } from 'lucide-react';

export const DesignSystemPage: React.FC = () => {
  const { mode, setMotionMode } = useMotion();
  const [selectedProvenance, setSelectedProvenance] = useState<string | null>(null);

  const sampleSha = 'a3b9c8d1e2f34567890abcdef1234567890abcdef1234567890abcdef12345678';

  const states: ForensicState[] = [
    'verified',
    'recovered',
    'partial',
    'estimated',
    'gap',
    'lead',
    'undetermined',
  ];

  return (
    <div className="min-h-screen bg-void text-ink p-6 md:p-10 font-sans space-y-12 max-w-7xl mx-auto">
      <FpsMeter />

      {/* Header & Motion Mode Control */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-edge">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
              <span className="text-scan">FORENSIC-X</span>
              <span className="text-ink-soft text-lg font-mono font-normal">/ Design System</span>
            </h1>
            <Badge variant="scan">Phase F0 Spec</Badge>
          </div>
          <p className="text-ink-soft text-sm mt-1">
            "Evidence Room" Design tokens, forensic provenance primitives, and animation safety layer.
          </p>
        </div>

        {/* Live Motion Mode Switcher */}
        <div className="flex items-center gap-2 p-1 bg-console rounded-control border border-edge">
          <span className="text-xs font-mono text-ink-soft px-2">Motion:</span>
          {(['full', 'reduced', 'off'] as MotionMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMotionMode(m)}
              className={`px-3 py-1 rounded text-xs font-mono capitalize transition-colors ${
                mode === m
                  ? 'bg-scan text-on-accent font-semibold shadow-sm'
                  : 'text-ink-soft hover:text-ink'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </header>

      {/* Section 1: Color System & Tokens */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-scan font-mono text-sm tracking-wide">
          <Layers className="w-4 h-4" />
          <span>01. EVIDENCE ROOM COLOR SYSTEM</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { token: '--bg-void', hex: '#070B14', name: 'Void', role: 'Canvas Backdrop', border: 'border-edge' },
            { token: '--bg-console', hex: '#0D1424', name: 'Console', role: 'Panels & Side Rail', border: 'border-edge' },
            { token: '--bg-raised', hex: '#121C31', name: 'Raised', role: 'Cards & Popovers', border: 'border-edge' },
            { token: '--edge', hex: '#223152', name: 'Edge', role: 'Borders & Dividers', border: 'border-edge' },
            { token: '--scan', hex: '#22D3EE', name: 'Scan Cyan', role: 'Primary Action / Focus', bg: 'bg-scan', text: 'text-on-accent' },
            { token: '--verified', hex: '#34D399', name: 'Verified', role: 'Hash OK / Evidence Intact', bg: 'bg-verified', text: 'text-on-accent' },
            { token: '--recovered', hex: '#A78BFA', name: 'Recovered', role: 'Carved Raw Video', bg: 'bg-recovered', text: 'text-on-accent' },
            { token: '--estimated', hex: '#FBBF24', name: 'Estimated', role: 'Drift ± Bounds', bg: 'bg-estimated', text: 'text-on-accent' },
            { token: '--gap', hex: '#FB7185', name: 'Gap / Loss', role: 'Missing / Tampered Footage', bg: 'bg-gap', text: 'text-on-accent' },
            { token: '--lead', hex: '#60A5FA', name: 'AI Lead', role: 'Detection / Re-ID match', bg: 'bg-lead', text: 'text-on-accent' },
            { token: '--ink', hex: '#E8EEF9', name: 'Ink Primary', role: 'High contrast text', bg: 'bg-ink', text: 'text-void' },
            { token: '--ink-soft', hex: '#A3B1C8', name: 'Ink Soft', role: 'Secondary metadata', bg: 'bg-ink-soft', text: 'text-void' },
            { token: '--ink-faint', hex: '#6B7C99', name: 'Ink Faint', role: 'Captions / Timers', bg: 'bg-ink-faint', text: 'text-void' },
            { token: '--on-accent', hex: '#04121A', name: 'On-Accent', role: 'Contrast text on fill', bg: 'bg-on-accent', text: 'text-scan', border: 'border-edge' },
          ].map((c) => (
            <div key={c.token} className={`p-3 rounded-control border ${c.border || 'border-transparent'} bg-console flex flex-col justify-between`}>
              <div
                className="w-full h-10 rounded mb-2 flex items-center justify-center font-mono text-xs font-semibold"
                style={{ backgroundColor: c.hex, color: c.hex === '#E8EEF9' || c.hex === '#A3B1C8' || c.hex === '#6B7C99' ? '#070B14' : c.hex === '#070B14' || c.hex === '#0D1424' || c.hex === '#121C31' || c.hex === '#223152' ? '#E8EEF9' : '#04121A' }}
              >
                {c.hex}
              </div>
              <div>
                <div className="font-semibold text-xs text-ink">{c.name}</div>
                <div className="text-[10px] font-mono text-ink-faint">{c.token}</div>
                <div className="text-[10px] text-ink-soft mt-1 truncate">{c.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Forensic Provenance Components */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-scan font-mono text-sm tracking-wide">
          <ShieldCheck className="w-4 h-4" />
          <span>02. SHARED FORENSIC PROVENANCE COMPONENTS (CRITICAL)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* State Badges */}
          <Card surface="console">
            <CardHeader>
              <CardTitle>StateBadge: Mandatory Non-Color Cues</CardTitle>
              <CardDescription>
                Never represented by color alone; every state incorporates an authoritative icon and textual label.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {states.map((s) => (
                  <StateBadge key={s} state={s} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hashes & TimeCodes */}
          <Card surface="console">
            <CardHeader>
              <CardTitle>HashChip & TimeCode</CardTitle>
              <CardDescription>
                Shortened monospace hashes with instant copy-to-clipboard and honest temporal bounds (± error).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <HashChip hash={sampleSha} verified={true} />
                <HashChip hash="3b819f72c0a94d8e1234567890abcdef1234567890abcdef1234567890abcdef" verified={false} />
                <HashChip hash="ff00112233445566778899aabbccddeeff00112233445566778899aabbccdde" mismatch={true} />
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <TimeCode time="2026-10-17T21:42:17Z" showIcon />
                <TimeCode time="2026-10-17T21:42:17Z" uncertaintyS={4} isEstimated showIcon />
                <TimeCode time={78137} uncertaintyS={1} rawTime="21:42:21" />
              </div>
            </CardContent>
          </Card>

          {/* Camera Badge & Confidence */}
          <Card surface="console">
            <CardHeader>
              <CardTitle>CameraBadge & ConfidenceBar</CardTitle>
              <CardDescription>
                Channel pills with status indicator dots; confidence bars never display bare percentages without the "estimate" qualification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <CameraBadge channel={1} locationName="Main Entrance" status="ok" />
                <CameraBadge channel={2} locationName="Aisle 4 (East)" status="offset_uncertain" />
                <CameraBadge channel={3} locationName="Cash Counter" status="gaps" />
              </div>

              <div className="space-y-2 pt-2">
                <div className="text-xs text-ink-soft">Likely Disconnection:</div>
                <ConfidenceBar confidence={0.8} label="estimate" />
                <div className="text-xs text-ink-soft pt-1">Person Re-ID Similarity:</div>
                <ConfidenceBar confidence={0.64} label="AI lead match" />
              </div>
            </CardContent>
          </Card>

          {/* ProvenanceLink */}
          <Card surface="console">
            <CardHeader>
              <CardTitle>ProvenanceLink & Evidence Tracing</CardTitle>
              <CardDescription>
                Guarantees every UI element connects back to seized disk image sector, frame index, and hash.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <ProvenanceLink
                  sourceHash={sampleSha}
                  frameRef="FR-41029"
                  onClick={() => setSelectedProvenance(`Frame 41029 on Hash ${sampleSha.slice(0, 12)}...`)}
                />
                <ProvenanceLink
                  sourceHash={sampleSha}
                  frameRef="GAP-003"
                  onClick={() => setSelectedProvenance('Evidence gap 21:40:02 to 21:55:10 (Cam 3)')}
                />
              </div>

              {selectedProvenance && (
                <div className="p-2.5 rounded bg-raised border border-scan/30 text-xs font-mono text-scan">
                  Selected Evidence Anchor: {selectedProvenance}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section 3: Base UI Primitives */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-scan font-mono text-sm tracking-wide">
          <Activity className="w-4 h-4" />
          <span>03. BASE UI PRIMITIVES</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Buttons */}
          <Card surface="console" className="space-y-4">
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Primary scan, secondary edge, ghost, and danger.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="primary" size="sm">Primary SM</Button>
              <Button variant="primary" size="md">Primary MD</Button>
              <Button variant="secondary" size="md">Secondary</Button>
              <Button variant="ghost" size="md">Ghost</Button>
              <Button variant="danger" size="md">Danger</Button>
              <Button variant="primary" size="md" isLoading>Analyzing...</Button>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card surface="console" className="space-y-4">
            <CardHeader>
              <CardTitle>Generic Badges</CardTitle>
              <CardDescription>Status pills for intake and metadata.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge variant="scan">Scan Active</Badge>
              <Badge variant="verified">Hash 100%</Badge>
              <Badge variant="recovered">10 Clips Carved</Badge>
              <Badge variant="estimated">± 1.2s Drift</Badge>
              <Badge variant="gap">Gap Logged</Badge>
              <Badge variant="lead">Re-ID Match</Badge>
              <Badge variant="neutral">Read-Only</Badge>
            </CardContent>
          </Card>

          {/* Skeletons & Shimmer */}
          <Card surface="console" className="space-y-4">
            <CardHeader>
              <CardTitle>Skeletons & Shimmer</CardTitle>
              <CardDescription>Cyan-tinted loading placeholders.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full rounded-control" />
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Panel title="Forensic Segments Sample Table (Table Component)">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Camera</TableHead>
                <TableHead>Corrected Timestamp</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>SHA-256 Hash</TableHead>
                <TableHead>Provenance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold text-scan">CAM 1</TableCell>
                <TableCell><TimeCode time="2026-10-17T21:40:00Z" /></TableCell>
                <TableCell className="font-mono text-xs">120s</TableCell>
                <TableCell><StateBadge state="verified" /></TableCell>
                <TableCell className="font-mono text-xs text-ink-soft">Index Table</TableCell>
                <TableCell><HashChip hash="9f82d1c7a4e6b528104829adcbef0192837465ab12cd34ef56ab78cd90ef1234" /></TableCell>
                <TableCell><ProvenanceLink frameRef="SEG-001" /></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold text-scan">CAM 1</TableCell>
                <TableCell><TimeCode time="2026-10-17T21:42:00Z" isEstimated uncertaintyS={1} /></TableCell>
                <TableCell className="font-mono text-xs">45s</TableCell>
                <TableCell><StateBadge state="recovered" /></TableCell>
                <TableCell className="font-mono text-xs text-recovered">Carved (Raw Block)</TableCell>
                <TableCell><HashChip hash="8811aabbccddeeff00112233445566778899aabbccddeeff0011223344556677" /></TableCell>
                <TableCell><ProvenanceLink frameRef="CRV-019" /></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold text-scan">CAM 3</TableCell>
                <TableCell><TimeCode time="2026-10-17T21:40:02Z" isEstimated uncertaintyS={0.5} /></TableCell>
                <TableCell className="font-mono text-xs text-gap">15m 08s</TableCell>
                <TableCell><StateBadge state="gap" label="Disconnected" /></TableCell>
                <TableCell className="font-mono text-xs text-ink-soft">Video Loss Log</TableCell>
                <TableCell><span className="text-xs text-ink-faint font-mono">No video data</span></TableCell>
                <TableCell><ProvenanceLink frameRef="LOG-441" /></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Panel>
      </section>

      {/* Section 4: Motion Safety Layer Demonstration */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-scan font-mono text-sm tracking-wide">
          <Zap className="w-4 h-4" />
          <span>04. ANIMATION SAFETY LAYER (useMotion, Animated, BackgroundFx)</span>
        </div>

        <Card surface="console">
          <CardHeader>
            <CardTitle>Active Motion Mode: <span className="uppercase text-scan">{mode}</span></CardTitle>
            <CardDescription>
              Toggle the motion mode above to observe how dynamic components swap immediately to zero-cost static representations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-32 w-full rounded-control border border-edge overflow-hidden relative">
              <BackgroundFx className="flex items-center justify-center p-6 text-center">
                <Animated
                  fallback={
                    <div className="text-ink-soft font-mono text-sm">
                      [Static Mode Active] Heavy WebGL shaders and continuous ticker loops disabled.
                    </div>
                  }
                >
                  <div className="flex items-center gap-3 animate-pulse text-scan font-mono text-sm">
                    <RefreshCw className="w-4 h-4 animate-spin text-scan" />
                    <span>Dynamic Radar & Scanner Shader Active (Full Motion Mode)</span>
                  </div>
                </Animated>
              </BackgroundFx>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 5: React Bits Components (F0.7) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-scan font-mono text-sm tracking-wide">
          <Sparkles className="w-4 h-4" />
          <span>05. FIRST REACT BITS COMPONENTS (PHASE F0.7)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Spotlight Card */}
          <SpotlightCard surface="console">
            <div className="font-sans font-semibold text-white text-base mb-1">SpotlightCard</div>
            <div className="text-xs text-ink-soft mb-4">
              Mouse-following soft radial spotlight in scan-cyan tint.
            </div>
            <div className="p-3 rounded bg-void/60 border border-edge/60 text-xs font-mono text-scan">
              Hover pointer here to see lighting
            </div>
          </SpotlightCard>

          {/* Decrypted Text */}
          <Card surface="console">
            <CardHeader>
              <CardTitle>DecryptedText</CardTitle>
              <CardDescription>Resolves random glyphs into authoritative strings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-lg font-bold text-white font-mono">
                <DecryptedText text="FORENSIC-X TRACEABLE" speed={40} />
              </div>
              <div className="text-xs text-ink-soft font-mono">
                SHA: <DecryptedText text="e3b0c44298fc1c149afbf4c8996fb924" speed={30} />
              </div>
              <div className="text-[11px] text-ink-faint">Hover over text to re-trigger decryption</div>
            </CardContent>
          </Card>

          {/* CountUp & ShinyText */}
          <Card surface="console">
            <CardHeader>
              <CardTitle>CountUp & ShinyText</CardTitle>
              <CardDescription>Metrics odometer & sweeping sheen.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs text-ink-soft mb-1">Odometer Count Up:</div>
                <div className="text-2xl font-bold text-verified font-mono">
                  <CountUp to={90} suffix="% Recovery" duration={1.6} />
                </div>
              </div>

              <div>
                <div className="text-xs text-ink-soft mb-1">Gradient Sheen Text:</div>
                <div className="text-sm font-semibold">
                  <ShinyText text="Tamper-Evident Court Admissible Evidence" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};
