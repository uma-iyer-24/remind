"""
Train forgetting-prediction models on SRS-style review logs.

Data: synthetic cohort calibrated to spaced-repetition literature (FSRS-like
intervals and ratings). Replace with exported OSR/Anki logs for production study.
"""

from __future__ import annotations

import json
import random
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    roc_auc_score,
)
from sklearn.model_selection import GridSearchCV, cross_validate, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

ROOT = Path(__file__).resolve().parent
ARTIFACTS = ROOT / "artifacts"
ARTIFACTS.mkdir(exist_ok=True)

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

RANDOM_STATE = 42


def generate_srs_cohort(n_users: int = 400, reviews_per_user: int = 80) -> pd.DataFrame:
    """Simulate review histories with realistic forgetting dynamics."""
    rng = np.random.default_rng(RANDOM_STATE)
    rows: list[dict] = []

    for user in range(n_users):
        stability = rng.uniform(2.0, 14.0)
        for _ in range(reviews_per_user):
            elapsed = float(rng.exponential(stability))
            review_count = int(rng.integers(1, 25))
            success_streak = int(rng.integers(0, 8))
            fail_streak = int(rng.integers(0, 4))
            avg_rt = float(rng.normal(4500, 1200))
            quiz_mc = int(rng.random() < 0.55)
            position = float(rng.uniform(0, 1))
            text_len = float(rng.integers(20, 120))

            # Retention decreases with elapsed / stability; failures add noise
            logit = (
                0.9 * (elapsed / max(stability, 0.5))
                - 0.35 * success_streak
                + 0.45 * fail_streak
                + 0.15 * (avg_rt / 8000)
                + 0.2 * position
                + rng.normal(0, 0.25)
            )
            p_forget = 1 / (1 + np.exp(-logit))
            will_forget = int(rng.random() < p_forget)

            rows.append(
                {
                    "user_id": f"user_{user}",
                    **{f: v for f, v in zip(FEATURES, [
                        elapsed,
                        review_count,
                        success_streak,
                        fail_streak,
                        avg_rt,
                        quiz_mc,
                        position,
                        text_len,
                    ])},
                    "will_forget": will_forget,
                }
            )
            # Drift stability after each review
            if will_forget:
                stability = max(1.5, stability * rng.uniform(0.7, 0.95))
            else:
                stability = min(30.0, stability * rng.uniform(1.05, 1.25))

    return pd.DataFrame(rows)


def build_models() -> dict[str, Pipeline]:
    numeric = FEATURES
    preprocess = ColumnTransformer(
        [("num", StandardScaler(), numeric)],
        remainder="drop",
    )
    return {
        "logistic_regression": Pipeline(
            [
                ("prep", preprocess),
                (
                    "clf",
                    LogisticRegression(max_iter=2000, class_weight="balanced", random_state=RANDOM_STATE),
                ),
            ]
        ),
        "random_forest": Pipeline(
            [
                ("prep", preprocess),
                (
                    "clf",
                    RandomForestClassifier(
                        n_estimators=200,
                        max_depth=12,
                        class_weight="balanced",
                        random_state=RANDOM_STATE,
                        n_jobs=-1,
                    ),
                ),
            ]
        ),
    }


def main() -> None:
    random.seed(RANDOM_STATE)
    df = generate_srs_cohort()
    df.to_csv(ARTIFACTS / "synthetic_srs_reviews.csv", index=False)

    X = df[FEATURES]
    y = df["will_forget"]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=RANDOM_STATE
    )

    models = build_models()
    cv_results: list[dict] = []

    for name, pipe in models.items():
        scores = cross_validate(
            pipe,
            X_train,
            y_train,
            cv=5,
            scoring={"auc": "roc_auc", "f1": "f1", "acc": "accuracy"},
            n_jobs=-1,
        )
        cv_results.append(
            {
                "model": name,
                "cv_auc_mean": float(scores["test_auc"].mean()),
                "cv_auc_std": float(scores["test_auc"].std()),
                "cv_f1_mean": float(scores["test_f1"].mean()),
                "cv_acc_mean": float(scores["test_acc"].mean()),
            }
        )

    best_name = max(cv_results, key=lambda r: r["cv_auc_mean"])["model"]
    best_pipe = models[best_name]

    if best_name == "logistic_regression":
        tuned = GridSearchCV(
            best_pipe,
            {"clf__C": [0.1, 0.5, 1.0, 2.0]},
            cv=3,
            scoring="roc_auc",
            n_jobs=-1,
        )
    else:
        tuned = GridSearchCV(
            best_pipe,
            {"clf__max_depth": [8, 12, 16], "clf__n_estimators": [150, 200]},
            cv=3,
            scoring="roc_auc",
            n_jobs=-1,
        )

    tuned.fit(X_train, y_train)
    final = tuned.best_estimator_
    proba = final.predict_proba(X_test)[:, 1]
    preds = final.predict(X_test)

    holdout = {
        "model": best_name,
        "test_auc": float(roc_auc_score(y_test, proba)),
        "test_f1": float(f1_score(y_test, preds)),
        "test_accuracy": float(accuracy_score(y_test, preds)),
        "best_params": tuned.best_params_,
    }

    joblib.dump(final, ARTIFACTS / "forget_model.joblib")
    metadata = {
        "features": FEATURES,
        "label": "will_forget",
        "dataset": "synthetic_srs_cohort_v1 (FSRS-calibrated simulation; swap for OSR exports)",
        "n_samples": len(df),
        "cv_results": cv_results,
        "holdout": holdout,
    }
    (ARTIFACTS / "metadata.json").write_text(json.dumps(metadata, indent=2))
    (ARTIFACTS / "model_comparison.json").write_text(json.dumps(cv_results, indent=2))

    print("Best model:", best_name)
    print(json.dumps(holdout, indent=2))


if __name__ == "__main__":
    main()
