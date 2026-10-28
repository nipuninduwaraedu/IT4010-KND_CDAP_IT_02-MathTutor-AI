from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Optional

import numpy as np
from sklearn.feature_extraction.text import HashingVectorizer

logger = logging.getLogger(__name__)

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
SHORT_MODEL_TYPE = "all-MiniLM-L6-v2"
FALLBACK_MODEL_TYPE = "hashing_fallback"
EMBEDDING_DIM = 384


def _resolve_cached_snapshot(model_name: str) -> Optional[Path]:
    """
    Locate a complete local HuggingFace snapshot containing model weights
    (model.safetensors or pytorch_model.bin) to avoid unnecessary network calls
    or broken incomplete cache pointers.
    """
    direct_path = Path(model_name)
    if direct_path.is_dir() and (
        (direct_path / "model.safetensors").exists()
        or (direct_path / "pytorch_model.bin").exists()
    ):
        return direct_path

    repo_dir_name = f"models--{model_name.replace('/', '--')}"
    cache_roots: list[Path] = []

    if os.environ.get("HF_HUB_CACHE"):
        cache_roots.append(Path(os.environ["HF_HUB_CACHE"]))
    if os.environ.get("HF_HOME"):
        cache_roots.append(Path(os.environ["HF_HOME"]) / "hub")
    cache_roots.append(Path.home() / ".cache" / "huggingface" / "hub")

    for root in cache_roots:
        snapshots_dir = root / repo_dir_name / "snapshots"
        if not snapshots_dir.is_dir():
            continue
        for snapshot in sorted(snapshots_dir.iterdir(), reverse=True):
            if snapshot.is_dir() and (
                (snapshot / "model.safetensors").exists()
                or (snapshot / "pytorch_model.bin").exists()
            ):
                return snapshot

    return None


class FeatureExtractor:
    """
    Dense 384-dimensional semantic vector extractor powered by
    sentence-transformers/all-MiniLM-L6-v2.

    Fallback to HashingVectorizer is strictly opt-in via allow_fallback=True
    to prevent silent train/serve feature skew.
    """

    def __init__(
        self,
        model_name: str = MODEL_NAME,
        allow_fallback: bool = False,
    ) -> None:
        self.model_name = model_name
        self.allow_fallback = allow_fallback
        self._st_model: Optional[object] = None
        self._fallback_vectorizer: Optional[HashingVectorizer] = None

        load_target = model_name
        cached_snapshot = _resolve_cached_snapshot(model_name)
        if cached_snapshot is not None:
            load_target = str(cached_snapshot)
            logger.info("Found complete local MiniLM snapshot at: %s", load_target)

        try:
            from sentence_transformers import SentenceTransformer  # type: ignore

            self._st_model = SentenceTransformer(load_target)
            logger.info("Loaded SentenceTransformer model (%s) from %s", model_name, load_target)
        except Exception as exc:
            if not allow_fallback:
                raise RuntimeError(
                    f"Failed to load SentenceTransformer '{model_name}' (resolved target: '{load_target}'). "
                    f"Silent fallback is disabled (allow_fallback=False) to prevent feature skew. "
                    f"Original error: {exc}"
                ) from exc

            logger.warning(
                "SentenceTransformer '%s' unavailable (%s); falling back to '%s' because allow_fallback=True.",
                model_name,
                exc,
                FALLBACK_MODEL_TYPE,
            )
            self._fallback_vectorizer = HashingVectorizer(
                n_features=EMBEDDING_DIM,
                ngram_range=(1, 3),
                norm="l2",
                alternate_sign=False,
            )

    @property
    def model_type(self) -> str:
        return SHORT_MODEL_TYPE if self._st_model is not None else FALLBACK_MODEL_TYPE

    @property
    def backend_name(self) -> str:
        return self.model_name if self._st_model is not None else FALLBACK_MODEL_TYPE

    def encode(self, texts: list[str]) -> np.ndarray:
        """
        Encode a list of normalized mathematical proof strings into an
        (N, 384) L2-normalized float32 numpy array.
        """
        if not texts:
            return np.zeros((0, EMBEDDING_DIM), dtype=np.float32)

        if self._st_model is not None:
            vecs = self._st_model.encode(  # type: ignore[attr-defined]
                texts,
                convert_to_numpy=True,
                normalize_embeddings=True,
                show_progress_bar=False,
            )
            arr = np.asarray(vecs, dtype=np.float32)
        elif self._fallback_vectorizer is not None:
            sparse_mat = self._fallback_vectorizer.transform(texts)
            arr = sparse_mat.toarray().astype(np.float32)
        else:
            raise RuntimeError("FeatureExtractor has no initialized encoding backend.")

        if arr.ndim != 2 or arr.shape[1] != EMBEDDING_DIM:
            raise ValueError(
                f"Expected embedding shape (N, {EMBEDDING_DIM}), got {arr.shape}."
            )

        # Verify and enforce L2 unit norm on all non-zero rows
        norms = np.linalg.norm(arr, axis=1, keepdims=True)
        non_zero = (norms.squeeze(-1) > 1e-12)
        if np.any(non_zero):
            arr[non_zero] = arr[non_zero] / norms[non_zero]
            verified_norms = np.linalg.norm(arr[non_zero], axis=1)
            if not np.allclose(verified_norms, 1.0, atol=1e-3):
                raise RuntimeError("Output embeddings failed L2 unit norm verification.")

        return arr.astype(np.float32, copy=False)
