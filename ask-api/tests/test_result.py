from dataclasses import FrozenInstanceError

import pytest

from ask_api.result import BelowThreshold, CitationMissing, Err, IndexStale, Ok


def test_ok_and_err_are_frozen_value_objects() -> None:
    ok = Ok(value=1)
    err = Err(BelowThreshold(top_score=0.2, threshold=0.5))
    with pytest.raises(FrozenInstanceError):
        ok.value = 2  # type: ignore[misc]
    with pytest.raises(FrozenInstanceError):
        err.error = CitationMissing()  # type: ignore[misc]


def test_err_values_are_named_closed_types() -> None:
    missing = CitationMissing()
    stale = IndexStale(expected="aaa", found=None)
    below = BelowThreshold(top_score=0.1, threshold=0.5)
    assert missing == CitationMissing()
    assert stale.found is None
    assert below.top_score == 0.1
