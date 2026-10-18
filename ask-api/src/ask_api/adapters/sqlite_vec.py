"""sqlite-vec vector index: persistent, atomically rebuilt, in-process k-NN."""

import os
import sqlite3
from collections.abc import Sequence
from pathlib import Path

import sqlite_vec

from ask_api.chunking import Chunk
from ask_api.corpus import IndexMeta
from ask_api.ports import ScoredChunk

_SCHEMA = """
CREATE TABLE IF NOT EXISTS chunks(
  id INTEGER PRIMARY KEY,
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  heading TEXT NOT NULL,
  text TEXT NOT NULL,
  sha256 TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY, value TEXT NOT NULL);
"""


class SqliteVecIndex:
    """The service's `VectorIndex` port over a single sqlite-vec file."""

    def __init__(self, path: Path, dim: int) -> None:
        if dim <= 0:
            raise ValueError("dim must be positive")
        self._path = path
        self._dim = dim

    def rebuild(
        self,
        chunks: Sequence[Chunk],
        vectors: Sequence[Sequence[float]],
        meta: IndexMeta,
    ) -> None:
        """Build a fresh index in a temp file and atomically replace the live one."""
        if len(chunks) != len(vectors):
            raise ValueError("chunks and vectors must have the same length")
        if meta.dim != self._dim:
            raise ValueError("meta.dim must match the index dimension")
        self._path.parent.mkdir(parents=True, exist_ok=True)
        tmp_path = self._path.with_name(self._path.name + ".tmp")
        tmp_path.unlink(missing_ok=True)
        connection = _connect(tmp_path)
        try:
            connection.executescript(_SCHEMA)
            connection.execute(
                "CREATE VIRTUAL TABLE vec_chunks USING "
                f"vec0(embedding float[{self._dim}] distance_metric=cosine)"
            )
            connection.executemany(
                "INSERT INTO meta(key, value) VALUES (?, ?)",
                [
                    ("corpus_sha256", meta.corpus_sha256),
                    ("built_at", meta.built_at),
                    ("model", meta.model),
                    ("dim", str(meta.dim)),
                    ("chunks", str(meta.chunks)),
                ],
            )
            connection.executemany(
                "INSERT INTO chunks(id, source, title, heading, text, sha256) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                [(c.id, c.source, c.title, c.heading, c.text, c.sha256) for c in chunks],
            )
            connection.executemany(
                "INSERT INTO vec_chunks(rowid, embedding) VALUES (?, ?)",
                [
                    (chunk.id, sqlite_vec.serialize_float32(list(vector)))
                    for chunk, vector in zip(chunks, vectors, strict=True)
                ],
            )
            connection.commit()
        finally:
            connection.close()
        with open(tmp_path, "rb+") as handle:
            os.fsync(handle.fileno())
        os.replace(tmp_path, self._path)

    def search(self, vector: Sequence[float], k: int) -> Sequence[ScoredChunk]:
        if len(vector) != self._dim:
            raise ValueError("query vector dimension mismatch")
        if k <= 0:
            raise ValueError("k must be positive")
        connection = _connect(self._path, read_only=True)
        try:
            rows = connection.execute(
                f"""
                SELECT c.id, c.source, c.title, c.heading, c.text, c.sha256, v.distance
                FROM vec_chunks v JOIN chunks c ON c.id = v.rowid
                WHERE v.embedding MATCH ? AND k = {int(k)}
                ORDER BY v.distance
                """,
                (sqlite_vec.serialize_float32(list(vector)),),
            ).fetchall()
        finally:
            connection.close()
        return tuple(
            ScoredChunk(
                chunk=Chunk(
                    id=row[0],
                    source=row[1],
                    title=row[2],
                    heading=row[3],
                    text=row[4],
                    sha256=row[5],
                ),
                score=1.0 - float(row[6]),
            )
            for row in rows
        )

    def meta(self) -> IndexMeta | None:
        """Index metadata, or None when the index is missing or unreadable."""
        if not self._path.is_file():
            return None
        try:
            connection = _connect(self._path, read_only=True)
            try:
                rows = dict(connection.execute("SELECT key, value FROM meta").fetchall())
            finally:
                connection.close()
            return IndexMeta(
                corpus_sha256=str(rows["corpus_sha256"]),
                built_at=str(rows["built_at"]),
                model=str(rows["model"]),
                dim=int(rows["dim"]),
                chunks=int(rows["chunks"]),
            )
        except (sqlite3.Error, KeyError, ValueError):
            return None


def _connect(path: Path, *, read_only: bool = False) -> sqlite3.Connection:
    if read_only:
        connection = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
    else:
        connection = sqlite3.connect(path)
    connection.enable_load_extension(True)
    sqlite_vec.load(connection)
    connection.enable_load_extension(False)
    return connection
