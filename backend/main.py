"""
FORENSIC-X Backend API Server
FastAPI application providing evidentiary endpoints, case repository, and timeline synchronization.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base
from backend.routers import cases, timeline, upload, analyze, gaps, evidence, metrics

# Initialize SQLite tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FORENSIC-X Core API",
    description="CCTV Forensic Recovery, Provenance Traceability & Evidence Synchronization API",
    version="1.0.0",
)

# Enable CORS for local frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(cases.router)
app.include_router(timeline.router)
app.include_router(upload.router)
app.include_router(analyze.router)
app.include_router(gaps.router)
app.include_router(evidence.router)
app.include_router(metrics.router)


@app.get("/")
def root():
    return {
        "service": "FORENSIC-X Forensic Core API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
    }


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "forensic-x-backend"}
