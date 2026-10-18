"""Shared test doubles and builders (not a test module)."""

from collections.abc import Sequence

from ask_api.chunking import Chunk
from ask_api.ports import Prompt, ScoredChunk
from ask_api.result import UpstreamError


def make_chunk(
    id: int = 0,
    *,
    text: str | None = None,
    source: str = "files/cv.md",
    title: str = "CV",
    heading: str = "Perfil",
) -> Chunk:
    return Chunk(
        id=id,
        source=source,
        title=title,
        heading=heading,
        text=text if text is not None else f"Chunk body number {id} about Jordi.",
        sha256=f"{id:064d}",
    )


def make_scored(chunk: Chunk, score: float) -> ScoredChunk:
    return ScoredChunk(chunk=chunk, score=score)


class FakeEmbedder:
    def __init__(
        self, vector: Sequence[float] | None = None, error: UpstreamError | None = None
    ) -> None:
        self.calls = 0
        self.inputs: list[Sequence[str]] = []
        self._vector = list(vector) if vector is not None else [1.0, 0.0, 0.0, 0.0]
        self._error = error

    def embed(self, texts: Sequence[str]) -> Sequence[Sequence[float]]:
        self.calls += 1
        self.inputs.append(texts)
        if self._error is not None:
            raise self._error
        return [list(self._vector) for _ in texts]


class FakeIndex:
    def __init__(self, results: Sequence[ScoredChunk]) -> None:
        self.calls = 0
        self._results = tuple(results)

    def search(self, vector: Sequence[float], k: int) -> Sequence[ScoredChunk]:
        self.calls += 1
        return self._results[:k]


class RecordingGenerator:
    def __init__(self, reply: str = "Answer [1].", error: UpstreamError | None = None) -> None:
        self.calls = 0
        self.prompts: list[Prompt] = []
        self._reply = reply
        self._error = error

    def generate(self, prompt: Prompt) -> str:
        self.calls += 1
        self.prompts.append(prompt)
        if self._error is not None:
            raise self._error
        return self._reply


class FakeClock:
    def __init__(self, start: float = 0.0) -> None:
        self.now = start

    def __call__(self) -> float:
        return self.now

    def advance(self, seconds: float) -> None:
        self.now += seconds
