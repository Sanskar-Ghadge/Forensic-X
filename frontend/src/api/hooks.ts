import { useState, useEffect, useCallback } from 'react';
import {
  apiGetCases,
  apiGetCase,
  apiGetTimeline,
  apiGetMetrics,
  checkBackendHealth,
  subscribeApiStatus,
  ApiStatus,
  TimelineData,
} from './client';
import { Case, Metrics } from './types';

export function useApiStatus(): ApiStatus {
  const [status, setStatus] = useState<ApiStatus>({
    isLive: false,
    checkedAt: new Date().toISOString(),
    baseUrl: 'http://127.0.0.1:8000',
  });

  useEffect(() => {
    const unsub = subscribeApiStatus(setStatus);
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 15000);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  return status;
}

export function useCases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiGetCases();
      setCases(data);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch cases');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { cases, isLoading, error, refetch: load };
}

export function useCase(caseId: string) {
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!caseId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiGetCase(caseId);
      setCaseData(data);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch case data');
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    load();
  }, [load]);

  return { caseData, isLoading, error, refetch: load };
}

export function useTimeline(caseId: string) {
  const [timeline, setTimeline] = useState<TimelineData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!caseId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiGetTimeline(caseId);
      setTimeline(data);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch timeline data');
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    load();
  }, [load]);

  return { timeline, isLoading, error, refetch: load };
}

export function useMetrics(caseId: string) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!caseId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiGetMetrics(caseId);
      setMetrics(data);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch metrics');
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    load();
  }, [load]);

  return { metrics, isLoading, error, refetch: load };
}
