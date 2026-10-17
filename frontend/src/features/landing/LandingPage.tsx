import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DecryptedText } from '@/components/fx/DecryptedText';
import { ShinyText } from '@/components/fx/ShinyText';
import { SpotlightCard } from '@/components/fx/SpotlightCard';
import { BackgroundFx } from '@/components/fx/BackgroundFx';
import { FpsMeter } from '@/components/fx/FpsMeter';
import {
  ShieldCheck,
  Clock,
  RotateCcw,
  Search,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  Database,
  Lock,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-void text-ink font-sans selection:bg-scan/30 selection:text-ink relative overflow-hidden">
      <FpsMeter />

      {/* Top Navbar */}
      <header className="h-16 border-b border-edge/60 bg-console/80 backdrop-blur sticky top-0 z-40 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-control bg-void border border-scan/50 flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.25)]">
            <ShieldCheck className="w-5 h-5 text-scan" />
          </div>
          <span className="font-display font-bold text-base tracking-tight text-white">
            FORENSIC<span className="text-scan">-X</span>
          </span>
          <Badge variant="neutral" className="text-[10px] hidden sm:inline-flex">
            Code Apex Track 3
          </Badge>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs text-ink-soft">
          <a href="#problem" className="hover:text-scan transition-colors">The Problem</a>
          <a href="#pipeline" className="hover:text-scan transition-colors">Pipeline</a>
          <a href="#differentiators" className="hover:text-scan transition-colors">Differentiators</a>
          <Link to="/design" className="hover:text-scan transition-colors">Design System</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/cases/CASE-2026-APEX-01">
            <Button variant="primary" size="sm" className="font-semibold gap-1.5">
              <span>Open Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[82vh] flex flex-col justify-center items-center px-6 text-center border-b border-edge/40">
        <BackgroundFx className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#070B14_1px,transparent_1px),linear-gradient(to_bottom,#070B14_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        </BackgroundFx>

        <div className="relative z-10 max-w-4xl mx-auto space-y-6 pt-8 pb-12">
          {/* Badge pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-scan/10 border border-scan/30 text-scan text-xs font-mono select-none shadow-[0_0_15px_rgba(34,211,238,0.15)]">
            <Lock className="w-3 h-3 text-scan" />
            <span>Cryptographically Traceable CCTV Evidence Platform</span>
          </div>

          {/* Headline with DecryptedText */}
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-tight">
            <DecryptedText text="FORENSIC-X" speed={35} className="text-white" />
          </h1>

          {/* Rotating verbs */}
          <div className="font-mono text-xl sm:text-2xl md:text-3xl font-semibold text-scan tracking-wide">
            Recover. Verify. Align. Search.
          </div>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-ink-soft text-base sm:text-lg leading-relaxed font-sans">
            <ShinyText
              text="From hours of manual CCTV review to one searchable, connected, and court-traceable investigation workflow."
              speed={4}
            />
          </p>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/cases/CASE-2026-APEX-01">
              <Button variant="primary" size="lg" className="shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                <span>Launch Demo Investigation</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <Link to="/design">
              <Button variant="secondary" size="lg">
                <span>Explore Design System (/design)</span>
              </Button>
            </Link>
          </div>

          <div className="pt-2 text-[11px] font-mono text-ink-faint">
            Targeting Hikvision, Dahua, CP Plus & Proprietary DVR Recorder Systems
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="bg-console/70 border-b border-edge py-6 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { icon: Lock, label: 'Write-Blocked Acquisition', desc: 'Read-only byte preservation' },
            { icon: ShieldCheck, label: 'SHA-256 Provenance', desc: 'Root hash on every finding' },
            { icon: Clock, label: 'Temporal Calibration', desc: 'Offsets with ± error bounds' },
            { icon: FileCheck2, label: 'Court Admissibility', desc: 'Tamper-evident audit report' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-3 rounded-control bg-raised/40 border border-edge/60 flex flex-col items-center">
                <Icon className="w-5 h-5 text-scan mb-1.5" />
                <span className="font-semibold text-xs text-white font-sans">{item.label}</span>
                <span className="text-[11px] text-ink-soft mt-0.5">{item.desc}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Problem Statement Section */}
      <section id="problem" className="py-16 px-6 max-w-6xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="gap">The Real Problem</Badge>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Why CCTV Evidence Breaks in Court
          </h2>
          <p className="text-ink-soft text-sm">
            Investigating multi-vendor CCTV recorder footage today is slow, manual, and legally vulnerable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card surface="console" className="space-y-3">
            <CardHeader>
              <Database className="w-6 h-6 text-gap mb-1" />
              <CardTitle>Proprietary Vendor Silos</CardTitle>
              <CardDescription>
                Hikvision, Dahua, and CP Plus each use closed disk layouts and custom wrappers. Investigators juggle multiple clunky viewer tools.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card surface="console" className="space-y-3">
            <CardHeader>
              <RotateCcw className="w-6 h-6 text-recovered mb-1" />
              <CardTitle>Deleted Footage Overwritten</CardTitle>
              <CardDescription>
                DVR deletion only unindexes clips; raw video sectors remain until overwritten. Without deep carving, crucial evidence is missed.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card surface="console" className="space-y-3">
            <CardHeader>
              <Clock className="w-6 h-6 text-estimated mb-1" />
              <CardTitle>Camera Clock Drift</CardTitle>
              <CardDescription>
                Independent camera clocks drift by seconds or minutes. Without temporal normalization, cross-camera timelines are misleading.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* 6-Stage Forensic Pipeline */}
      <section id="pipeline" className="py-16 px-6 bg-console/40 border-t border-b border-edge">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="scan">Investigation Workflow</Badge>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              The 6-Stage Traceable Evidence Pipeline
            </h2>
            <p className="text-ink-soft text-sm">
              From raw byte intake to sealed court PDF report without breaking chain of custody.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                step: '01',
                title: 'Intake & Hashing',
                desc: 'Seized disk images are opened read-only and fingerprinted with SHA-256 before any analysis.',
                badge: 'Write-Blocked',
              },
              {
                step: '02',
                title: 'Vendor Adapter & Carving',
                desc: 'Adapter reads proprietary indexes; generic carver recovers unindexed deleted segments from raw blocks.',
                badge: 'Carving Engine',
              },
              {
                step: '03',
                title: 'Temporal Calibration',
                desc: 'Cross-references reference events to align unsynchronized clocks with honest ± uncertainty bounds.',
                badge: '± Error Margin',
              },
              {
                step: '04',
                title: 'Footage Gap Assessment',
                desc: 'Diagnoses missing video ranges into probabilistic causes (camera loss, power cut, manual deletion).',
                badge: 'Explainable AI',
              },
              {
                step: '05',
                title: 'Two-Pass Vision Search',
                desc: 'Cheap motion filtering + YOLO11n nano, followed by OSNet person re-ID and CLIP text search.',
                badge: 'Cross-Camera Re-ID',
              },
              {
                step: '06',
                title: 'Evidence Graph & Report',
                desc: 'Interactive DAG linking every finding to source hashes, sealed with one-click tamper-evident PDF export.',
                badge: 'Court-Ready',
              },
            ].map((st) => (
              <SpotlightCard key={st.step} surface="console">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xl font-bold text-scan">{st.step}</span>
                  <Badge variant="neutral" className="text-[10px] font-mono">{st.badge}</Badge>
                </div>
                <h3 className="font-sans font-semibold text-white text-base mb-1">{st.title}</h3>
                <p className="text-ink-soft text-xs leading-relaxed">{st.desc}</p>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiators Section */}
      <section id="differentiators" className="py-16 px-6 max-w-6xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="verified">Competitive Moats</Badge>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Four Engineering Differentiators
          </h2>
          <p className="text-ink-soft text-sm">
            What makes FORENSIC-X unique compared to traditional AI surveillance dashboards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SpotlightCard surface="raised" className="space-y-2">
            <div className="flex items-center gap-2 text-estimated font-mono text-sm font-semibold">
              <Clock className="w-4 h-4" />
              <span>1. Honest Temporal Uncertainty (± Bounds)</span>
            </div>
            <p className="text-xs text-ink-soft leading-relaxed">
              Every clock drifts. Rather than claiming impossible precision, FORENSIC-X computes camera offsets with realistic confidence bounds (e.g. <code>21:41:10 ± 4s</code>), upholding courtroom credibility.
            </p>
          </SpotlightCard>

          <SpotlightCard surface="raised" className="space-y-2">
            <div className="flex items-center gap-2 text-gap font-mono text-sm font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>2. Probabilistic Evidence Gap Diagnosis</span>
            </div>
            <p className="text-xs text-ink-soft leading-relaxed">
              Missing footage is diagnosed using log forensics, schedule matching, and neighboring sector residue. Gaps are reported as facts; causes are estimated with supporting and contradicting evidence.
            </p>
          </SpotlightCard>

          <SpotlightCard surface="raised" className="space-y-2">
            <div className="flex items-center gap-2 text-verified font-mono text-sm font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>3. Unbroken SHA-256 Evidence Anchors</span>
            </div>
            <p className="text-xs text-ink-soft leading-relaxed">
              Every bounding box crop, extracted keyframe, and timeline segment links back to the original seized recorder hash. Tampering at any point invalidates the evidence graph.
            </p>
          </SpotlightCard>

          <SpotlightCard surface="raised" className="space-y-2">
            <div className="flex items-center gap-2 text-lead font-mono text-sm font-semibold">
              <Search className="w-4 h-4" />
              <span>4. Two-Pass AI & Plausible Path Tracking</span>
            </div>
            <p className="text-xs text-ink-soft leading-relaxed">
              Motion gating eliminates 80%+ of empty frames before deep re-ID runs. Suspect trajectories are validated with walking-speed physics to flag impossible teleportation.
            </p>
          </SpotlightCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-edge bg-console py-10 px-6 text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-5 h-5 text-scan" />
          <span className="font-display font-bold text-white text-base">FORENSIC-X</span>
        </div>

        <p className="text-ink-soft text-xs max-w-md mx-auto leading-relaxed">
          Built by Team <strong>Claude Code</strong> (Lead: Sanskar Ghadge, <code>@Sanskar</code>) for the <strong>Code Apex Hackathon</strong> — Track 3: Open Innovation.
        </p>

        <div className="text-[11px] font-mono text-ink-faint">
          Open-Source Forensic Engine · Adapter Architecture with Generic Carver Fallback
        </div>
      </footer>
    </div>
  );
};
