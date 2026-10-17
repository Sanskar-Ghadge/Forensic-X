export interface SearchLead {
  id: string;
  case_id: string;
  camera_id: string;
  camera_name: string;
  channel: number;
  corrected_sec: number;
  corrected_timestamp_iso: string;
  raw_timestamp_iso: string;
  uncertainty_seconds: number;
  similarity: number; // 0.0 to 1.0
  label: string;
  bbox: [number, number, number, number]; // [x, y, w, h]
  thumbnail_url: string;
  clip_hash: string;
  model_detector: string;
  model_embedder: string;
  pass_tier: number;
  is_rejected?: boolean;
}

export interface TrajectoryHop {
  from_camera_id: string;
  to_camera_id: string;
  from_camera_name: string;
  to_camera_name: string;
  from_corrected_sec: number;
  to_corrected_sec: number;
  elapsed_seconds: number;
  min_expected_walking_sec: number;
  is_plausible: boolean;
  warning_reason?: string | null;
}

export interface SearchResponse {
  query: string;
  min_similarity: number;
  total_matches: number;
  hidden_below_threshold: number;
  leads: SearchLead[];
  trajectory_hops: TrajectoryHop[];
  legal_notice: string;
}
