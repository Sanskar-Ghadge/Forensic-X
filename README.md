# FORENSIC-X

> **From hours of manual CCTV review to one searchable, connected, and traceable investigation workflow.**

**Event**: Code Apex Hackathon (Vishwakarma Institutes, AISF, powered by Verzii)  
**Track**: Track 3: Open Innovation  
**Team**: Team *Claude Code*  
**Team Lead**: Sanskar Ghadge (`@Sanskar`)  

---

## 📌 What is FORENSIC-X?

**FORENSIC-X** is an intelligent digital forensics platform engineered for police, cybercrime investigation units, and courts to ingest, recover, synchronize, and analyze video evidence from multi-vendor CCTV recorder (DVR/NVR) systems (Hikvision, Dahua, CP Plus, etc.).

Unlike conventional video analysis tools that merely run AI models on isolated clips, FORENSIC-X is a **traceable evidence platform**:
1. **Cryptographic SHA-256 Anchoring**: Read-only ingestion with write-blocking; every extracted frame, detection, and finding is anchored back to a verifiable SHA-256 hash for unbroken chain of custody.
2. **Deleted Footage Carving**: Scans raw unindexed disk blocks to reconstruct deleted or fragmented video segments before they are overwritten.
3. **Temporal Calibration (Clock Normalization)**: Cross-references environmental reference events (wall clocks, lighting flashes, transit paths) to align desynchronized camera clocks with an honest uncertainty bound (e.g., `21:41:10 ± 4s`).
4. **Explainable Footage Gap Assessment**: Diagnoses missing footage ranges (e.g. 21:40 to 21:55) by cross-referencing system logs, schedules, and residual disk sectors to provide probabilistic causes with supporting/contradicting evidence (e.g. *Camera Disconnected: 80% confidence, video-loss log at 21:40:02*).
5. **Cross-Camera Entity Search**: Two-pass detection (OpenCV motion gating + YOLO11n nano, followed by OSNet person re-ID or CLIP text/image queries like *"red backpack"*).
6. **Tamper-Evident Court Reports**: Instant generation of sealed, court-ready PDF audit reports with source frame references and hash verification seals.

---

## 🏛️ System Architecture

```text
Forensic - X/
├── FORENSIC-X Project Document.docx
├── FORENSIC-X Frontend Implementation Plan.docx
├── structure.md
├── docs/                            # Demo script, schema, architecture
├── data/                            # Market-1501, MOT17, Wildtrack, Anomaly Videos
├── sample_data/                     # MOCKDVR1 disk images & truth.json
├── forensic_core/                   # Python carving, hashing, vendor adapters
│   ├── intake.py                    # Read-only open & chunked SHA-256
│   ├── schema.py                    # Common Evidence Schema models
│   ├── adapters/                    # Base, mock, generic carver, vendor stubs
│   ├── carver.py                    # Raw block scanner
│   ├── recover.py                   # Segment stitching & verification
│   └── logs.py                      # Video-loss, reboot, clock-change parser
├── backend/                         # FastAPI application & SQLite DB
│   ├── main.py                      # API router & lifespan
│   ├── models.py                    # SQLAlchemy evidence tables
│   ├── routers/                     # Cases, upload, timeline, gaps, search, report
│   └── report.py                    # PDF generator (ReportLab)
├── ai/                              # Vision & search engine
│   ├── motion.py                    # OpenCV background subtractor / gate
│   ├── detect.py                    # YOLO11n pass 1 & pass 2
│   ├── clock.py                     # Temporal offset solver & drift line
│   ├── gaps.py                      # Rule-based gap diagnosis & scoring
│   ├── embed.py                     # OSNet / CLIP feature extraction
│   └── search.py                    # FAISS vector similarity search
└── frontend/                        # React + TypeScript + Vite + Tailwind CSS
    ├── src/
    │   ├── styles/                  # tokens.css & globals.css (Evidence Room palette)
    │   ├── components/
    │   │   ├── ui/                  # Base controls (Button, Card, Badge, Table, Tooltip)
    │   │   ├── forensic/            # HashChip, TimeCode, StateBadge, ConfidenceBar, CameraBadge
    │   │   ├── fx/                  # React Bits wrappers & useMotion safety layer
    │   │   └── layout/              # Shell, SideRail, TopBar, Inspector, PlaybackStrip
    │   └── features/
    │       └── design/              # Living style guide (/design)
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18+ (tested on v26.5.1)
* **Python**: 3.10+
* **FFmpeg**: For video frame decoding and segment inspection

### Frontend Setup & Living Style Guide
```powershell
cd frontend
npm install
npm run dev
```
Open **`http://127.0.0.1:5173/design`** to explore the **Living Style Guide**, featuring:
* The Evidence Room dark palette and WCAG-compliant contrast tokens.
* Non-color cue StateBadges (*Verified, Recovered, Partial, Estimated, Gap, Lead, Undetermined*).
* Interactive `HashChip` with one-click SHA-256 copy.
* `TimeCode` with uncertainty margins ($\pm 4s$).
* Dynamic motion switcher (`Full`, `Reduced`, `Off`) with automatic fallback to zero-cost static rendering.

---

## ⚖️ Forensic Integrity & Claims Honesty

1. **Vendor Support**: We describe our engine as an *"adapter architecture with a generic fallback"*, never *"supports all DVRs"*. Proprietary DVR disk formats are reverse-engineered; unindexed or unknown brands receive partial recovery through the generic carver.
2. **Gap Diagnosis**: Causes are reported as *probabilistic estimates with confidence scores and evidence lists*, never as undeniable facts. If clues are insufficient, the system reports *"Cause undetermined"*, which is an honest forensic verdict.
3. **Recovery Limits**: Deleted video is recoverable only as long as raw disk blocks have not been overwritten by continuous loop recording.
4. **AI Output**: Detection and visual search matches are labeled as **leads for investigator verification**, never as conclusive legal proof.

---

## 📜 Credits & Acknowledgments
* **React Bits**: Open-source visual component library (`reactbits.dev`).
* **Icons**: Lucide React (`lucide.dev`).
* **UI Primitives**: Radix UI (`radix-ui.com`).
* **Datasets**: Market-1501 (Zheng et al.), MOT17, WILDTRACK, UCF-Crime.
