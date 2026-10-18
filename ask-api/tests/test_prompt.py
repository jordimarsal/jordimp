import pytest

from ask_api.citation import not_covered_text
from ask_api.prompt import build_prompt
from support import make_chunk, make_scored


def chunks_two():
    return (
        make_scored(make_chunk(0, text="Jordi built APIs with Spring Boot."), 0.9),
        make_scored(make_chunk(1, text="He used Kafka at Telefónica.", heading="Kafka"), 0.8),
    )


def test_prompt_numbers_context_blocks_and_includes_the_question() -> None:
    prompt = build_prompt("Where did Jordi use Kafka?", "en", chunks_two())
    assert "[1] CV — Perfil" in prompt.user
    assert "[2] CV — Kafka" in prompt.user
    assert "Jordi built APIs with Spring Boot." in prompt.user
    assert "Where did Jordi use Kafka?" in prompt.user


def test_system_instructs_exclusive_context_use_and_citations() -> None:
    prompt = build_prompt("q", "en", chunks_two())
    assert "ONLY" in prompt.system
    assert "[1]" in prompt.system
    assert "never invent" in prompt.system


@pytest.mark.parametrize(
    ("lang", "language_name"),
    [("en", "English"), ("es", "Spanish"), ("ca", "Catalan")],
)
def test_system_requests_the_answer_language_and_carries_the_fallback(
    lang: str, language_name: str
) -> None:
    prompt = build_prompt("q", lang, chunks_two())  # type: ignore[arg-type]
    assert language_name in prompt.system
    assert not_covered_text(lang) in prompt.system  # type: ignore[arg-type]


def test_empty_context_raises() -> None:
    with pytest.raises(ValueError):
        build_prompt("q", "en", ())


def test_heading_less_chunk_label_is_title_only() -> None:
    prompt = build_prompt("q", "en", (make_scored(make_chunk(0, heading=""), 0.9),))
    assert "[1] CV\n" in prompt.user
