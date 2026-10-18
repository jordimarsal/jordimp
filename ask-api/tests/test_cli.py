import yaml
from typer.testing import CliRunner

import ask_api.cli as cli

runner = CliRunner()


def write_corpus(tmp_path) -> None:  # type: ignore[no-untyped-def]
    corpus_dir = tmp_path / "corpus"
    files_dir = corpus_dir / "files"
    files_dir.mkdir(parents=True)
    (corpus_dir / "manifest.yaml").write_text(
        yaml.safe_dump({"sources": [{"path": "files/cv.md", "title": "CV"}]}),
        encoding="utf-8",
    )
    (files_dir / "cv.md").write_text(
        "# Perfil\n\nEnginyer amb Spring Boot i Kafka.\n", encoding="utf-8"
    )


def set_env(monkeypatch, tmp_path) -> None:  # type: ignore[no-untyped-def]
    monkeypatch.setenv("ASK_CORPUS_DIR", str(tmp_path / "corpus"))
    monkeypatch.setenv("ASK_INDEX_PATH", str(tmp_path / "data" / "index.sqlite"))
    monkeypatch.setenv("ASK_EMBED_BACKEND", "hash")
    monkeypatch.setenv("ASK_GEN_BACKEND", "echo")
    monkeypatch.setenv("ASK_EMBED_DIM", "4")


def test_ingest_builds_the_index_and_is_idempotent(tmp_path, monkeypatch) -> None:  # type: ignore[no-untyped-def]
    write_corpus(tmp_path)
    set_env(monkeypatch, tmp_path)

    first = runner.invoke(cli.app, ["ingest"])
    assert first.exit_code == 0
    assert "indexed 1 chunks" in first.output
    assert (tmp_path / "data" / "index.sqlite").is_file()

    second = runner.invoke(cli.app, ["ingest"])
    assert second.exit_code == 0
    assert "up to date" in second.output

    forced = runner.invoke(cli.app, ["ingest", "--force"])
    assert forced.exit_code == 0
    assert "indexed 1 chunks" in forced.output


def test_ingest_without_corpus_fails_cleanly(tmp_path, monkeypatch) -> None:  # type: ignore[no-untyped-def]
    set_env(monkeypatch, tmp_path)
    result = runner.invoke(cli.app, ["ingest"])
    assert result.exit_code == 1
    assert "corpus error" in result.output


def test_serve_refuses_stale_index(tmp_path, monkeypatch) -> None:  # type: ignore[no-untyped-def]
    write_corpus(tmp_path)
    set_env(monkeypatch, tmp_path)

    def boom(*args: object, **kwargs: object) -> None:
        raise AssertionError("uvicorn.run must not be called")

    monkeypatch.setattr(cli.uvicorn, "run", boom)
    result = runner.invoke(cli.app, ["serve"])
    assert result.exit_code == 1
    assert "index not ready" in result.output


def test_serve_starts_when_index_is_fresh(tmp_path, monkeypatch) -> None:  # type: ignore[no-untyped-def]
    write_corpus(tmp_path)
    set_env(monkeypatch, tmp_path)
    assert runner.invoke(cli.app, ["ingest"]).exit_code == 0

    calls: dict[str, object] = {}

    def fake_run(app: object, **kwargs: object) -> None:
        calls["app"] = app
        calls["kwargs"] = kwargs

    monkeypatch.setattr(cli.uvicorn, "run", fake_run)
    served = runner.invoke(cli.app, ["serve"])
    assert served.exit_code == 0
    assert "app" in calls


def test_check_reports_ok_when_fresh(tmp_path, monkeypatch) -> None:  # type: ignore[no-untyped-def]
    write_corpus(tmp_path)
    set_env(monkeypatch, tmp_path)
    assert runner.invoke(cli.app, ["ingest"]).exit_code == 0

    checked = runner.invoke(cli.app, ["check"])
    assert checked.exit_code == 0
    assert "index: fresh" in checked.output
    assert "health: ok" in checked.output


def test_check_fails_when_index_is_stale(tmp_path, monkeypatch) -> None:  # type: ignore[no-untyped-def]
    write_corpus(tmp_path)
    set_env(monkeypatch, tmp_path)
    result = runner.invoke(cli.app, ["check"])
    assert result.exit_code == 1
    assert "STALE" in result.output


def write_golden(tmp_path, body):  # type: ignore[no-untyped-def]
    golden = tmp_path / "golden.yaml"
    golden.write_text(yaml.safe_dump(body), encoding="utf-8")
    return golden


def test_eval_gate_passes_when_golden_hits(tmp_path, monkeypatch) -> None:  # type: ignore[no-untyped-def]
    write_corpus(tmp_path)
    set_env(monkeypatch, tmp_path)
    golden = write_golden(
        tmp_path,
        {
            "floor": 1.0,
            "questions": [{"q": "spring boot kafka engineer", "expect": "files/cv.md"}],
            "off_corpus": [{"q": "quantum physics recipes"}],
        },
    )
    result = runner.invoke(cli.app, ["eval", "--golden", str(golden)])
    assert result.exit_code == 0
    assert "PASS" in result.output
    assert "recall 1/1" in result.output
    assert "honest: 1/1" in result.output


def test_eval_gate_fails_on_miss_or_leak(tmp_path, monkeypatch) -> None:  # type: ignore[no-untyped-def]
    write_corpus(tmp_path)
    set_env(monkeypatch, tmp_path)
    missed = write_golden(
        tmp_path,
        {
            "floor": 1.0,
            "questions": [{"q": "spring boot kafka engineer", "expect": "files/nope.md"}],
        },
    )
    assert runner.invoke(cli.app, ["eval", "--golden", str(missed)]).exit_code == 1

    leaking = write_golden(
        tmp_path,
        {
            "floor": 1.0,
            "questions": [{"q": "spring boot kafka engineer", "expect": "files/cv.md"}],
            "off_corpus": [{"q": "spring boot kafka"}],  # lexically identical to the corpus
        },
    )
    result = runner.invoke(cli.app, ["eval", "--golden", str(leaking)])
    assert result.exit_code == 1
    assert "LEAK" in result.output


def test_eval_gate_requires_questions(tmp_path, monkeypatch) -> None:  # type: ignore[no-untyped-def]
    set_env(monkeypatch, tmp_path)
    broken = write_golden(tmp_path, {"floor": 1.0})
    result = runner.invoke(cli.app, ["eval", "--golden", str(broken)])
    assert result.exit_code == 1
    assert "questions" in result.output
