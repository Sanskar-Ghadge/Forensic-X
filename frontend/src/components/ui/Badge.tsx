import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'scan' | 'verified' | 'recovered' | 'estimated' | 'gap' | 'lead';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'neutral', children, ...props }, ref) => {
    const variants = {
      neutral: 'bg-raised text-ink-soft border-edge',
      scan: 'bg-scan/10 text-scan border-scan/30',
      verified: 'bg-verified/10 text-verified border-verified/30',
      recovered: 'bg-recovered/10 text-recovered border-recovered/30',
      estimated: 'bg-estimated/10 text-estimated border-estimated/30',
      gap: 'bg-gap/10 text-gap border-gap/30',
      lead: 'bg-lead/10 text-lead border-lead/30',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium font-sans border tracking-wide select-none',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';
