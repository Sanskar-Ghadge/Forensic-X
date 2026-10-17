import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Shell } from '@/components/layout/Shell';
import { LoadingFallback } from '@/components/layout/LoadingFallback';

// Immediate entry views
import { LandingPage } from '@/features/landing/LandingPage';
import { CaseListPage } from '@/features/cases/CaseListPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';

// Code-split heavy views for performance budget (LCP < 1.2s)
const DesignSystemPage = lazy(() =>
  import('@/features/design/DesignSystemPage').then((m) => ({ default: m.DesignSystemPage }))
);
const IntakeWizardPage = lazy(() =>
  import('@/features/cases/IntakeWizardPage').then((m) => ({ default: m.IntakeWizardPage }))
);
const TimelinePage = lazy(() =>
  import('@/features/timeline/TimelinePage').then((m) => ({ default: m.TimelinePage }))
);
const CamerasPage = lazy(() =>
  import('@/features/cameras/CamerasPage').then((m) => ({ default: m.CamerasPage }))
);
const SearchPage = lazy(() =>
  import('@/features/search/SearchPage').then((m) => ({ default: m.SearchPage }))
);
const GraphPage = lazy(() =>
  import('@/features/graph/GraphPage').then((m) => ({ default: m.GraphPage }))
);
const ReportPage = lazy(() =>
  import('@/features/report/ReportPage').then((m) => ({ default: m.ReportPage }))
);

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/design',
    element: withSuspense(DesignSystemPage),
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
        element: withSuspense(IntakeWizardPage),
      },
      {
        path: ':caseId',
        element: <DashboardPage />,
      },
      {
        path: ':caseId/timeline',
        element: withSuspense(TimelinePage),
      },
      {
        path: ':caseId/cameras',
        element: withSuspense(CamerasPage),
      },
      {
        path: ':caseId/search',
        element: withSuspense(SearchPage),
      },
      {
        path: ':caseId/graph',
        element: withSuspense(GraphPage),
      },
      {
        path: ':caseId/report',
        element: withSuspense(ReportPage),
      },
      {
        path: ':caseId/metrics',
        element: withSuspense(ReportPage),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);


