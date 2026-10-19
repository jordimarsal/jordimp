"""LoRA fine-tune of Qwen3.5-2B for the porter citation contract.

Trains on prompt/completion pairs whose prompt is the EXACT prod prompt
(build_prompt output) and whose completions pass the production citation
policy. Completion-only loss. Merge is done by the caller (merge_lora.py).
"""

import argparse
import json
from pathlib import Path

import torch
from datasets import Dataset
from peft import LoraConfig
from transformers import AutoModelForCausalLM, AutoTokenizer
from trl import SFTConfig, SFTTrainer


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", type=Path, required=True)
    ap.add_argument("--base", default="Qwen/Qwen3.5-2B")
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--epochs", type=float, default=2.0)
    ap.add_argument("--lr", type=float, default=7e-5)
    args = ap.parse_args()

    lines = args.data.read_text(encoding="utf-8").splitlines()
    rows = [json.loads(line) for line in lines if line.strip()]
    print(f"examples: {len(rows)}")

    tokenizer = AutoTokenizer.from_pretrained(args.base)

    def to_pc(row: dict) -> dict:
        prompt = tokenizer.apply_chat_template(
            [
                {"role": "system", "content": row["prompt_system"]},
                {"role": "user", "content": row["prompt_user"]},
            ],
            tokenize=False,
            add_generation_prompt=True,
            enable_thinking=False,
        )
        return {"prompt": prompt, "completion": row["completion"] + "<|im_end|>"}

    dataset = Dataset.from_list([to_pc(r) for r in rows])

    model = AutoModelForCausalLM.from_pretrained(
        args.base,
        dtype=torch.bfloat16,
        attn_implementation="sdpa",
    )
    model.config.use_cache = False

    lora = LoraConfig(
        r=32,
        lora_alpha=64,
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=[
            "q_proj",
            "k_proj",
            "v_proj",
            "o_proj",
            "gate_proj",
            "up_proj",
            "down_proj",
        ],
    )

    config = SFTConfig(
        output_dir=str(args.out),
        per_device_train_batch_size=2,
        gradient_accumulation_steps=8,
        num_train_epochs=args.epochs,
        learning_rate=args.lr,
        lr_scheduler_type="cosine",
        logging_steps=5,
        save_strategy="no",
        bf16=True,
        max_length=2600,
        dataset_text_field="text",
        report_to=[],
        seed=42,
    )

    trainer = SFTTrainer(
        model=model,
        args=config,
        train_dataset=dataset,
        peft_config=lora,
        processing_class=tokenizer,
    )
    trainer.train()
    trainer.save_model(str(args.out))
    tokenizer.save_pretrained(str(args.out))
    print("LoRA adapter saved to", args.out)


if __name__ == "__main__":
    main()
