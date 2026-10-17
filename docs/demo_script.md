# FORENSIC-X: 5-Minute Scripted Demo Guide

> **Single Scripted Scenario**: Theft incident at 21:42:17 across 3 cameras, 1 camera clock 4 seconds off, 1 clip deleted and carved from disk, and 1 footage gap explained as camera disconnection.

---

## ⏱️ Timeline of Demo Beats

| Time | Beat & Screen | What the Presenter Does | Key Takeaway for Judges |
| :--- | :--- | :--- | :--- |
| **0:00 – 0:30** | **1. The Problem**<br>`/` (Landing) | Highlight the 3 core pain points: proprietary vendor silos (Hikvision/Dahua/CP Plus), deleted footage lost in unindexed blocks, and clocks drifting across cameras. | Shows why current manual CCTV review fails and why court-admissible evidence needs traceability. |
| **0:30 – 1:15** | **2. Intake & Hashing**<br>`/cases/new` | Ingest disk image; watch the SHA-256 hash resolve on screen with write-blocked read-only verification. Detect mock vendor adapter with generic carver fallback. | Cryptographic chain of custody established at step zero. |
| **1:15 – 2:00** | **3. The "Wow" Recovery**<br>`/cases/:id/timeline` | Spot the red gap on Camera 1 at 21:42. Click **Recover**. Watch carving stages complete as thumbnail swaps to violet carved video and plays back. | Shows that deleted footage can be resurrected from raw unindexed blocks before overwrite. |
| **2:00 – 2:45** | **4. Explainable Gap Diagnosis**<br>`/cases/:id/timeline` | Click the 15-minute gap on Camera 3. Open Gap Diagnosis panel: *"Likely camera disconnection (80% confidence) based on video-loss log at 21:40:02; deletion contradicted."* | Demonstrates honest, probabilistic reasoning with evidence for and against, rather than guesswork. |
| **2:45 – 3:30** | **5. Multi-Camera Timeline Sync**<br>`/cases/:id/timeline` | Toggle **Raw Time** to **Corrected Time**. Watch Camera 2 slide into alignment (480ms animation) with `± 1s` uncertainty band. All reference sync events align vertically. | Eliminates clock drift confusion across multiple recorder streams. |
| **3:30 – 4:15** | **6. Entity Search & Path View**<br>`/cases/:id/search` | Enter query *"red backpack"*. View suspect's chronological trajectory across cameras in **Path View** (Entrance $\rightarrow$ Aisle 4 $\rightarrow$ Cash counter) with walking speed plausibility check. | AI visual search provides actionable leads across cameras in seconds instead of hours. |
| **4:15 – 4:45** | **7. Evidence Graph & Report**<br>`/cases/:id/graph` & `/report` | Highlight suspect finding, run **Trace to Source** to pulse chain of custody back to root hash. Click **Seal and Generate Report** to produce court-admissible PDF. | End-to-end auditability: every crop, timestamp, and conclusion is linked to a SHA-256 hash. |
| **4:45 – 5:00** | **8. The Close** | Deliver closing statement: *"From hours of manual review to one searchable, connected, and traceable workflow."* | Leaves judges with a clean, memorable summary. |

---

## 🎯 Presenter Hotkeys & Demo Safety Rules
* `Ctrl/Cmd + K`: Global command palette to jump to any screen instantly.
* `M`: Cycle motion modes (`Full` $\rightarrow$ `Reduced` $\rightarrow$ `Off`) if presenting on a low-power laptop.
* `Space`: Play / Pause synchronized multi-camera video.
* `J` / `L`: Step 5 seconds backward / forward in synchronized time.
* `Never claim`: *"Supports all DVRs"* $\rightarrow$ Say *"Adapter architecture with generic fallback"*.
* `Never claim`: *"AI proves guilt"* $\rightarrow$ Say *"AI search provides visual leads for investigator verification"*.
