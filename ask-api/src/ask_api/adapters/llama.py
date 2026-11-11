"""llama.cpp HTTP adapters (OpenAI-compatible endpoints)."""

import json
from collections.abc import Iterator, Sequence

import httpx

from ask_api.ports import Prompt
from ask_api.result import UpstreamError


class LlamaCppEmbedder:
    """Embeddings via `llama-server /v1/embeddings`, batched and bounded."""

    def __init__(
        self,
        base_url: str,
        model: str,
        dim: int,
        timeout_s: float,
        batch_size: int = 32,
        client: httpx.Client | None = None,
    ) -> None:
        self._base_url = base_url.rstrip("/")
        self._model = model
        self._dim = dim
        self._timeout_s = timeout_s
        self._batch_size = batch_size
        self._client = client or httpx.Client()

    def embed(self, texts: Sequence[str]) -> Sequence[Sequence[float]]:
        vectors: list[list[float]] = []
        items = list(texts)
        for start in range(0, len(items), self._batch_size):
            vectors.extend(self._embed_batch(items[start : start + self._batch_size]))
        return vectors

    def _embed_batch(self, batch: list[str]) -> list[list[float]]:
        payload: dict[str, object] = {"input": batch, "model": self._model}
        try:
            response = self._client.post(
                f"{self._base_url}/v1/embeddings", json=payload, timeout=self._timeout_s
            )
            response.raise_for_status()
            body = response.json()
            ordered = sorted(body["data"], key=lambda item: item["index"])
            raw_vectors = [item["embedding"] for item in ordered]
        except (httpx.HTTPError, KeyError, TypeError, ValueError) as exc:
            raise UpstreamError("embedder") from exc
        if len(raw_vectors) != len(batch):
            raise UpstreamError("embedder")
        return [self._validated(vector) for vector in raw_vectors]

    def _validated(self, vector: object) -> list[float]:
        if not isinstance(vector, list) or len(vector) != self._dim:
            raise UpstreamError("embedder")
        values: list[float] = []
        for value in vector:
            if not isinstance(value, int | float):
                raise UpstreamError("embedder")
            values.append(float(value))
        return values


class LlamaCppGenerator:
    """Chat completions via `llama-server /v1/chat/completions`, greedy and bounded."""

    def __init__(
        self,
        base_url: str,
        model: str,
        max_tokens: int,
        timeout_s: float,
        client: httpx.Client | None = None,
    ) -> None:
        self._base_url = base_url.rstrip("/")
        self._model = model
        self._max_tokens = max_tokens
        self._timeout_s = timeout_s
        self._client = client or httpx.Client()

    def generate(self, prompt: Prompt) -> str:
        payload: dict[str, object] = {
            "model": self._model,
            "messages": [
                {"role": "system", "content": prompt.system},
                {"role": "user", "content": prompt.user},
            ],
            "temperature": 0,
            "max_tokens": self._max_tokens,
        }
        try:
            response = self._client.post(
                f"{self._base_url}/v1/chat/completions",
                json=payload,
                timeout=self._timeout_s,
            )
            response.raise_for_status()
            body = response.json()
            content = body["choices"][0]["message"]["content"]
        except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError) as exc:
            raise UpstreamError("generator") from exc
        if not isinstance(content, str) or not content.strip():
            raise UpstreamError("generator")
        return content

    def stream(self, prompt: Prompt) -> Iterator[str]:
        """Stream answer deltas from `llama-server /v1/chat/completions` (SSE).

        Yields each non-empty content delta as it arrives; the `[DONE]`
        terminator ends the iterator. Any transport or payload failure raises
        `UpstreamError` — before the first delta or mid-stream, and callers
        decide how to surface already-emitted partial text.
        """
        payload: dict[str, object] = {
            "model": self._model,
            "messages": [
                {"role": "system", "content": prompt.system},
                {"role": "user", "content": prompt.user},
            ],
            "temperature": 0,
            "max_tokens": self._max_tokens,
            "stream": True,
        }
        emitted = False
        try:
            with self._client.stream(
                "POST",
                f"{self._base_url}/v1/chat/completions",
                json=payload,
                timeout=self._timeout_s,
            ) as response:
                response.raise_for_status()
                for line in response.iter_lines():
                    if not line.startswith("data: "):
                        continue
                    data = line[len("data: ") :].strip()
                    if data == "[DONE]":
                        break
                    item = json.loads(data)
                    delta = item["choices"][0]["delta"].get("content")
                    if not isinstance(delta, str) or not delta:
                        continue
                    emitted = True
                    yield delta
        except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError) as exc:
            raise UpstreamError("generator") from exc
        if not emitted:
            raise UpstreamError("generator: empty stream")
