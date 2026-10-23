import json
from datetime import datetime, timezone
from pathlib import Path

LOG_FILE = Path(__file__).resolve().parent.parent / "data" / "usage_log.json"


def log_usage(student_id: str, resource_id: str, action: str = "opened") -> dict:
    entry = {
        "student_id": student_id,
        "resource_id": resource_id,
        "action": action,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    logs = []
    if LOG_FILE.exists() and LOG_FILE.stat().st_size > 0:
        with open(LOG_FILE, encoding="utf-8") as f:
            logs = json.load(f)
    logs.append(entry)
    with open(LOG_FILE, "w", encoding="utf-8") as f:
        json.dump(logs, f, indent=2)
    return entry