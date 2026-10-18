"""In-process protection: per-client token bucket + global concurrency gate."""

import math
import threading
import time
from collections.abc import Callable

_MAX_TRACKED_CLIENTS = 4096
_STALE_AFTER_S = 600.0


class TokenBucket:
    """Per-client rate limiter with an injectable clock (deterministic in tests)."""

    def __init__(
        self,
        per_minute: int,
        burst: int,
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        if per_minute <= 0 or burst <= 0:
            raise ValueError("per_minute and burst must be positive")
        self._rate_per_s = per_minute / 60.0
        self._capacity = float(burst)
        self._clock = clock
        self._lock = threading.Lock()
        self._state: dict[str, tuple[float, float]] = {}

    def allow(self, key: str) -> bool:
        with self._lock:
            now = self._clock()
            self._prune(now)
            tokens, last = self._state.get(key, (self._capacity, now))
            tokens = min(self._capacity, tokens + (now - last) * self._rate_per_s)
            allowed = tokens >= 1.0
            if allowed:
                tokens -= 1.0
            self._state[key] = (tokens, now)
            return allowed

    def retry_after(self, key: str) -> int:
        """Seconds until the key has a full token again (0 when it has one now)."""
        with self._lock:
            now = self._clock()
            tokens, last = self._state.get(key, (self._capacity, now))
            tokens = min(self._capacity, tokens + (now - last) * self._rate_per_s)
            if tokens >= 1.0:
                return 0
            return max(1, math.ceil((1.0 - tokens) / self._rate_per_s))

    def _prune(self, now: float) -> None:
        if len(self._state) <= _MAX_TRACKED_CLIENTS:
            return
        self._state = {
            key: value for key, value in self._state.items() if now - value[1] < _STALE_AFTER_S
        }


class ConcurrencyGate:
    """Global in-flight cap; `try_acquire` never blocks."""

    def __init__(self, limit: int) -> None:
        if limit <= 0:
            raise ValueError("limit must be positive")
        self._semaphore = threading.BoundedSemaphore(limit)

    def try_acquire(self) -> bool:
        return self._semaphore.acquire(blocking=False)

    def release(self) -> None:
        self._semaphore.release()
