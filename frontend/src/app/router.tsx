import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LandingPage } from '@/features/landing/LandingPage';
import { DesignSystemPage } from '@/features/design/DesignSystemPage';
import { Shell } from '@/components/layout/Shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StateBadge } from '@/components/forensic/StateBadge';
import { CameraBadge } from '@/components/forensic/CameraBadge';
import { useAppStore } from '@/lib/store';
import {
  Clock,
  Video,
  ScanSearch,
  GitBranch,
  FileText,
  ArrowRight,
} from 'lucide-react';

/* --- Temporary Placeholder Screens for Phase F1 Shell Verification --- */

const DashboardView: React.FC = () => {
  const { currentCaseId, openInspector } = useAppStore();

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <span>Case Overview:</span>
            <span className="text-scan font-mono">{currentCaseId}</span>
          </h1>
          <p className="text-xs text-ink-soft mt-1">
            Retail Store Theft Investigation — Acquired 2026-10-17 21:40 UTC
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="verified">Integrity 100%</Badge>
          <Badge variant="scan">3 Cameras Mapped</Badge>
        </div>
      </div>

      {/* Summary Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card surface="console">
          <CardHeader className="pb-2">
            <CardDescription>Cameras Online</CardDescription>
            <CardTitle className="text-2xl font-mono text-scan">3 / 3</CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-ink-soft">
            Channels: Entrance, Aisle 4, Cash Counter
          </CardContent>
        </Card>

        <Card surface="console">
          <CardHeader className="pb-2">
            <CardDescription>Carved / Recovered</CardDescription>
            <CardTitle className="text-2xl font-mono text-recovered">1 Clip (60s)</CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-ink-soft">
            Recovered from unindexed disk blocks
          </CardContent>
        </Card>

        <Card surface="console">
          <CardHeader className="pb-2">
            <CardDescription>Identified Gaps</CardDescription>
            <CardTitle className="text-2xl font-mono text-gap">1 Disconnection</CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-ink-soft">
            Cam 3: 21:40:02 to 21:55:10 (80% confidence)
          </CardContent>
        </Card>

        <Card surface="console">
          <CardHeader className="pb-2">
            <CardDescription>Clock Calibration</CardDescription>
            <CardTitle className="text-2xl font-mono text-estimated">+4.0s Drift</CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-ink-soft">
            Camera 2 aligned with ± 1s uncertainty
          </CardContent>
        </Card>
      </div>

      {/* Quick Findings Feed */}
      <Card surface="console">
        <CardHeader>
          <CardTitle>Key Findings & Provenance Trace</CardTitle>
          <CardDescription>Click any finding to inspect its cryptographic chain of custody</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              id: 'FIND-01',
              title: 'Carved Deleted Segment (Incident Window)',
              kind: 'segment' as const,
              state: 'recovered' as const,
              channel: 1,
              location: 'Main Entrance',
              timeCorrected: '2026-10-17T21:42:00Z',
              timeOriginal: '21:42:00',
              hash: '8811aabbccddeeff00112233445566778899aabbccddeeff0011223344556677',
              frameRef: 'FR-41029',
              method: 'carved',
            },
            {
              id: 'FIND-02',
              title: 'Footage Gap Diagnosed as Camera Loss',
              kind: 'gap' as const,
              state: 'gap' as const,
              channel: 3,
              location: 'Cash Counter',
              timeCorrected: '2026-10-17T21:40:02Z',
              confidence: 0.8,
              evidenceFor: ['Video loss carrier dropped at 21:40:02', 'Reconnected at 21:55:10'],
              evidenceAgainst: ['No format or manual deletion logs found'],
            },
          ].map((f) => (
            <div
              key={f.id}
              onClick={() => openInspector(f)}
              className="p-3 rounded-control bg-raised/60 hover:bg-raised border border-edge hover:border-scan/40 flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <CameraBadge channel={f.channel} locationName={f.location} />
                <span className="font-semibold text-xs text-ink font-sans">{f.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <StateBadge state={f.state} />
                <ArrowRight className="w-3.5 h-3.5 text-ink-soft" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

const TimelineViewPlaceholder: React.FC = () => (
  <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
    <div className="flex items-center justify-between">
      <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
        <Clock className="w-5 h-5 text-scan" />
        <span>Multi-Camera Synchronized Timeline</span>
      </h1>
      <Badge variant="scan">Ready for Phase F3 Implementation</Badge>
    </div>
    <Card surface="console" className="p-12 text-center text-ink-soft">
      Timeline canvas with custom d3-scale / d3-zoom and Raw vs Corrected alignment switch.
      PlaybackStrip is active below.
    </Card>
  </div>
);

const CamerasViewPlaceholder: React.FC = () => (
  <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
    <div className="flex items-center justify-between">
      <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
        <Video className="w-5 h-5 text-scan" />
        <span>Camera Feeds</span>
      </h1>
      <Badge variant="scan">Phase F3 Tile Grid</Badge>
    </div>
    <Card surface="console" className="p-12 text-center text-ink-soft">
      Camera grid with SpotlightCard tiles and TargetCursor lock.
    </Card>
  </div>
);

const SearchViewPlaceholder: React.FC = () => (
  <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
    <div className="flex items-center justify-between">
      <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
        <ScanSearch className="w-5 h-5 text-scan" />
        <span>Cross-Camera Visual & Text Search</span>
      </h1>
      <Badge variant="scan">Phase F5 Query Composer</Badge>
    </div>
    <Card surface="console" className="p-12 text-center text-ink-soft">
      Search composer, ChromaGrid results, and PathView trajectory.
    </Card>
  </div>
);

const GraphViewPlaceholder: React.FC = () => (
  <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
    <div className="flex items-center justify-between">
      <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
        <GitBranch className="w-5 h-5 text-scan" />
        <span>Traceable Evidence Graph</span>
      </h1>
      <Badge variant="scan">Phase F6 React Flow</Badge>
    </div>
    <Card surface="console" className="p-12 text-center text-ink-soft">
      React Flow evidence graph linking Incident → Cameras → Segments → Hashes.
    </Card>
  </div>
);

const ReportViewPlaceholder: React.FC = () => (
  <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
    <div className="flex items-center justify-between">
      <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
        <FileText className="w-5 h-5 text-scan" />
        <span>Court Audit Report & Metrics</span>
      </h1>
      <Badge variant="scan">Phase F7 PDF Generator</Badge>
    </div>
    <Card surface="console" className="p-12 text-center text-ink-soft">
      Validation metrics and sealed PDF report export.
    </Card>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/design',
    element: <DesignSystemPage />,
  },
  {
    path: '/cases',
    element: <Shell />,
    children: [
      {
        index: true,
        element: <DashboardView />,
      },
      {
        path: ':caseId',
        element: <DashboardView />,
      },
      {
        path: ':caseId/timeline',
        element: <TimelineViewPlaceholder />,
      },
      {
        path: ':caseId/cameras',
        element: <CamerasViewPlaceholder />,
      },
      {
        path: ':caseId/search',
        element: <SearchViewPlaceholder />,
      },
      {
        path: ':caseId/graph',
        element: <GraphViewPlaceholder />,
      },
      {
        path: ':caseId/report',
        element: <ReportViewPlaceholder />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
