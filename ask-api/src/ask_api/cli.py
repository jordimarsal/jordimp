"""ask-api CLI: ingest / serve / check / eval."""

import datetime as dt
import logging
import tempfile
from dataclasses import replace
from pathlib import Path

import typer
import uvicorn
import yaml

from ask_api import __version__
from ask_api.adapters.factory import build_embedder, build_generator
from ask_api.adapters.sqlite_vec import SqliteVecIndex
from ask_api.api import HealthReporter, create_app
from ask_api.chunking import Chunk, chunk_markdown
from ask_api.config import Settings
from ask_api.corpus import (
    CorpusFile,
    IndexMeta,
    check_freshness,
    corpus_hash,
    load_manifest,
    read_sources,
)
from ask_api.result import BelowThreshold, Err, IndexStale, Result, UpstreamError
from ask_api.service import AnswerService

app = typer.Typer(name="ask-api", help="RAG assistant for jordimp.net.", no_args_is_help=True)


@app.command()
def ingest(
    force: bool = typer.Option(False, "--force", help="Rebuild even when up to date."),
) -> None:
    """Build the sqlite-vec index from the corpus (idempotent, atomic)."""
    settings = Settings()
    sources = _load_corpus(settings)
    expected = corpus_hash(sources)
    model_label = (
        settings.embed_model if settings.embed_backend == "llama" else f"hash-{settings.embed_dim}"
    )
    index = SqliteVecIndex(settings.index_path, settings.embed_dim)
    meta = index.meta()
    if (
        not force
        and meta is not None
        and meta.corpus_sha256 == expected
        and meta.dim == settings.embed_dim
        and meta.model == model_label
    ):
        typer.echo(f"index up to date ({meta.chunks} chunks, built {meta.built_at})")
        return
    # Chunk ids are per-document; the index needs one global id space.
    chunks = _chunk_corpus(settings)
    embedder = build_embedder(settings)
    doc_prefix = settings.embed_doc_prefix
    try:
        vectors = embedder.embed([f"{doc_prefix}{chunk.text}" for chunk in chunks])
    except UpstreamError as exc:
        typer.echo(f"embedding failed: {exc}", err=True)
        raise typer.Exit(code=1) from exc
    built_at = dt.datetime.now(dt.UTC).isoformat(timespec="seconds")
    index.rebuild(
        chunks,
        vectors,
        IndexMeta(
            corpus_sha256=expected,
            built_at=built_at,
            model=model_label,
            dim=settings.embed_dim,
            chunks=len(chunks),
        ),
    )
    typer.echo(f"indexed {len(chunks)} chunks from {len(sources)} sources")


@app.command()
def serve(
    host: str = typer.Option("0.0.0.0"),  # container-internal bind only
    port: int = typer.Option(8000),
) -> None:
    """Serve the API; refuses to start when the index is missing or stale (R15)."""
    settings = Settings()
    _configure_logging(settings.log_level)
    status = _index_status(settings)
    if isinstance(status, Err):
        error = status.error
        found = "none" if error.found is None else error.found[:12]
        typer.echo(
            f"index not ready: expected corpus {error.expected[:12]}, found {found} "
            "— run `ask-api ingest` first",
            err=True,
        )
        raise typer.Exit(code=1)
    uvicorn.run(create_app(settings), host=host, port=port, log_level=settings.log_level.lower())


@app.command()
def check() -> None:
    """Validate config, corpus/index freshness and upstream reachability."""
    settings = Settings()
    typer.echo(f"ask-api {__version__}")
    typer.echo(f"corpus: {settings.corpus_dir} · index: {settings.index_path}")
    typer.echo(
        f"embedder: {settings.embed_backend} {settings.embed_url} · "
        f"generator: {settings.gen_backend} {settings.gen_url}"
    )
    status = _index_status(settings)
    if isinstance(status, Err):
        typer.echo("index: STALE — run `ask-api ingest`", err=True)
        raise typer.Exit(code=1)
    typer.echo(f"index: fresh ({status.value.chunks} chunks, built {status.value.built_at})")
    report = HealthReporter(settings).report()
    typer.echo(f"health: {report['status']} models={report['models']}")
    if report["status"] != "ok":
        raise typer.Exit(code=1)


def _chunk_corpus(settings: Settings) -> list[Chunk]:
    """Chunk every corpus source, re-keyed into one global id space."""
    per_document: list[Chunk] = []
    for item in _load_corpus(settings):
        per_document.extend(
            chunk_markdown(
                item.source.path,
                item.source.title,
                item.text,
                max_chars=settings.chunk_chars,
                overlap_chars=settings.chunk_overlap,
            )
        )
    # Chunk ids are per-document; the index needs one global id space.
    return [replace(chunk, id=index) for index, chunk in enumerate(per_document)]


