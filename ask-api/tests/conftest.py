"""Shared fixtures."""

from collections.abc import Callable
from pathlib import Path

import pytest

from ask_api.config import Settings


@pytest.fixture()
def make_settings(tmp_path: Path) -> Callable[..., Settings]:
    def _make(**overrides: object) -> Settings:
        base: dict[str, object] = {
            "corpus_dir": tmp_path / "corpus",
            "index_path": tmp_path / "data" / "index.sqlite",
            "embed_backend": "hash",
            "gen_backend": "echo",
            "embed_dim": 4,
            "rate_per_min": 60,
            "rate_burst": 10,
            "max_concurrency": 4,
        }
        base.update(overrides)
        return Settings(**base)  # type: ignore[arg-type]

    return _make
