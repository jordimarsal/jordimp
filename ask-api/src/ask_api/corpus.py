"""Corpus manifest, hashing and index freshness checking."""

import hashlib
from collections.abc import Sequence
from dataclasses import dataclass
from pathlib import Path

import yaml

from ask_api.result import Err, IndexStale, Ok, Result


@dataclass(frozen=True)
class CorpusSource:
    path: str
    file: Path
    title: str


@dataclass(frozen=True)
class CorpusFile:
    source: CorpusSource
    text: str


@dataclass(frozen=True)
class IndexMeta:
    corpus_sha256: str
    built_at: str
    model: str
    dim: int
    chunks: int


def load_manifest(corpus_dir: Path) -> tuple[CorpusSource, ...]:
    manifest_path = corpus_dir / "manifest.yaml"
    if not manifest_path.is_file():
        raise FileNotFoundError(f"corpus manifest not found: {manifest_path}")
    raw = yaml.safe_load(manifest_path.read_text(encoding="utf-8"))
    if not isinstance(raw, dict) or not isinstance(raw.get("sources"), list):
        raise ValueError("manifest must contain a 'sources' list")
    sources = tuple(
        CorpusSource(
            path=str(entry["path"]),
            file=corpus_dir / str(entry["path"]),
            title=str(entry["title"]),
        )
        for entry in raw["sources"]
    )
    if not sources:
        raise ValueError("manifest has no sources")
    return sources


def read_sources(sources: Sequence[CorpusSource]) -> tuple[CorpusFile, ...]:
    files: list[CorpusFile] = []
    for source in sources:
        if not source.file.is_file():
            raise FileNotFoundError(f"corpus file not found: {source.file}")
        files.append(CorpusFile(source=source, text=source.file.read_text(encoding="utf-8")))
    return tuple(files)


def corpus_hash(files: Sequence[CorpusFile]) -> str:
    """SHA-256 over the manifest-ordered source path + content pairs."""
    digest = hashlib.sha256()
    for item in files:
        digest.update(item.source.path.encode("utf-8"))
        digest.update(b"\x00")
        digest.update(item.text.encode("utf-8"))
        digest.update(b"\x00")
    return digest.hexdigest()


def check_freshness(expected: str, meta: IndexMeta | None) -> Result[IndexMeta, IndexStale]:
    if meta is None:
        return Err(IndexStale(expected=expected, found=None))
    if meta.corpus_sha256 != expected:
        return Err(IndexStale(expected=expected, found=meta.corpus_sha256))
    return Ok(meta)