@app.command("eval")
def eval_gate(
    golden_path: Path = typer.Option(
        Path("evals/golden.yaml"),
        "--golden",
        help="Golden set YAML (questions + expected sources + off_corpus).",
    ),
) -> None:
    """Retrieval eval gate: golden questions must retrieve their expected source."""
    settings = Settings()
    try:
        golden = yaml.safe_load(golden_path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        typer.echo(f"golden set not found: {golden_path}", err=True)
        raise typer.Exit(code=1) from None
    if not isinstance(golden, dict) or not isinstance(golden.get("questions"), list):
        typer.echo("golden set must contain a 'questions' list", err=True)
        raise typer.Exit(code=1)
    questions = golden["questions"]
    floor = float(golden.get("floor", 0.9))
    if settings.embed_backend != "hash":
        floor = float(golden.get("floor_real", floor))
    off_corpus = golden.get("off_corpus", [])

    chunks = _chunk_corpus(settings)
    embedder = build_embedder(settings)
    queries = [str(item["q"]) for item in questions] + [str(item["q"]) for item in off_corpus]
    doc_prefix = settings.embed_doc_prefix
    query_prefix = settings.embed_query_prefix
    try:
        vectors = embedder.embed([f"{doc_prefix}{chunk.text}" for chunk in chunks])
        query_vectors = embedder.embed([f"{query_prefix}{query}" for query in queries])
    except UpstreamError as exc:
        typer.echo(f"embedding failed: {exc}", err=True)
        raise typer.Exit(code=1) from exc

    with tempfile.TemporaryDirectory() as tmp:
        index = SqliteVecIndex(Path(tmp) / "eval.sqlite", settings.embed_dim)
        index.rebuild(
            chunks,
            vectors,
            IndexMeta(
                corpus_sha256="eval",
                built_at=dt.datetime.now(dt.UTC).isoformat(timespec="seconds"),
                model="eval",
                dim=settings.embed_dim,
                chunks=len(chunks),
            ),
        )
        service = AnswerService(
            embedder=embedder,
            index=index,
            generator=build_generator(settings),
            top_k=settings.top_k,
            threshold=settings.threshold,
            query_prefix=query_prefix,
        )
        hits = 0
        for offset, item in enumerate(questions):
            question = str(item["q"])
            raw_expect = item["expect"]
            expected: tuple[str, ...] = (
                tuple(str(entry) for entry in raw_expect)
                if isinstance(raw_expect, list)
                else (str(raw_expect),)
            )
            scored = index.search(query_vectors[offset], settings.top_k)
            sources = [item_.chunk.source for item_ in scored]
            best = scored[0].score if scored else 0.0
            if any(expect in sources for expect in expected):
                hits += 1
                typer.echo(f"PASS  {question[:64]}  ({best:.3f})")
            else:
                top_sources = ", ".join(sources[:2]) if sources else "nothing"
                typer.echo(
                    f"FAIL  {question[:64]}  ({best:.3f}; want {expected[0]}; top: {top_sources})"
                )
        recall = hits / len(questions) if questions else 0.0

        honest = 0
        for offset, item in enumerate(off_corpus):
            base = len(questions) + offset
            lang = str(item.get("lang", "en"))
            outcome = service.answer(queries[base], lang)  # type: ignore[arg-type]
            if isinstance(outcome, Err):
                gate = "retrieval" if isinstance(outcome.error, BelowThreshold) else "citations"
                honest += 1
                typer.echo(f"SAFE  {queries[base][:64]}  (refused by {gate})")
            else:
                typer.echo(f"LEAK  {queries[base][:64]}  (answered as covered!)")

        typer.echo(
            f"recall {hits}/{len(questions)} = {recall:.3f} (floor {floor:.2f}) · "
            f"off-corpus honest: {honest}/{len(off_corpus)}"
        )
        if recall < floor or honest < len(off_corpus):
            raise typer.Exit(code=1)


def _load_corpus(settings: Settings) -> tuple[CorpusFile, ...]:
    try:
        return read_sources(load_manifest(settings.corpus_dir))
    except (FileNotFoundError, ValueError) as exc:
        typer.echo(f"corpus error: {exc}", err=True)
        raise typer.Exit(code=1) from exc


def _index_status(settings: Settings) -> Result[IndexMeta, IndexStale]:
    expected = corpus_hash(_load_corpus(settings))
    return check_freshness(expected, SqliteVecIndex(settings.index_path, settings.embed_dim).meta())


def _configure_logging(level: str) -> None:
    logging.basicConfig(
        level=level.upper(),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )


def main() -> None:
    app()
