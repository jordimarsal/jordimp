import pytest

from ask_api.adapters.sqlite_vec import SqliteVecIndex
from ask_api.corpus import IndexMeta
from support import make_chunk

DIM = 4
VECTORS = (
    [1.0, 0.0, 0.0, 0.0],
    [0.0, 1.0, 0.0, 0.0],
    [0.70710678, 0.70710678, 0.0, 0.0],
)


def chunks():
    return (
        make_chunk(0, text="alpha"),
        make_chunk(1, text="beta"),
        make_chunk(2, text="gamma"),
    )


def meta(sha: str = "f" * 64) -> IndexMeta:
    return IndexMeta(
        corpus_sha256=sha, built_at="2026-10-18T00:00:00+00:00", model="hash-4", dim=DIM, chunks=3
    )


def build(tmp_path):
    index = SqliteVecIndex(tmp_path / "index.sqlite", DIM)
    index.rebuild(chunks(), VECTORS, meta())
    return index


def test_rebuild_and_meta_roundtrip(tmp_path) -> None:
    index = build(tmp_path)
    assert index.meta() == meta()
    assert not (tmp_path / "index.sqlite.tmp").exists()
    assert (tmp_path / "index.sqlite").is_file()


def test_search_orders_by_cosine_similarity(tmp_path) -> None:
    results = build(tmp_path).search([1.0, 0.0, 0.0, 0.0], k=3)
    assert [item.chunk.id for item in results] == [0, 2, 1]
    assert results[0].score == pytest.approx(1.0, abs=1e-6)
    assert results[1].score == pytest.approx(0.70710678, abs=1e-3)
    assert results[2].score == pytest.approx(0.0, abs=1e-6)


def test_search_returns_chunk_payload(tmp_path) -> None:
    results = build(tmp_path).search([1.0, 0.0, 0.0, 0.0], k=1)
    assert results[0].chunk.text == "alpha"
    assert results[0].chunk.source == "files/cv.md"
    assert results[0].chunk.sha256 == f"{0:064d}"


def test_search_limits_to_k(tmp_path) -> None:
    assert len(build(tmp_path).search([1.0, 0.0, 0.0, 0.0], k=2)) == 2


def test_search_validations(tmp_path) -> None:
    index = build(tmp_path)
    with pytest.raises(ValueError):
        index.search([1.0, 0.0], k=1)
    with pytest.raises(ValueError):
        index.search([1.0, 0.0, 0.0, 0.0], k=0)


def test_rebuild_validations(tmp_path) -> None:
    index = SqliteVecIndex(tmp_path / "index.sqlite", DIM)
    with pytest.raises(ValueError):
        index.rebuild(chunks(), VECTORS[:1], meta())
    with pytest.raises(ValueError):
        index.rebuild(chunks(), VECTORS, IndexMeta("f" * 64, "t", "m", dim=8, chunks=3))


def test_meta_none_when_missing(tmp_path) -> None:
    assert SqliteVecIndex(tmp_path / "absent.sqlite", DIM).meta() is None


def test_meta_none_when_unreadable(tmp_path) -> None:
    path = tmp_path / "index.sqlite"
    path.write_text("this is not a sqlite database", encoding="utf-8")
    assert SqliteVecIndex(path, DIM).meta() is None


def test_invalid_dim_raises(tmp_path) -> None:
    with pytest.raises(ValueError):
        SqliteVecIndex(tmp_path / "i.sqlite", 0)
