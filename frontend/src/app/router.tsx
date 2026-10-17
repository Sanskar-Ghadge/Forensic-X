import React from 'react';
import { createBrowserRouter, Navigate, Link } from 'react-router-dom';
import { DesignSystemPage } from '@/features/design/DesignSystemPage';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, ArrowRight } from 'lucide-react';

const LandingPlaceholder: React.FC = () => {
  return (
    <div className="min-h-screen bg-void text-ink flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-16 h-16 rounded-full bg-scan/10 border border-scan/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
        <ShieldCheck className="w-8 h-8 text-scan" />
      </div>

      <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white mb-3">
        FORENSIC<span className="text-scan">-X</span>
      </h1>

      <p className="max-w-md text-ink-soft text-sm sm:text-base mb-8 font-sans">
        Digital forensics platform for multi-vendor CCTV video recovery, clock drift normalization, and hash-anchored evidence tracing.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link to="/design">
          <Button variant="primary" size="lg" className="group">
            <span>Explore Living Style Guide (/design)</span>
            <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>

      <div className="mt-12 text-xs font-mono text-ink-faint">
        Phase F0 Foundation & Design System Ready
      </div>
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPlaceholder />,
  },
  {
    path: '/design',
    element: <DesignSystemPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
