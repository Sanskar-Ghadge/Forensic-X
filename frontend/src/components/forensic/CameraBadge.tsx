import React from 'react';
import { cn } from '@/lib/utils';
import { Video } from 'lucide-react';

interface CameraBadgeProps {
  channel: number;
  locationName: string;
  status?: 'ok' | 'gaps' | 'offset_uncertain';
  className?: string;
}

export const CameraBadge: React.FC<CameraBadgeProps> = ({
  channel,
  locationName,
  status = 'ok',
  className,
}) => {
  const statusDots = {
    ok: 'bg-verified ring-verified/20',
    gaps: 'bg-gap ring-gap/20 animate-pulse',
    offset_uncertain: 'bg-estimated ring-estimated/20',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-2.5 py-1 rounded-control bg-console border border-edge select-none shadow-sm',
        className
      )}
    >
      <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-scan">
        <Video className="w-3.5 h-3.5 text-scan" />
        <span>CAM {channel}</span>
      </div>

      <span className="w-px h-3 bg-edge" />

      <span className="text-xs text-ink truncate max-w-[140px] font-medium font-sans">
        {locationName}
      </span>

      <span
        className={cn('w-2 h-2 rounded-full ring-2 shrink-0 ml-0.5', statusDots[status])}
        title={`Status: ${status}`}
      />
    </div>
  );
};
