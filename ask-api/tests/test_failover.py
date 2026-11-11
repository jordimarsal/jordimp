"""Failover semantics: primary first, fallback only before partial delivery."""

from collections.abc import Iterator

import pytest

from ask_api.adapters.failover import FailoverGenerator
from ask_api.ports import Prompt
from ask_api.result import UpstreamError


class FakeGenerator:
    """Scriptable double: deltas then an optional terminal failure."""

    def __init__(
        self,
        deltas: list[str],
        error: UpstreamError | None = None,
        name: str = "fake",
    ) -> None:
        self._deltas = deltas
        self._error = error
        self.name = name
        self.calls = 0

    def stream(self, prompt: Prompt) -> Iterator[str]:
        self.calls += 1
        yield from self._deltas
        if self._error is not None:
            raise self._error

    def generate(self, prompt: Prompt) -> str:
        self.calls += 1
        if self._error is not None:
            raise self._error
        return "".join(self._deltas)


def prompt() -> Prompt:
    return Prompt(system="s", user="u")


def test_primary_served_without_touching_the_fallback() -> None:
    primary = FakeGenerator(["answer"], name="primary")
    fallback = FakeGenerator(["fallback"], name="fallback")
    node = FailoverGenerator(primary, fallback)

    assert node.generate(prompt()) == "answer"
    assert primary.calls == 1 and fallback.calls == 0


def test_failover_when_the_primary_is_down() -> None:
    primary = FakeGenerator([], error=UpstreamError("generator"), name="primary")
    fallback = FakeGenerator(["fallback"], name="fallback")
    node = FailoverGenerator(primary, fallback)

    assert node.generate(prompt()) == "fallback"


def test_stream_failover_happens_before_partial_delivery() -> None:
    primary = FakeGenerator([], error=UpstreamError("generator"), name="primary")
    fallback = FakeGenerator(["fallback"], name="fallback")
    node = FailoverGenerator(primary, fallback)

    assert list(node.stream(prompt())) == ["fallback"]
    assert fallback.calls == 1


def test_mid_stream_failure_propagates_no_duplicated_answer() -> None:
    primary = FakeGenerator(["half "], error=UpstreamError("generator"), name="primary")
    fallback = FakeGenerator(["fallback"], name="fallback")
    node = FailoverGenerator(primary, fallback)

    with pytest.raises(UpstreamError):
        list(node.stream(prompt()))
    assert fallback.calls == 0


def test_both_down_raises_the_primary_error() -> None:
    primary = FakeGenerator([], error=UpstreamError("generator"), name="primary")
    fallback = FakeGenerator([], error=UpstreamError("fallback"), name="fallback")
    node = FailoverGenerator(primary, fallback)

    with pytest.raises(UpstreamError):
        node.generate(prompt())
