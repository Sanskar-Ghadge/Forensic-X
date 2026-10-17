import React from 'react';
import { cn } from '@/lib/utils';

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  action?: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  action,
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-panel bg-console border border-edge overflow-hidden surface-depth flex flex-col',
        className
      )}
      {...props}
    >
      {title && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-edge/60 bg-console/80">
          <span className="text-xs font-semibold font-sans uppercase tracking-wider text-ink-soft">
            {title}
          </span>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-4 flex-1">{children}</div>
    </div>
  );
};
