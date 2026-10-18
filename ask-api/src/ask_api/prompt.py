"""Prompt builder: context-only answering, mandatory citations, answer language."""

from collections.abc import Sequence

from ask_api.citation import not_covered_text
from ask_api.config import Lang
from ask_api.ports import Prompt, ScoredChunk

_LANG_NAMES: dict[Lang, str] = {"en": "English", "es": "Spanish", "ca": "Catalan"}

_SYSTEM_TEMPLATE = (
    "You are the assistant of Jordi Marçal's public portfolio. "
    "Answer the question using ONLY the numbered context excerpts below; "
    "never use prior knowledge and never invent facts. "
    "Every factual sentence must cite at least one excerpt with its bracketed number, like [1]. "
    "If the excerpts do not contain the answer, reply exactly with: {fallback} "
    "Answer in {language}, in at most 120 words, professional and concise."
)


def build_prompt(question: str, lang: Lang, chunks: Sequence[ScoredChunk]) -> Prompt:
    if not chunks:
        raise ValueError("cannot build a prompt without context chunks")
    blocks = "\n\n".join(
        f"[{index}] {_label(item)}\n{item.chunk.text}" for index, item in enumerate(chunks, start=1)
    )
    system = _SYSTEM_TEMPLATE.format(fallback=not_covered_text(lang), language=_LANG_NAMES[lang])
    user = f"Context excerpts:\n\n{blocks}\n\nQuestion: {question}"
    return Prompt(system=system, user=user)


def _label(item: ScoredChunk) -> str:
    if item.chunk.heading:
        return f"{item.chunk.title} — {item.chunk.heading}"
    return item.chunk.title
