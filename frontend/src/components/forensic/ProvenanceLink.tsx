import React from 'react';
import { Fingerprint, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProvenanceLinkProps {
  sourceHash?: string;
  frameRef?: string;
  onClick?: () => void;
  className?: string;
}

export const ProvenanceLink: React.FC<ProvenanceLinkProps> = ({
  sourceHash,
  frameRef,
  onClick,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono text-ink-soft bg-raised/80 hover:bg-raised hover:text-scan border border-edge hover:border-scan/40 transition-colors select-none group',
        className
      )}
      title={sourceHash ? `View provenance: Hash ${sourceHash}` : 'View source provenance'}
    >
      <Fingerprint className="w-3.5 h-3.5 text-scan/70 group-hover:text-scan shrink-0" />
      <span className="text-[11px] font-sans">Source</span>
      {frameRef && (
        <span className="text-[10px] text-ink-faint tabular-nums border-l border-edge pl-1 ml-0.5">
          {frameRef}
        </span>
      )}
      <ExternalLink className="w-3 h-3 text-ink-faint group-hover:text-scan shrink-0 ml-0.5" />
    </button>
  );
};
