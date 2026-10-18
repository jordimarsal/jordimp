"""AnswerService: embed → retrieve → threshold → prompt → generate → cite."""

import time
from collections.abc import Callable
from dataclasses import dataclass

from ask_api.citation import Citation, enforce
from ask_api.config import Lang
from ask_api.ports import Embedder, Generator, VectorIndex
from ask_api.prompt import build_prompt
from ask_api.result import AskError, BelowThreshold, Err, Ok, Result
from ask_api.retrieval import is_below_threshold, top_score


@dataclass(frozen=True)
class Answer:
    text: str
    citations: tuple[Citation, ...]
    covered: bool
    latency_ms: int


class AnswerService:
    def __init__(
        self,
        *,
        embedder: Embedder,
        index: VectorIndex,
        generator: Generator,
        top_k: int,
        threshold: float,
        query_prefix: str = "",
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        if top_k <= 0:
            raise ValueError("top_k must be positive")
        self._embedder = embedder
        self._index = index
        self._generator = generator
        self._top_k = top_k
        self._threshold = threshold
        self._query_prefix = query_prefix
        self._clock = clock

    def answer(self, question: str, lang: Lang) -> Result[Answer, AskError]:
        """Answer from the corpus, or fail honestly (`BelowThreshold`/`CitationMissing`)."""
        started = self._clock()
        vector = self._embedder.embed([f"{self._query_prefix}{question}"])[0]
        chunks = self._index.search(vector, self._top_k)
        if is_below_threshold(chunks, self._threshold):
            return Err(BelowThreshold(top_score(chunks), self._threshold))
        raw = self._generator.generate(build_prompt(question, lang, chunks))
        outcome = enforce(raw, chunks, lang)
        if isinstance(outcome, Err):
            return Err(outcome.error)
        text, citations = outcome.value
        return Ok(
            Answer(
                text=text,
                citations=citations,
                covered=True,
                latency_ms=self._elapsed_ms(started),
            )
        )

    def _elapsed_ms(self, started: float) -> int:
        return int((self._clock() - started) * 1000)
