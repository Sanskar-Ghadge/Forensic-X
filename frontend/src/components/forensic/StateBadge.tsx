import React from 'react';
import {
  ShieldCheck,
  RotateCcw,
  Clock,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  FileQuestion,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ForensicState =
  | 'verified'
  | 'recovered'
  | 'partial'
  | 'estimated'
  | 'gap'
  | 'lead'
  | 'undetermined';

interface StateBadgeProps {
  state: ForensicState;
  label?: string;
  className?: string;
}

export const StateBadge: React.FC<StateBadgeProps> = ({
  state,
  label,
  className,
}) => {
  const configs = {
    verified: {
      colorClass: 'bg-verified/10 text-verified border-verified/30',
      icon: ShieldCheck,
      defaultLabel: 'Verified',
    },
    recovered: {
      colorClass: 'bg-recovered/10 text-recovered border-recovered/30',
      icon: RotateCcw,
      defaultLabel: 'Recovered',
    },
    partial: {
      colorClass:
        'bg-recovered/10 text-recovered border-recovered/40 bg-[linear-gradient(45deg,transparent_25%,rgba(167,139,250,0.15)_25%,rgba(167,139,250,0.15)_50%,transparent_50%,transparent_75%,rgba(167,139,250,0.15)_75%)] bg-[length:8px_8px]',
      icon: RotateCcw,
      defaultLabel: 'Partial',
    },
    estimated: {
      colorClass: 'bg-estimated/10 text-estimated border-estimated/30',
      icon: Clock,
      defaultLabel: 'Estimated',
    },
    gap: {
      colorClass: 'bg-gap/10 text-gap border-gap/30 border-dashed',
      icon: AlertTriangle,
      defaultLabel: 'Gap',
    },
    lead: {
      colorClass: 'bg-lead/10 text-lead border-lead/30',
      icon: Sparkles,
      defaultLabel: 'Lead',
    },
    undetermined: {
      colorClass: 'bg-raised text-ink-soft border-edge',
      icon: HelpCircle,
      defaultLabel: 'Cause undetermined',
    },
  };

  const config = configs[state] || {
    colorClass: 'bg-raised text-ink-soft border-edge',
    icon: FileQuestion,
    defaultLabel: state,
  };

  const IconComponent = config.icon;
  const displayText = label || config.defaultLabel;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium font-sans border select-none tracking-wide',
        config.colorClass,
        className
      )}
    >
      <IconComponent className="w-3.5 h-3.5 shrink-0" />
      <span>{displayText}</span>
    </span>
  );
};
