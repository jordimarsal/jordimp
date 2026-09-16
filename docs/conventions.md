# Conventions

This document defines the coding and project conventions for the project. These rules
exist to enforce extreme homogeneity across the codebase. The goal is that any developer
can open any file and immediately understand its structure, naming, and intent without
having to learn a new style.

**Default policy: no comments.** Code must be self-documenting through clear naming and
structure. Comments are permitted only when they explain *why* a non-obvious decision was
made. Comments that describe *what* the code does are prohibited; if the code cannot be
understood without comments, rewrite the code.

**Language:** all code, identifiers, docs and commit messages in English. UI copy exists
in `en`, `es`, `ca` — managed exclusively through the `ui` dictionary and content
collections, never inline in components.

---

## Style Rules

**TypeScript / Astro (front)**
- `strict: true`; no `any`, no `!` non-null assertions, no `as` casts except at
  validated boundaries (Astro `props`).
- Named exports only; no default exports.
- Islands: zero-framework `<script>` blocks; each script owns one behavior (theme,
  filter) and registers it on load — no global namespaces.
- Prefer `const`, early returns, and exhaustive discriminated unions over boolean flags.
- Component props declared as an exported `interface Props`; `Astro.props as Props` once.

**Java 25 (status-api, Phase 2)**
- `record` for every DTO and value object; compact constructors validate invariants
  (`ServiceId { ServiceId { requireNonNull; requireNonBlank; } }`).
- Sealed interfaces for closed hierarchies (`Result`, probe outcomes).
- Constructor with >7 params → Builder (see Sonar rules below).
- Virtual threads for blocking probes; no manual thread pools unless justified in an ADR.

**Python 3.13 (ask-api, Phase 3)**
- `ruff` + `black` (line 100), `mypy --strict`; every function fully annotated.
- Pydantic v2 models for request/response DTOs; frozen `@dataclass` for internal value
  objects (`Citation`, `ScoredChunk`).
- `uv` for dependency and environment management; no `requirements.txt` drift.

---

## Naming Rules

| Thing | Rule | Example |
|---|---|---|
| Astro components | `PascalCase.astro` | `ProjectCard.astro`, `ThemeToggle.astro` |
| TS lib/config files | `kebab-case.ts` | `content.config.ts`, `i18n.ts` |
| Content JSON | `kebab-case` = route slug = collection id | `kafka-adapter-telemetry.json` |
| Java classes | `PascalCase`, records like nouns, tests `XTest` | `StatusService`, `Result` |
| Python modules | `snake_case.py`, tests `test_x.py` | `retriever.py` |
| Locales | literal `'en' \| 'es' \| 'ca'`, type `Locale` | never `'EN'`, never free strings |
| UI strings | dotted keys `section.item` | `nav.projects`, `hero.cta.ask` |
| CSS custom props | `--noun-adjective` | `--accent-strong`, `--code-bg` |
| Env vars | `SCREAMING_SNAKE`, `PUBLIC_` prefix for browser-visible | `PUBLIC_GOATCOUNTER` |

---

## File Structure

Follow the plan's file map (`docs/superpowers/plans/2026-09-16-portfolio-phase0-1-front.md`,
"File Structure") as the single source of truth. Invariants:

- One responsibility per file; a component/page file and its styles stay together
  (scoped `<style>` in Astro) unless shared → `src/styles/`.
- Content JSON lives only in `src/content/<collection>/`; no content in pages.
- Tests mirror the source tree (`tests/` for e2e; colocated `*.spec.ts` for units).
- Later services are top-level workspaces: `status-api/`, `ask-api/` — never nested
  under `src/`.

---

## Test Rules

- **TDD**: failing test first for every behavior; red → green → refactor → commit.
- **One behavior per test**; Arrange–Act–Assert; no inter-test coupling, no shared
  mutable state.
- TS: Vitest for units; Playwright for smoke (`tests/smoke.spec.ts` is the contract:
  render, routing, i18n).
- Java: JUnit 5 + AssertJ + Awaitility; SSE payload pinned by a contract test whose
  fixture is shared with the front.
