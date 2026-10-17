import React, { useEffect, useState, useRef } from 'react';

/**
 * FpsMeter - dev-only performance monitor.
 * Displays current rendering frame rate in the bottom-left corner when ?fps=1 is in URL.
 */
export const FpsMeter: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [fps, setFps] = useState(60);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('fps') === '1') {
        setEnabled(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const loop = (now: number) => {
      frameCount.current++;
      if (now - lastTime.current >= 1000) {
        setFps(Math.round((frameCount.current * 1000) / (now - lastTime.current)));
        frameCount.current = 0;
        lastTime.current = now;
      }
      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-3 left-3 z-[9999] px-2.5 py-1 rounded bg-console/90 border border-edge text-xs font-mono tabular-nums text-scan shadow-lg backdrop-blur">
      <span className={fps < 30 ? 'text-gap' : fps < 50 ? 'text-estimated' : 'text-verified'}>
        {fps} FPS
      </span>
    </div>
  );
};
