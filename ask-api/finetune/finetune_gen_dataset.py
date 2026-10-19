"""Fine-tune dataset generator for the porter gen-model.

Runs inside the ask-api image (compose network): real nomic retrieval + the
4B teacher as generator. For every example the TRAINING PROMPT is the exact
prod prompt (build_prompt) and the completion is kept only if it passes the
production citation policy (citation.enforce). Golden questions are excluded
(holdout). Output: JSONL {prompt_system, prompt_user, completion, kind, lang}.

Kinds: simple (one-topic Q), compound (spans two sources), refusal (uncovered).
"""

import argparse
import json
import random
import re
import tempfile
from datetime import UTC, datetime
from pathlib import Path

import yaml

from ask_api.adapters.factory import build_embedder
from ask_api.adapters.sqlite_vec import SqliteVecIndex
from ask_api.citation import enforce, not_covered_text
from ask_api.cli import _chunk_corpus
from ask_api.config import Settings
from ask_api.corpus import IndexMeta
from ask_api.prompt import build_prompt
from ask_api.result import Ok

LANGS = ["en", "es", "ca"]

QUESTION_SYS = (
    "You create evaluation datasets. Output ONLY a JSON object, no other text."
)


def teacher_call(base_url: str, system: str, user: str, max_tokens: int) -> str:
    import json as _json
    import urllib.request

    body = _json.dumps(
        {
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "temperature": 0.8,
            "max_tokens": max_tokens,
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        f"{base_url}/v1/chat/completions",
        data=body,
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=90) as response:
        payload = _json.load(response)
    return payload["choices"][0]["message"]["content"]


def norm(q: str) -> str:
    return re.sub(r"\s+", " ", q).strip().casefold()


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--per-lang", type=int, default=100)
    ap.add_argument("--golden", type=Path, default=Path("evals/golden.yaml"))
    args = ap.parse_args()

    settings = Settings()
    chunks = _chunk_corpus(settings)
    embedder = build_embedder(settings)
    sources = sorted({c.source for c in chunks})
    rng = random.Random(42)

    golden = yaml.safe_load(args.golden.read_text(encoding="utf-8"))
    banned = {
        norm(str(item["q"]))
        for item in golden["questions"] + golden.get("off_corpus", [])
    }

    rows: list[dict] = []
    seen_questions: set[str] = set()

    def retrieve(question: str):
        vec = embedder.embed([f"{settings.embed_query_prefix}{question}"])[0]
        return index.search(vec, settings.top_k)

    with tempfile.TemporaryDirectory() as tmp:
        vectors = embedder.embed(
            [f"{settings.embed_doc_prefix}{c.embed_text()}" for c in chunks]
        )
        index = SqliteVecIndex(Path(tmp) / "gen.sqlite", settings.embed_dim)
        index.rebuild(
            chunks,
            vectors,
            IndexMeta(
                corpus_sha256="gen",
                built_at=datetime.now(UTC).isoformat(timespec="seconds"),
                model="gen",
                dim=settings.embed_dim,
                chunks=len(chunks),
            ),
        )

        specs = []
        for lang in LANGS:
            specs += [("simple", lang)] * int(args.per_lang * 0.5)
            specs += [("compound", lang)] * int(args.per_lang * 0.25)
            specs += [("refusal", lang)] * int(args.per_lang * 0.25)

        for i, (kind, lang) in enumerate(specs):
            out_path = args.out
            out_path.parent.mkdir(parents=True, exist_ok=True)
            out_file = out_path.open("a", encoding="utf-8")
            # 1) teacher invents a question in `lang`
            picked = rng.sample(sources, 2) if kind == "compound" else [rng.choice(sources)]
            glimpse = "\n\n".join(
                f"- {s}: " + next(c.text[:350] for c in chunks if c.source == s)
                for s in picked
            )
            if kind == "refusal":
                task = (
                    f"Write ONE natural visitor question in {lang} about a topic that is "
                    "CLEARLY NOT covered by these portfolio documents (hobbies, cooking, "
                    "sports, other people, general world facts)."
                )
            elif kind == "compound":
                task = (
                    f"Write ONE natural visitor question in {lang} whose answer needs "
                    "combining information from TWO different documents above (for example "
                    "experience plus a specific project, or two projects together)."
                )
            else:
                task = (
                    f"Write ONE natural visitor question in {lang} answerable from "
                    "the documents above."
                )
            raw = teacher_call(
                settings.gen_url,
                QUESTION_SYS,
                f"Portfolio documents (glimpse):\n{glimpse}\n\n{task}\n\nOutput ONLY: "
                '{{"question": "..."}}',
                120,
            )
            m = re.search(r'\{.*\}', raw, re.S)
            if not m:
                continue
            try:
                question = json.loads(m.group(0))["question"].strip()
            except Exception:
                continue
            if not question or norm(question) in banned or norm(question) in seen_questions:
                continue
            seen_questions.add(norm(question))

            scored = retrieve(question)
            if not scored:
                continue
            prompt = build_prompt(question, lang, scored)

            if kind == "refusal":
                completion = not_covered_text(lang)
            else:
                raw_answer = teacher_call(
                    settings.gen_url,
                    prompt.system,
                    prompt.user,
                    320,
                )
                outcome = enforce(raw_answer, scored, lang)
                if not isinstance(outcome, Ok):
                    continue
                completion = outcome.value[0]

            rows.append(
                {
                    "kind": kind,
                    "lang": lang,
                    "question": question,
                    "prompt_system": prompt.system,
                    "prompt_user": prompt.user,
                    "completion": completion,
                }
            )
            out_file.write(json.dumps(rows[-1], ensure_ascii=False) + "\n")
            out_file.flush()
            if (i + 1) % 20 == 0:
                print(f"[{i + 1}/{len(specs)}] kept {len(rows)}", flush=True)

    args.out.write_text(
        "".join(json.dumps(r, ensure_ascii=False) + "\n" for r in rows), encoding="utf-8"
    )
    from collections import Counter

    print("total:", len(rows), Counter((r["kind"], r["lang"]) for r in rows))


if __name__ == "__main__":
    main()
