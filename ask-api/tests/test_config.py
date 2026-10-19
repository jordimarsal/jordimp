from ask_api.config import Settings


def test_defaults_match_the_design() -> None:
    settings = Settings()
    assert settings.embed_backend == "llama"
    assert settings.gen_backend == "llama"
    assert settings.threshold == 0.55
    assert settings.top_k == 6
    assert settings.max_question_chars == 500
    assert settings.max_output_tokens == 320
    assert settings.cors_origin_list == ["https://jordimp.net", "https://www.jordimp.net"]


def test_env_overrides(monkeypatch) -> None:  # type: ignore[no-untyped-def]
    monkeypatch.setenv("ASK_THRESHOLD", "0.7")
    monkeypatch.setenv("ASK_CORS_ORIGINS", "https://a.example, https://b.example")
    settings = Settings()
    assert settings.threshold == 0.7
    assert settings.cors_origin_list == ["https://a.example", "https://b.example"]
