import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LandingPage } from '@/features/landing/LandingPage';
import { DesignSystemPage } from '@/features/design/DesignSystemPage';
import { Shell } from '@/components/layout/Shell';
import { CaseListPage } from '@/features/cases/CaseListPage';
import { IntakeWizardPage } from '@/features/cases/IntakeWizardPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Clock,
  Video,
  ScanSearch,
  GitBranch,
  FileText,
} from 'lucide-react';

/* --- Temporary Placeholder Screens for Subsequent Phases --- */

const TimelineViewPlaceholder: React.FC = () => (
  <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
    <div className="flex items-center justify-between">
      <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
        <Clock className="w-5 h-5 text-scan" />
        <span>Multi-Camera Synchronized Timeline</span>
      </h1>
      <Badge variant="scan">Phase F3 Canvas</Badge>
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
        element: <CaseListPage />,
      },
      {
        path: 'new',
        element: <IntakeWizardPage />,
      },
      {
        path: ':caseId',
        element: <DashboardPage />,
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

