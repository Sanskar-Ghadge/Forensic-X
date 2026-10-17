import React, { useEffect, useState, useRef } from 'react';
import { useMotion } from '@/hooks/useMotion';
import { cn } from '@/lib/utils';

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
  to,
  from = 0,
  duration = 1.4,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
}) => {
  const [value, setValue] = useState(from);
  const { isOff } = useMotion();
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOff) {
      setValue(to);
      return;
    }

    const easeOutQuad = (t: number) => t * (2 - t);

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / (duration * 1000), 1);
      const easedProgress = easeOutQuad(progress);
      const currentVal = from + (to - from) * easedProgress;

      setValue(currentVal);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setValue(to); // Guarantees ending on exact value
      }
    };

    startTimeRef.current = null;
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [to, from, duration, isOff]);

  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={cn('font-mono tabular-nums inline-block', className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
