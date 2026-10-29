"""FastAPI boundary: routes, problem+json errors, CORS allowlist, access logs."""

import logging
import time
import asyncio
from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import httpx
from fastapi import FastAPI, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from starlette.exceptions import HTTPException as StarletteHTTPException

from ask_api import __version__
from ask_api.adapters.factory import build_embedder, build_generator
from ask_api.adapters.sqlite_vec import SqliteVecIndex
from ask_api.citation import not_covered_text
from ask_api.config import Lang, Settings
from ask_api.ratelimit import ConcurrencyGate, TokenBucket
from ask_api.result import Err, UpstreamError
from ask_api.service import AnswerService

logger = logging.getLogger("ask_api")
access_logger = logging.getLogger("ask_api.access")

_BUSY_RETRY_AFTER_S = 2
_HARD_QUESTION_LIMIT = (
    2000  # schema-level bound; the configured soft limit is enforced in the route
)
_MAX_BODY_BYTES = 16384  # replaces Caddy's request_body max_size at the tunnel origin

_SECURITY_HEADERS = {
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
    "strict-transport-security": "max-age=31536000",
}


class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=_HARD_QUESTION_LIMIT)
    lang: Lang = "en"


class HealthReporter:
    """Upstream + index health, cached for a short TTL."""

    def __init__(
        self,
        settings: Settings,
        clock: Callable[[], float] = time.monotonic,
        http: httpx.Client | None = None,
        ttl_s: float = 10.0,
    ) -> None:
        self._settings = settings
        self._clock = clock
        self._http = http or httpx.Client()
        self._ttl_s = ttl_s
        self._cached: dict[str, Any] | None = None
        self._cached_at = 0.0

    def report(self) -> dict[str, Any]:
        now = self._clock()
        if self._cached is not None and now - self._cached_at < self._ttl_s:
            return self._cached
        index_meta = SqliteVecIndex(self._settings.index_path, self._settings.embed_dim).meta()
        models = {
            "embedder": self._ping(self._settings.embed_backend, self._settings.embed_url),
            "generator": self._ping(self._settings.gen_backend, self._settings.gen_url),
        }
        index = (
            {
                "chunks": index_meta.chunks,
                "corpus_sha256": index_meta.corpus_sha256,
                "built_at": index_meta.built_at,
            }
            if index_meta is not None
            else None
        )
        status = "ok" if index_meta is not None and all(models.values()) else "degraded"
        self._cached = {"status": status, "version": __version__, "index": index, "models": models}
        self._cached_at = now
        return self._cached

    def _ping(self, backend: str, url: str) -> bool:
        if backend != "llama":
            return True
        try:
            response = self._http.get(f"{url.rstrip('/')}/health", timeout=1.0)
        except httpx.HTTPError:
            return False
        return response.status_code == 200


@dataclass(frozen=True)
class Deps:
    service: AnswerService
    limiter: TokenBucket
    gate: ConcurrencyGate
    health: HealthReporter


def build_deps(settings: Settings) -> Deps:
    service = AnswerService(
        embedder=build_embedder(settings),
        index=SqliteVecIndex(settings.index_path, settings.embed_dim),
        generator=build_generator(settings),
        top_k=settings.top_k,
        threshold=settings.threshold,
        query_prefix=settings.embed_query_prefix,
    )
    return Deps(
        service=service,
        limiter=TokenBucket(settings.rate_per_min, settings.rate_burst),
        gate=ConcurrencyGate(settings.max_concurrency),
        health=HealthReporter(settings),
    )


