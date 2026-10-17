import React from 'react';
import { cn } from '@/lib/utils';

interface ConfidenceBarProps {
  confidence: number; // 0 to 1 or 0 to 100
  label?: string;
  className?: string;
}

export const ConfidenceBar: React.FC<ConfidenceBarProps> = ({
  confidence,
  label = 'estimate',
  className,
}) => {
  // Normalize to 0-100
  const percent = Math.min(100, Math.max(0, confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence)));

  const barColor =
    percent >= 75
      ? 'bg-verified'
      : percent >= 50
      ? 'bg-scan'
      : percent >= 30
      ? 'bg-estimated'
      : 'bg-gap';

  return (
    <div className={cn('flex items-center gap-2.5 font-sans', className)}>
      <div className="flex-1 h-1.5 rounded-full bg-void/80 border border-edge/60 overflow-hidden">
        <div
          className={cn('h-full transition-all duration-base rounded-full', barColor)}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs text-ink-soft whitespace-nowrap tabular-nums">
        <strong className="text-ink font-semibold">{percent}%</strong>{' '}
        <span className="text-[11px] text-ink-faint">({label})</span>
      </span>
    </div>
  );
};
