"""
FORENSIC-X: Mock DVR Disk Image & Ground Truth Builder
Simulates a multi-vendor DVR disk image with:
  1. Active indexed segments (Channel 1, 2, 3)
  2. Deleted unindexed segment (Channel 1 carving target)
  3. Clock drift (+4 seconds on Channel 2)
  4. Camera disconnection gap (Channel 3 from 21:40:02 to 21:55:10)
  5. Fragmented / out-of-order segment placement
  6. truth.json ground-truth file for objective metrics
  7. events.log system log file
"""

import os
import sys
import struct
import hashlib
import json
import shutil
from datetime import datetime, timezone

# Binary header for each raw segment:
# <8s  : Magic bytes b"MOCKDVR1"
# H    : Channel number (unsigned short, 2 bytes)
# Q    : Start timestamp (epoch seconds, unsigned 64-bit int, 8 bytes)
# I    : Length of video bytes (unsigned 32-bit int, 4 bytes)
SEGMENT_HEADER = struct.Struct("<8sHQI")

# Binary header for the index table at disk offset 0:
# <8s  : Magic bytes b"MOCKIDX1"
# I    : Total entries count (unsigned 32-bit int)
INDEX_HEADER = struct.Struct("<8sI")

# Each index entry in the index table:
# H    : Channel (2 bytes)
# Q    : Start timestamp (8 bytes)
# I    : Duration in seconds (4 bytes)
# Q    : Disk offset of segment header (8 bytes)
# I    : Video data length (4 bytes)
# 32s  : SHA-256 binary digest (32 bytes)
INDEX_ENTRY = struct.Struct("<HQIQI32s")


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    clips_dir = os.path.join(base_dir, "clips")
    os.makedirs(clips_dir, exist_ok=True)

    img_path = os.path.join(base_dir, "mock_dvr.img")
    truth_path = os.path.join(base_dir, "truth.json")
    log_path = os.path.join(base_dir, "events.log")

    # Locate source surveillance clips from data/
    data_source_dir = os.path.abspath(os.path.join(base_dir, "..", "data", "Testing_Normal_Videos", "Testing_Normal_Videos_Anomaly"))
    
    # 3 selected lightweight sample surveillance clips
    clip_candidates = [
        "Normal_Videos_881_x264.mp4",  # ~533 KB
        "Normal_Videos_889_x264.mp4",  # ~853 KB
        "Normal_Videos_745_x264.mp4",  # ~1.9 MB
    ]

    source_clips = []
    for c in clip_candidates:
        src = os.path.join(data_source_dir, c)
        if os.path.isfile(src):
            source_clips.append(src)

    if len(source_clips) < 3:
        print(f"Warning: Expected 3 source clips in {data_source_dir}, found {len(source_clips)}.")
        # Create minimal synthetic MP4 files if missing
        for i in range(1, 4):
            dst = os.path.join(clips_dir, f"cam{i}_segment.mp4")
            if not os.path.exists(dst):
                with open(dst, "wb") as f:
                    f.write(b"\x00\x00\x00\x18ftypmp42\x00\x00\x00\x00isommp42" + os.urandom(1024 * 64))
            source_clips.append(dst)

    # Copy / prepare demo clips in sample_data/clips/
    prepared_clips = []
    names = ["cam1_entrance.mp4", "cam2_aisle4_deleted.mp4", "cam3_counter.mp4"]
    for idx, src in enumerate(source_clips[:3]):
        dst = os.path.join(clips_dir, names[idx])
        if src != dst and not os.path.exists(dst):
            shutil.copy2(src, dst)
        prepared_clips.append(dst)

    # Read video raw bytes
    clip_data = []
    for p in prepared_clips:
        with open(p, "rb") as f:
            data = f.read()
            clip_data.append(data)

    print(f"Loaded {len(clip_data)} clip payloads for simulated DVR.")

    # Base reference timestamp: 2026-10-17 21:40:00 UTC
    base_epoch = int(datetime(2026, 10, 17, 21, 40, 0, tzinfo=timezone.utc).timestamp())

    # Segment definitions:
    # 1. Cam 1: Active segment (21:40:00, 120s) -> INDEXED
    # 2. Cam 1: Deleted segment (21:42:00, 60s) -> NOT INDEXED (Carving Target)
    # 3. Cam 2: Active segment with +4s clock drift (recorded as 21:40:04, 120s) -> INDEXED
    # 4. Cam 3: Active segment (21:40:00, 2s) before disconnection -> INDEXED
    # 5. Cam 3: Active segment (21:55:10, 120s) after reconnection -> INDEXED

    segments_plan = [
        {
            "id": "SEG-001",
            "channel": 1,
            "location": "Main Entrance",
            "timestamp": base_epoch,
            "duration": 120,
            "data": clip_data[0][:250000],
            "status": "active",
            "is_indexed": True,
            "offset_s": 0,
        },
        {
            "id": "SEG-002-DEL",
            "channel": 1,
            "location": "Main Entrance",
            "timestamp": base_epoch + 120,  # 21:42:00 (Incident window!)
            "duration": 60,
            "data": clip_data[1][:180000],
            "status": "recovered",
            "is_indexed": False,  # DELETED: Erased from index, carved from raw disk
            "offset_s": 0,
        },
        {
            "id": "SEG-003-DRIFT",
            "channel": 2,
            "location": "Aisle 4",
            "timestamp": base_epoch + 4,  # Clock is shifted +4 seconds!
            "duration": 120,
            "data": clip_data[0][250000:450000] if len(clip_data[0]) > 450000 else clip_data[1][:200000],
            "status": "active",
            "is_indexed": True,
            "offset_s": 4,  # +4s true drift
        },
        {
            "id": "SEG-004-PRE-GAP",
            "channel": 3,
            "location": "Cash Counter",
            "timestamp": base_epoch,
            "duration": 2,  # Ends at 21:40:02 (Disconnection begins)
            "data": clip_data[2][:30000],
            "status": "active",
            "is_indexed": True,
            "offset_s": 0,
        },
        {
            "id": "SEG-005-POST-GAP",
            "channel": 3,
            "location": "Cash Counter",
            "timestamp": base_epoch + 910,  # Reconnected at 21:55:10 (15m 08s gap!)
            "duration": 120,
            "data": clip_data[2][30000:250000] if len(clip_data[2]) > 250000 else clip_data[0][:200000],
            "status": "active",
            "is_indexed": True,
            "offset_s": 0,
        },
    ]

    # Pre-calculate index table size
    indexed_segments = [s for s in segments_plan if s["is_indexed"]]
    index_table_size = INDEX_HEADER.size + (len(indexed_segments) * INDEX_ENTRY.size)

    # Pad index table to 4096-byte sector boundary
    aligned_data_offset = ((index_table_size + 4095) // 4096) * 4096

    # Construct binary disk image in memory
    raw_disk = bytearray(aligned_data_offset)
    current_offset = aligned_data_offset

    index_entries_bytes = bytearray()
    truth_segments = []

    for seg in segments_plan:
        seg_data = seg["data"]
        seg_len = len(seg_data)
        seg_sha = hashlib.sha256(seg_data).hexdigest()
        seg_raw_digest = hashlib.sha256(seg_data).digest()

        # Write segment header + video payload
        header_bytes = SEGMENT_HEADER.pack(b"MOCKDVR1", seg["channel"], seg["timestamp"], seg_len)
        segment_offset = current_offset

        raw_disk.extend(header_bytes)
        raw_disk.extend(seg_data)

        # Pad segment to 512-byte sector boundary
        rem = len(raw_disk) % 512
        if rem > 0:
            raw_disk.extend(b"\x00" * (512 - rem))

        current_offset = len(raw_disk)

        # Add to index table ONLY if active
        if seg["is_indexed"]:
            entry_bytes = INDEX_ENTRY.pack(
                seg["channel"],
                seg["timestamp"],
                seg["duration"],
                segment_offset,
                seg_len,
                seg_raw_digest
            )
            index_entries_bytes.extend(entry_bytes)

        truth_segments.append({
            "id": seg["id"],
            "channel": seg["channel"],
            "location": seg["location"],
            "start_timestamp": seg["timestamp"],
            "start_iso": datetime.fromtimestamp(seg["timestamp"], tz=timezone.utc).isoformat(),
            "duration_s": seg["duration"],
            "disk_offset": segment_offset,
            "length_bytes": seg_len,
            "sha256": seg_sha,
            "status": seg["status"],
            "is_indexed": seg["is_indexed"],
            "clock_offset_s": seg["offset_s"],
        })

    # Write index header and entries into sector 0
    idx_header_bytes = INDEX_HEADER.pack(b"MOCKIDX1", len(indexed_segments))
    raw_disk[0:len(idx_header_bytes)] = idx_header_bytes
    raw_disk[len(idx_header_bytes):len(idx_header_bytes) + len(index_entries_bytes)] = index_entries_bytes

    # Write out mock_dvr.img
    with open(img_path, "wb") as f:
        f.write(raw_disk)

    image_sha256 = sha256_bytes(raw_disk)
    image_size_bytes = len(raw_disk)

    print(f"Generated {img_path} ({image_size_bytes} bytes, SHA-256: {image_sha256[:16]}...)")

    # Generate events.log
    log_lines = [
        "2026-10-17 08:00:00 [SYSTEM] Power On - System Boot (MOCKDVR1 v4.2.1)",
        "2026-10-17 08:00:03 [STORAGE] HDD 0 Mounted: 4000 GB, File System: MOCKFS",
        "2026-10-17 08:00:05 [TIME] System Clock Synchronized via NTP: 2026-10-17 08:00:05 UTC",
        "2026-10-17 21:00:00 [SCHEDULE] Recording profile 'CONTINUOUS_ALL' active",
        "2026-10-17 21:40:02 [WARN] CH3 Video Loss detected: Signal carrier dropped",
        "2026-10-17 21:42:15 [ALARM] CH1 Motion Detection Sensor triggered: Zone Entrance",
        "2026-10-17 21:55:10 [INFO] CH3 Video Signal Restored: 1080p 25fps carrier locked",
        "2026-10-17 22:00:00 [AUDIT] Read-only integrity check scheduled",
    ]

    with open(log_path, "w", encoding="utf-8") as f:
        f.write("\n".join(log_lines) + "\n")

    print(f"Generated {log_path} ({len(log_lines)} events).")

    # Generate truth.json
    truth_data = {
        "case_id": "CASE-2026-APEX-01",
        "case_name": "Retail Store Incident — 2026-10-17",
        "incident_time": "2026-10-17T21:42:17Z",
        "recorders": [
            {
                "id": "REC-01",
                "brand": "MOCKDVR1",
                "filename": "mock_dvr.img",
                "filesize_bytes": image_size_bytes,
                "sha256": image_sha256,
                "total_channels": 3,
            }
        ],
        "cameras": [
            {
                "channel": 1,
                "location": "Main Entrance",
                "true_clock_offset_s": 0.0,
                "status": "ok",
            },
            {
                "channel": 2,
                "location": "Aisle 4",
                "true_clock_offset_s": 4.0,  # +4 seconds drift
                "status": "offset_uncertain",
            },
            {
                "channel": 3,
                "location": "Cash Counter",
                "true_clock_offset_s": 0.0,
                "status": "gaps",
            },
        ],
        "segments": truth_segments,
        "gaps": [
            {
                "channel": 3,
                "location": "Cash Counter",
                "start_time": "2026-10-17T21:40:02Z",
                "end_time": "2026-10-17T21:55:10Z",
                "duration_s": 908,
                "true_cause": "disconnected",
                "expected_confidence": 0.80,
                "supporting_evidence": [
                    "2026-10-17 21:40:02 [WARN] CH3 Video Loss detected",
                    "2026-10-17 21:55:10 [INFO] CH3 Video Signal Restored",
                    "No residual video frames carved in gap disk sectors",
                ],
                "contradicting_evidence": [
                    "No format or manual deletion logs found",
                ],
            }
        ],
        "expected_metrics": {
            "recovery_success_rate": {
                "carved_recovered": 1,
                "known_deleted": 1,
                "percentage": 100.0,
            },
            "average_alignment_error_s": 0.0,
            "hash_verification_success_rate": 100.0,
        },
    }

    with open(truth_path, "w", encoding="utf-8") as f:
        json.dump(truth_data, f, indent=2)

    print(f"Generated {truth_path} with ground truth for automated evaluation.")

    # Also copy sample clips to frontend/public/sample/ for offline web demo!
    frontend_sample_dir = os.path.abspath(os.path.join(base_dir, "..", "frontend", "public", "sample"))
    os.makedirs(frontend_sample_dir, exist_ok=True)
    for p in prepared_clips:
        dst = os.path.join(frontend_sample_dir, os.path.basename(p))
        shutil.copy2(p, dst)

    # Copy truth.json to frontend/src/mocks/data/
    frontend_mock_dir = os.path.abspath(os.path.join(base_dir, "..", "frontend", "src", "mocks", "data"))
    os.makedirs(frontend_mock_dir, exist_ok=True)
    shutil.copy2(truth_path, os.path.join(frontend_mock_dir, "truth.json"))

    print(f"Sample data staged to frontend public/sample/ and src/mocks/data/ successfully.")


if __name__ == "__main__":
    main()
