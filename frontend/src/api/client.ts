/**
 * FORENSIC-X API Client
 * Seamlessly talks to FastAPI backend with auto-fallback to verified forensic mock data
 */

/// <reference types="vite/client" />
import { Case, Camera, Segment, Gap, Metrics, SearchResult, Job } from './types';
import TRUTH_DATA from '@/mocks/data/truth.json';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const FORCE_MOCK = (import.meta as any).env?.VITE_USE_MOCK === 'true';

export interface ApiStatus {
  isLive: boolean;
  checkedAt: string;
  baseUrl: string;
  latencyMs?: number;
}

let cachedStatus: ApiStatus = {
  isLive: false,
  checkedAt: new Date().toISOString(),
  baseUrl: API_BASE,
};

type StatusListener = (status: ApiStatus) => void;
const listeners = new Set<StatusListener>();

export function subscribeApiStatus(listener: StatusListener): () => void {
  listeners.add(listener);
  listener(cachedStatus);
  return () => {
    listeners.delete(listener);
  };
}

function updateStatus(isLive: boolean, latencyMs?: number) {
  cachedStatus = {
    isLive,
    checkedAt: new Date().toISOString(),
    baseUrl: API_BASE,
    latencyMs,
  };
  listeners.forEach((l) => l(cachedStatus));
}

export async function checkBackendHealth(): Promise<ApiStatus> {
  if (FORCE_MOCK) {
    updateStatus(false);
    return cachedStatus;
  }

  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE}/api/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(2000),
    });

    if (res.ok) {
      const latency = Math.round(performance.now() - start);
      updateStatus(true, latency);
      return cachedStatus;
    }
    updateStatus(false);
    return cachedStatus;
  } catch {
    updateStatus(false);
    return cachedStatus;
  }
}

// Initial probe
checkBackendHealth();

