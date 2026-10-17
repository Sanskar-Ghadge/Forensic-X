import React, { useState } from 'react';
import { Copy, Check, ShieldCheck, AlertTriangle } from 'lucide-react';
import { shortenHash, copyToClipboard } from '@/lib/hash';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';

interface HashChipProps {
  hash: string;
  verified?: boolean;
  mismatch?: boolean;
  leadChars?: number;
  tailChars?: number;
  className?: string;
}

export const HashChip: React.FC<HashChipProps> = ({
  hash,
  verified = true,
  mismatch = false,
  leadChars = 8,
  tailChars = 6,
  className,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(hash);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const shortValue = shortenHash(hash, leadChars, tailChars);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={handleCopy}
            className={cn(
              'inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-xs cursor-pointer select-none border transition-all duration-fast',
              mismatch
                ? 'bg-gap/10 border-gap/40 text-gap hover:border-gap'
                : verified
                ? 'bg-console border-edge text-ink hover:border-verified/50 hover:bg-raised'
                : 'bg-console border-edge text-ink-soft hover:border-scan/40',
              className
            )}
            title="Click to copy SHA-256"
          >
            {mismatch ? (
              <AlertTriangle className="w-3.5 h-3.5 text-gap shrink-0" />
            ) : verified ? (
              <ShieldCheck className="w-3.5 h-3.5 text-verified shrink-0" />
            ) : null}

            <span className="tabular-nums tracking-tight">{shortValue}</span>

            <button
              type="button"
              className="text-ink-soft hover:text-ink transition-colors ml-0.5"
              aria-label="Copy hash"
            >
              {copied ? (
                <Check className="w-3 h-3 text-verified" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
        </TooltipTrigger>
        <TooltipContent className="font-mono max-w-xs break-all text-[11px] leading-relaxed">
          <div className="font-semibold text-scan mb-0.5">SHA-256 Hash</div>
          <div>{hash || 'No hash recorded'}</div>
          <div className="text-[10px] text-ink-soft mt-1">Click chip to copy full hash</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
