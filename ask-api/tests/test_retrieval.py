import pytest

from ask_api.retrieval import cosine, is_below_threshold, top_score
from support import make_chunk, make_scored


def test_cosine_identical_orthogonal_and_zero() -> None:
    assert cosine([1.0, 2.0], [1.0, 2.0]) == pytest.approx(1.0)
    assert cosine([1.0, 0.0], [0.0, 1.0]) == pytest.approx(0.0)
    assert cosine([0.0, 0.0], [1.0, 1.0]) == 0.0


def test_cosine_dimension_mismatch_raises() -> None:
    with pytest.raises(ValueError):
        cosine([1.0], [1.0, 2.0])


def test_top_score_defaults_to_zero_when_empty() -> None:
    assert top_score(()) == 0.0


def test_top_score_is_the_maximum() -> None:
    results = (
        make_scored(make_chunk(0), 0.3),
        make_scored(make_chunk(1), 0.7),
        make_scored(make_chunk(2), 0.5),
    )
    assert top_score(results) == pytest.approx(0.7)


def test_threshold_is_strictly_below() -> None:
    results = (make_scored(make_chunk(0), 0.55),)
    assert is_below_threshold(results, 0.55) is False
    assert is_below_threshold(results, 0.56) is True
    assert is_below_threshold((), 0.1) is True
