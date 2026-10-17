# FORENSIC-X Frontend

> **Evidence Room Command Center for CCTV Video Forensics & Traceability**

Built with React 18, TypeScript, Vite, Tailwind CSS, and Radix UI. Engineered for police, state forensics labs, and judicial presentation.

---

## 🚀 Quick Start

### 1. Development Mode
```bash
cd frontend
npm install
npm run dev
```
Open **`http://127.0.0.1:5173`** in your browser.

### 2. Run Unit Tests (Vitest)
```bash
npm test
```
Runs 8/8 comprehensive forensic unit tests covering time math, uncertainty bounds, SHA-256 truncation, and Zod data contract validation.

### 3. Production Build & Preview
```bash
npm run build
npm run preview
```
Verified bundle budget: Initial entry bundle is **~451 kB** (141 kB gzipped) with dynamic code-splitting for heavy pages (`GraphPage`, `ReportPage`, `SearchPage`). LCP < 1.2s.

---

## 🎬 Guided Demo Mode (F9.1)

FORENSIC-X features an integrated **Presenter Layer** designed for flawless 5-minute hackathon and judicial demonstrations.

- **Toggle Demo Tour**: Press **`D`** on your keyboard or click the **Demo Tour** pill in the top header bar.
- **Presenter Controls**:
  - `Next Beat`: **`Alt + →`** or click **Next**
  - `Previous Beat`: **`Alt + ←`** or click **Back**
  - `Toggle Presenter Notes HUD`: Press **`N`** to reveal speaking cues, time budgets, and forensic honesty lines.
  - `1-Click State Reset`: Press **`R`** to un-carve clips and reset search filters for clean repeat rehearsals.
  - `Projector Mode`: Toggle **`P`** or click the TV icon for 112% scaled high-contrast projection display.
  - `Fullscreen`: Press **`F`**.

### 8 Scripted Demo Beats:
1. **Intake & Cryptographic Master Seal** (`/cases/CASE-2026-APEX-01`)
2. **Multi-Camera Clock Normalization** (`/cases/CASE-2026-APEX-01/cameras`)
3. **Synchronized Multi-Camera Timeline** (`/cases/CASE-2026-APEX-01/timeline`)
4. **Deep Carver Deleted Footage Recovery** (`/cases/CASE-2026-APEX-01/timeline`)
5. **Explainable Gap Causal Diagnosis** (`/cases/CASE-2026-APEX-01/timeline`)
6. **Cross-Camera Appearance Search & Trajectory** (`/cases/CASE-2026-APEX-01/search`)
7. **Evidence Lineage Graph (DAG)** (`/cases/CASE-2026-APEX-01/graph`)
8. **Section 65B Certified Court Report** (`/cases/CASE-2026-APEX-01/report`)

---

## ⌨️ Global Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| **`⌘ + K`** | Open Command Palette |
| **`?`** | Toggle Keyboard Shortcuts Modal |
| **`D`** | Toggle Guided Demo Mode |
| **`I`** | Toggle Provenance Context Inspector |
| **`M`** | Cycle Motion Mode (`Full` → `Reduced` → `Off`) |
| **`1` to `6`** | Jump to Dashboard, Cameras, Timeline, Search, Graph, Report |
| **`Space`** | Play / Pause Synchronized Feeds |
| **`J` / `L`** | Step Back / Forward 1.0 second |

---

## 🎨 Design System & Palette (Evidence Room)

- **`--bg-void`** (`#030712`): Absolute dark backdrop for zero eye fatigue.
- **`--bg-console`** (`#0b1220`): Panel surfaces and inspection containers.
- **`--scan`** (`#22d3ee`): Cyan brand accent representing radar sweep & action.
- **`--verified`** (`#10b981`): Emerald green denoting cryptographic match & pass.
- **`--recovered`** (`#a855f7`): Violet denoting carved unallocated footage.
- **`--gap`** (`#f43f5e`): Rose red denoting unindexed missing time ranges.
- **`--estimated`** (`#f59e0b`): Amber denoting temporal offset uncertainty.
- **`--lead`** (`#38bdf8`): Sky blue denoting AI detection candidates.

---

## 📜 Credits & Attributions

- **Icons**: [Lucide React](https://lucide.dev) (ISC License)
- **UI Primitives**: [Radix UI](https://www.radix-ui.com) (MIT License)
- **Graph DAG**: [@xyflow/react](https://reactflow.dev) (MIT License)
- **Command Menu**: [CMDK](https://cmdk.paco.me) (MIT License)
- **Fonts**: Space Grotesk, Inter, JetBrains Mono via Google Fonts (OFL License)
