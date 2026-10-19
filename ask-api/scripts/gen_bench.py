"""Generation-model A/B bench: golden + off-corpus battery through AnswerService.

Runs the exact prod pipeline (real embeddings + citation enforcement) against
any llama-server as generator, without touching production. Deterministic
generator (temperature 0), same prompt builder, same corpus.

Usage (inside the ask-api image, on the compose network):
  python scripts/gen_bench.py --label qwen3-1.7b --out /work/out/qwen3-1.7b.json

Env: ASK_EMBED_URL, ASK_GEN_URL, ASK_THRESHOLD, ASK_TOP_K (mirror deploy compose).
Output JSON: per-question verdict, text and latency, plus a printed summary.
"""

import argparse
import datetime as dt
import json
import statistics
import tempfile
from pathlib import Path

import yaml

from ask_api.adapters.factory import build_embedder, build_generator
from ask_api.adapters.sqlite_vec import SqliteVecIndex
from ask_api.cli import _chunk_corpus
from ask_api.config import Settings
from ask_api.corpus import IndexMeta
from ask_api.result import Err, Ok


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--label", required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--golden", type=Path, default=Path("evals/golden.yaml"))
    args = parser.parse_args()

    settings = Settings()
    golden = yaml.safe_load(args.golden.read_text(encoding="utf-8"))
    covered = list(golden["questions"])
    off_corpus = list(golden.get("off_corpus", []))

    chunks = _chunk_corpus(settings)
    embedder = build_embedder(settings)
    vectors = embedder.embed(
        [f"{settings.embed_doc_prefix}{chunk.embed_text()}" for chunk in chunks]
    )

    rows: list[dict[str, object]] = []
    with tempfile.TemporaryDirectory() as tmp:
        index = SqliteVecIndex(Path(tmp) / "bench.sqlite", settings.embed_dim)
        index.rebuild(
            chunks,
            vectors,
            IndexMeta(
                corpus_sha256="bench",
                built_at=dt.datetime.now(dt.UTC).isoformat(timespec="seconds"),
                model="bench",
                dim=settings.embed_dim,
                chunks=len(chunks),
            ),
        )
        service = build_service(settings, embedder, index)
        for item in covered:
            rows.append(ask(service, str(item["q"]), str(item.get("lang", "en")), False))
        for item in off_corpus:
            rows.append(ask(service, str(item["q"]), str(item.get("lang", "en")), True))

    covered_rows = [row for row in rows if not row["off_corpus"]]
    ok_rows = [row for row in covered_rows if row["ok"]]
    refused = [row for row in covered_rows if not row["ok"]]
    honest = [row for row in rows if row["off_corpus"] and not row["ok"]]
    latencies = sorted(int(row["latency_ms"]) for row in ok_rows)
    p50 = statistics.median(latencies) if latencies else 0
    p95 = latencies[int(len(latencies) * 0.95) - 1] if latencies else 0

    summary = {
        "label": args.label,
        "covered_ok": f"{len(ok_rows)}/{len(covered_rows)}",
        "refused_on_covered": [str(row["q"]) for row in refused],
        "off_corpus_honest": f"{len(honest)}/{len(off_corpus)}",
        "latency_ms_p50": p50,
        "latency_ms_p95": p95,
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(
        json.dumps({"summary": summary, "rows": rows}, ensure_ascii=False, indent=1),
        encoding="utf-8",
    )
    print(json.dumps(summary, ensure_ascii=False, indent=1))


def build_service(settings: Settings, embedder: object, index: object) -> object:  # noqa: ANN001
    from ask_api.service import AnswerService

    return AnswerService(
        embedder=embedder,  # type: ignore[arg-type]
        index=index,  # type: ignore[arg-type]
        generator=build_generator(settings),
        top_k=settings.top_k,
        threshold=settings.threshold,
        query_prefix=settings.embed_query_prefix,
    )


def ask(service: object, question: str, lang: str, off_corpus: bool) -> dict[str, object]:  # noqa: ANN001
    outcome = service.answer(question, lang)  # type: ignore[attr-defined]
    if isinstance(outcome, Ok):
        answer = outcome.value
        return {
            "q": question,
            "lang": lang,
            "off_corpus": off_corpus,
            "ok": True,
            "latency_ms": answer.latency_ms,
            "citations": [citation.source for citation in answer.citations],
            "text": answer.text,
        }
    error = outcome.error
    return {
        "q": question,
        "lang": lang,
        "off_corpus": off_corpus,
        "ok": False,
        "latency_ms": -1,
        "error": type(error).__name__,
        "text": "",
    }


if __name__ == "__main__":
    main()
