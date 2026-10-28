from __future__ import annotations

import logging
from typing import Optional
import numpy as np
from sklearn.feature_extraction.text import HashingVectorizer

logger = logging.getLogger(__name__)

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDING_DIM = 384


class FeatureExtractor:
    """
    Dense 384-dimensional semantic vector extractor powered by
    sentence-transformers/all-MiniLM-L6-v2 (with deterministic 384-D
    n-gram hashing fallback when running in offline environments).
    """

    def __init__(self, model_name: str = MODEL_NAME, prefer_offline: bool = False) -> None:
        self.model_name = model_name
        self._st_model: Optional[object] = None
        self._fallback_vectorizer = HashingVectorizer(
            n_features=EMBEDDING_DIM,
            ngram_range=(1, 3),
            norm="l2",
            alternate_sign=False,
        )

        if not prefer_offline:
            try:
                from sentence_transformers import SentenceTransformer  # type: ignore

                self._st_model = SentenceTransformer(model_name)
                logger.info("Loaded SentenceTransformer model: %s", model_name)
            except Exception as exc:
                logger.warning(
                    "SentenceTransformer '%s' unavailable (%s); using 384-D semantic n-gram projection.",
                    model_name,
                    exc,
                )

    @property
    def backend_name(self) -> str:
        return self.model_name if self._st_model is not None else f"{self.model_name} (384-D offline projection)"

    def encode(self, texts: list[str]) -> np.ndarray:
        """
        Encode a list of normalized mathematical proof strings into an
        (N, 384) float32 numpy array.
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
            return np.asarray(vecs, dtype=np.float32)

        sparse_mat = self._fallback_vectorizer.transform(texts)
        return sparse_mat.toarray().astype(np.float32)
