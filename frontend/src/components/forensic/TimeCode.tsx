import React from 'react';
import { formatTimeCode } from '@/lib/time';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface TimeCodeProps {
  time: string | number;
  uncertaintyS?: number;
  isEstimated?: boolean;
  rawTime?: string;
  showIcon?: boolean;
  className?: string;
}

export const TimeCode: React.FC<TimeCodeProps> = ({
  time,
  uncertaintyS,
  isEstimated = false,
  rawTime,
  showIcon = false,
  className,
}) => {
  const formatted = formatTimeCode(time);
  const hasUncertainty = uncertaintyS !== undefined && uncertaintyS !== null && uncertaintyS > 0;
  const showHatchedUnderline = isEstimated || hasUncertainty;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-mono text-xs tabular-nums tracking-tight',
        showHatchedUnderline && 'border-b border-dashed border-estimated/80 text-ink',
        className
      )}
      title={
        rawTime
          ? `Corrected: ${formatted} (Raw recorded: ${rawTime})`
          : hasUncertainty
          ? `Estimated timestamp with ±${uncertaintyS}s uncertainty`
          : 'Normalized timestamp'
      }
    >
      {showIcon && <Clock className="w-3.5 h-3.5 text-ink-soft shrink-0" />}
      <span>{formatted}</span>
      {hasUncertainty && (
        <span className="text-estimated font-medium">
          ± {uncertaintyS}s
        </span>
      )}
    </span>
  );
};
