from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Callable

import joblib
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.calibration import CalibratedClassifierCV
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import GroupKFold
from sklearn.svm import LinearSVC

BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.embeddings import FeatureExtractor
from app.normalizer import normalize_math_text

DATA_PATH = BASE_DIR / "data" / "dataset.csv"
MODELS_DIR = BASE_DIR / "models"
CONFUSION_MATRIX_PATH = MODELS_DIR / "confusion_matrix.png"
MODEL_ARTIFACT_PATH = MODELS_DIR / "misconception_classifier.pkl"

TARGET_CLASSES = [
    "Correct Reasoning",
    "Incorrect Theorem Application",
    "Incorrect Angle Relationships",
    "Missing Proof Step",
]


def evaluate_candidate(
    name: str,
    estimator_factory: Callable[[], object],
    X: np.ndarray,
    y: np.ndarray,
    groups: np.ndarray,
) -> tuple[np.ndarray, dict[str, float]]:
    gkf = GroupKFold(n_splits=5)
    oof_preds = np.empty(len(y), dtype=object)

    for train_idx, val_idx in gkf.split(X, y, groups=groups):
        clf = estimator_factory()
        clf.fit(X[train_idx], y[train_idx])
        oof_preds[val_idx] = clf.predict(X[val_idx])

    metrics = {
        "accuracy": float(accuracy_score(y, oof_preds)),
        "precision_macro": float(precision_score(y, oof_preds, average="macro", zero_division=0)),
        "recall_macro": float(recall_score(y, oof_preds, average="macro", zero_division=0)),
        "f1_macro": float(f1_score(y, oof_preds, average="macro", zero_division=0)),
    }
    return oof_preds, metrics


def save_confusion_matrix_plot(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    best_model_name: str,
    out_path: Path,
) -> None:
    cm = confusion_matrix(y_true, y_pred, labels=TARGET_CLASSES)
    short_labels = [
        "Correct\nReasoning",
        "Incorrect\nTheorem",
        "Incorrect\nAngle Rel.",
        "Missing\nProof Step",
    ]

    plt.figure(figsize=(8.5, 6.8), dpi=180)
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=short_labels,
        yticklabels=short_labels,
        cbar=True,
        linewidths=0.8,
        linecolor="#e2e8f0",
        annot_kws={"size": 12, "weight": "bold"},
    )
    plt.title(
        f"5-Fold Cross-Validation Confusion Matrix ({best_model_name} + MiniLM)",
        fontsize=11,
        fontweight="bold",
        pad=14,
    )
    plt.xlabel("Predicted Misconception Class", fontsize=10, fontweight="bold", labelpad=10)
    plt.ylabel("Ground-Truth Misconception Class", fontsize=10, fontweight="bold", labelpad=10)
    plt.tight_layout()
    os.makedirs(out_path.parent, exist_ok=True)
    plt.savefig(out_path, bbox_inches="tight")
    plt.close()


def main() -> None:
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Training dataset not found at: {DATA_PATH}")

    os.makedirs(MODELS_DIR, exist_ok=True)

    df = pd.read_csv(DATA_PATH).dropna(subset=["extracted_steps_text", "label", "student_id"])
    df["normalized_text"] = df["extracted_steps_text"].astype(str).apply(normalize_math_text)

    print("=" * 84)
    print(" COMPONENT 2 (MEMBER 2: INDUWARA T.G.N - IT23414778) MODEL TRAINING & EVALUATION ")
    print("=" * 84)
    print(
        f"[Dataset] Loaded {len(df)} labeled student proof records across "
        f"{df['student_id'].nunique()} student groups."
    )

    extractor = FeatureExtractor(allow_fallback=False)
    print(f"[Embedder] Extracting 384-D semantic vectors using: {extractor.model_type}")
    X = extractor.encode(df["normalized_text"].tolist())
    y = df["label"].astype(str).to_numpy()
    groups = df["student_id"].astype(str).to_numpy()

    print(f"[Embeddings] Feature matrix shape: {X.shape}")

    candidates: list[tuple[str, Callable[[], object]]] = [
        (
            "LinearSVC",
            lambda: LinearSVC(C=1.0, class_weight="balanced", random_state=42),
        ),
        (
            "LogisticRegression",
            lambda: LogisticRegression(
                C=2.0, class_weight="balanced", max_iter=1000, random_state=42
            ),
        ),
    ]

    results: dict[str, dict[str, object]] = {}
    for name, factory in candidates:
        oof_preds, metrics = evaluate_candidate(name, factory, X, y, groups)
        results[name] = {
            "factory": factory,
            "oof_preds": oof_preds,
            "metrics": metrics,
        }

    print("\n" + "-" * 84)
    print(" 5-FOLD GROUPED CROSS-VALIDATION BENCHMARK (GROUPED BY student_id) ")
    print("-" * 84)
    print(
        f"| {'Classifier Model':<28} | {'Accuracy':>10} | {'Precision':>11} | {'Recall':>10} | {'Macro-F1':>10} |"
    )
    print("-" * 84)
    for name, _ in candidates:
        m = results[name]["metrics"]  # type: ignore[assignment]
        print(
            f"| {name:<28} | {m['accuracy']*100:>9.2f}% | "
            f"{m['precision_macro']*100:>10.2f}% | {m['recall_macro']*100:>9.2f}% | "
            f"{m['f1_macro']*100:>9.2f}% |"
        )
    print("-" * 84)

    # Select winning candidate strictly by highest out-of-fold Macro-F1
    best_model_name = max(
        results.keys(),
        key=lambda k: results[k]["metrics"]["f1_macro"],  # type: ignore[index]
    )
    best_entry = results[best_model_name]
    best_oof: np.ndarray = best_entry["oof_preds"]  # type: ignore[assignment]
    best_metrics: dict[str, float] = best_entry["metrics"]  # type: ignore[assignment]
    best_factory: Callable[[], object] = best_entry["factory"]  # type: ignore[assignment]

    print(f"\n[Out-of-Fold Classification Report — Selected Model: {best_model_name}]")
    print(
        classification_report(
            y,
            best_oof,
            labels=TARGET_CLASSES,
            digits=4,
            zero_division=0,
        )
    )

    save_confusion_matrix_plot(y, best_oof, best_model_name, CONFUSION_MATRIX_PATH)
    print(f"[Artifact] Saved 4x4 Confusion Matrix Heatmap -> {CONFUSION_MATRIX_PATH}")

    # Fit selected winning estimator on full corpus (calibrate only if predict_proba unavailable)
    winning_estimator = best_factory()
    if hasattr(winning_estimator, "predict_proba"):
        final_model = winning_estimator.fit(X, y)
    else:
        final_model = CalibratedClassifierCV(
            estimator=winning_estimator, cv=5, method="sigmoid"
        ).fit(X, y)

    artifact_bundle = {
        "model": final_model,
        "model_name": best_model_name,
        "classes": list(TARGET_CLASSES),
        "embedding_backend": extractor.model_type,
        "cv_macro_f1": round(float(best_metrics["f1_macro"]), 4),
        "cv_accuracy": round(float(best_metrics["accuracy"]), 4),
    }
    joblib.dump(artifact_bundle, MODEL_ARTIFACT_PATH)
    print(
        f"[Artifact] Saved Production Classifier ({best_model_name}, "
        f"Macro-F1={artifact_bundle['cv_macro_f1']:.4f}) -> {MODEL_ARTIFACT_PATH}"
    )
    print("=" * 84)


if __name__ == "__main__":
    main()
