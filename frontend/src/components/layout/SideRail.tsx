import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import {
  LayoutDashboard,
  FolderLock,
  Video,
  Clock,
  ScanSearch,
  GitBranch,
  FileText,
  Palette,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const SideRail: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { currentCaseId } = useAppStore();
  const location = useLocation();

  const navItems = [
    {
      to: `/cases/${currentCaseId}`,
      icon: LayoutDashboard,
      label: 'Dashboard',
    },
    {
      to: '/cases',
      icon: FolderLock,
      label: 'Cases',
    },
    {
      to: `/cases/${currentCaseId}/cameras`,
      icon: Video,
      label: 'Cameras',
    },
    {
      to: `/cases/${currentCaseId}/timeline`,
      icon: Clock,
      label: 'Timeline',
    },
    {
      to: `/cases/${currentCaseId}/search`,
      icon: ScanSearch,
      label: 'Search',
    },
    {
      to: `/cases/${currentCaseId}/graph`,
      icon: GitBranch,
      label: 'Evidence Graph',
    },
    {
      to: `/cases/${currentCaseId}/report`,
      icon: FileText,
      label: 'Audit Report',
    },
    {
      to: '/design',
      icon: Palette,
      label: 'Design System',
    },
  ];

  return (
    <TooltipProvider delayDuration={100}>
      <aside
        className={cn(
          'h-screen bg-console border-r border-edge flex flex-col justify-between transition-all duration-base z-30 select-none surface-depth',
          isExpanded ? 'w-60' : 'w-[72px]'
        )}
      >
        {/* Top: Brand Logo */}
        <div>
          <div className="h-16 flex items-center px-4 border-b border-edge/60 justify-between">
            <NavLink to="/" className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-control bg-void border border-scan/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(34,211,238,0.2)]">
                <ShieldCheck className="w-5 h-5 text-scan" />
              </div>
              {isExpanded && (
                <div className="flex flex-col truncate">
                  <span className="font-display font-bold text-sm tracking-tight text-white leading-none">
                    FORENSIC<span className="text-scan">-X</span>
                  </span>
                  <span className="text-[10px] font-mono text-ink-faint tracking-wider uppercase mt-1">
                    CCTV Investigation
                  </span>
                </div>
              )}
            </NavLink>

            {isExpanded && (
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="text-ink-soft hover:text-ink p-1 rounded hover:bg-raised transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-2 space-y-1.5 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to || (item.to !== '/cases' && location.pathname.startsWith(item.to));

              const linkContent = (
                <NavLink
                  to={item.to}
                  className={cn(
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-control font-sans text-xs font-medium transition-all duration-fast group',
                    isActive
                      ? 'bg-raised text-white font-semibold shadow-sm'
                      : 'text-ink-soft hover:text-ink hover:bg-raised/50'
                  )}
                >
                  {/* Cyan active marker on left */}
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-scan shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  )}

                  <Icon
                    className={cn(
                      'w-5 h-5 shrink-0 transition-colors',
                      isActive ? 'text-scan' : 'text-ink-soft group-hover:text-ink'
                    )}
                  />

                  {isExpanded && <span className="truncate">{item.label}</span>}
                </NavLink>
              );

              if (isExpanded) {
                return <div key={item.to}>{linkContent}</div>;
              }

              return (
                <Tooltip key={item.to}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium text-xs">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Collapse / Expand Toggle */}
        {!isExpanded && (
          <div className="p-3 border-t border-edge/60 flex justify-center">
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="p-2 rounded-control bg-raised/60 hover:bg-raised text-ink-soft hover:text-scan transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
};
