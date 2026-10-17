import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const GraphLegend: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute bottom-4 left-4 z-10 bg-panel-dark/95 border border-grid-line/80 rounded-xl shadow-xl overflow-hidden max-w-xs text-xs font-mono">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2.5 px-3 bg-panel-light/30 hover:bg-panel-light/50 transition-colors text-white"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-3.5 h-3.5 text-scan" />
          <span className="font-semibold text-[11px] uppercase tracking-wider">
            Provenance Legend
          </span>
        </div>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {isOpen && (
        <div className="p-3 space-y-2.5 border-t border-grid-line/50 text-[11px]">
          <div>
            <div className="text-ink-muted uppercase text-[9px] mb-1 font-bold">Node Entities</div>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="flex items-center gap-1.5 text-white">
                <span className="w-2.5 h-2.5 rounded bg-scan border border-scan/80" />
                <span>Incident Root</span>
              </div>
              <div className="flex items-center gap-1.5 text-white">
                <span className="w-2.5 h-2.5 rounded bg-cyan-400 border border-cyan-300" />
                <span>Physical Disk</span>
              </div>
              <div className="flex items-center gap-1.5 text-white">
                <span className="w-2.5 h-2.5 rounded bg-blue-500 border border-blue-400" />
                <span>Camera Stream</span>
              </div>
              <div className="flex items-center gap-1.5 text-white">
                <span className="w-2.5 h-2.5 rounded bg-status-active border border-status-active" />
                <span>Active Clip</span>
              </div>
              <div className="flex items-center gap-1.5 text-white">
                <span className="w-2.5 h-2.5 rounded bg-violet-500 border border-violet-400" />
                <span>Carved Clip</span>
              </div>
              <div className="flex items-center gap-1.5 text-white">
                <span className="w-2.5 h-2.5 rounded bg-rose-500 border border-rose-400" />
                <span>Hardware Gap</span>
              </div>
              <div className="flex items-center gap-1.5 text-white">
                <span className="w-2.5 h-2.5 rounded bg-cyan-300 border border-cyan-200" />
                <span>AI Lead</span>
              </div>
              <div className="flex items-center gap-1.5 text-white">
                <span className="w-2.5 h-2.5 rounded bg-emerald-400 border border-emerald-300" />
                <span>SHA-256 Hash</span>
              </div>
            </div>
          </div>

          <div className="border-t border-grid-line/40 pt-2">
            <div className="text-ink-muted uppercase text-[9px] mb-1 font-bold">Edge Lineage</div>
            <div className="text-ink-soft space-y-1 text-[10px]">
              <div>&bull; <strong>carved from</strong>: sector extraction lineage</div>
              <div>&bull; <strong>sealed with</strong>: cryptographic integrity bond</div>
              <div>&bull; <strong>observed lead</strong>: appearance similarity detection</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
