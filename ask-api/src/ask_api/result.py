"""Ok/Err values for expected failures — exceptions are for invariant violations only.

Convention (docs/conventions.md): `Err` values are named, closed types; the HTTP
boundary translates them once, never cores.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class Ok[T]:
    """Success of an operation that can fail in expected ways."""

    value: T


@dataclass(frozen=True)
class Err[E]:
    """Expected failure with a named, closed error value."""

    error: E


type Result[T, E] = Ok[T] | Err[E]


@dataclass(frozen=True)
class BelowThreshold:
    """Retrieval did not clear the configured similarity threshold."""

    top_score: float
    threshold: float


@dataclass(frozen=True)
class CitationMissing:
    """The generator produced no citation referring to a retrieved chunk."""


@dataclass(frozen=True)
class IndexStale:
    """The persisted index does not match the current corpus."""

    expected: str
    found: str | None


type AskError = BelowThreshold | CitationMissing | IndexStale


class UpstreamError(Exception):
    """A model upstream (embedder or generator) is unreachable or errored.

    Raised by adapters (translated once, per conventions); the API boundary maps
    it to `503 problem+json`.
    """

    def __init__(self, service: str) -> None:
        super().__init__(f"upstream unavailable: {service}")
        self.service = service
