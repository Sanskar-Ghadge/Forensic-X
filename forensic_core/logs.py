"""
FORENSIC-X System Log Parser
Parses DVR system, audit, and security logs to detect reboots, video-loss, clock changes,
and correlate them with missing footage / gap intervals.
"""

import re
import os
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from forensic_core.schema import LogEvent

# Regular expression to match standard timestamped DVR log lines:
# Example: "2026-10-17 21:40:02 [WARN] CH3 Video Loss detected: Signal carrier dropped"
LOG_LINE_REGEX = re.compile(
    r"^(?P<datetime>\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+\[(?P<level>[A-Z0-9_\-]+)\]\s+(?P<message>.*)$"
)

# Common forensic patterns in DVR logs
VIDEO_LOSS_PATTERN = re.compile(r"CH(?P<channel>\d+)\s+Video Loss", re.IGNORECASE)
VIDEO_RESTORED_PATTERN = re.compile(r"CH(?P<channel>\d+)\s+Video Signal Restored", re.IGNORECASE)
CLOCK_CHANGE_PATTERN = re.compile(r"(Clock Synchronized|Clock Changed|NTP|Time Updated)", re.IGNORECASE)
BOOT_PATTERN = re.compile(r"(Power On|System Boot|Reboot|Startup|Shutdown|Power Loss)", re.IGNORECASE)
FORMAT_PATTERN = re.compile(r"(Format|Disk Full|HDD Error|Filesystem Check|Overwrite)", re.IGNORECASE)


class LogParser:
    """
    Parses DVR log text streams and correlates hardware/system anomalies
    with video recording gaps.
    """

    def __init__(self):
        self.events: List[LogEvent] = []

    def parse_file(self, file_path: str) -> List[LogEvent]:
        """Parses a log file line by line into structured LogEvent objects."""
        if not os.path.isfile(file_path):
            raise FileNotFoundError(f"Log file not found: {file_path}")

        self.events = []
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            for line in f:
                event = self.parse_line(line.strip())
                if event:
                    self.events.append(event)
        return self.events

    def parse_line(self, line: str) -> Optional[LogEvent]:
        """Parses a single line into a LogEvent."""
        if not line:
            return None

        match = LOG_LINE_REGEX.match(line)
        if not match:
            # Fallback for unformatted lines
            return LogEvent(
                timestamp=None,
                iso_time=datetime.now(timezone.utc).isoformat(),
                level="INFO",
                category="GENERIC",
                message=line,
            )

        dt_str = match.group("datetime")
        level = match.group("level").upper()
        message = match.group("message")

        # Parse epoch timestamp
        try:
            dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
            timestamp = int(dt.timestamp())
            iso_time = dt.isoformat()
        except ValueError:
            timestamp = None
            iso_time = dt_str

        # Categorize
        category = "SYSTEM"
        if VIDEO_LOSS_PATTERN.search(message) or VIDEO_RESTORED_PATTERN.search(message):
            category = "VIDEO_LOSS"
        elif CLOCK_CHANGE_PATTERN.search(message):
            category = "TIME_SYNC"
        elif BOOT_PATTERN.search(message):
            category = "POWER_BOOT"
        elif FORMAT_PATTERN.search(message):
            category = "STORAGE"
        elif "ALARM" in level or "Motion" in message:
            category = "ALARM"
        elif "AUDIT" in level:
            category = "AUDIT"

        return LogEvent(
            timestamp=timestamp,
            iso_time=iso_time,
            level=level,
            category=category,
            message=message,
        )

    def find_video_loss_intervals(self, channel: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Pairs 'Video Loss detected' events with subsequent 'Video Signal Restored' events
        to produce exact disconnection intervals.
        """
        intervals: List[Dict[str, Any]] = []
        active_losses: Dict[int, LogEvent] = {}

        for evt in self.events:
            # Check for Video Loss
            loss_match = VIDEO_LOSS_PATTERN.search(evt.message)
            if loss_match:
                ch = int(loss_match.group("channel"))
                if channel is None or ch == channel:
                    active_losses[ch] = evt

            # Check for Video Signal Restored
            restore_match = VIDEO_RESTORED_PATTERN.search(evt.message)
            if restore_match:
                ch = int(restore_match.group("channel"))
                if ch in active_losses:
                    loss_evt = active_losses.pop(ch)
                    start_ts = loss_evt.timestamp
                    end_ts = evt.timestamp
                    duration_s = (end_ts - start_ts) if (start_ts and end_ts) else 0.0

                    intervals.append({
                        "channel": ch,
                        "loss_start_iso": loss_evt.iso_time,
                        "loss_end_iso": evt.iso_time,
                        "duration_s": duration_s,
                        "cause": "physical_camera_disconnect_or_loss",
                        "supporting_clues": [
                            f"{loss_evt.iso_time} [{loss_evt.level}] {loss_evt.message}",
                            f"{evt.iso_time} [{evt.level}] {evt.message}",
                        ],
                    })

        return intervals

    def filter_events(
        self,
        category: Optional[str] = None,
        level: Optional[str] = None,
        channel: Optional[int] = None,
    ) -> List[LogEvent]:
        """Filters parsed events by category, level, or channel mention."""
        results = []
        for e in self.events:
            if category and e.category != category:
                continue
            if level and e.level != level:
                continue
            if channel is not None:
                ch_tag = f"CH{channel}"
                if ch_tag not in e.message:
                    continue
            results.append(e)
        return results
