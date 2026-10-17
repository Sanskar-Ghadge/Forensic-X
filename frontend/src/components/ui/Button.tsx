import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium font-sans rounded-control transition-all duration-fast select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-scan focus-visible:outline-offset-2';

    const variants = {
      primary:
        'bg-scan text-on-accent hover:bg-scan/90 hover:shadow-[0_0_15px_rgba(34,211,238,0.35)] font-semibold shadow-sm',
      secondary:
        'bg-console border border-edge text-ink hover:bg-raised hover:border-ink-soft/40 hover:text-white',
      ghost:
        'bg-transparent text-ink-soft hover:text-ink hover:bg-raised/50',
      danger:
        'bg-gap/10 border border-gap/40 text-gap hover:bg-gap/20 hover:border-gap',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-9 px-4 text-sm gap-2',
      lg: 'h-11 px-6 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
