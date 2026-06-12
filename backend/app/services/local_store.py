import json
from pathlib import Path
from typing import Any

from app.config import get_settings


class LocalStore:
    def __init__(self) -> None:
        self.root = Path(get_settings().local_data_dir)
        self.root.mkdir(parents=True, exist_ok=True)

    def read(self, name: str, default: Any) -> Any:
        path = self.root / f"{name}.json"
        if not path.exists():
            return default
        return json.loads(path.read_text(encoding="utf-8"))

    def write(self, name: str, payload: Any) -> None:
        path = self.root / f"{name}.json"
        path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
