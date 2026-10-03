from __future__ import annotations

import json
from pathlib import Path

import joblib
import numpy as np

FEATURES = [
    "elapsed_days_since_last_review",
    "review_count",
    "success_streak",
    "fail_streak",
    "avg_response_time_ms",
    "quiz_type_mc",
    "position_index_on_path",
    "concept_text_length",
]

def _find_artifacts_dir() -> Path:
    here = Path(__file__).resolve()
    candidates = [
        here.parents[3] / "ml" / "artifacts",
        here.parents[2] / "ml" / "artifacts",
        Path("/app/ml/artifacts"),
        Path.cwd() / "ml" / "artifacts",
    ]
    for path in candidates:
        if (path / "forget_model.joblib").exists() or (path / "metadata.json").exists():
            return path
    return candidates[0]


ARTIFACTS_DIR = _find_artifacts_dir()
ARTIFACT_PATH = ARTIFACTS_DIR / "forget_model.joblib"
METADATA_PATH = ARTIFACTS_DIR / "metadata.json"


class MLService:
    def __init__(self) -> None:
        self.model = None
        self.metadata: dict = {}
        if ARTIFACT_PATH.exists():
            self.model = joblib.load(ARTIFACT_PATH)
        if METADATA_PATH.exists():
            self.metadata = json.loads(METADATA_PATH.read_text())

    @property
    def ready(self) -> bool:
        return self.model is not None

    def _vector(self, row: dict) -> np.ndarray:
        return np.array([[float(row[f]) for f in FEATURES]])

    def heuristic_probability(self, row: dict) -> float:
        elapsed = row["elapsed_days_since_last_review"]
        fails = row["fail_streak"]
        success = row["success_streak"]
        rt = row["avg_response_time_ms"] / 8000
        pos = row["position_index_on_path"]
        logit = 0.35 * elapsed - 0.25 * success + 0.5 * fails + 0.15 * rt + 0.1 * pos
        return float(1 / (1 + np.exp(-logit)))

    def predict(self, row: dict) -> tuple[float, str]:
        if self.model is not None:
            proba = float(self.model.predict_proba(self._vector(row))[0, 1])
            return proba, "model"
        return self.heuristic_probability(row), "heuristic"

    def explain(self, row: dict, proba: float) -> str:
        days = row["elapsed_days_since_last_review"]
        parts = [f"Predicted {proba * 100:.0f}% forget risk"]
        if days >= 1:
            parts.append(f"last seen {days:.1f}d ago")
        if row["fail_streak"] > 0:
            parts.append(f"{row['fail_streak']} recent miss(es)")
        return " · ".join(parts)


ml_service = MLService()
