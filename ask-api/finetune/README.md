# Fine-tune: the porter's gen model

`porter-qwen3.5-2b-ft-Q4_K_M.gguf` is a LoRA fine-tune of **Qwen/Qwen3.5-2B**
(Apache-2.0) that teaches the porter's citation contract: answer only from the
numbered excerpts, cite every factual sentence with `[n]`, echo the
not-covered copy when the corpus doesn't cover the question, answer in the
visitor's language.

## Results (2026-10-19, golden 21 + off-corpus 3, deterministic re-run)

| | base Qwen3.5-2B | **fine-tuned** | prod before (Qwen3-4B-2507) |
|---|---|---|---|
| covered | 20/21 | **21/21** | 21/21 |
| honest off-corpus | 3/3 | 3/3 | 3/3 |
| latency p50 | 336 ms | **~310-355 ms** | 641 ms |
| GGUF Q4_K_M | 1.2 GB | **1.2 GB** | 2.4 GB |

## Pipeline (fully reproducible)

1. **Dataset** (`finetune_gen_dataset.py` — runs inside the ask-api image):
   the old 4B acts as teacher and invents visitor questions in ca/es/en
   (simple / compound-across-two-sources / refusal); retrieval is the real
   nomic service; the completion is kept **only if it passes
   `citation.enforce()`** — the production gate. Prompts are the exact
   `build_prompt()` output → zero train/serve skew. The 21 golden questions
   are excluded (they are the test, never the training data).
   Output: `porter_sft.jsonl` (174 examples: 77 simple, 65 refusal, 32
   compound).
2. **LoRA** (`train_lora.py`): r=32, alpha=64, all linear projections,
   completion-only loss (TRL prompt/completion format), 2 epochs, lr 7e-5,
   bf16, single GPU. v1 (3 epochs, full-sequence loss) overfit to 15/21 —
   the gentler v2 recipe is what ships.
3. **Merge → GGUF** (`merge_lora.py` + llama.cpp convert → `llama-quantize`
   Q4_K_M).
4. **Gate**: `scripts/gen_bench_run.sh` must report 21/21 + 3/3 before any
   swap.

## Production wiring

- `GEN_MODEL_FILE=porter-qwen3.5-2b-ft-Q4_K_M.gguf` in `deploy/.env`
- `ask-gen` needs `LLAMA_ARG_CHAT_TEMPLATE_KWARGS: '{"enable_thinking":false}'`
  (already in `deploy/docker-compose.yml`) — the base is a thinking hybrid.
- Rollback: point `GEN_MODEL_FILE` back at `Qwen3-4B-Instruct-2507-Q4_K_M.gguf`
  (file kept in the models dir) and `docker compose up -d ask-gen`.
