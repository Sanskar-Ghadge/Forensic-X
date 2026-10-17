"""
FORENSIC-X Forensic Core Command Line Interface
Provides command-line operations for evidence intake, carving, log analysis, and ground-truth evaluation.
Usage:
    python -m forensic_core.cli analyze sample_data/mock_dvr.img --truth sample_data/truth.json --logs sample_data/events.log
    python -m forensic_core.cli hash sample_data/mock_dvr.img
    python -m forensic_core.cli logs sample_data/events.log
"""

import sys
import os
import argparse
import json
from typing import Optional

from forensic_core.intake import ForensicIntake
from forensic_core.recover import EvidenceRecoveryEngine
from forensic_core.logs import LogParser
from forensic_core.adapters import AdapterRegistry


def format_bytes(bytes_num: int) -> str:
    """Formats bytes into human readable format."""
    for unit in ["B", "KB", "MB", "GB", "TB"]:
        if bytes_num < 1024.0:
            return f"{bytes_num:3.1f} {unit}"
        bytes_num /= 1024.0
    return f"{bytes_num:.1f} PB"


def print_banner():
    banner = """
========================================================================
 FORENSIC-X :: CCTV Evidence Forensics & Traceability Core Engine
 Read-Only Intake | Vendor Adapters | Sector Carver | Log Correlator
========================================================================
"""
    print(banner)


def cmd_hash(args):
    """Computes and displays chunked SHA-256 hash of an evidence file."""
    intake = ForensicIntake()
    print(f"[*] Inspecting target evidence: {args.file}")
    info = intake.inspect_file(args.file)
    print(f"    File: {info['filename']} ({format_bytes(info['size_bytes'])})")
    print(f"    Read-only status: {'PASSED' if info['is_readable'] else 'FAILED'}")
    print("[*] Computing cryptographic SHA-256 fingerprint...")

    def progress(pct, speed):
        sys.stdout.write(f"\r    Progress: {pct*100:5.1f}% | Speed: {speed:6.1f} MB/s")
        sys.stdout.flush()

    digest, elapsed = intake.compute_sha256(args.file, progress_callback=progress)
    print(f"\n[+] Completed in {elapsed:.3f}s")
    print(f"    SHA-256: {digest}")

    if args.expected:
        matches = digest.lower() == args.expected.strip().lower()
        if matches:
            print("[+] INTEGRITY CHECK PASSED: Matches expected ground-truth hash.")
        else:
            print("[!] INTEGRITY CHECK FAILED: Hash mismatch!")
            sys.exit(1)


def cmd_logs(args):
    """Parses and correlates DVR event logs."""
    parser = LogParser()
    print(f"[*] Parsing log file: {args.file}")
    events = parser.parse_file(args.file)
    print(f"[+] Successfully parsed {len(events)} log entries.\n")

    print(f"{'TIMESTAMP':<25} {'LEVEL':<10} {'CATEGORY':<14} {'MESSAGE'}")
    print("-" * 75)
    for evt in events:
        print(f"{evt.iso_time:<25} {evt.level:<10} {evt.category:<14} {evt.message}")

    # Video Loss intervals
    loss_intervals = parser.find_video_loss_intervals()
    if loss_intervals:
        print("\n[*] Correlated Video Loss & Disconnect Intervals:")
        for interval in loss_intervals:
            print(
                f"    [!] Channel {interval['channel']}: {interval['loss_start_iso']} -> "
                f"{interval['loss_end_iso']} ({interval['duration_s']}s duration)"
            )
            for clue in interval["supporting_clues"]:
                print(f"        * {clue}")


