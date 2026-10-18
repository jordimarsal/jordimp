import pytest
import yaml

from ask_api.corpus import (
    IndexMeta,
    check_freshness,
    corpus_hash,
    load_manifest,
    read_sources,
)
from ask_api.result import Err, IndexStale, Ok


def write_corpus(tmp_path, entries, files=None):
    corpus_dir = tmp_path / "corpus"
    corpus_dir.mkdir(parents=True, exist_ok=True)
    (corpus_dir / "manifest.yaml").write_text(
        yaml.safe_dump({"sources": entries}), encoding="utf-8"
    )
    for name, text in (files or {}).items():
        path = corpus_dir / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")
    return corpus_dir


def test_load_and_read_sources(tmp_path) -> None:
    corpus_dir = write_corpus(
        tmp_path,
        [{"path": "files/cv.md", "title": "CV"}],
        {"files/cv.md": "# Perfil\n\nEnginyer.\n"},
    )
    sources = load_manifest(corpus_dir)
    assert sources[0].path == "files/cv.md"
    assert sources[0].title == "CV"
    assert sources[0].file == corpus_dir / "files/cv.md"
    files = read_sources(sources)
    assert files[0].text.startswith("# Perfil")


def test_missing_manifest_raises(tmp_path) -> None:
    with pytest.raises(FileNotFoundError):
        load_manifest(tmp_path / "nope")


def test_manifest_without_sources_raises(tmp_path) -> None:
    corpus_dir = tmp_path / "corpus"
    corpus_dir.mkdir()
    (corpus_dir / "manifest.yaml").write_text("title: broken\n", encoding="utf-8")
    with pytest.raises(ValueError):
        load_manifest(corpus_dir)


def test_manifest_with_empty_sources_raises(tmp_path) -> None:
    corpus_dir = write_corpus(tmp_path, [])
    with pytest.raises(ValueError):
        load_manifest(corpus_dir)


def test_missing_corpus_file_raises(tmp_path) -> None:
    corpus_dir = write_corpus(tmp_path, [{"path": "files/gone.md", "title": "X"}])
    with pytest.raises(FileNotFoundError):
        read_sources(load_manifest(corpus_dir))


def test_corpus_hash_is_stable_and_order_sensitive(tmp_path) -> None:
    corpus_dir = write_corpus(
        tmp_path,
        [
            {"path": "files/a.md", "title": "A"},
            {"path": "files/b.md", "title": "B"},
        ],
        {"files/a.md": "alpha", "files/b.md": "beta"},
    )
    first = corpus_hash(read_sources(load_manifest(corpus_dir)))
    second = corpus_hash(read_sources(load_manifest(corpus_dir)))
    assert first == second

    corpus_dir_2 = write_corpus(
        tmp_path / "other",
        [
            {"path": "files/b.md", "title": "B"},
            {"path": "files/a.md", "title": "A"},
        ],
        {"files/a.md": "alpha", "files/b.md": "beta"},
    )
    swapped = corpus_hash(read_sources(load_manifest(corpus_dir_2)))
    assert swapped != first


def test_corpus_hash_changes_with_content(tmp_path) -> None:
    corpus_dir = write_corpus(
        tmp_path,
        [{"path": "files/a.md", "title": "A"}],
        {"files/a.md": "alpha"},
    )
    before = corpus_hash(read_sources(load_manifest(corpus_dir)))
    (corpus_dir / "files" / "a.md").write_text("alpha changed", encoding="utf-8")
    after = corpus_hash(read_sources(load_manifest(corpus_dir)))
    assert after != before


def make_meta(sha: str = "a" * 64) -> IndexMeta:
    return IndexMeta(
        corpus_sha256=sha, built_at="2026-10-18T00:00:00+00:00", model="m", dim=768, chunks=1
    )


def test_check_freshness_missing_index() -> None:
    outcome = check_freshness("abc", None)
    assert outcome == Err(IndexStale(expected="abc", found=None))


def test_check_freshness_mismatch() -> None:
    outcome = check_freshness("abc", make_meta("def"))
    assert outcome == Err(IndexStale(expected="abc", found="def"))


def test_check_freshness_match() -> None:
    meta = make_meta("abc")
    assert check_freshness("abc", meta) == Ok(meta)