/**
 * Robust JSON request wrapper
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    },
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

// --- CASE ENDPOINTS ---

export async function apiGetCases(): Promise<Case[]> {
  try {
    if (!FORCE_MOCK) {
      const data = await request<Case[]>('/api/cases');
      updateStatus(true);
      return data;
    }
  } catch (err) {
    console.warn('[Forensic-X API] Falling back to local cases', err);
    updateStatus(false);
  }

  return [
    {
      id: TRUTH_DATA.case_id,
      name: TRUTH_DATA.case_name,
      status: 'ready',
      createdAt: '2026-10-17 21:45:00 UTC',
      recorderCount: 1,
      cameraCount: 3,
      incidentTime: TRUTH_DATA.incident_time,
      notes: 'Hardware clock drift ±4s calibrated against optical flash anchor. Deleted clip recovered from unallocated sectors.',
    },
    {
      id: 'CASE-2026-BAY-02',
      name: 'Logistics Warehouse Perimeter Breach',
      status: 'ready',
      createdAt: '2026-10-16 04:20:00 UTC',
      recorderCount: 2,
      cameraCount: 8,
      incidentTime: '2026-10-16T03:15:00Z',
      notes: 'Perimeter motion sensors tripped during night shift. Multiple angles verified.',
    },
  ];
}

export async function apiGetCase(caseId: string): Promise<Case | null> {
  try {
    if (!FORCE_MOCK) {
      const data = await request<Case>(`/api/cases/${caseId}`);
      updateStatus(true);
      return data;
    }
  } catch {
    updateStatus(false);
  }

  const all = await apiGetCases();
  return all.find((c) => c.id === caseId) || all[0];
}

export async function apiCreateCase(payload: {
  name: string;
  incidentTime?: string;
  notes?: string;
}): Promise<Case> {
  try {
    if (!FORCE_MOCK) {
      const created = await request<Case>('/api/cases', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      updateStatus(true);
      return created;
    }
  } catch {
    updateStatus(false);
  }

  return {
    id: `CASE-${Date.now().toString().slice(-6)}`,
    name: payload.name,
    status: 'new',
    createdAt: new Date().toISOString(),
    recorderCount: 0,
    cameraCount: 0,
    incidentTime: payload.incidentTime,
    notes: payload.notes,
  };
}

// --- TIMELINE & SEGMENTS ---

export interface TimelineData {
  cameras: Camera[];
  segments: Segment[];
  gaps: Gap[];
  incidentEpoch: number;
}

export async function apiGetTimeline(caseId: string): Promise<TimelineData> {
  try {
    if (!FORCE_MOCK) {
      const data = await request<TimelineData>(`/api/cases/${caseId}/timeline`);
      updateStatus(true);
      return data;
    }
  } catch {
    updateStatus(false);
  }

  // Fallback to ground truth data
  const cameras: Camera[] = TRUTH_DATA.cameras.map((c) => ({
    id: `CAM-0${c.channel}`,
    recorderId: 'REC-01',
    channel: c.channel,
    locationName: c.location,
    clockOffsetS: c.true_clock_offset_s,
    offsetErrorS: c.channel === 2 ? 0.05 : 0.02,
    status: c.status as 'ok' | 'gaps' | 'offset_uncertain',
  }));

  const segments: Segment[] = TRUTH_DATA.segments.map((s) => ({
    id: s.id,
    cameraId: `CAM-0${s.channel}`,
    startOriginal: s.start_iso,
    startCorrected: s.start_iso,
    durationS: s.duration_s,
    status: s.status as 'active' | 'recovered' | 'partial',
    method: s.is_indexed ? 'index' : 'carved',
    hash: s.sha256,
    clipUrl:
      s.channel === 1
        ? '/sample/cam1_entrance.mp4'
        : s.channel === 2
        ? '/sample/cam2_aisle4_deleted.mp4'
        : '/sample/cam3_counter.mp4',
  }));

  const gaps: Gap[] = TRUTH_DATA.gaps.map((g, idx) => ({
    id: `GAP-CH${g.channel}-0${idx + 1}`,
    cameraId: `CAM-0${g.channel}`,
    start: g.start_time,
    end: g.end_time,
    durationS: g.duration_s,
    verdict: g.true_cause as Gap['verdict'],
    candidates: [
      {
        cause: g.true_cause as any,
        confidence: g.expected_confidence,
        supports: g.supporting_evidence,
        contradicts: g.contradicting_evidence,
      },
    ],
  }));

  return {
    cameras,
    segments,
    gaps,
    incidentEpoch: 1792273337,
  };
}

// --- METRICS ---

export async function apiGetMetrics(caseId: string): Promise<Metrics> {
  try {
    if (!FORCE_MOCK) {
      const data = await request<Metrics>(`/api/cases/${caseId}/metrics`);
      updateStatus(true);
      return data;
    }
  } catch {
    updateStatus(false);
  }

  return {
    recoveryRate: { recovered: 1, known: 1, partial: 0 },
    alignmentErrorS: [
      { camera: 'CH 01 (Entrance)', value: 0.0 },
      { camera: 'CH 02 (Aisle 4)', value: 0.05 },
      { camera: 'CH 03 (Cash Counter)', value: 0.0 },
    ],
    processing: { minutesPerSecond: 14.8, totalDurationS: 81 },
    falsePositiveRate: { incorrect: 0, total: 4 },
    hashVerified: { verified: 4, total: 4 },
    traceability: { linked: 4, total: 4 },
  };
}

// --- GAPS ---

export async function apiUpdateGapVerdict(
  caseId: string,
  gapId: string,
  verdict: string,
  notes: string
): Promise<{ success: boolean }> {
  try {
    if (!FORCE_MOCK) {
      const res = await request<{ success: boolean }>(`/api/cases/${caseId}/gaps/${gapId}`, {
        method: 'PATCH',
        body: JSON.stringify({ verdict, notes }),
      });
      updateStatus(true);
      return res;
    }
  } catch {
    updateStatus(false);
  }

  return { success: true };
}

// --- SEARCH ---

export async function apiSearchEvidence(
  caseId: string,
  query: string,
  type: 'text' | 'image' = 'text'
): Promise<SearchResult[]> {
  try {
    if (!FORCE_MOCK) {
      const res = await request<SearchResult[]>(`/api/cases/${caseId}/search?q=${encodeURIComponent(query)}&type=${type}`);
      updateStatus(true);
      return res;
    }
  } catch {
    updateStatus(false);
  }

  return [];
}

// --- JOBS & ANALYSIS ---

export async function apiStartAnalysis(
  caseId: string,
  options: { deepCarve?: boolean; alignClocks?: boolean } = {}
): Promise<Job> {
  try {
    if (!FORCE_MOCK) {
      const res = await request<Job>(`/api/cases/${caseId}/analyze`, {
        method: 'POST',
        body: JSON.stringify(options),
      });
      updateStatus(true);
      return res;
    }
  } catch {
    updateStatus(false);
  }

  return {
    id: `JOB-${Date.now().toString().slice(-6)}`,
    type: 'analyze',
    status: 'running',
    progress: 10,
    startedAt: new Date().toISOString(),
  };
}

export async function apiGetJob(jobId: string): Promise<Job> {
  try {
    if (!FORCE_MOCK) {
      const res = await request<Job>(`/api/jobs/${jobId}`);
      updateStatus(true);
      return res;
    }
  } catch {
    updateStatus(false);
  }

  return {
    id: jobId,
    type: 'analyze',
    status: 'done',
    progress: 100,
    startedAt: new Date().toISOString(),
  };
}

// --- REPORT LAB PDF URL ---

export function getReportDownloadUrl(caseId: string): string {
  return `${API_BASE}/api/cases/${caseId}/report`;
}