def cmd_analyze(args):
    """Full forensic workflow: intake, carving, recovery, log correlation, and evaluation."""
    print_banner()

    # 1. Intake & Hash
    intake = ForensicIntake()
    print(f"[*] STAGE 1: Intake & Write-Blocked Integrity Hashing")
    print(f"    Target Image: {args.image}")
    file_info = intake.inspect_file(args.image)
    print(f"    Size: {format_bytes(file_info['size_bytes'])}")

    def progress(pct, speed):
        sys.stdout.write(f"\r    Hashing: {pct*100:5.1f}% [{speed:5.1f} MB/s]")
        sys.stdout.flush()

    sha256_hash, hash_time = intake.compute_sha256(args.image, progress_callback=progress)
    print(f"\n    SHA-256: {sha256_hash} (elapsed: {hash_time:.3f}s)")

    # 2. Adapter Identification
    print(f"\n[*] STAGE 2: Vendor Adapter Identification")
    adapter = AdapterRegistry.detect_adapter(args.image)
    if adapter:
        print(f"    [+] Detected Vendor Format: {adapter.brand_name}")
    else:
        print(f"    [!] No proprietary vendor index detected. Using Generic Video Carver Fallback.")

    # 3. Processing & Carving
    print(f"\n[*] STAGE 3: Processing Index & Deep Sector Carving")
    out_dir = args.out or "extracted_evidence"
    engine = EvidenceRecoveryEngine(output_dir=out_dir)
    results = engine.process_disk_image(args.image, truth_json_path=args.truth)

    print(f"    Active (indexed) clips found : {results['active_segments']}")
    print(f"    Carved (recovered deleted)  : {results['deleted_recovered_segments']}")
    print(f"    Total video segments saved  : {results['total_segments_found']}")
    print(f"    Extracted files saved to    : {os.path.abspath(out_dir)}")

    print("\n    Discovered Video Segments:")
    print(f"    {'ID':<24} {'CH':<4} {'START TIME (UTC)':<22} {'DURATION':<10} {'OFFSET':<10} {'STATUS':<10} {'METHOD'}")
    print("    " + "-" * 90)
    for seg in results["segments"]:
        print(
            f"    {seg.id:<24} {seg.channel:<4} {seg.start_iso[:19]:<22} {f'{seg.duration_s}s':<10} "
            f"{seg.disk_offset:<10} {seg.status.upper():<10} {seg.method.upper()}"
        )

    # 4. Log Correlation
    loss_intervals = []
    if args.logs and os.path.isfile(args.logs):
        print(f"\n[*] STAGE 4: Hardware & System Log Correlation")
        log_parser = LogParser()
        events = log_parser.parse_file(args.logs)
        print(f"    Parsed {len(events)} log events from {args.logs}")
        loss_intervals = log_parser.find_video_loss_intervals()
        if loss_intervals:
            for interval in loss_intervals:
                print(
                    f"    [!] Channel {interval['channel']} Video Loss Gap: {interval['loss_start_iso']} to "
                    f"{interval['loss_end_iso']} ({interval['duration_s']}s duration)"
                )
                print(f"        Inferred Cause: Camera signal loss / physical cable disconnect")

    # 5. Truth Evaluation
    if results.get("metrics") and results["metrics"].get("status") != "no_truth_file":
        m = results["metrics"]
        print(f"\n[*] STAGE 5: Ground-Truth Validation & Accuracy Evaluation")
        print(f"    Known Deleted Clips (truth.json) : {m.get('known_deleted_clips')}")
        print(f"    Carved & Restored Clips          : {m.get('recovered_deleted_clips')}")
        print(f"    Recovery Success Rate            : {m.get('recovery_success_rate_percent')}%")
        print(f"    Forensic Evaluation Verdict      : [{m.get('evaluation_verdict')}]")

    # 6. JSON Export
    if args.export:
        report_data = {
            "evidence_image": os.path.abspath(args.image),
            "sha256": sha256_hash,
            "size_bytes": file_info["size_bytes"],
            "adapter": results["adapter_used"],
            "active_count": results["active_segments"],
            "recovered_count": results["deleted_recovered_segments"],
            "metrics": results.get("metrics"),
            "segments": [
                {
                    "id": s.id,
                    "channel": s.channel,
                    "start_iso": s.start_iso,
                    "duration_s": s.duration_s,
                    "disk_offset": s.disk_offset,
                    "length_bytes": s.length_bytes,
                    "sha256": s.sha256_hash,
                    "status": s.status,
                    "method": s.method,
                }
                for s in results["segments"]
            ],
            "gap_correlations": loss_intervals,
        }
        with open(args.export, "w", encoding="utf-8") as f:
            json.dump(report_data, f, indent=2)
        print(f"\n[+] Full forensic findings exported to: {os.path.abspath(args.export)}")

    print("\n[+] Forensic Analysis Pipeline completed successfully.\n")


def main():
    parser = argparse.ArgumentParser(
        description="FORENSIC-X Forensic Core Engine CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    subparsers = parser.add_subparsers(dest="command", help="Available subcommands")

    # analyze
    analyze_parser = subparsers.add_parser("analyze", help="Analyze disk image and recover evidence")
    analyze_parser.add_argument("image", help="Path to raw disk image (.img, .raw, .dd)")
    analyze_parser.add_argument("--truth", help="Path to ground truth JSON file for evaluation")
    analyze_parser.add_argument("--logs", help="Path to DVR event log file for gap correlation")
    analyze_parser.add_argument("--out", default="extracted_evidence", help="Output directory for carved clips")
    analyze_parser.add_argument("--export", help="Path to export forensic findings as JSON")

    # hash
    hash_parser = subparsers.add_parser("hash", help="Compute cryptographic SHA-256 hash of a file")
    hash_parser.add_argument("file", help="Path to file")
    hash_parser.add_argument("--expected", help="Expected SHA-256 hash to verify against")

    # logs
    logs_parser = subparsers.add_parser("logs", help="Parse and inspect DVR event logs")
    logs_parser.add_argument("file", help="Path to event log file")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    if args.command == "hash":
        cmd_hash(args)
    elif args.command == "logs":
        cmd_logs(args)
    elif args.command == "analyze":
        cmd_analyze(args)


if __name__ == "__main__":
    main()
