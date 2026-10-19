"""Merge the porter LoRA adapter into the base model and save safetensors."""

import argparse
from pathlib import Path

import torch
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="Qwen/Qwen3.5-2B")
    ap.add_argument("--adapter", type=Path, required=True)
    ap.add_argument("--out", type=Path, required=True)
    args = ap.parse_args()

    model = AutoModelForCausalLM.from_pretrained(args.base, dtype=torch.bfloat16)
    model = PeftModel.from_pretrained(model, str(args.adapter))
    model = model.merge_and_unload()
    args.out.mkdir(parents=True, exist_ok=True)
    model.save_pretrained(args.out)
    tokenizer = AutoTokenizer.from_pretrained(args.base)
    tokenizer.save_pretrained(args.out)
    print("merged model saved to", args.out)


if __name__ == "__main__":
    main()