def create_app(settings: Settings, deps: Deps | None = None) -> FastAPI:
    resolved = deps or build_deps(settings)
    app = FastAPI(title="ask-api", version=__version__)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type"],
        max_age=600,
    )

    @app.middleware("http")
    async def access_log(
        request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        started = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - started) * 1000.0
        access_logger.info(
            "request method=%s path=%s status=%d duration_ms=%.1f client=%s",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
            _client_key(request),
        )
        return response

    @app.middleware("http")
    async def hardening(
        request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        content_length = request.headers.get("content-length")
        oversized = (
            content_length is not None
            and content_length.isdigit()
            and int(content_length) > _MAX_BODY_BYTES
        )
        if oversized:
            return _problem(413, "Payload too large", "request body exceeds the allowed size")
        response = await call_next(request)
        for name, value in _SECURITY_HEADERS.items():
            response.headers[name] = value
        return response

    @app.exception_handler(UpstreamError)
    async def handle_upstream(request: Request, exc: UpstreamError) -> JSONResponse:
        logger.warning("upstream failure service=%s path=%s", exc.service, request.url.path)
        return _problem(503, "Service unavailable", "a model upstream is currently unavailable")

    @app.exception_handler(RequestValidationError)
    async def handle_validation(request: Request, exc: RequestValidationError) -> JSONResponse:
        return _problem(422, "Invalid request", "the request body does not match the API contract")

    @app.exception_handler(StarletteHTTPException)
    async def handle_http(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        return _problem(exc.status_code, _http_title(exc.status_code), str(exc.detail))

    @app.get("/")
    def root() -> dict[str, Any]:
        return {
            "name": "ask-api",
            "version": __version__,
            "endpoints": ["/api/ask", "/api/health", "/demo"],
            "site": "https://jordimp.net",
        }

    @app.get("/demo", include_in_schema=False)
    def demo() -> Response:
        """Minimal browser UI so the API is demoable from any phone."""
        page = (Path(__file__).with_name("demo.html")).read_text(encoding="utf-8")
        return Response(content=page, media_type="text/html")

    @app.get("/api/health")
    def health() -> dict[str, Any]:
        return resolved.health.report()

    @app.post("/api/ask")
    async def ask(payload: AskRequest, request: Request) -> JSONResponse:
        origin = request.headers.get("origin")
        if origin is not None and origin not in settings.cors_origin_list:
            return _problem(403, "Forbidden", "origin is not allowed")
        question = payload.question.strip()
        if not question:
            return _problem(422, "Invalid request", "question must not be blank")
        if len(question) > settings.max_question_chars:
            return _problem(
                422,
                "Invalid request",
                f"question exceeds {settings.max_question_chars} characters",
            )
        key = _client_key(request)
        if not resolved.limiter.allow(key):
            logger.warning("rate limit exceeded client=%s", key)
            return _problem(
                429,
                "Too many requests",
                "rate limit exceeded",
                retry_after_s=max(1, resolved.limiter.retry_after(key)),
            )
        if not resolved.gate.try_acquire():
            logger.warning("concurrency gate rejected client=%s", key)
            return _problem(
                429,
                "Too many requests",
                "server is busy, retry shortly",
                retry_after_s=_BUSY_RETRY_AFTER_S,
            )
        started = time.perf_counter()
        try:
            outcome = await asyncio.wait_for(
                asyncio.to_thread(resolved.service.answer, question, payload.lang),
                timeout=settings.route_timeout_s,
            )
        except asyncio.TimeoutError:
            logger.warning("route timeout client=%s", key)
            return _problem(
                504,
                "Gateway timeout",
                "request exceeded the time limit",
                retry_after_s=_BUSY_RETRY_AFTER_S,
            )
        finally:
            resolved.gate.release()
        route_ms = int((time.perf_counter() - started) * 1000)
        if isinstance(outcome, Err):
            return JSONResponse(
                status_code=200,
                content={
                    "answer": not_covered_text(payload.lang),
                    "citations": [],
                    "lang": payload.lang,
                    "covered": False,
                    "latency_ms": route_ms,
                },
            )
        answer = outcome.value
        return JSONResponse(
            status_code=200,
            content={
                "answer": answer.text,
                "citations": [
                    {
                        "source": citation.source,
                        "title": citation.title,
                        "heading": citation.heading,
                    }
                    for citation in answer.citations
                ],
                "lang": payload.lang,
                "covered": answer.covered,
                "latency_ms": answer.latency_ms if answer.latency_ms else route_ms,
            },
        )

    return app


def _client_key(request: Request) -> str:
    cf = request.headers.get("cf-connecting-ip")
    if cf:
        return cf.strip()
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    client = request.client
    return client.host if client is not None else "unknown"


def _problem(
    status: int, title: str, detail: str, *, retry_after_s: int | None = None
) -> JSONResponse:
    headers = {"Retry-After": str(retry_after_s)} if retry_after_s is not None else None
    return JSONResponse(
        status_code=status,
        media_type="application/problem+json",
        content={"type": "about:blank", "title": title, "status": status, "detail": detail},
        headers=headers,
    )


def _http_title(status: int) -> str:
    if status == 404:
        return "Not found"
    if status == 405:
        return "Method not allowed"
    return "Request failed"
