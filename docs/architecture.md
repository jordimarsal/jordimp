# Architecture

This document defines the architectural quality standards for the project: the
principles that guide design decisions, the data-flow patterns the system follows,
and the boundaries that must never be crossed.

System context: a static portfolio site (`/`, Astro) plus two live micro-backends
(`status-api`, Java 25 / Spring Boot 4.1 — Phase 2; `ask-api`, Python 3.13 / FastAPI —
Phase 3). Full context: `docs/superpowers/specs/2026-09-16-portfolio-web-design.md`.

---

## Principles

1. **Static-first.** The site is fully usable with every API down. Live widgets are
   enhancements that degrade to explicit "offline" states — never blockers, never
   broken layouts.
2. **Ports & adapters everywhere.** Each service (front, `status-api`, `ask-api`) keeps
   a pure, deterministic core behind interfaces. Frameworks, HTTP clients, LLM servers
   and vector stores are adapters at the edge, replaceable without touching the core.
3. **Tell, Don't Ask.** Behavior lives on the object that owns the data. Callers tell
   objects what to do; they do not pull state out to make decisions elsewhere. No
   anemic data bags with public mutable state and logic in a distant service class.
4. **Rich, immutable Value Objects.** Every concept with meaning or rules becomes a
   named type with invariants enforced at construction:
   - Java: `record` with a compact constructor that validates (e.g. `ServiceId`,
     `LatencyMs`, `RetryAfter`).
   - Python: frozen `@dataclass` or Pydantic v2 models with constraints
     (e.g. `Citation`, `ScoredChunk`).
   - TypeScript: branded/primitive aliases where it removes ambiguity (`Locale`,
     `Slug`); UI strings never inline — always from the `ui` dictionary.
   Invalid state is unrepresentable: if a constructor can reject it, callers never
   write `if (x.isValid())` checks.
5. **`Result<T, E>` inside; HTTP outside.** Expected failures (probe timeout, retrieval
   below threshold, rate limit) are *values*, not exceptions:
   - Java: sealed `Result<T, E>` with `Ok<T>` / `Err<E>` records.
   - Python: a tiny internal `Result[T, E]` type (no external dependency).
   - TS (islands): discriminated union `{ ok: true; value } | { ok: false; error }`.
   Exceptions are reserved for broken invariants and programmer errors.
6. **No response envelopes.** HTTP endpoints return plain DTOs with real status codes.
   Errors are RFC 9457 `application/problem+json` bodies. An envelope
   (`{success, data}`) duplicates what HTTP already expresses — forbidden.
7. **I/O at the edges.** Parsing, mapping, validation and decisions are pure and unit-
   testable without network. One adapter per external dependency; the adapter catches
   specific low-level errors and translates them into the core's error types.
8. **Content is typed data.** Astro content collections + JSON schema are the content
   contract. Templates render; they do not compute domain logic.
9. **Spec- and test-driven.** No feature without a spec (harness SDD flow) and no code
   without a failing test first.

---

## Data Flow

**Front (this repo, Phase 1)**
```
content/*.json ──schema──▶ collections ──▶ .astro templates ──▶ static HTML (Pages)
browser islands (theme, filter)  ·  local-only state, zero network
live widgets (Phase 2–3): fetch api.jordimp.net ──▶ Result ──▶ ok | offline | limited state
```

**status-api (Phase 2)**
```
probes (adapters, virtual threads, 1s timeout)
  ──▶ StatusService (pure snapshot + change detection)
  ──▶ StatusController ──▶ REST JSON + SSE stream (heartbeat 15s, debounce ≥2s)
```

**ask-api (Phase 3)**
```
corpus (CV, READMEs, ADRs) ──ingest──▶ chunks ──▶ vector store (sqlite-vec)
question ──▶ Retriever ──▶ ScoredChunks ──▶ Generator (llama.cpp) ──▶ CitationPolicy
  ──▶ Result<Answer, AskError> ──▶ DTO + status code (+ rate limiter at the edge)
```

Failure translation is one-way and edge-only: an adapter maps a low-level error
(`ConnectException`, `HTTPStatusError`) into a core error (`ProbeTimeout`, `LlmUnavailable`)
and the core never sees transport types.

---

## Do Not

- Do not fetch API data at build time into pages — the static site must not silently
  embed live state that can go stale.
- Do not share databases or files between services; each service owns its storage.
- Do not return envelopes, `Map<String, Object>`, or `dict` payloads at a boundary —
  named DTOs only.
- Do not use exceptions for expected/anticipated failures (see Principle 5).
- Do not put decision logic in templates, controllers or FastAPI route handlers — they
  adapt transport to core calls, nothing more.
- Do not catch generic `Exception`/`except Exception` — catch specific errors where the
  type is known and translate once, at the adapter.
- Do not commit secrets, the phone number, or the street address; public contact data
  is limited to what `src/config.ts` already holds.
- Do not hardcode locale lists outside `src/lib/i18n.ts` / the content schema.
