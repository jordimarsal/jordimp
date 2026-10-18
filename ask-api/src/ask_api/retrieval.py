"""Retrieval math: similarity, threshold decision."""

import math
from collections.abc import Sequence

from ask_api.ports import ScoredChunk


def cosine(a: Sequence[float], b: Sequence[float]) -> float:
    """Cosine similarity of two vectors — the math sqlite-vec's cosine metric applies."""
    if len(a) != len(b):
        raise ValueError("vectors must have the same dimension")
    dot = sum(x * y for x, y in zip(a, b, strict=True))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot / (norm_a * norm_b)


def top_score(results: Sequence[ScoredChunk]) -> float:
    return max((item.score for item in results), default=0.0)


def is_below_threshold(results: Sequence[ScoredChunk], threshold: float) -> bool:
    return top_score(results) < threshold
