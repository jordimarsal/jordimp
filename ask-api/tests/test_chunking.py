import pytest

from ask_api.chunking import chunk_markdown


def test_windows_respect_max_chars_and_overlap() -> None:
    text = "a" * 2000
    chunks = chunk_markdown("s.md", "S", text, max_chars=900, overlap_chars=150)
    assert [len(chunk.text) for chunk in chunks] == [900, 900, 500]
    assert chunks[1].text[:150] == chunks[0].text[-150:]


def test_sections_are_scoped_by_heading_path() -> None:
    markdown = (
        "# Perfil\n\nJordi és enginyer.\n\n"
        "## Experiència\n\nVa treballar a Telefónica.\n\n"
        "### Dades\n\nSnowflake i Cassandra.\n"
    )
    chunks = chunk_markdown("cv.md", "CV", markdown, max_chars=500, overlap_chars=50)
    assert [chunk.heading for chunk in chunks] == [
        "Perfil",
        "Perfil › Experiència",
        "Perfil › Experiència › Dades",
    ]
    assert chunks[0].text == "Jordi és enginyer."
    assert "Telefónica" in chunks[1].text


def test_preamble_before_first_heading_has_empty_heading() -> None:
    chunks = chunk_markdown(
        "x.md", "X", "intro line\n# Later\n\nbody", max_chars=100, overlap_chars=10
    )
    assert chunks[0].heading == ""
    assert chunks[0].text == "intro line"
    assert chunks[1].heading == "Later"


def test_long_section_windows_are_bounded_with_newlines() -> None:
    text = "\n".join(f"line {i} with some words" for i in range(200))
    chunks = chunk_markdown("s.md", "S", text, max_chars=200, overlap_chars=40)
    assert len(chunks) > 5
    assert all(len(chunk.text) <= 200 for chunk in chunks)
    assert all(chunk.text for chunk in chunks)


def test_empty_text_yields_no_chunks() -> None:
    assert chunk_markdown("s.md", "S", "\n\n   \n", max_chars=100, overlap_chars=10) == ()


def test_ids_are_sequential() -> None:
    chunks = chunk_markdown("s.md", "S", "a" * 2000, max_chars=900, overlap_chars=150)
    assert [chunk.id for chunk in chunks] == [0, 1, 2]


def test_chunk_hash_is_stable_and_content_sensitive() -> None:
    first = chunk_markdown("s.md", "T", "hello", max_chars=100, overlap_chars=10)[0]
    second = chunk_markdown("s.md", "T", "hello", max_chars=100, overlap_chars=10)[0]
    other = chunk_markdown("s.md", "T", "hello!", max_chars=100, overlap_chars=10)[0]
    assert first.sha256 == second.sha256
    assert first.sha256 != other.sha256
    assert len(first.sha256) == 64


def test_embed_text_includes_the_heading_for_retrieval() -> None:
    chunk = chunk_markdown(
        "s.md", "S", "# Models\n\nQwen and nomic.", max_chars=100, overlap_chars=10
    )[0]
    assert chunk.embed_text() == "Models\nQwen and nomic."


def test_embed_text_without_heading_is_the_body() -> None:
    chunk = chunk_markdown("s.md", "S", "plain body", max_chars=100, overlap_chars=10)[0]
    assert chunk.embed_text() == "plain body"


@pytest.mark.parametrize(
    ("max_chars", "overlap_chars"),
    [(0, 0), (-1, 0), (100, 100), (100, 150), (100, -1)],
)
def test_invalid_sizes_raise(max_chars: int, overlap_chars: int) -> None:
    with pytest.raises(ValueError):
        chunk_markdown("s.md", "S", "text", max_chars=max_chars, overlap_chars=overlap_chars)
