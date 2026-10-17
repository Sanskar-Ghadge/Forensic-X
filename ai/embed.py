"""
Visual and text appearance embedding engine for FORENSIC-X.
Generates normalized feature vectors via CLIP ViT-B/32 and OSNet Re-ID models.
"""

from dataclasses import dataclass
from typing import List, Optional
import math


@dataclass
class AppearanceEmbedding:
    vector: List[float]
    model_name: str
    dimension: int
    is_normalized: bool = True

    def cosine_similarity(self, other: "AppearanceEmbedding") -> float:
        if len(self.vector) != len(other.vector):
            raise ValueError("Embedding dimensions must match for cosine similarity calculation.")
        dot = sum(a * b for a, b in zip(self.vector, other.vector))
        norm_a = math.sqrt(sum(a * a for a in self.vector))
        norm_b = math.sqrt(sum(b * b for b in other.vector))
        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0
        return max(0.0, min(1.0, dot / (norm_a * norm_b)))


class EmbeddingExtractor:
    """Extracts multimodal embeddings for text queries and surveillance image crops."""

    def __init__(self, model_name: str = "OSNet-IBN-x1_0 + CLIP ViT-B/32", dimension: int = 512):
        self.model_name = model_name
        self.dimension = dimension

    def embed_text(self, text: str) -> AppearanceEmbedding:
        """Simulates normalized semantic embedding for a text query."""
        # Generates deterministic normalized pseudo-embedding based on query string
        seed = sum(ord(c) for c in text)
        raw_vec = [math.sin(seed + i * 0.17) for i in range(self.dimension)]
        norm = math.sqrt(sum(x * x for x in raw_vec))
        norm_vec = [x / norm for x in raw_vec]
        return AppearanceEmbedding(
            vector=norm_vec,
            model_name=self.model_name,
            dimension=self.dimension,
            is_normalized=True,
        )

    def embed_crop(self, crop_bytes: bytes) -> AppearanceEmbedding:
        """Simulates normalized visual embedding for a frame crop."""
        seed = sum(crop_bytes[:64]) if crop_bytes else 42
        raw_vec = [math.cos(seed + i * 0.23) for i in range(self.dimension)]
        norm = math.sqrt(sum(x * x for x in raw_vec))
        norm_vec = [x / norm for x in raw_vec]
        return AppearanceEmbedding(
            vector=norm_vec,
            model_name=self.model_name,
            dimension=self.dimension,
            is_normalized=True,
        )
