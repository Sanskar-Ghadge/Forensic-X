forensic-x/
├── README.md                  # what it is, how to run, credits, limitations
├── docker-compose.yml         # added last: db, backend, worker, frontend
├── .gitignore                 # ignores the big files in sample_data/
│
├── forensic_core/             # Python library: no web code inside
│   ├── intake.py              # read-only open, chunked SHA-256
│   ├── schema.py              # Recorder, Camera, Segment, Event records
│   ├── adapters/
│   │   ├── base.py            # VendorAdapter interface + registry
│   │   ├── mock_vendor.py     # fully built, reads your simulated format
│   │   ├── generic_export.py  # imports exported MP4/AVI folders
│   │   └── hikvision.py, dahua.py, cpplus.py   # stubs (planned)
│   ├── carver.py              # generic raw-disk scanner
│   ├── recover.py             # active, deleted, partial; fragment rebuild
│   ├── logs.py                # video-loss, reboot, clock-change parsing
│   ├── cli.py                 # python -m forensic_core analyze <image>
│   └── tests/
│
├── ai/                        # detection and search
│   ├── motion.py              # OpenCV motion filter
│   ├── detect.py              # YOLO11n pass 1, optional pass 2
│   ├── gaps.py                # gap detection and cause scoring
│   ├── clock.py               # reference events, offset ± error
│   ├── embed.py               # OSNet and CLIP embeddings
│   ├── search.py              # FAISS index and queries
│   └── tests/
│
├── backend/                   # FastAPI app
│   ├── main.py
│   ├── models.py              # SQLAlchemy tables
│   ├── schemas.py             # request and response models
│   ├── jobs.py                # background analysis jobs, progress
│   ├── report.py              # PDF audit report
│   ├── routers/               # cases, upload, analyze, timeline, gaps,
│   │                          # evidence, search, report, metrics
│   └── tests/
│
├── frontend/                  # React + TypeScript + Vite
│   ├── index.html
│   ├── vite.config.ts
│   ├── .env.example           # VITE_USE_MOCK, VITE_API_BASE_URL
│   ├── public/sample/         # demo clips, posters, sample PDF (offline demo)
│   └── src/
│       ├── main.tsx
│       ├── app/               # router, providers
│       ├── styles/            # tokens.css, globals.css
│       ├── components/
│       │   ├── rb/            # React Bits components, installed, not edited
│       │   ├── fx/            # our wrappers: palette, useMotion, fallbacks
│       │   ├── ui/            # Button, Card, Badge, Table, Tooltip
│       │   ├── forensic/      # HashChip, TimeCode, StateBadge, ConfidenceBar
│       │   └── layout/        # Shell, SideRail, TopBar, Inspector, PlaybackStrip
│       ├── features/          # landing, dashboard, cases, intake, cameras,
│       │                      # timeline, playback, gaps, search, graph, report
│       ├── api/               # client, types, Zod schemas, query hooks
│       ├── mocks/             # MSW handlers + JSON for the demo story
│       ├── hooks/             # useMotion, useTimeCursor, useHotkeys
│       └── lib/               # time math, hash formatting, uncertainty helpers
│
├── sample_data/               # not in git if large
│   ├── clips/                 # your recordings and UCF-Crime clips
│   ├── build_mock_dvr.py      # builds the disk image
│   ├── mock_dvr.img
│   ├── events.log             # boot, clock change, "Camera 3 video loss"
│   └── truth.json             # deleted clips, true offsets, gap causes
│
├── scripts/                   # helper scripts, e.g. spike_detect.py
└── docs/                      # deck, demo script, schema, architecture