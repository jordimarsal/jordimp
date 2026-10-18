import json

import httpx
import pytest

from ask_api.adapters.llama import LlamaCppEmbedder, LlamaCppGenerator
from ask_api.ports import Prompt
from ask_api.result import UpstreamError


def client_with(handler) -> httpx.Client:  # type: ignore[no-untyped-def]
    return httpx.Client(transport=httpx.MockTransport(handler))


def test_embedder_posts_model_and_returns_vectors() -> None:
    seen = {}

    def handler(request: httpx.Request) -> httpx.Response:
        seen["path"] = request.url.path
        seen["body"] = json.loads(request.content)
        return httpx.Response(200, json={"data": [{"index": 0, "embedding": [0.1, 0.2, 0.3]}]})

    embedder = LlamaCppEmbedder(
        base_url="http://models.test",
        model="nomic",
        dim=3,
        timeout_s=5.0,
        client=client_with(handler),
    )
    assert embedder.embed(["hello"]) == [[0.1, 0.2, 0.3]]
    assert seen["path"] == "/v1/embeddings"
    assert seen["body"]["model"] == "nomic"
    assert seen["body"]["input"] == ["hello"]


def test_embedder_batches_and_preserves_order() -> None:
    batches: list[int] = []

    def handler(request: httpx.Request) -> httpx.Response:
        batch = json.loads(request.content)["input"]
        batches.append(len(batch))
        data = [{"index": i, "embedding": [float(i), 0.0, 0.0]} for i in range(len(batch))]
        return httpx.Response(200, json={"data": data})

    embedder = LlamaCppEmbedder(
        base_url="http://models.test",
        model="nomic",
        dim=3,
        timeout_s=5.0,
        batch_size=32,
        client=client_with(handler),
    )
    vectors = embedder.embed([f"t{i}" for i in range(70)])
    assert batches == [32, 32, 6]
    assert len(vectors) == 70


def test_embedder_http_error_maps_to_upstream() -> None:
    embedder = LlamaCppEmbedder(
        base_url="http://models.test",
        model="nomic",
        dim=3,
        timeout_s=5.0,
        client=client_with(lambda request: httpx.Response(500)),
    )
    with pytest.raises(UpstreamError) as excinfo:
        embedder.embed(["hello"])
    assert excinfo.value.service == "embedder"


def test_embedder_connect_error_maps_to_upstream() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("no route to host")

    embedder = LlamaCppEmbedder(
        base_url="http://models.test",
        model="nomic",
        dim=3,
        timeout_s=5.0,
        client=client_with(handler),
    )
    with pytest.raises(UpstreamError):
        embedder.embed(["hello"])


def test_embedder_malformed_or_mismatched_payload_maps_to_upstream() -> None:
    for payload in ({"nope": []}, {"data": [{"index": 0, "embedding": [0.1]}]}):
        embedder = LlamaCppEmbedder(
            base_url="http://models.test",
            model="nomic",
            dim=3,
            timeout_s=5.0,
            client=client_with(lambda request, payload=payload: httpx.Response(200, json=payload)),
        )
        with pytest.raises(UpstreamError):
            embedder.embed(["hello"])


def test_embedder_empty_input_makes_no_request() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        raise AssertionError("no request expected")

    embedder = LlamaCppEmbedder(
        base_url="http://models.test",
        model="nomic",
        dim=3,
        timeout_s=5.0,
        client=client_with(handler),
    )
    assert embedder.embed([]) == []


def test_generator_posts_bounded_greedy_payload() -> None:
    seen = {}

    def handler(request: httpx.Request) -> httpx.Response:
        seen["path"] = request.url.path
        seen["body"] = json.loads(request.content)
        return httpx.Response(200, json={"choices": [{"message": {"content": "Answer [1]."}}]})

    generator = LlamaCppGenerator(
        base_url="http://models.test",
        model="mini",
        max_tokens=320,
        timeout_s=5.0,
        client=client_with(handler),
    )
    assert generator.generate(Prompt(system="S", user="U")) == "Answer [1]."
    assert seen["path"] == "/v1/chat/completions"
    assert seen["body"]["max_tokens"] == 320
    assert seen["body"]["temperature"] == 0
    assert seen["body"]["model"] == "mini"
    assert seen["body"]["messages"] == [
        {"role": "system", "content": "S"},
        {"role": "user", "content": "U"},
    ]


def test_generator_failures_map_to_upstream() -> None:
    def timeout_handler(request: httpx.Request) -> httpx.Response:
        raise httpx.TimeoutException("timed out")

    cases = [
        timeout_handler,
        lambda request: httpx.Response(500),
        lambda request: httpx.Response(200, json={"choices": []}),
        lambda request: httpx.Response(200, json={"choices": [{"message": {"content": "  "}}]}),
        lambda request: httpx.Response(200, content=b"not json"),
    ]
    for handler in cases:
        generator = LlamaCppGenerator(
            base_url="http://models.test",
            model="mini",
            max_tokens=64,
            timeout_s=5.0,
            client=client_with(handler),
        )
        with pytest.raises(UpstreamError) as excinfo:
            generator.generate(Prompt(system="S", user="U"))
        assert excinfo.value.service == "generator"
