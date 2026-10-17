import { useEffect } from 'react';

/**
 * Updates document.title and ensures accessible screen-reader announcement
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} — FORENSIC-X` : 'FORENSIC-X — CCTV Evidence Forensics';

    return () => {
      document.title = prev;
    };
  }, [title]);
}
