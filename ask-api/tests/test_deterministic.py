import math

from ask_api.adapters.deterministic import EchoGenerator, HashEmbedder
from ask_api.ports import Prompt


def test_hash_embedder_dimension_and_normalization() -> None:
    vector = HashEmbedder(dim=16).embed(["jordi spring boot kafka"])[0]
    assert len(vector) == 16
    assert math.isclose(math.sqrt(sum(value * value for value in vector)), 1.0, rel_tol=1e-9)


def test_hash_embedder_is_deterministic_and_content_sensitive() -> None:
    embedder = HashEmbedder(dim=16)
    first = embedder.embed(["spring boot"])[0]
    again = embedder.embed(["spring boot"])[0]
    other = embedder.embed(["quantum physics"])[0]
    assert first == again
    assert first != other


def test_hash_embedder_empty_text_is_zero_vector() -> None:
    vector = HashEmbedder(dim=8).embed([""])[0]
    assert vector == [0.0] * 8


def test_echo_generator_always_cites_first_excerpt() -> None:
    reply = EchoGenerator().generate(
        Prompt(system="s", user="Context excerpts:\n\n[1] CV\n\nQuestion: Who?")
    )
    assert reply.startswith("[1]")
    assert "Question: Who?" in reply
