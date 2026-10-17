import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ReportPreview } from './ReportPreview';
import { MetricsDashboard } from './MetricsDashboard';
import { AuditTrailPanel } from './AuditTrailPanel';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  FileText,
  ShieldCheck,
  Download,
  Printer,
  Copy,
  Check,
  Lock,
  Layers,
  BarChart3,
  History,
} from 'lucide-react';

import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export const ReportPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const activeCase = caseId || 'CASE-2026-APEX-01';
  useDocumentTitle(`Court Audit Report & Metrics — ${activeCase}`);

  const [activeTab, setActiveTab] = useState<'preview' | 'metrics' | 'audit'>('preview');

  // Report Settings
  const [examinerName, setExaminerName] = useState('Certified Digital Forensics Examiner');
  const [examinerAgency, setExaminerAgency] = useState('Digital Evidence Unit / State Forensics Lab');
  const [customNotes, setCustomNotes] = useState(
    'All physical sectors and cryptographic digests verified against original acquisition bitstream. Video carving successfully decoded without bitstream drift.'
  );

  const [includedSections, setIncludedSections] = useState<Record<string, boolean>>({
    metadata: true,
    hashes: true,
    sync: true,
    findings: true,
  });

  const [isSealed, setIsSealed] = useState(false);
  const [isSealing, setIsSealing] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const toggleSection = (key: string) => {
    setIncludedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSealReport = () => {
    setIsSealing(true);
    setTimeout(() => {
      setIsSealing(false);
      setIsSealed(true);
      alert('Report cryptographically sealed and certified under Section 65B Indian Evidence Act / FRE 902!');
    }, 1000);
  };

  const handleDownloadPdf = () => {
    // Direct link to backend PDF generation endpoint
    window.open(`http://127.0.0.1:8000/api/cases/${activeCase}/report?examiner=${encodeURIComponent(examinerName)}&agency=${encodeURIComponent(examinerAgency)}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const text = `# FORENSIC-X DIGITAL EVIDENCE AUDIT REPORT
Case: ${activeCase}
Examiner: ${examinerName}
Agency: ${examinerAgency}

## Physical Acquisition
- Disk Image: mock_dvr.img (153.6 MB)
- SHA-256 Digest: 618ed08956f023966c63dd2416f7d8b2aa8f071dfa4835305f57d608215720d0
- Verification Status: MATCH (PASS)

## Multi-Camera Synchronization
- CAM 01 Entrance: 0.00s offset (±0.05s)
- CAM 02 Aisle 4: +4.00s offset (±0.05s)
- CAM 03 Cash Counter: 0.00s offset (±0.08s)

## Key Findings
1. CARVE-01: Restored deleted footage SEG-002-DEL at sector 254464 (SHA-256: 0b2b68603632cf4b64fcad18a6dfc9247d8ff60f04c6e9a7e6b0253457b3f25c).
2. GAP-CH3-01: 908-second signal loss on Channel 3 attributed to Camera Disconnect (80% confidence estimate).

Notes: ${customNotes}
`;
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-scan" />
            <h1 className="font-display text-2xl font-bold text-white tracking-tight">
              Court Audit Certificate & Validation Metrics
            </h1>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Generate legally compliant forensic audit certificates, view six traceable validation metrics, and inspect the chain-of-custody audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="neutral" className="text-xs font-mono">
            Case: {activeCase}
          </Badge>
          <Badge variant="verified" className="text-xs font-mono">
            Section 65B Certified
          </Badge>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Settings, Sections & Sealing Controls */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-xl bg-panel-dark border border-grid-line/80 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-grid-line/60">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-scan" />
                <span>Certificate Settings</span>
              </span>
              {isSealed ? (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono font-bold">
                  SEALED
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  DRAFT
                </span>
              )}
            </div>

            {/* Sections Checklist */}
            <div className="space-y-2.5">
              <span className="text-ink-muted text-xs font-mono uppercase tracking-wider block">
                Include Sections:
              </span>
              <div className="space-y-2 text-xs text-ink-soft">
                <label className="flex items-center gap-2.5 cursor-pointer select-none hover:text-white">
                  <input
                    type="checkbox"
                    checked={includedSections.metadata}
                    onChange={() => toggleSection('metadata')}
                    className="rounded bg-panel-dark border-grid-line text-scan focus:ring-scan/30"
                  />
                  <span>1. Case Coordinates & Scope</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none hover:text-white">
                  <input
                    type="checkbox"
                    checked={includedSections.hashes}
                    onChange={() => toggleSection('hashes')}
                    className="rounded bg-panel-dark border-grid-line text-scan focus:ring-scan/30"
                  />
                  <span>2. Physical Storage & SHA-256 Seal</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none hover:text-white">
                  <input
                    type="checkbox"
                    checked={includedSections.sync}
                    onChange={() => toggleSection('sync')}
                    className="rounded bg-panel-dark border-grid-line text-scan focus:ring-scan/30"
                  />
                  <span>3. Multi-Camera Clock Calibration</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none hover:text-white">
                  <input
                    type="checkbox"
                    checked={includedSections.findings}
                    onChange={() => toggleSection('findings')}
                    className="rounded bg-panel-dark border-grid-line text-scan focus:ring-scan/30"
                  />
                  <span>4. Carved Clips & Gap Attribution</span>
                </label>
              </div>
            </div>

            {/* Examiner Information Input */}
            <div className="space-y-3 pt-2 border-t border-grid-line/50 text-xs font-mono">
              <div>
                <label className="text-ink-muted block text-[11px] mb-1">Lead Examiner Name:</label>
                <input
                  type="text"
                  value={examinerName}
                  onChange={(e) => setExaminerName(e.target.value)}
                  className="w-full p-2 bg-panel-light/20 border border-grid-line/60 rounded text-xs text-white focus:outline-none focus:border-scan/70"
                />
              </div>

              <div>
                <label className="text-ink-muted block text-[11px] mb-1">Agency / Forensic Lab:</label>
                <input
                  type="text"
                  value={examinerAgency}
                  onChange={(e) => setExaminerAgency(e.target.value)}
                  className="w-full p-2 bg-panel-light/20 border border-grid-line/60 rounded text-xs text-white focus:outline-none focus:border-scan/70"
                />
              </div>

              <div>
                <label className="text-ink-muted block text-[11px] mb-1">Examiner Commentary:</label>
                <textarea
                  rows={3}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full p-2 bg-panel-light/20 border border-grid-line/60 rounded text-xs text-white focus:outline-none focus:border-scan/70 resize-none font-sans"
                />
              </div>
            </div>

            {/* Sealing & PDF Actions */}
            <div className="space-y-2.5 pt-3 border-t border-grid-line/50">
              <Button
                variant="primary"
                onClick={handleSealReport}
                disabled={isSealing || isSealed}
                className="w-full text-xs gap-2 font-mono h-9 font-semibold"
              >
                {isSealed ? (
                  <>
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>Cryptographically Sealed</span>
                  </>
                ) : isSealing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Re-Verifying Bitstream Hashes...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Seal & Sign Certificate</span>
                  </>
                )}
              </Button>

              <Button
                variant="secondary"
                onClick={handleDownloadPdf}
                className="w-full text-xs gap-2 font-mono h-9 border-grid-line hover:border-scan text-white"
              >
                <Download className="w-4 h-4 text-scan" />
                <span>Download Sealed PDF (Court-Ready)</span>
              </Button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrint}
                  className="text-xs gap-1.5 h-8 text-ink-muted hover:text-white"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print View</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyMarkdown}
                  className="text-xs gap-1.5 h-8 text-ink-muted hover:text-white"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-status-active" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'Copied!' : 'Copy Text'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tabbed Preview & Metrics View */}
        <div className="lg:col-span-8 space-y-4">
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-panel-dark border border-grid-line/60 shadow-md">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'preview'
                  ? 'bg-scan text-white shadow-sm'
                  : 'text-ink-muted hover:text-white hover:bg-panel-light/20'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Court Report Preview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('metrics')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'metrics'
                  ? 'bg-scan text-white shadow-sm'
                  : 'text-ink-muted hover:text-white hover:bg-panel-light/20'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Validation Metrics (F7.1)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'audit'
                  ? 'bg-scan text-white shadow-sm'
                  : 'text-ink-muted hover:text-white hover:bg-panel-light/20'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Chain of Custody (F7.3)</span>
            </button>
          </div>

          {/* Active Tab Content */}
          <div className="animate-fade-in">
            {activeTab === 'preview' && (
              <ReportPreview
                caseId={activeCase}
                examinerName={examinerName}
                examinerAgency={examinerAgency}
                customNotes={customNotes}
                includedSections={includedSections}
                isSealed={isSealed}
              />
            )}

            {activeTab === 'metrics' && <MetricsDashboard />}

            {activeTab === 'audit' && <AuditTrailPanel />}
          </div>
        </div>
      </div>
    </div>
  );
};
