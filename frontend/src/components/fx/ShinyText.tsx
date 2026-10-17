import React from 'react';
import { useMotion } from '@/hooks/useMotion';
import { cn } from '@/lib/utils';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

export const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 5,
  className,
}) => {
  const { isOff } = useMotion();
  const shouldAnimate = !disabled && !isOff;

  const animationDuration = `${speed}s`;

  return (
    <span
      className={cn(
        'inline-block bg-clip-text text-transparent font-medium',
        shouldAnimate
          ? 'bg-[linear-gradient(120deg,rgba(232,238,249,0.7)_0%,rgba(34,211,238,1)_50%,rgba(232,238,249,0.7)_100%)] bg-[length:200%_100%] animate-[shine_4s_linear_infinite]'
          : 'text-ink',
        className
      )}
      style={{
        animationDuration: shouldAnimate ? animationDuration : undefined,
      }}
    >
      {text}
    </span>
  );
};
