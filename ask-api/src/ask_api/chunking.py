"""Markdown-aware chunker: heading-scoped windows with bounded size and overlap."""

import hashlib
import re
from dataclasses import dataclass

_HEADING_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*#*\s*$")


@dataclass(frozen=True)
class Chunk:
    id: int
    source: str
    title: str
    heading: str
    text: str
    sha256: str

    def embed_text(self) -> str:
        """The text to embed: heading first (it scopes the body), then the body.

        Headings never reach the vector unless included here — without them,
        retrieval loses the section context.
        """
        if self.heading:
            return f"{self.heading}\n{self.text}"
        return self.text


def chunk_markdown(
    source: str, title: str, text: str, *, max_chars: int, overlap_chars: int
) -> tuple[Chunk, ...]:
    """Split a markdown document into heading-scoped windows of at most `max_chars`."""
    if max_chars <= 0:
        raise ValueError("max_chars must be positive")
    if overlap_chars < 0 or overlap_chars >= max_chars:
        raise ValueError("overlap_chars must be in [0, max_chars)")

    chunks: list[Chunk] = []
    for heading, section in _split_sections(text):
        for window in _windows(section, max_chars, overlap_chars):
            chunks.append(
                Chunk(
                    id=len(chunks),
                    source=source,
                    title=title,
                    heading=heading,
                    text=window,
                    sha256=_chunk_hash(source, heading, window),
                )
            )
    return tuple(chunks)


def _split_sections(text: str) -> list[tuple[str, str]]:
    sections: list[tuple[str, str]] = []
    stack: list[tuple[int, str]] = []
    heading = ""
    body: list[str] = []

    def flush() -> None:
        joined = "\n".join(body).strip()
        if joined:
            sections.append((heading, joined))

    for line in text.splitlines():
        match = _HEADING_RE.match(line)
        if match:
            flush()
            body = []
            level = len(match.group(1))
            while stack and stack[-1][0] >= level:
                stack.pop()
            stack.append((level, match.group(2).strip()))
            heading = " › ".join(name for _, name in stack)
        else:
            body.append(line)
    flush()
    return sections


def _windows(text: str, max_chars: int, overlap_chars: int) -> list[str]:
    windows: list[str] = []
    start = 0
    length = len(text)
    while True:
        end = min(start + max_chars, length)
        if end < length:
            cut = text.rfind("\n", start + max_chars // 2, end)
            if cut != -1:
                end = cut
        window = text[start:end].strip()
        if window:
            windows.append(window)
        if end >= length:
            break
        start = max(end - overlap_chars, start + 1)
    return windows


def _chunk_hash(source: str, heading: str, text: str) -> str:
    digest = hashlib.sha256()
    for part in (source, heading, text):
        digest.update(part.encode("utf-8"))
        digest.update(b"\x00")
    return digest.hexdigest()
