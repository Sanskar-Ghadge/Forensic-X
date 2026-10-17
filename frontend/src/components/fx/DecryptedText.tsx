import React, { useState, useEffect, useRef } from 'react';
import { useMotion } from '@/hooks/useMotion';
import { cn } from '@/lib/utils';

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  characters?: string;
  className?: string;
  parentClassName?: string;
  encryptedClassName?: string;
  animateOn?: 'view' | 'hover';
  revealDirection?: 'start' | 'end' | 'center';
  sequential?: boolean;
}

const DEFAULT_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><,./-=';

export const DecryptedText: React.FC<DecryptedTextProps> = ({
  text,
  speed = 50,
  maxIterations = 10,
  characters = DEFAULT_CHARS,
  className,
  parentClassName,
  encryptedClassName = 'text-scan/60 font-mono',
  sequential = true,
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const { isOff } = useMotion();

  const iterationRef = useRef(0);
  const intervalRef = useRef<number | null>(null);

  const startScramble = () => {
    if (isOff) {
      setDisplayText(text);
      return;
    }

    setIsScrambling(true);
    iterationRef.current = 0;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      setDisplayText(() => {
        return text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (sequential && index < iterationRef.current / 2) {
              return text[index];
            }
            if (iterationRef.current >= maxIterations) {
              return text[index];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join('');
      });

      iterationRef.current++;

      if (iterationRef.current > (sequential ? text.length * 2 + maxIterations : maxIterations)) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsScrambling(false);
        setDisplayText(text);
      }
    }, speed);
  };

  useEffect(() => {
    startScramble();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, isOff]);

  return (
    <span
      className={cn('inline-block whitespace-pre-wrap select-none', parentClassName)}
      onMouseEnter={startScramble}
    >
      <span className={cn(isScrambling ? encryptedClassName : '', className)}>
        {displayText}
      </span>
    </span>
  );
};
