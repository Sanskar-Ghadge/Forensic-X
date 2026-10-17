import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { SearchLead, TrajectoryHop } from './types';
import { QueryComposer } from './QueryComposer';
import { FilterBar } from './FilterBar';
import { ChromaGrid } from './ChromaGrid';
import { ResultTable } from './ResultTable';
import { PathView } from './PathView';
import { MatchDetailModal } from './MatchDetailModal';
import { SynchronizedPlayer } from '@/features/playback/SynchronizedPlayer';
import { Badge } from '@/components/ui/Badge';
import {
  ScanSearch,
  ShieldAlert,
  Info,
} from 'lucide-react';

const INITIAL_DEMO_LEADS: SearchLead[] = [
  {
    id: 'LEAD-001',
    case_id: 'CASE-2026-APEX-01',
    camera_id: 'CAM-01',
    camera_name: 'Entrance',
    channel: 1,
    corrected_sec: 135,
    corrected_timestamp_iso: '2026-03-29T21:42:15Z',
    raw_timestamp_iso: '2026-03-29T21:42:15Z',
    uncertainty_seconds: 0.05,
    similarity: 0.92,
    label: 'Lead: Person in Red Jacket (0.92)',
    bbox: [410, 180, 220, 480],
    thumbnail_url: '/sample/cam1_entrance.mp4',
    clip_hash: '3b7a1e0f8c9d2a4e6b5c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
    model_detector: 'YOLO11n-pose-surveillance (ONNX)',
    model_embedder: 'OSNet-IBN-x1_0 + CLIP ViT-B/32',
    pass_tier: 2,
  },
  {
    id: 'LEAD-002',
    case_id: 'CASE-2026-APEX-01',
    camera_id: 'CAM-02',
    camera_name: 'Aisle 4 (Beverages)',
    channel: 2,
    corrected_sec: 378,
    corrected_timestamp_iso: '2026-03-29T21:46:18Z',
    raw_timestamp_iso: '2026-03-29T21:46:22Z', // +4s raw clock offset
    uncertainty_seconds: 0.05,
    similarity: 0.88,
    label: 'Lead: Person with Red Backpack (0.88)',
    bbox: [540, 210, 190, 440],
    thumbnail_url: '/sample/cam2_aisle4_deleted.mp4',
    clip_hash: '0b2b68603632cf4b64fcad18a6dfc9247d8ff60f04c6e9a7e6b0253457b3f25c',
    model_detector: 'YOLO11n-pose-surveillance (ONNX)',
    model_embedder: 'OSNet-IBN-x1_0 + CLIP ViT-B/32',
    pass_tier: 2,
  },
  {
    id: 'LEAD-003',
    case_id: 'CASE-2026-APEX-01',
    camera_id: 'CAM-03',
    camera_name: 'Cash Counter',
    channel: 3,
    corrected_sec: 962,
    corrected_timestamp_iso: '2026-03-29T21:56:02Z',
    raw_timestamp_iso: '2026-03-29T21:56:02Z',
    uncertainty_seconds: 0.08,
    similarity: 0.84,
    label: 'Lead: Individual at Register (0.84)',
    bbox: [320, 190, 240, 460],
    thumbnail_url: '/sample/cam3_counter.mp4',
    clip_hash: '9f8e7d6c5b4a3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    model_detector: 'YOLO11n-pose-surveillance (ONNX)',
    model_embedder: 'OSNet-IBN-x1_0 + CLIP ViT-B/32',
    pass_tier: 1,
  },
  {
    id: 'LEAD-004-LOW',
    case_id: 'CASE-2026-APEX-01',
    camera_id: 'CAM-01',
    camera_name: 'Entrance',
    channel: 1,
    corrected_sec: 1100,
    corrected_timestamp_iso: '2026-03-29T21:58:20Z',
    raw_timestamp_iso: '2026-03-29T21:58:20Z',
    uncertainty_seconds: 0.05,
    similarity: 0.58, // Below default 0.65 threshold
    label: 'Lead: Distant Pedestrian (0.58)',
    bbox: [680, 260, 110, 260],
    thumbnail_url: '/sample/cam1_entrance.mp4',
    clip_hash: '3b7a1e0f8c9d2a4e6b5c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
    model_detector: 'YOLO11n-pose-surveillance (ONNX)',
    model_embedder: 'OSNet-IBN-x1_0 + CLIP ViT-B/32',
    pass_tier: 1,
  },
];

