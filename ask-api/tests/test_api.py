import logging

from fastapi.testclient import TestClient

from ask_api.adapters.sqlite_vec import SqliteVecIndex
from ask_api.api import Deps, HealthReporter, create_app
from ask_api.citation import not_covered_text
from ask_api.config import Settings
from ask_api.corpus import IndexMeta
from ask_api.ratelimit import ConcurrencyGate, TokenBucket
from ask_api.result import UpstreamError
from ask_api.service import AnswerService
from support import FakeEmbedder, FakeIndex, RecordingGenerator, make_chunk, make_scored


def build_app_from(
    settings: Settings,
    *,
    scores: tuple[float, ...] = (0.9, 0.8),
    reply: str = "Answer [1].",
    embedder: FakeEmbedder | None = None,
    generator: RecordingGenerator | None = None,
):
    resolved_embedder = embedder or FakeEmbedder()
    index = FakeIndex(tuple(make_scored(make_chunk(i), score) for i, score in enumerate(scores)))
    resolved_generator = generator or RecordingGenerator(reply=reply)
    service = AnswerService(
        embedder=resolved_embedder,
        index=index,
        generator=resolved_generator,
        top_k=settings.top_k,
        threshold=settings.threshold,
    )
    deps = Deps(
        service=service,
        limiter=TokenBucket(settings.rate_per_min, settings.rate_burst),
        gate=ConcurrencyGate(settings.max_concurrency),
        health=HealthReporter(settings),
    )
    return TestClient(create_app(settings, deps)), deps, resolved_embedder, resolved_generator


def build_app(  # type: ignore[no-untyped-def]
    make_settings,
    *,
    scores=(0.9, 0.8),
    reply="Answer [1].",
    embedder=None,
    generator=None,
    **overrides,
):
    settings = make_settings(**overrides)
    return build_app_from(
        settings, scores=scores, reply=reply, embedder=embedder, generator=generator
    )


def test_root_descriptor(make_settings) -> None:
    client, *_ = build_app(make_settings)
    body = client.get("/").json()
    assert body["name"] == "ask-api"
    assert "/api/ask" in body["endpoints"]
    assert body["site"] == "https://jordimp.net"


def test_covered_answer_shape(make_settings) -> None:
    client, _, embedder, generator = build_app(make_settings)
    response = client.post("/api/ask", json={"question": "Who is Jordi?", "lang": "en"})
    assert response.status_code == 200
    body = response.json()
    assert body["covered"] is True
    assert body["answer"] == "Answer [1]."
    assert body["citations"][0]["source"] == "files/cv.md"
    assert body["citations"][0]["title"] == "CV"
    assert body["lang"] == "en"
    assert body["latency_ms"] >= 0
    assert embedder.calls == 1
    assert generator.calls == 1


def test_not_covered_below_threshold_is_honest(make_settings) -> None:
    client, _, _, generator = build_app(make_settings, scores=(0.2, 0.1))
    response = client.post("/api/ask", json={"question": "Q?", "lang": "ca"})
    assert response.status_code == 200
    body = response.json()
    assert body["covered"] is False
    assert body["citations"] == []
    assert body["answer"] == not_covered_text("ca")
    assert generator.calls == 0


def test_uncited_generation_becomes_not_covered(make_settings) -> None:
    client, _, _, generator = build_app(make_settings, reply="Sense cites.")
    response = client.post("/api/ask", json={"question": "Q?", "lang": "en"})
    assert response.status_code == 200
    body = response.json()
    assert body["covered"] is False
    assert body["answer"] == not_covered_text("en")
    assert generator.calls == 1


def test_blank_and_overlong_questions_are_422_problems(make_settings) -> None:
    client, *_ = build_app(make_settings, max_question_chars=20)
    for payload in ({"question": "   "}, {"question": "x" * 21}):
        response = client.post("/api/ask", json=payload)
        assert response.status_code == 422
        assert response.headers["content-type"].startswith("application/problem+json")
        assert response.json()["status"] == 422


def test_schema_validation_is_422_problem(make_settings) -> None:
    client, *_ = build_app(make_settings)
    for payload in ({}, {"question": "q", "lang": "fr"}, {"question": "x" * 2001}):
        response = client.post("/api/ask", json=payload)
        assert response.status_code == 422
        assert response.headers["content-type"].startswith("application/problem+json")


def test_unknown_route_is_problem_json(make_settings) -> None:
    client, *_ = build_app(make_settings)
    response = client.get("/nope")
    assert response.status_code == 404
    assert response.headers["content-type"].startswith("application/problem+json")
    assert response.json()["title"] == "Not found"


