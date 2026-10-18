"""Ports (Protocols) for the hexagonal boundary + shared read models."""

from collections.abc import Sequence
from dataclasses import dataclass
from typing import Protocol

from ask_api.chunking import Chunk


@dataclass(frozen=True)
class ScoredChunk:
    """A chunk retrieved for a query, with its similarity score."""

    chunk: Chunk
    score: float


@dataclass(frozen=True)
class Prompt:
    system: str
    user: str


class Embedder(Protocol):
    def embed(self, texts: Sequence[str]) -> Sequence[Sequence[float]]: ...


class Generator(Protocol):
    def generate(self, prompt: Prompt) -> str: ...


class VectorIndex(Protocol):
    def search(self, vector: Sequence[float], k: int) -> Sequence[ScoredChunk]: ...