import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export const SearchPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const activeCase = caseId || 'CASE-2026-APEX-01';
  useDocumentTitle(`Entity Search & Trajectory — ${activeCase}`);

  const {
    setTimeCursor,
    setIsPlaying,
    setVideoWallOpen,
    isVideoWallOpen,
    addFinding,
    rejectedLeadIds,
    markLeadRejected,
  } = useAppStore();

  const [query, setQuery] = useState('person in red jacket');
  const [isLoading, setIsLoading] = useState(false);
  const [similarityCutoff, setSimilarityCutoff] = useState(0.65);
  const [activeCamera, setActiveCamera] = useState('all');
  const [onlyPlausible, setOnlyPlausible] = useState(false);
  const [passTier2Only, setPassTier2Only] = useState(false);
  const [activeView, setActiveView] = useState<'grid' | 'list' | 'path'>('grid');

  const [selectedLead, setSelectedLead] = useState<SearchLead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Trigger search simulation
  const handleSearch = (q: string) => {
    setQuery(q);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  };

  // Filtered Leads based on similarity cutoff, camera, pass tier, and rejections
  const filteredLeads = useMemo(() => {
    return INITIAL_DEMO_LEADS.filter((lead) => {
      if (rejectedLeadIds.includes(lead.id)) return false;
      if (lead.similarity < similarityCutoff) return false;
      if (activeCamera !== 'all' && lead.camera_id !== activeCamera) return false;
      if (passTier2Only && lead.pass_tier < 2) return false;
      return true;
    }).sort((a, b) => a.corrected_sec - b.corrected_sec);
  }, [similarityCutoff, activeCamera, passTier2Only, rejectedLeadIds]);

  // Compute hidden count
  const hiddenCount = useMemo(() => {
    return INITIAL_DEMO_LEADS.filter(
      (l) => !rejectedLeadIds.includes(l.id) && l.similarity < similarityCutoff
    ).length;
  }, [similarityCutoff, rejectedLeadIds]);

  // Compute trajectory hops
  const trajectoryHops: TrajectoryHop[] = useMemo(() => {
    const hops: TrajectoryHop[] = [];
    for (let i = 0; i < filteredLeads.length - 1; i++) {
      const curr = filteredLeads[i];
      const nxt = filteredLeads[i + 1];
      const elapsed = nxt.corrected_sec - curr.corrected_sec;
      const minSec = 25.0; // standard minimum walking threshold
      const plausible = elapsed >= minSec;

      hops.push({
        from_camera_id: curr.camera_id,
        to_camera_id: nxt.camera_id,
        from_camera_name: curr.camera_name,
        to_camera_name: nxt.camera_name,
        from_corrected_sec: curr.corrected_sec,
        to_corrected_sec: nxt.corrected_sec,
        elapsed_seconds: elapsed,
        min_expected_walking_sec: minSec,
        is_plausible: plausible,
        warning_reason: plausible
          ? null
          : `Transit time (${elapsed}s) faster than minimum walking time (${minSec}s); verify match.`,
      });
    }
    return hops;
  }, [filteredLeads]);

  // Handle Play Action (Direct launch of 3-Up Video Wall at exact second)
  const handlePlayLead = (lead: SearchLead) => {
    setTimeCursor(lead.corrected_sec);
    setIsPlaying(true);
    setVideoWallOpen(true);
  };

  // Handle Select Lead
  const handleSelectLead = (lead: SearchLead) => {
    setSelectedLead(lead);
    setIsDetailOpen(true);
  };

  // Handle Add to Findings
  const handleAddFinding = (lead: SearchLead) => {
    addFinding({
      id: `FIND-${Date.now()}`,
      leadId: lead.id,
      cameraName: lead.camera_name,
      time: lead.corrected_timestamp_iso,
      similarity: lead.similarity,
      note: `Visual lead: ${lead.label} with ${(lead.similarity * 100).toFixed(0)}% confidence`,
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <ScanSearch className="w-6 h-6 text-scan" />
            <h1 className="font-display text-2xl font-bold text-white tracking-tight">
              Cross-Camera Appearance & Re-ID Search
            </h1>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Query appearance across all camera streams simultaneously, validate chronological paths, and examine leads with strict forensic provenance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="neutral" className="text-xs font-mono">
            Case: {activeCase}
          </Badge>
          <Badge variant="verified" className="text-xs font-mono">
            FAISS Cosine Index
          </Badge>
        </div>
      </div>

      {/* Pinned Honest Forensic Notice */}
      <div className="p-3.5 rounded-lg bg-panel-dark/90 border border-scan/40 flex items-start gap-3 text-xs text-ink-soft shadow-sm">
        <ShieldAlert className="w-4 h-4 text-scan flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white">Forensic Principle — Leads, Not Proof:</strong> Visual match results are candidate hypotheses generated by machine-learning appearance models. Low lighting, compression artifacts, and similar clothing can produce false positives. All matches require certified human verification before presentation in court.
        </div>
      </div>

      {/* Query Composer */}
      <QueryComposer
        query={query}
        onQueryChange={setQuery}
        onSearch={handleSearch}
        isLoading={isLoading}
        activeCamera={activeCamera}
        onCameraChange={setActiveCamera}
        totalMatches={filteredLeads.length}
      />

      {/* Filters & View Switcher */}
      <FilterBar
        similarityCutoff={similarityCutoff}
        onCutoffChange={setSimilarityCutoff}
        hiddenCount={hiddenCount}
        totalCount={filteredLeads.length}
        onlyPlausible={onlyPlausible}
        onOnlyPlausibleChange={setOnlyPlausible}
        passTier2Only={passTier2Only}
        onPassTier2Change={setPassTier2Only}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Main View Area */}
      {filteredLeads.length === 0 ? (
        <div className="p-16 text-center rounded-xl bg-panel-dark/40 border border-dashed border-grid-line space-y-3">
          <Info className="w-8 h-8 text-ink-muted mx-auto" />
          <h3 className="text-sm font-semibold text-white">No Matching Leads Found</h3>
          <p className="text-xs text-ink-muted max-w-md mx-auto">
            No camera frames exceeded the current similarity cutoff ({(similarityCutoff * 100).toFixed(0)}%).
            Try lowering the similarity slider, changing the camera filter, or unchecking Pass 2 filter.
          </p>
        </div>
      ) : (
        <>
          {activeView === 'grid' && (
            <ChromaGrid leads={filteredLeads} onSelectLead={handleSelectLead} />
          )}

          {activeView === 'list' && (
            <ResultTable
              leads={filteredLeads}
              onSelectLead={handleSelectLead}
              onPlayLead={handlePlayLead}
            />
          )}

          {activeView === 'path' && (
            <PathView
              leads={filteredLeads}
              hops={trajectoryHops}
              onSelectLead={handleSelectLead}
              onPlayLead={handlePlayLead}
            />
          )}
        </>
      )}

      {/* Match Detail Modal */}
      <MatchDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        lead={selectedLead}
        onPlayLead={handlePlayLead}
        onAddFinding={handleAddFinding}
        onMarkWrongMatch={markLeadRejected}
      />

      {/* Synchronized 3-Up Video Wall when opened */}
      {isVideoWallOpen && (
        <SynchronizedPlayer onClose={() => setVideoWallOpen(false)} />
      )}
    </div>
  );
};
