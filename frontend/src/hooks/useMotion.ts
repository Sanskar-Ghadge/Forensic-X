import { useState, useEffect } from 'react';

export type MotionMode = 'full' | 'reduced' | 'off';

const STORAGE_KEY = 'forensic_x_motion_mode';

export function useMotion() {
  const [motionMode, setMotionModeState] = useState<MotionMode>(() => {
    // 1. Check saved preference
    const saved = localStorage.getItem(STORAGE_KEY) as MotionMode | null;
    if (saved && ['full', 'reduced', 'off'].includes(saved)) {
      return saved;
    }

    // 2. Check OS accessibility setting
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return 'reduced';
    }

    // 3. Hardware concurrency check: if 4 or fewer logical cores, default to reduced
    if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) {
      return 'reduced';
    }

    return 'full';
  });

  const setMotionMode = (mode: MotionMode) => {
    setMotionModeState(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setMotionModeState(e.matches ? 'reduced' : 'full');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return {
    mode: motionMode,
    isFull: motionMode === 'full',
    isReduced: motionMode === 'reduced',
    isOff: motionMode === 'off',
    setMotionMode,
  };
}
