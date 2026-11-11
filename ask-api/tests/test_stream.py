"""Streaming answers: deltas first, the validated body last."""

import pytest

from ask_api.result import UpstreamError
from ask_api.service import AnswerService
from support import (
    FakeEmbedder,
    FakeIndex,
    RecordingGenerator,
    StreamingRecordingGenerator,
    make_chunk,
    make_scored,
)


def streaming_service(
    reply: str = "Answer [1].",
    *,
    scores: tuple[float, ...] = (0.9, 0.8),
    error: UpstreamError | None = None,
) -> tuple[AnswerService, StreamingRecordingGenerator]:
    generator = StreamingRecordingGenerator(reply=reply, error=error)
    service = AnswerService(
        embedder=FakeEmbedder(),
        index=FakeIndex(tuple(make_scored(make_chunk(i), score) for i, score in enumerate(scores))),
        generator=generator,
        top_k=2,
        threshold=0.55,
    )
    return service, generator


def test_stream_emits_deltas_then_the_validated_answer() -> None:
    service, _ = streaming_service(reply="Answer [1].")

    events = list(service.answer_stream("question?", "en"))

    kinds = [event["type"] for event in events]
    assert "delta" in kinds and "done" in kinds
    done = events[-1]["answer"]
    assert done.text == "Answer [1]."
    assert [c.source for c in done.citations] == ["files/cv.md"]
    assert done.covered is True
    deltas = [event["text"] for event in events if event["type"] == "delta"]
    assert "".join(deltas).rstrip() == "Answer [1]."


def test_stream_refuses_below_threshold_with_one_event() -> None:
    service, _ = streaming_service(scores=(0.2, 0.1))

    events = list(service.answer_stream("question?", "en"))

    assert len(events) == 1
    assert events[0]["type"] == "refused"
    assert events[0]["threshold"] == 0.55


def test_stream_reports_citation_missing_as_error() -> None:
    service, _ = streaming_service(reply="Answer [9].")

    events = list(service.answer_stream("question?", "en"))

    assert events[-1]["type"] == "error"


def test_stream_surfaces_upstream_errors() -> None:
    service, _ = streaming_service(error=UpstreamError("generator"))

    with pytest.raises(UpstreamError):
        list(service.answer_stream("question?", "en"))


def test_stream_reports_generators_without_stream_support() -> None:
    generator = RecordingGenerator(reply="Answer [1].")
    service = AnswerService(
        embedder=FakeEmbedder(),
        index=FakeIndex(
            tuple(make_scored(make_chunk(i), score) for i, score in enumerate((0.9, 0.8)))
        ),
        generator=generator,
        top_k=2,
        threshold=0.55,
    )

    events = list(service.answer_stream("question?", "en"))

    assert events == [{"type": "error", "reason": "streaming-unsupported"}]