- Python: pytest (+ `pytest-asyncio` for FastAPI); retrieval quality gated by the
  deterministic eval baseline (CI fails on regression — no eyeballing).
- No `sleep`, no real network in unit tests, no test data magic numbers without names.

---

## Error Handling

Decisions live in `docs/architecture.md` (Principles 5–7); their practical rules:

- **`Result<T, E>` for expected failures** — sealed interface (Java), internal generic
  type (Python), discriminated union (TS islands). `Err` values are named, closed types
  (`ProbeTimeout`, `LlmUnavailable`, `BelowThreshold`).
- **Exceptions for invariant violations only.** Never `throw` for "user asked something
  the corpus can't answer" — that is `Result.Err(BelowThreshold)`.
- **HTTP boundary**: real status codes; errors as RFC 9457 `problem+json`;
  `429 + Retry-After` for the rate limiter; no envelope wrapper, ever.
- **Catch specific, translate once, at the adapter**: `IOException` → `ProbeTimeout` at
  the HTTP-probe adapter; `httpx.ConnectError` → `LlmUnavailable` at the llama.cpp
  client. Cores never see transport types; controllers never see low-level exceptions.
- **Front islands**: every fetch wrapped in `Result`; each widget renders exactly three
  states (`ok | offline | limited`) with a visible label — a failed widget never blanks
  or breaks the page.
- Logging (where logging exists): SLF4J parameterized (Java), `structlog`/stdlib with
  key–value context (Python); throwable as last arg; no `print`, no `System.out`.

---

## Code quality (SonarQube)

The project is scanned by SonarQube (IDE rules appear as `java:S<nnn>` / `docker:S<nnn>`). Follow
these conventions proactively so the CI gate stays green without a cleanup pass; fix at the source,
never suppress the rule.

### Logging
- Never use `System.out`/`System.err`. Use the project's SLF4J logger.
- Pass the throwable as the last arg: `LOG.error("msg", e)` — never `LOG.error(e.getMessage())`.
- Defer expensive args: `LOG.info("{}", () -> expensive())` (lambda / `Supplier`), don't precompute the string.
- Keep WARNING-severity messages as `WARN`; reserve `ERROR` for real failures.

### Resources & exceptions
- Wrap every `AutoCloseable` (stores, containers, pools, files) in **try-with-resources**.
  A class-scoped container started in `@BeforeAll`/`@AfterAll` cannot use try-with-resources →
  annotate the owning method with `@SuppressWarnings("resource")` and document why.
- Unused caught exception params → `_` (modern Java): `catch (RuntimeException _)`.
- Empty override methods need a one-line comment explaining why they're empty.

### APIs & data types
- No wildcard return types: return `ApiResponse<Object>`, not `ApiResponse<?>`.
- Prefer `record` for immutable value objects.
- A constructor with >7 params → use a **Builder**, not a parameter object.
- Clamp with `Math.clamp(value, min, max)` (Java 21+), not `Math.max(min, Math.min(value, max))`.

### Control flow & complexity
- Avoid `break`/`continue`/named labels in loops; extract a helper predicate and `return` early.
- Keep methods under the cognitive-complexity budget: extract helpers instead of nesting loops/branches.
- Remove unused locals/fields.

### Tests
- AssertJ fluent form, not `.size()`/`.keySet()`/`.hashCode()` intermediates: `hasSize(n)`,
  `containsKeys(...)`, `containsEntry(k, v)`, `hasSameHashCodeAs(other)`, `hasToString(...)`.
  Chain `assertThat(a).isEqualTo(b).hasSameHashCodeAs(b)`.
- Hoist constant / expensive strings (e.g. `"x".repeat(129)`, `URI.create(...)`, `Duration.of(...)`) out of lambdas.
- No `Thread.sleep` and no `try { … } catch (…) { fail(…); }`: use **Awaitility**
  (`await().during(Duration.ofMillis(n)).until(() -> true)`).
- Repeated reject/accept cases → `@ParameterizedTest` + `@ValueSource`.

### Docker
- Pin base images by **digest**, not floating tags: `eclipse-temurin@sha256:…` (the tag may stay as
  documentation, but the digest is what's enforced).
