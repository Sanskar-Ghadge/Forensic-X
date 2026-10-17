import React from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';

export const LoadingFallback: React.FC = () => {
  return (
    <div className="flex h-full w-full min-h-[400px] items-center justify-center bg-void p-8 select-none">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border border-edge bg-console flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-6 h-6 text-scan" />
          </div>
          <Loader2 className="absolute w-16 h-16 text-scan/40 animate-spin" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-sm text-ink tracking-wide">
            Loading Forensic Context...
          </h3>
          <p className="text-xs font-mono text-ink-soft mt-1">
            Verifying cryptographic seals & initial state
          </p>
        </div>
      </div>
    </div>
  );
};
