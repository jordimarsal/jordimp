"""Failover wrapper: primary generator first, a fallback on upstream failure.

The failover covers connection, HTTP and payload failures raised **before
any delta is emitted**. A mid-stream failure propagates instead: the client
already holds half an answer from the primary, and a silently different
model finishing it would be a citation hazard, not a recovery.
"""

from collections.abc import Iterator

from ask_api.ports import Prompt, StreamingGenerator
from ask_api.result import UpstreamError

__all__ = ["FailoverGenerator"]


class FailoverGenerator:
    """Serves from the fallback when the primary is down."""

    def __init__(self, primary: StreamingGenerator, fallback: StreamingGenerator) -> None:
        self._primary = primary
        self._fallback = fallback

    def generate(self, prompt: Prompt) -> str:
        try:
            return self._primary.generate(prompt)
        except UpstreamError:
            return self._fallback.generate(prompt)

    def stream(self, prompt: Prompt) -> Iterator[str]:
        emitted = False
        try:
            for delta in self._primary.stream(prompt):
                emitted = True
                yield delta
        except UpstreamError:
            if emitted:
                raise
            yield from self._fallback.stream(prompt)
