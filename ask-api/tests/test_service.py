import pytest

from ask_api.result import BelowThreshold, CitationMissing, Err, Ok, UpstreamError
from ask_api.service import AnswerService
from support import FakeEmbedder, FakeIndex, RecordingGenerator, make_chunk, make_scored


def build(embedder=None, index=None, generator=None, clock=None, top_k=4, threshold=0.5):  # type: ignore[no-untyped-def]
    return AnswerService(
        embedder=embedder or FakeEmbedder(),
        index=index
        or FakeIndex([make_scored(make_chunk(0), 0.9), make_scored(make_chunk(1), 0.8)]),
        generator=generator or RecordingGenerator(),
        top_k=top_k,
        threshold=threshold,
        **(dict(clock=clock) if clock is not None else {}),
    )


def test_covered_answer_with_citations() -> None:
    generator = RecordingGenerator(reply="Jordi va treballar amb Kafka [2] i Spring [1].")
    outcome = build(generator=generator).answer("Amb què va treballar?", "ca")
    assert isinstance(outcome, Ok)
    answer = outcome.value
    assert answer.covered is True
    assert [citation.source for citation in answer.citations] == ["files/cv.md", "files/cv.md"]
    assert "Kafka" in answer.text


def test_below_threshold_short_circuits_before_generation() -> None:
    generator = RecordingGenerator()
    index = FakeIndex([make_scored(make_chunk(0), 0.2), make_scored(make_chunk(1), 0.1)])
    outcome = build(index=index, generator=generator, threshold=0.5).answer("q", "en")
    assert outcome == Err(BelowThreshold(top_score=0.2, threshold=0.5))
    assert generator.calls == 0


def test_uncited_generation_is_citation_missing() -> None:
    generator = RecordingGenerator(reply="Sense cap referència.")
    outcome = build(generator=generator).answer("q", "ca")
    assert outcome == Err(CitationMissing())
    assert generator.calls == 1


def test_invalid_citations_are_stripped_and_missing_when_all_invalid() -> None:
    generator = RecordingGenerator(reply="Referència dolenta [7].")
    outcome = build(generator=generator).answer("q", "en")
    assert outcome == Err(CitationMissing())


def test_latency_is_measured_with_the_injected_clock() -> None:
    clock = iter([100.0, 100.25]).__next__
    outcome = build(clock=clock).answer("q", "en")
    assert isinstance(outcome, Ok)
    assert outcome.value.latency_ms == 250


def test_embedder_receives_the_question() -> None:
    embedder = FakeEmbedder()
    build(embedder=embedder).answer("Who is Jordi?", "en")
    assert embedder.calls == 1
    assert list(embedder.inputs[0]) == ["Who is Jordi?"]


def test_embedder_applies_the_query_prefix_when_configured() -> None:
    embedder = FakeEmbedder()
    AnswerService(
        embedder=embedder,
        index=FakeIndex([make_scored(make_chunk(0), 0.9)]),
        generator=RecordingGenerator(),
        top_k=4,
        threshold=0.5,
        query_prefix="search_query: ",
    ).answer("Who is Jordi?", "en")
    assert list(embedder.inputs[0]) == ["search_query: Who is Jordi?"]


def test_generator_receives_language_instruction() -> None:
    generator = RecordingGenerator()
    build(generator=generator).answer("Qui és en Jordi?", "ca")
    assert "Catalan" in generator.prompts[0].system


def test_upstream_error_propagates() -> None:
    embedder = FakeEmbedder(error=UpstreamError("embedder"))
    with pytest.raises(UpstreamError):
        build(embedder=embedder).answer("q", "en")
    generator = RecordingGenerator(error=UpstreamError("generator"))
    with pytest.raises(UpstreamError):
        build(generator=generator).answer("q", "en")


def test_top_k_must_be_positive() -> None:
    with pytest.raises(ValueError):
        build(top_k=0)
