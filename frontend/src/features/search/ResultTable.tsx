import React, { useState } from 'react';
import { SearchLead } from './types';
import { CameraBadge } from '@/components/forensic/CameraBadge';
import { StateBadge } from '@/components/forensic/StateBadge';
import { HashChip } from '@/components/forensic/HashChip';
import { ConfidenceBar } from '@/components/forensic/ConfidenceBar';
import { Button } from '@/components/ui/Button';
import { ArrowUpDown, Play, Eye } from 'lucide-react';

interface ResultTableProps {
  leads: SearchLead[];
  onSelectLead: (lead: SearchLead) => void;
  onPlayLead: (lead: SearchLead) => void;
}

export const ResultTable: React.FC<ResultTableProps> = ({
  leads,
  onSelectLead,
  onPlayLead,
}) => {
  const [sortField, setSortField] = useState<'time' | 'similarity'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sortedLeads = [...leads].sort((a, b) => {
    if (sortField === 'time') {
      return sortOrder === 'asc'
        ? a.corrected_sec - b.corrected_sec
        : b.corrected_sec - a.corrected_sec;
    } else {
      return sortOrder === 'asc'
        ? a.similarity - b.similarity
        : b.similarity - a.similarity;
    }
  });

  const toggleSort = (field: 'time' | 'similarity') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder(field === 'time' ? 'asc' : 'desc');
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-grid-line/60 bg-panel-dark/90 shadow-md">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-grid-line/60 bg-panel-light/30 text-ink-muted uppercase font-mono tracking-wider">
            <th className="py-3 px-4">Preview</th>
            <th className="py-3 px-4">Camera / Channel</th>
            <th className="py-3 px-4 cursor-pointer select-none" onClick={() => toggleSort('time')}>
              <div className="flex items-center gap-1.5 hover:text-white">
                <span>Corrected Time</span>
                <ArrowUpDown className="w-3 h-3 text-scan" />
              </div>
            </th>
            <th className="py-3 px-4">Raw DVR Clock</th>
            <th
              className="py-3 px-4 cursor-pointer select-none"
              onClick={() => toggleSort('similarity')}
            >
              <div className="flex items-center gap-1.5 hover:text-white">
                <span>Similarity (Lead)</span>
                <ArrowUpDown className="w-3 h-3 text-scan" />
              </div>
            </th>
            <th className="py-3 px-4">Clip Provenance Hash</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-grid-line/30 font-mono">
          {sortedLeads.map((lead) => (
            <tr
              key={lead.id}
              className="hover:bg-panel-light/20 transition-colors cursor-pointer group"
              onClick={() => onSelectLead(lead)}
            >
              {/* Thumbnail */}
              <td className="py-2.5 px-4">
                <div className="relative w-16 h-10 bg-black rounded overflow-hidden border border-grid-line">
                  <video
                    src={lead.thumbnail_url}
                    className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all"
                    muted
                  />
                  <div className="absolute top-0.5 right-0.5">
                    <StateBadge state="lead" />
                  </div>
                </div>
              </td>

              {/* Camera Badge */}
              <td className="py-2.5 px-4">
                <CameraBadge channel={lead.channel} locationName={lead.camera_name} />
              </td>

              {/* Corrected Time */}
              <td className="py-2.5 px-4 text-white font-medium">
                <div>{lead.corrected_timestamp_iso.slice(11, 19)}</div>
                <div className="text-[10px] text-ink-muted">±{lead.uncertainty_seconds}s offset error</div>
              </td>

              {/* Raw DVR Time */}
              <td className="py-2.5 px-4 text-ink-muted">
                {lead.raw_timestamp_iso.slice(11, 19)}
              </td>

              {/* Similarity */}
              <td className="py-2.5 px-4">
                <div className="w-28 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-scan font-bold">
                      Lead {(lead.similarity * 100).toFixed(0)}%
                    </span>
                    <span className="text-ink-muted text-[10px]">P{lead.pass_tier}</span>
                  </div>
                  <ConfidenceBar
                    confidence={lead.similarity}
                  />
                </div>
              </td>

              {/* HashChip */}
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <HashChip hash={lead.clip_hash} />
              </td>

              {/* Actions */}
              <td className="py-2.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onPlayLead(lead)}
                    className="h-7 px-2 text-[11px] gap-1"
                    title="Play video wall from this timestamp"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Play</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectLead(lead)}
                    className="h-7 px-2 text-[11px] text-ink-muted hover:text-white"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
