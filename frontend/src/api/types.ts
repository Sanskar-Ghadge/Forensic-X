/**
 * FORENSIC-X Data Contracts & Core Evidence Types
 */

export type SegmentStatus = 'active' | 'recovered' | 'partial';

export type CauseId =
  | 'deleted'
  | 'overwritten'
  | 'power_cut'
  | 'disconnected'
  | 'motion_schedule'
  | 'disk_error'
  | 'time_changed';

export interface Case {
  id: string;
  name: string;
  status: 'new' | 'processing' | 'ready';
  createdAt: string;
  recorderCount: number;
  cameraCount: number;
  incidentTime?: string;
  notes?: string;
}

export interface Recorder {
  id: string;
  caseId: string;
  brand: string;
  adapterUsed: string;
  imageHash: string;
  hashVerifiedAt?: string;
  acquiredAt: string;
  fileSizeMb?: number;
}

export interface Camera {
  id: string;
  recorderId: string;
  channel: number;
  locationName: string;
  clockOffsetS: number;
  offsetErrorS: number;
  status: 'ok' | 'gaps' | 'offset_uncertain';
}

export interface Segment {
  id: string;
  cameraId: string;
  startOriginal: string;
  startCorrected: string;
  durationS: number;
  status: SegmentStatus;
  method: 'index' | 'carved';
  hash: string;
  clipUrl: string;
}

export interface CauseCandidate {
  cause: CauseId;
  confidence: number;
  supports: string[];
  contradicts: string[];
}

export interface Gap {
  id: string;
  cameraId: string;
  start: string;
  end: string;
  durationS?: number;
  candidates: CauseCandidate[];
  verdict: CauseId | 'undetermined';
  investigatorNotes?: string;
  reviewStatus?: 'unreviewed' | 'reviewed' | 'disputed' | 'accepted';
}

export interface Detection {
  id: string;
  cameraId: string;
  timeCorrected: string;
  label: string;
  bbox: [number, number, number, number];
  thumbnailUrl: string;
  frameRef: string;
  sourceHash: string;
  confidence?: number;
}

export interface SearchResult {
  detection: Detection;
  similarity: number;
  order: number;
}

export interface GraphNode {
  id: string;
  kind: 'incident' | 'camera' | 'clip' | 'gap' | 'hash' | 'event';
  label: string;
  state?: 'verified' | 'recovered' | 'estimated' | 'gap' | 'lead';
  metadata?: Record<string, unknown>;
}

export interface GraphEdge {
  from: string;
  to: string;
  label?: string;
  state?: string;
}

export interface Job {
  id: string;
  type: 'hash' | 'detect' | 'recover' | 'analyze';
  status: 'queued' | 'running' | 'done' | 'failed';
  progress: number;
  startedAt: string;
  finishedAt?: string;
  errorMessage?: string;
}

export interface Metrics {
  recoveryRate: { recovered: number; known: number; partial?: number };
  alignmentErrorS: { camera: string; value: number }[];
  processing: { minutesPerSecond: number; totalDurationS?: number };
  falsePositiveRate: { incorrect: number; total: number };
  hashVerified: { verified: number; total: number };
  traceability: { linked: number; total: number };
}
