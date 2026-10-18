import pytest

from ask_api.ratelimit import ConcurrencyGate, TokenBucket
from support import FakeClock


def test_burst_then_deny() -> None:
    clock = FakeClock()
    bucket = TokenBucket(per_minute=60, burst=2, clock=clock)
    assert bucket.allow("client") is True
    assert bucket.allow("client") is True
    assert bucket.allow("client") is False


def test_refill_after_time() -> None:
    clock = FakeClock()
    bucket = TokenBucket(per_minute=60, burst=1, clock=clock)
    assert bucket.allow("client") is True
    assert bucket.allow("client") is False
    clock.advance(1.0)
    assert bucket.allow("client") is True


def test_clients_are_isolated() -> None:
    bucket = TokenBucket(per_minute=60, burst=1, clock=FakeClock())
    assert bucket.allow("a") is True
    assert bucket.allow("b") is True
    assert bucket.allow("a") is False


def test_retry_after_counts_down_to_a_full_token() -> None:
    clock = FakeClock()
    bucket = TokenBucket(per_minute=60, burst=1, clock=clock)
    assert bucket.retry_after("client") == 0
    assert bucket.allow("client") is True
    assert bucket.retry_after("client") >= 1
    clock.advance(2.0)
    assert bucket.retry_after("client") == 0


def test_invalid_limits_raise() -> None:
    with pytest.raises(ValueError):
        TokenBucket(per_minute=0, burst=1)
    with pytest.raises(ValueError):
        TokenBucket(per_minute=1, burst=0)
    with pytest.raises(ValueError):
        ConcurrencyGate(0)


def test_gate_never_blocks_and_balances() -> None:
    gate = ConcurrencyGate(1)
    assert gate.try_acquire() is True
    assert gate.try_acquire() is False
    gate.release()
    assert gate.try_acquire() is True
