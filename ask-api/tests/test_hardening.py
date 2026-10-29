import logging
import time

from fastapi.testclient import TestClient

from ask_api.config import Settings
from ask_api.ratelimit import ConcurrencyGate, TokenBucket
from support import FakeEmbedder, FakeIndex, RecordingGenerator, make_chunk, make_scored

from ask_api.api import Deps, HealthReporter, create_app
from ask_api.service import AnswerService


def _build(make_settings, **overrides):
    settings = make_settings(**overrides)
    index = FakeIndex((make_scored(make_chunk(0), 0.9),))
    service = AnswerService(
        embedder=FakeEmbedder(),
        index=index,
        generator=RecordingGenerator(),
        top_k=settings.top_k,
        threshold=settings.threshold,
    )
    deps = Deps(
        service=service,
        limiter=TokenBucket(settings.rate_per_min, settings.rate_burst),
        gate=ConcurrencyGate(settings.max_concurrency),
        health=HealthReporter(settings),
    )
    return TestClient(create_app(settings, deps)), deps


def test_r1_cf_connecting_ip_keys_bucket(make_settings) -> None:
    client, *_ = _build(make_settings, rate_burst=1, rate_per_min=1)
    first = client.post("/api/ask", json={"question": "q"}, headers={"CF-Connecting-IP": "1.2.3.4"})
    second = client.post(
        "/api/ask", json={"question": "q"}, headers={"CF-Connecting-IP": "5.6.7.8"}
    )
    assert first.status_code == 200
    assert second.status_code == 200


def test_r1_cf_connecting_ip_same_ip_limited(make_settings) -> None:
    client, *_ = _build(make_settings, rate_burst=1, rate_per_min=1)
    first = client.post("/api/ask", json={"question": "q"}, headers={"CF-Connecting-IP": "1.2.3.4"})
    second = client.post(
        "/api/ask", json={"question": "q"}, headers={"CF-Connecting-IP": "1.2.3.4"}
    )
    assert first.status_code == 200
    assert second.status_code == 429


def test_r3_origin_mismatch_is_403(make_settings) -> None:
    client, *_ = _build(make_settings)
    response = client.post(
        "/api/ask", json={"question": "q"}, headers={"Origin": "https://evil.example"}
    )
    assert response.status_code == 403


def test_r4_no_origin_accepted(make_settings) -> None:
    client, *_ = _build(make_settings)
    response = client.post("/api/ask", json={"question": "q"})
    assert response.status_code == 200


def test_r8_r9_r10_route_timeout_returns_504(make_settings) -> None:
    class SlowEmbedder(FakeEmbedder):
        def embed(self, texts):
            time.sleep(2.0)
            return super().embed(texts)

    settings = make_settings(route_timeout_s=0.2, max_concurrency=4)
    index = FakeIndex((make_scored(make_chunk(0), 0.9),))
    service = AnswerService(
        embedder=SlowEmbedder(),
        index=index,
        generator=RecordingGenerator(),
        top_k=settings.top_k,
        threshold=settings.threshold,
    )
    deps = Deps(
        service=service,
        limiter=TokenBucket(settings.rate_per_min, settings.rate_burst),
        gate=ConcurrencyGate(settings.max_concurrency),
        health=HealthReporter(settings),
    )
    client = TestClient(create_app(settings, deps))
    gate = deps.gate
    response = client.post("/api/ask", json={"question": "q"})
    assert response.status_code == 504
    assert gate.try_acquire() is True
    gate.release()


def test_r11_r12_health_does_not_leak_internals(make_settings) -> None:
    client, *_ = _build(make_settings)
    body = client.get("/api/health").json()
    forbidden = {"embed_url", "gen_url", "index_path", "corpus_dir", "embed_backend", "gen_backend"}
    assert forbidden.isdisjoint(body.keys())
    assert "status" in body
    assert "version" in body


def test_r14_rate_limit_warning_logged(make_settings, caplog) -> None:
    client, *_ = _build(make_settings, rate_burst=1, rate_per_min=1)
    client.post("/api/ask", json={"question": "q"})
    with caplog.at_level(logging.WARNING, logger="ask_api"):
        second = client.post("/api/ask", json={"question": "q"})
    assert second.status_code == 429
    assert "rate limit exceeded" in caplog.text


def test_r15_gate_rejection_warning_logged(make_settings, caplog) -> None:
    client, deps, *_ = _build(make_settings, max_concurrency=1)
    assert deps.gate.try_acquire() is True
    try:
        with caplog.at_level(logging.WARNING, logger="ask_api"):
            response = client.post("/api/ask", json={"question": "q"})
    finally:
        deps.gate.release()
    assert response.status_code == 429
    assert "concurrency gate rejected" in caplog.text


def test_r20_rate_limit_independent_of_origin(make_settings) -> None:
    client, *_ = _build(make_settings, rate_burst=1, rate_per_min=1)
    first = client.post(
        "/api/ask", json={"question": "q"}, headers={"Origin": "https://jordimp.net"}
    )
    second = client.post(
        "/api/ask", json={"question": "q"}, headers={"Origin": "https://jordimp.net"}
    )
    assert first.status_code == 200
    assert second.status_code == 429
