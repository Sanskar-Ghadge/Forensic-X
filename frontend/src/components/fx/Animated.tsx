import React from 'react';
import { useMotion } from '@/hooks/useMotion';

interface AnimatedProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  allowReduced?: boolean;
}

/**
 * Animation safety wrapper.
 * Switches between interactive animated component and static fallback based on useMotion.
 */
export const Animated: React.FC<AnimatedProps> = ({
  children,
  fallback = null,
  allowReduced = false,
}) => {
  const { isOff, isReduced } = useMotion();

  if (isOff || (isReduced && !allowReduced)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
