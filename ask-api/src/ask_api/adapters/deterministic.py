"""Deterministic adapters for tests, the CI eval gate and `--fake` runs."""

import hashlib
import math
import re
import unicodedata
from collections.abc import Sequence
from itertools import pairwise

from ask_api.ports import Prompt

_WORD_RE = re.compile(r"[a-z0-9]+")


def _fold(text: str) -> str:
    """Strip diacritics so `máster` matches `master` lexically."""
    return "".join(
        char for char in unicodedata.normalize("NFD", text) if not unicodedata.combining(char)
    )


def _tokens(text: str) -> list[str]:
    words = _WORD_RE.findall(_fold(text.lower()))
    return words + [f"{left}~{right}" for left, right in pairwise(words)]


class HashEmbedder:
    """Signed hashing bag-of-words (+bigrams) embedding: deterministic and lexical."""

    def __init__(self, dim: int = 768) -> None:
        if dim <= 0:
            raise ValueError("dim must be positive")
        self._dim = dim

    def embed(self, texts: Sequence[str]) -> Sequence[Sequence[float]]:
        return [self._embed_one(text) for text in texts]

    def _embed_one(self, text: str) -> list[float]:
        vector = [0.0] * self._dim
        for token in _tokens(text):
            digest = hashlib.sha256(token.encode("utf-8")).digest()
            index = int.from_bytes(digest[:8], "big") % self._dim
            sign = 1.0 if digest[8] % 2 == 0 else -1.0
            vector[index] += sign
        norm = math.sqrt(sum(value * value for value in vector))
        if norm == 0.0:
            return vector
        return [value / norm for value in vector]


class EchoGenerator:
    """Deterministic generator: always cites excerpt [1]."""

    def generate(self, prompt: Prompt) -> str:
        question_line = prompt.user.splitlines()[-1]
        return f"[1] Deterministic echo: {question_line[:80]}"
