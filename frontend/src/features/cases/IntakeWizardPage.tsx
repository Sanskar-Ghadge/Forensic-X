import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, CaseSummary } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DecryptedText } from '@/components/fx/DecryptedText';
import {
  ShieldCheck,
  HardDrive,
  Play,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  UploadCloud,
  RefreshCw,
  Sparkles,
  Lock,
} from 'lucide-react';

const EXPECTED_MOCK_SHA = '618ed08956f023966c63dd2416f7d8b2aa8f071dfa4835305f57d608215720d0';

export const IntakeWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { addCase, setCurrentCaseId } = useAppStore();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Case Details
  const [caseId, setCaseId] = useState('CASE-2026-APEX-01');
  const [caseName, setCaseName] = useState('Retail Store Incident — 2026-10-17');
  const [investigator, setInvestigator] = useState('Det. S. Vance (Forensic Unit)');
  const [incidentTime, setIncidentTime] = useState('2026-10-17T21:42:17Z');
  const [notes, setNotes] = useState('Suspected theft across entrance and cash counter. Raw sector scan requested.');

  // Step 2: Evidence Image
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSizeBytes, setFileSizeBytes] = useState<number>(0);
  const [isSampleLoaded, setIsSampleLoaded] = useState(false);

  // Step 3: Hash Calculation & Verification
  const [hashingProgress, setHashingProgress] = useState(0);
  const [hashingSpeed, setHashingSpeed] = useState(0);
  const [isHashingComplete, setIsHashingComplete] = useState(false);
  const [simulateCorruption, setSimulateCorruption] = useState(false);
  const [hashResult, setHashResult] = useState('');

  // Step 4: Adapter Selection
  const [detectedAdapter, setDetectedAdapter] = useState<'mock' | 'generic' | 'none'>('mock');
  const [isAdapterScanning, setIsAdapterScanning] = useState(false);

  // Step 5: Analysis Options
  const [aiPassMode, setAiPassMode] = useState<'pass1' | 'twopass'>('twopass');
  const [enableCarving, setEnableCarving] = useState(true);
  const [enableLogs, setEnableLogs] = useState(true);
  const [enableClockSync, setEnableClockSync] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Quick load sample evidence
  const loadSampleEvidence = () => {
    setFileName('mock_dvr.img');
    setFileSizeBytes(885248);
    setIsSampleLoaded(true);
  };

  // Run Hashing Simulator
  const startHashing = () => {
    setHashingProgress(0);
    setIsHashingComplete(false);
    setHashingSpeed(374.8);

    const interval = setInterval(() => {
      setHashingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsHashingComplete(true);
          setHashResult(
            simulateCorruption
              ? 'deadbeef00000000badf00d11112222333344445555666677778888999900000'
              : EXPECTED_MOCK_SHA
          );
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  // Auto-start hashing when step 3 opens
  useEffect(() => {
    if (currentStep === 3 && hashingProgress === 0) {
      startHashing();
    }
  }, [currentStep]);

  // Adapter detection scan when step 4 opens
  useEffect(() => {
    if (currentStep === 4) {
      setIsAdapterScanning(true);
      const timer = setTimeout(() => {
        setIsAdapterScanning(false);
        setDetectedAdapter('mock');
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Run analysis pipeline
  const runAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(10);
    setAnalysisStage('Stage 1/5: Cryptographic write-block verification...');

    setTimeout(() => {
      setAnalysisProgress(30);
      setAnalysisStage('Stage 2/5: Reading sector 0 index table (4 active segments found)...');
    }, 600);

    setTimeout(() => {
      setAnalysisProgress(60);
      setAnalysisStage('Stage 3/5: Deep sector carving unallocated disk blocks (1 deleted segment recovered)...');
    }, 1300);

    setTimeout(() => {
      setAnalysisProgress(85);
      setAnalysisStage('Stage 4/5: Correlating events.log & clock drift (+4.0s calibration on CH2)...');
    }, 2000);

    setTimeout(() => {
      setAnalysisProgress(100);
      setAnalysisStage('Stage 5/5: Pipeline complete. Integrity validated (PASS).');

      // Add to store
      const newCase: CaseSummary = {
        id: caseId,
        name: caseName,
        incidentTime: incidentTime,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
        status: 'ready',
        recorderCount: 1,
        cameraCount: 3,
        sha256: EXPECTED_MOCK_SHA,
        notes: notes,
      };
      addCase(newCase);
      setCurrentCaseId(caseId);

      setTimeout(() => {
        navigate(`/cases/${caseId}`);
      }, 800);
    }, 2800);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono tracking-widest text-scan">Forensic Evidence Intake</span>
            <Badge variant="scan" className="text-[10px]">Step {currentStep} of 5</Badge>
          </div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-scan" />
            <span>Cryptographic Acquisition Wizard</span>
          </h1>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/cases')}
          className="text-xs border-edge text-ink-soft hover:text-white"
        >
          Cancel
        </Button>
      </div>

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-5 gap-2 p-3 rounded-card bg-console border border-edge">
        {[
          { num: 1, label: 'Case Info' },
          { num: 2, label: 'Evidence' },
          { num: 3, label: 'SHA-256' },
          { num: 4, label: 'Adapter' },
          { num: 5, label: 'Analyze' },
        ].map((s) => {
          const isDone = s.num < currentStep;
          const isCurrent = s.num === currentStep;
          return (
            <div
              key={s.num}
              onClick={() => {
                // Allow clicking completed steps
                if (isDone) setCurrentStep(s.num);
              }}
              className={`flex items-center gap-2 py-1.5 px-2 rounded-control text-xs font-mono transition-colors ${
                isCurrent
                  ? 'bg-scan/20 text-scan border border-scan/40 font-bold'
                  : isDone
                  ? 'text-verified cursor-pointer hover:bg-raised/60'
                  : 'text-ink-faint'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isCurrent
                    ? 'bg-scan text-void'
                    : isDone
                    ? 'bg-verified text-void'
                    : 'bg-raised text-ink-faint'
                }`}
              >
                {isDone ? '✓' : s.num}
              </div>
              <span className="hidden sm:inline truncate">{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Wizard Content Panels */}
      <Card surface="console" className="p-6 md:p-8 space-y-6 border border-edge">
        {/* STEP 1: CASE DETAILS */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white">Step 1: Case Identification & Narrative</h2>
              <p className="text-xs text-ink-soft mt-1">
                Enter reference identifiers and incident parameters to index this forensic investigation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-ink-soft">CASE IDENTIFIER</label>
                <input
                  type="text"
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-void border border-edge rounded-control text-ink font-mono focus:border-scan focus:outline-none"
                  placeholder="CASE-2026-XXXX"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-ink-soft">INCIDENT TIMESTAMP (UTC)</label>
                <input
                  type="text"
                  value={incidentTime}
                  onChange={(e) => setIncidentTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-void border border-edge rounded-control text-ink font-mono focus:border-scan focus:outline-none"
                  placeholder="2026-10-17T21:42:17Z"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-mono text-ink-soft">CASE TITLE / INCIDENT NAME</label>
                <input
                  type="text"
                  value={caseName}
                  onChange={(e) => setCaseName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-void border border-edge rounded-control text-ink font-sans focus:border-scan focus:outline-none"
                  placeholder="E.g. Retail Store Incident Investigation"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-mono text-ink-soft">LEAD EXAMINER / BADGE</label>
                <input
                  type="text"
                  value={investigator}
                  onChange={(e) => setInvestigator(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-void border border-edge rounded-control text-ink font-sans focus:border-scan focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-mono text-ink-soft">INVESTIGATION NOTES & HYPOTHESIS</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-void border border-edge rounded-control text-ink font-sans focus:border-scan focus:outline-none"
                  placeholder="Briefly describe what missing footage or camera movements are being investigated..."
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: EVIDENCE ACQUISITION */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white">Step 2: Evidence Image Intake</h2>
              <p className="text-xs text-ink-soft mt-1">
                Provide the raw CCTV recorder bitstream image (.img, .raw, .dd) or export folder.
              </p>
            </div>

            {/* Write-Block Guarantee Banner */}
            <div className="p-3.5 rounded-control bg-scan/10 border border-scan/30 flex items-start gap-3">
              <Lock className="w-4 h-4 text-scan mt-0.5 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-scan">Forensic Write-Block Guarantee:</span>
                <p className="text-ink-soft mt-0.5 leading-relaxed">
                  The evidence image is opened strictly read-only with non-exclusive sharing locks. The original disk
                  blocks are never modified or touched.
                </p>
              </div>
            </div>

            {/* Drop Zone */}
            <div
              onClick={loadSampleEvidence}
              className={`border-2 border-dashed rounded-card p-8 text-center cursor-pointer transition-all ${
                fileName
                  ? 'border-scan/60 bg-scan/5'
                  : 'border-edge hover:border-scan/40 hover:bg-raised/40'
              }`}
            >
              <UploadCloud className="w-10 h-10 mx-auto text-scan mb-3" />
              {fileName ? (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-control bg-raised border border-edge text-xs font-mono text-white">
                    <HardDrive className="w-4 h-4 text-scan" />
                    <span>{fileName}</span>
                    <span className="text-ink-faint">({(fileSizeBytes / 1024).toFixed(1)} KB)</span>
                  </div>
                  <p className="text-xs text-verified font-medium">Evidence Loaded & Verified in Buffer</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-white">Drag and drop raw disk image here</p>
                  <p className="text-xs text-ink-soft">Supported: .img, .raw, .dd, .bin, or DVR exports</p>
                </div>
              )}
            </div>

            {/* Quick Sample Button */}
            <div className="flex items-center justify-between p-3 rounded-control bg-raised/50 border border-edge">
              <div className="text-xs">
                <span className="font-semibold text-white">Evaluation Dataset:</span>
                <span className="text-ink-soft ml-1.5">MOCKDVR1 Image (885 KB) with Cam 1 deleted clip & Cam 3 gap</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={loadSampleEvidence}
                className="text-xs border-scan/40 text-scan hover:bg-scan/10"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                {isSampleLoaded ? 'Sample Evidence Selected' : 'Use Sample Evidence'}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: HASHING */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white">Step 3: Cryptographic Integrity Hashing</h2>
              <p className="text-xs text-ink-soft mt-1">
                Streaming chunked SHA-256 fingerprint generation to establish baseline chain-of-custody.
              </p>
            </div>

            {/* Hash Card */}
            <div className="p-5 rounded-card bg-void/90 border border-edge space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-ink-soft">READ SPEED: {hashingSpeed} MB/s</span>
                <span className="text-scan font-bold">{hashingProgress}% PROCESSED</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-raised overflow-hidden">
                <div
                  className="h-full bg-scan transition-all duration-200"
                  style={{ width: `${hashingProgress}%` }}
                />
              </div>

              {/* Hash Display */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-mono text-ink-faint">COMPUTED SHA-256 DIGEST:</span>
                <div className="p-3 rounded-control bg-raised border border-edge font-mono text-xs text-white break-all tracking-wider">
                  {isHashingComplete ? (
                    <DecryptedText
                      text={hashResult}
                      speed={15}
                      className="text-scan font-bold"
                    />
                  ) : (
                    <span className="text-ink-faint animate-pulse">Calculating streaming SHA-256 chunks...</span>
                  )}
                </div>
              </div>

              {/* Status and Verification */}
              {isHashingComplete && (
                <div>
                  {hashResult.toLowerCase() === EXPECTED_MOCK_SHA.toLowerCase() ? (
                    <div className="p-3 rounded-control bg-verified/10 border border-verified/40 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-verified font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>INTEGRITY MATCH: 100% Validated against acquisition record</span>
                      </div>
                      <Badge variant="verified">PASS</Badge>
                    </div>
                  ) : (
                    <div className="p-3 rounded-control bg-rose-500/15 border border-rose-500/50 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-rose-400 font-bold">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          <span>INTEGRITY FAILURE: SHA-256 Mismatch Detected</span>
                        </div>
                        <Badge variant="gap">CORRUPTED</Badge>
                      </div>
                      <p className="text-rose-300 text-[11px]">
                        The computed fingerprint does not match the manifest. The image may have suffered bit rot or
                        unauthorized modification.
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={startHashing}
                        className="text-xs border-rose-500/40 text-rose-400 hover:bg-rose-500/10"
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1" />
                        Retry Verification
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Forensic Test Control: Simulate Hash Failure */}
            <div className="p-3 rounded-control bg-raised/40 border border-edge flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-white">Demonstrate Forensic Safety:</span>
                <p className="text-[11px] text-ink-soft">Toggle corrupted bitstream to inspect rejection handling.</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simulateCorruption}
                  onChange={(e) => {
                    setSimulateCorruption(e.target.checked);
                    setIsHashingComplete(false);
                    setTimeout(() => startHashing(), 50);
                  }}
                  className="rounded border-edge text-scan focus:ring-0 bg-void"
                />
                <span className="text-xs text-ink-soft font-mono">Simulate Mismatch</span>
              </label>
            </div>
          </div>
        )}

        {/* STEP 4: ADAPTER DETECTION */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white">Step 4: Proprietary Vendor Adapter Detection</h2>
              <p className="text-xs text-ink-soft mt-1">
                Scanning sector 0 filesystem headers against adapter registry signatures.
              </p>
            </div>

            {isAdapterScanning ? (
              <div className="p-8 text-center space-y-3">
                <RefreshCw className="w-6 h-6 mx-auto text-scan animate-spin" />
                <p className="text-xs font-mono text-ink-soft">Scanning registered vendor filesystem signatures...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Mock Adapter */}
                <div
                  onClick={() => setDetectedAdapter('mock')}
                  className={`p-4 rounded-card border transition-all cursor-pointer ${
                    detectedAdapter === 'mock'
                      ? 'bg-scan/10 border-scan/60'
                      : 'bg-raised/40 border-edge hover:border-edge/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-verified/20 text-verified flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">MOCKDVR1 Simulated Vendor Adapter</h4>
                        <p className="text-xs text-ink-soft">
                          Matches signature <code className="text-scan font-mono">MOCKIDX1</code> at sector 0.
                        </p>
                      </div>
                    </div>
                    <Badge variant="verified">MATCHED</Badge>
                  </div>
                  <div className="mt-3 pt-3 border-t border-edge/60 text-xs font-mono text-ink-soft grid grid-cols-2 gap-2">
                    <span>Index Table: Sector 0 (4 active clips)</span>
                    <span>Channels: 3 Detected (1080p)</span>
                  </div>
                </div>

                {/* Other Vendor Adapters */}
                {[
                  { name: 'Hikvision DVR Adapter', sig: 'HIKFS / HK_IDX', status: 'NO MATCH' },
                  { name: 'Dahua DVR Adapter', sig: 'DHFS44 / DHI', status: 'NO MATCH' },
                  { name: 'CP Plus DVR Adapter', sig: 'CPFS / CPIDX', status: 'NO MATCH' },
                ].map((v) => (
                  <div
                    key={v.name}
                    className="p-3.5 rounded-control bg-raised/20 border border-edge/60 flex items-center justify-between opacity-60 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-ink-soft">{v.name}</span>
                      <span className="text-ink-faint ml-2 font-mono">({v.sig})</span>
                    </div>
                    <span className="font-mono text-[10px] text-ink-faint">{v.status}</span>
                  </div>
                ))}

                {/* Generic Carver Fallback */}
                <div
                  onClick={() => setDetectedAdapter('generic')}
                  className={`p-3.5 rounded-control border transition-all cursor-pointer text-xs ${
                    detectedAdapter === 'generic'
                      ? 'bg-amber-500/10 border-amber-500/60'
                      : 'bg-raised/20 border-edge/60 hover:border-edge'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white">Generic Raw Video Carver (Fallback)</span>
                      <p className="text-[11px] text-ink-soft mt-0.5">
                        Deep sector scanner. Carves container markers if no proprietary index is present.
                      </p>
                    </div>
                    <Badge variant="estimated">STANDBY</Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: PIPELINE EXECUTION */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white">Step 5: Forensic Pipeline Configuration</h2>
              <p className="text-xs text-ink-soft mt-1">
                Configure two-pass AI budget and carve options before executing the forensic pipeline.
              </p>
            </div>

            {isAnalyzing ? (
              <div className="p-8 rounded-card bg-void/90 border border-scan/40 space-y-5 text-center">
                <div className="w-12 h-12 rounded-full border-2 border-scan border-t-transparent animate-spin mx-auto" />
                <div>
                  <h3 className="text-sm font-semibold text-white">Running FORENSIC-X Core Engine</h3>
                  <p className="text-xs font-mono text-scan mt-1">{analysisStage}</p>
                </div>
                <div className="w-full h-2 rounded-full bg-raised overflow-hidden max-w-md mx-auto">
                  <div
                    className="h-full bg-scan transition-all duration-300"
                    style={{ width: `${analysisProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* AI Pass Selection */}
                <div className="p-4 rounded-card bg-raised/40 border border-edge space-y-2">
                  <span className="text-xs font-mono text-ink-soft uppercase">AI Compute Budget</span>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      onClick={() => setAiPassMode('pass1')}
                      className={`p-3 rounded-control text-left border transition-all ${
                        aiPassMode === 'pass1'
                          ? 'bg-scan/20 border-scan text-white'
                          : 'bg-void/60 border-edge text-ink-soft'
                      }`}
                    >
                      <div className="text-xs font-bold font-mono">PASS 1 ONLY</div>
                      <div className="text-[11px] text-ink-soft mt-0.5">Fast OpenCV motion filter + YOLO11n</div>
                    </button>

                    <button
                      onClick={() => setAiPassMode('twopass')}
                      className={`p-3 rounded-control text-left border transition-all ${
                        aiPassMode === 'twopass'
                          ? 'bg-scan/20 border-scan text-white'
                          : 'bg-void/60 border-edge text-ink-soft'
                      }`}
                    >
                      <div className="text-xs font-bold font-mono text-scan">TWO-PASS FORENSIC</div>
                      <div className="text-[11px] text-ink-soft mt-0.5">Motion filter + YOLO11n + OSNet ReID</div>
                    </button>
                  </div>
                </div>

                {/* Pipeline Feature Toggles */}
                <div className="space-y-2">
                  {[
                    {
                      label: 'Deep Sector Video Carving',
                      desc: 'Scans unallocated sectors for deleted clips bypassing filesystem index.',
                      val: enableCarving,
                      setVal: setEnableCarving,
                    },
                    {
                      label: 'Hardware & DVR Event Log Parsing',
                      desc: 'Correlates video-loss, power-cut, and clock changes with footage gaps.',
                      val: enableLogs,
                      setVal: setEnableLogs,
                    },
                    {
                      label: 'Cross-Camera Clock Synchronization',
                      desc: 'Calibrates camera drift offsets with Bayesian uncertainty error bounds.',
                      val: enableClockSync,
                      setVal: setEnableClockSync,
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-control bg-raised/30 border border-edge flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-semibold text-white">{item.label}</span>
                        <p className="text-[11px] text-ink-soft">{item.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={item.val}
                        onChange={(e) => item.setVal(e.target.checked)}
                        className="rounded border-edge text-scan focus:ring-0 bg-void"
                      />
                    </div>
                  ))}
                </div>

                {/* Launch Button */}
                <Button
                  variant="primary"
                  onClick={runAnalysis}
                  className="w-full py-2.5 shadow-glow-cyan font-semibold text-xs tracking-wide"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Initialize Forensic Pipeline & Build Workspace
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Wizard Footer Navigation */}
        {!isAnalyzing && (
          <div className="pt-4 border-t border-edge flex items-center justify-between">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((p) => Math.max(1, p - 1))}
              className="text-xs border-edge text-ink-soft hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Previous
            </Button>

            {currentStep < 5 && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (currentStep === 2 && !fileName) {
                    loadSampleEvidence();
                  }
                  setCurrentStep((p) => Math.min(5, p + 1));
                }}
                disabled={currentStep === 3 && hashResult.toLowerCase() !== EXPECTED_MOCK_SHA.toLowerCase()}
                className="text-xs shadow-glow-cyan"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