def test_rate_limit_denies_before_doing_work(make_settings) -> None:
    client, _, embedder, generator = build_app(make_settings, rate_burst=1)
    first = client.post("/api/ask", json={"question": "q1"})
    second = client.post("/api/ask", json={"question": "q2"})
    assert first.status_code == 200
    assert second.status_code == 429
    assert int(second.headers["retry-after"]) >= 1
    assert second.json()["title"] == "Too many requests"
    assert generator.calls == 1
    assert embedder.calls == 1


def test_buckets_are_keyed_by_forwarded_client(make_settings) -> None:
    client, *_ = build_app(make_settings, rate_burst=1)
    first = client.post(
        "/api/ask", json={"question": "q"}, headers={"X-Forwarded-For": "203.0.113.1"}
    )
    second = client.post(
        "/api/ask", json={"question": "q"}, headers={"X-Forwarded-For": "203.0.113.2"}
    )
    assert first.status_code == 200
    assert second.status_code == 200


def test_busy_gate_is_429_without_consuming_rate_budget(make_settings) -> None:
    client, deps, embedder, generator = build_app(make_settings, rate_burst=1, max_concurrency=1)
    assert deps.gate.try_acquire() is True
    try:
        response = client.post("/api/ask", json={"question": "q"})
    finally:
        deps.gate.release()
    assert response.status_code == 429
    assert response.json()["detail"] == "server is busy, retry shortly"
    assert response.headers["retry-after"] == "2"
    assert generator.calls == 0
    assert embedder.calls == 0


def test_upstream_error_is_sanitized_503_problem(make_settings) -> None:
    embedder = FakeEmbedder(error=UpstreamError("embedder"))
    client, *_ = build_app(make_settings, embedder=embedder)
    response = client.post("/api/ask", json={"question": "q"})
    assert response.status_code == 503
    assert response.headers["content-type"].startswith("application/problem+json")
    body = response.json()
    assert body["status"] == 503
    assert body["title"] == "Service unavailable"
    assert "Traceback" not in response.text
    assert "ConnectError" not in response.text


def test_cors_allowlist(make_settings) -> None:
    client, *_ = build_app(make_settings)
    allowed = client.get("/api/health", headers={"Origin": "https://jordimp.net"})
    assert allowed.headers.get("access-control-allow-origin") == "https://jordimp.net"
    blocked = client.get("/api/health", headers={"Origin": "https://evil.example"})
    assert "access-control-allow-origin" not in blocked.headers


def test_access_log_hides_question_and_logs_route(make_settings, caplog) -> None:
    client, *_ = build_app(make_settings)
    marker = "ZxQwErTySecret"
    with caplog.at_level(logging.INFO, logger="ask_api.access"):
        client.post("/api/ask", json={"question": f"Is the marker {marker}?"})
    assert marker not in caplog.text
    assert "/api/ask" in caplog.text
    assert "method=POST" in caplog.text


def test_security_headers_on_every_response(make_settings) -> None:
    client, *_ = build_app(make_settings)
    response = client.get("/api/health")
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["referrer-policy"] == "no-referrer"
    assert response.headers["strict-transport-security"] == "max-age=31536000"


def test_oversized_body_is_413_problem(make_settings) -> None:
    client, *_ = build_app(make_settings)
    response = client.post("/api/ask", json={"question": "x" * 20000})
    assert response.status_code == 413
    assert response.headers["content-type"].startswith("application/problem+json")
    assert response.json()["title"] == "Payload too large"


def test_health_degraded_without_index(make_settings) -> None:
    client, *_ = build_app(make_settings)
    body = client.get("/api/health").json()
    assert body["status"] == "degraded"
    assert body["index"] is None
    assert body["models"] == {"embedder": True, "generator": True}
    assert body["version"]


def test_health_ok_with_fresh_index_and_cached(make_settings) -> None:
    settings = make_settings()
    SqliteVecIndex(settings.index_path, settings.embed_dim).rebuild(
        (make_chunk(0),),
        ([1.0, 0.0, 0.0, 0.0],),
        IndexMeta(
            corpus_sha256="a" * 64,
            built_at="2026-10-18T00:00:00+00:00",
            model="hash-4",
            dim=4,
            chunks=1,
        ),
    )
    client, deps, *_ = build_app_from(settings)
    body = client.get("/api/health").json()
    assert body["status"] == "ok"
    assert body["index"]["chunks"] == 1
    assert deps.health.report() is deps.health.report()
