"""Adapter selection from settings — the only place backends are wired."""

from ask_api.adapters.deterministic import EchoGenerator, HashEmbedder
from ask_api.adapters.failover import FailoverGenerator
from ask_api.adapters.llama import LlamaCppEmbedder, LlamaCppGenerator
from ask_api.config import Settings
from ask_api.ports import Embedder, Generator


def build_embedder(settings: Settings) -> Embedder:
    if settings.embed_backend == "hash":
        return HashEmbedder(dim=settings.embed_dim)
    return LlamaCppEmbedder(
        base_url=settings.embed_url,
        model=settings.embed_model,
        dim=settings.embed_dim,
        timeout_s=settings.embed_timeout_s,
    )


def build_generator(settings: Settings) -> Generator:
    primary: Generator
    if settings.gen_backend == "echo":
        primary = EchoGenerator()
    else:
        primary = LlamaCppGenerator(
            base_url=settings.gen_url,
            model=settings.gen_model,
            max_tokens=settings.max_output_tokens,
            timeout_s=settings.gen_timeout_s,
        )
    if settings.fallback_url is None:
        return primary
    fallback = LlamaCppGenerator(
        base_url=settings.fallback_url,
        model=settings.fallback_model,
        max_tokens=settings.max_output_tokens,
        timeout_s=settings.fallback_timeout_s,
    )
    return FailoverGenerator(primary, fallback)
