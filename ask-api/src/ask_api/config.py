"""Service settings, env-driven (`ASK_*` prefix), no secrets."""

from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict

type Lang = Literal["en", "es", "ca"]
type EmbedBackend = Literal["llama", "hash"]
type GenBackend = Literal["llama", "echo"]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="ASK_", extra="ignore")

    corpus_dir: Path = Path("corpus")
    index_path: Path = Path("data/index.sqlite")

    embed_backend: EmbedBackend = "llama"
    embed_url: str = "http://localhost:8080"
    embed_model: str = "nomic-embed-text-v1.5"
    embed_dim: int = 768
    embed_timeout_s: float = 15.0
    # Task prefixes (nomic-embed-text-v1.5 style): set to `search_query: ` /
    # `search_document: ` in deploy env; empty for prefix-free models and tests.
    embed_query_prefix: str = ""
    embed_doc_prefix: str = ""

    gen_backend: GenBackend = "llama"
    gen_url: str = "http://localhost:8081"
    gen_model: str = "portfolio-mini"
    gen_timeout_s: float = 30.0

    threshold: float = 0.55
    top_k: int = 6  # calibrated: compound questions (two topics, several sources) need the room
    chunk_chars: int = 900
    chunk_overlap: int = 150
    max_question_chars: int = 500
    max_output_tokens: int = 320

    rate_per_min: int = 6
    rate_burst: int = 3
    max_concurrency: int = 2

    route_timeout_s: float = 45.0
    trusted_proxy_cidrs: str = ""

    cors_origins: str = "https://jordimp.net,https://www.jordimp.net"
    log_level: str = "INFO"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
