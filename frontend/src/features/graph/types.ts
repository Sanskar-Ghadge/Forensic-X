import { Node, Edge } from '@xyflow/react';

export type EvidenceNodeKind =
  | 'incident'
  | 'recorder'
  | 'camera'
  | 'segment'
  | 'gap'
  | 'lead'
  | 'hash';

export interface BaseNodeData extends Record<string, unknown> {
  label: string;
  kind: EvidenceNodeKind;
  isHighlighted?: boolean;
  isDimmed?: boolean;
  isVerified?: boolean;
  isPulsing?: boolean;
}

export interface IncidentNodeData extends BaseNodeData {
  kind: 'incident';
  caseId: string;
  timeRange: string;
  jurisdiction: string;
}

export interface RecorderNodeData extends BaseNodeData {
  kind: 'recorder';
  brand: string;
  imageHash: string;
  sectors: number;
  sizeBytes: number;
}

export interface CameraNodeData extends BaseNodeData {
  kind: 'camera';
  channel: number;
  offsetSec: number;
  status: 'ok' | 'recovered' | 'gaps';
}

export interface SegmentNodeData extends BaseNodeData {
  kind: 'segment';
  channel: number;
  cameraName: string;
  status: 'verified' | 'recovered';
  method?: string;
  sector?: number;
  timeStart: string;
  duration: string;
  hash: string;
}

export interface GapNodeData extends BaseNodeData {
  kind: 'gap';
  channel: number;
  cameraName: string;
  verdict: string;
  confidence: number;
  timeStart: string;
  timeEnd: string;
}

export interface LeadNodeData extends BaseNodeData {
  kind: 'lead';
  similarity: number;
  model: string;
  timestamp: string;
}

export interface HashNodeData extends BaseNodeData {
  kind: 'hash';
  hash: string;
  algorithm: string;
  verified: boolean;
}

export type CustomNodeData =
  | IncidentNodeData
  | RecorderNodeData
  | CameraNodeData
  | SegmentNodeData
  | GapNodeData
  | LeadNodeData
  | HashNodeData;

export type EvidenceGraphNode = Node<CustomNodeData>;
export type EvidenceGraphEdge = Edge;
