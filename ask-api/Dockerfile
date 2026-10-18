# ask-api production image — pinned base, non-root, ingest-then-serve entrypoint.
FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim@sha256:531f855bda2c73cd6ef67d56b733b357cea384185b3022bd09f05e002cd144ca

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

WORKDIR /app

# Dependencies first (layer cached); the lockfile is authoritative.
COPY pyproject.toml uv.lock README.md ./
RUN uv sync --frozen --no-dev --no-install-project

COPY src ./src
RUN uv sync --frozen --no-dev

# Data dir for the sqlite index (mounted as a named volume in compose).
RUN useradd --uid 10001 --create-home asker \
    && mkdir -p /app/data \
    && chown -R asker:asker /app

COPY --chown=asker:asker corpus ./corpus
COPY --chown=asker:asker deploy/entrypoint.sh ./deploy/entrypoint.sh
USER asker

ENV PATH="/app/.venv/bin:$PATH" \
    ASK_INDEX_PATH=/app/data/index.sqlite \
    ASK_CORPUS_DIR=/app/corpus

EXPOSE 8000
ENTRYPOINT ["/app/deploy/entrypoint.sh"]
