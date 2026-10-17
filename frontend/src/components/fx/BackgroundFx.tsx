import React, { useEffect, useRef, useState } from 'react';
import { useMotion } from '@/hooks/useMotion';
import { cn } from '@/lib/utils';

interface BackgroundFxProps {
  children?: React.ReactNode;
  className?: string;
  gradientFallback?: string;
}

/**
 * BackgroundFx - Performance and battery-safe background wrapper.
 * - Caps pixel ratio to 1.5
 * - Pauses execution when tab is hidden or element is scrolled out of view
 * - Swaps to static gradient when motion is off or reduced
 */
export const BackgroundFx: React.FC<BackgroundFxProps> = ({
  children,
  className,
  gradientFallback = 'radial-gradient(ellipse at 50% 0%, rgba(34, 211, 238, 0.08) 0%, transparent 70%)',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isTabActive, setIsTabActive] = useState(true);
  const { isFull } = useMotion();

  useEffect(() => {
    // 1. Tab visibility listener
    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 2. Intersection observer (unmount/pause when scrolled away)
    let observer: IntersectionObserver | null = null;
    if (containerRef.current && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        ([entry]) => {
          setIsVisible(entry.isIntersecting);
        },
        { threshold: 0.05 }
      );
      observer.observe(containerRef.current);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (observer) observer.disconnect();
    };
  }, []);

  const shouldRenderActiveFx = isFull && isVisible && isTabActive;

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full h-full overflow-hidden', className)}
      style={{
        background: !shouldRenderActiveFx ? gradientFallback : undefined,
      }}
    >
      {shouldRenderActiveFx ? (
        children
      ) : (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: gradientFallback }}
        />
      )}
    </div>
  );
};
