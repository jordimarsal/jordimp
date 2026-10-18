from ask_api.citation import Citation, enforce, not_covered_text
from ask_api.result import CitationMissing, Err, Ok
from support import make_chunk, make_scored


def scored_two():
    return (
        make_scored(make_chunk(0, source="files/a.md", title="A", heading="HA"), 0.9),
        make_scored(make_chunk(1, source="files/b.md", title="B", heading="HB"), 0.8),
    )


def test_valid_markers_become_citations() -> None:
    outcome = enforce("Jordi treballa amb Kafka [2] i amb Spring [1].", scored_two(), "en")
    assert isinstance(outcome, Ok)
    text, citations = outcome.value
    assert text == "Jordi treballa amb Kafka [2] i amb Spring [1]."
    assert citations == (
        Citation(source="files/b.md", title="B", heading="HB"),
        Citation(source="files/a.md", title="A", heading="HA"),
    )


def test_no_markers_is_citation_missing() -> None:
    assert enforce("Answer without citations.", scored_two(), "en") == Err(CitationMissing())


def test_only_invalid_markers_is_citation_missing_and_text_is_cleaned() -> None:
    outcome = enforce("Bad ref [3].", scored_two(), "en")
    assert outcome == Err(CitationMissing())


def test_invalid_markers_are_stripped_from_the_text() -> None:
    outcome = enforce("Mixed [2] and [9].", scored_two(), "en")
    assert isinstance(outcome, Ok)
    text, citations = outcome.value
    assert "[9]" not in text
    assert text == "Mixed [2] and."
    assert len(citations) == 1


def test_marker_zero_is_invalid() -> None:
    assert enforce("Zero [0].", scored_two(), "en") == Err(CitationMissing())


def test_duplicate_markers_deduplicate_preserving_order() -> None:
    outcome = enforce("First [2], again [2], then [1].", scored_two(), "en")
    assert isinstance(outcome, Ok)
    _, citations = outcome.value
    assert [citation.source for citation in citations] == ["files/b.md", "files/a.md"]


def test_double_spaces_collapse() -> None:
    outcome = enforce("A  [3]  B", scored_two(), "en")
    assert outcome == Err(CitationMissing())


def test_fallback_echo_with_citation_is_still_not_covered() -> None:
    reply = (
        "Això no consta en el perfil disponible — el CV públic i el portafoli cobreixen "
        "projectes, stack i rols descrits a jordimp.net. Prova de preguntar per això. [1]"
    )
    outcome = enforce(reply, scored_two(), "ca")
    assert outcome == Err(CitationMissing())


def test_normal_answer_with_citation_passes() -> None:
    outcome = enforce("Va treballar a Zitro [1].", scored_two(), "ca")
    assert isinstance(outcome, Ok)


def test_not_covered_copy_exists_for_every_language() -> None:
    for lang in ("en", "es", "ca"):
        text = not_covered_text(lang)  # type: ignore[arg-type]
        assert len(text) > 30
        assert "jordimp.net" in text
