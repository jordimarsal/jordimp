# ggufbench — the benchmark, the live dashboard, the compare view and the articles

## ggufbench in one paragraph

ggufbench — Jordi's agentic benchmark for local GGUF models. It measures prompt
speed, tool-calling, code generation and multi-step agent work under one
identical condition set, with the raw receipts of every call. Written in Python
(standard library only), it runs against models served by llama.cpp — or by the
Strata engine — and is 100% local: no cloud, no APIs, no telemetry.

The benchmark answers one question: **which GGUF should I run on my own machine
for agentic work?** It is not a leaderboard of "how smart is this model".
Public benchmarks are trained on, they score single-shot answers, and they say
nothing about whether a model can call a tool with well-formed arguments,
survive a multi-call loop, read a folder, edit a file and verify its own
change. Those are the four dimensions ggufbench measures.

## Where does it live?

- **Project page on jordimp.net:** the Tooling & Platform floor (F1), at
  `https://jordimp.net/en/projects/ggufbench/` (also `/es/projects/ggufbench/`
  and `/ca/projects/ggufbench/`). It lists the brief, what was built, the
  metrics (best global 0.85; three runs per task; 100% local) and the stack
  (Python, GGUF, llama.cpp, GitHub Actions).
- **Repository:** `https://github.com/jordimarsal/ggufbench` (MIT), built with
  the harness. It contains the harness, the task sets, the graders, the raw
  receipts, `docs/SPEC.md` (the full method) and `docs/writeups/` (the article
  sources in English, Spanish and Catalan).
- **Live dashboard (the scoreboard):**
  `https://jordimarsal.github.io/ggufbench/` — published from the gh-pages
  branch by `harness/tools/publish-report.sh`.
- **Head-to-head compare page:**
  `https://jordimarsal.github.io/ggufbench/compare.html`.

## The live dashboard (Bench Board)

The dashboard is titled **Bench Board — local model benchmark** and is a
single-file HTML report generated from the live scoreboard, never typed by
hand. It has two panes — **Board** and **Retired** — and inside the Board it
groups rows into **By task set** blocks, because a score is comparable only
inside the task set it was measured on. Every row carries a `SET` badge with
its real task signature (for example `18/72/72`) and its condition flags.

Stable facts the dashboard states:

- The global score is a weighted mix: **tools 0.30, code 0.30, agent 0.25,
  speed 0.15**.
- Every model runs **three times per task** (seeds 42/43/44) and the scoreboard
  reports **mean ± standard deviation**.
- Thinking modes are measured **separately** (`off` and `on`) and never mixed
  in one number.
- Retired models stay in the **Retired** pane as record only: they count for
  neither the headline KPIs nor the recommendations.
- The page links to the head-to-head compare and shows the generated date, the
  measured date range and the GPU used for the runs.
- The live page is the source of truth for current numbers. The best global
  score shown on the project page is 0.85, by `minicpm-v-4.7-35b-a3b q4_k_m`
  with thinking off; close rows are ties in practice, not a ranking.

## The compare view (head-to-head)

The compare page is titled **Head-to-head — ggufbench compare**. It puts two
pool rows side by side: per-dimension scores, global score, speed and the
condition axes of both rows. When the two rows did not run the same conditions
— a different task signature, a different baseline flag set, or a different
engine/server build — the page announces the mix instead of pretending the
comparison is clean.

Two ways to use it:

- **Published page:** `https://jordimarsal.github.io/ggufbench/compare.html`.
  It ships the last pair executed on Jordi's machine; `publish-report.sh`
  pushes it as-is next to the dashboard.
- **Locally, from the repository:** the `--compare` flag of the runner. For
  example, the same model in both thinking modes:

  ```sh
  python3 -m ggufbench.run --compare "qwen3_8-27b-ud-q5_k_m,off" "qwen3_8-27b-ud-q5_k_m,on"
  ```

  Each pair run overwrites `results/compare.html`, the file the publish script
  ships. The argument is a scoreboard slug plus `off` or `on` (thinking mode).

The same report also covers the **engine comparison**: llama.cpp against the
Strata engine, under the same harness, with the non-identical conditions
stated (16K context and the engine's default KV cache on the Strata side, since
a 32K prefill graph does not fit a 16 GB card).

## The task set and the conditions

- **Current set (v5):** 18 tool tasks, 72 code tasks across python, bash, java
  and typescript (32 easy, 20 hard, 20 expert) and 72 multi-step agent tasks
  (13 of them multi-file projects of 5-8 files, with `list_files` and 14
  turns). The set is versioned from v1 to v5 so every scoreboard row states
  the set it really ran.
- **Same sampling for every model:** temperature 0.2, top-p 0.95, top-k 40,
  min-p 0.05, seed 42, KV cache q8_0, `--jinja`, one slot. Every sampler value
  is pinned explicitly because a GGUF carries its own sampling metadata, and an
  unpinned value would be a per-model condition instead of a shared one.
- **Per-model profiles:** a model can keep its own profile file, applied last,
  so it competes in its best real configuration; what each model actually ran
  with is recorded in its result row.
- **One reasoning budget:** 32768 tokens for code; thinking on and off are
  measured as separate rows.
- **Exclusions are recorded with a reason**, never silently: a timeout or a
  prose answer where a code block was expected shows up in the report.
- **Hardware:** the same rig, 2× RTX 5080, so speed is comparable across rows.

## The articles

ggufbench has a long-form article on the jordimp.net blog, in English, Spanish
and Catalan (same content, three language routes):

- **English:** "Which local model should a coding agent run? Seven GGUFs and a
  Strata engine, one harness, receipts" — filed 2026-10-13, REV C.
  `https://jordimp.net/en/blog/which-local-model-for-coding-agents/`
- **Spanish:** "¿Qué modelo local debería ejecutar un agente de código? Siete
  GGUFs y un motor Strata, un harness, recibos".
  `https://jordimp.net/es/blog/which-local-model-for-coding-agents/`
- **Catalan:** "Quin model local hauria d'executar un agent de codi? Sis GGUFs
  i un motor Strata, un harness, rebuts".
  `https://jordimp.net/ca/blog/which-local-model-for-coding-agents/`

The article walks through the rules that make the numbers mean something (the
pinned sampling, the per-model profiles, the annotated exclusions, the three
runs), what the scoreboard said, how thinking mode trades speed for hard-code
quality, the engine comparison and what to do with the result: pick by
dimension, measure on your own hardware, read the exclusions, treat close rows
as ties. The three source files live in the repository under
`docs/writeups/`.

## The companion article — "Setze models, una porta"

L'article company de ggufbench explica com es va triar el model del porter:
"Setze models, una porta: com el porter va aconseguir el seu cervell". El
article compañero es "Dieciséis modelos, una puerta: cómo el conserje consiguió
su cerebro"; in English it is "Sixteen models, one gate: how the concierge got
its brain" (filed 2026-10-19, REV A, at
`https://jordimp.net/en/blog/sixteen-models-one-gate/`, also `/es/` and
`/ca/`).

It is not a ggufbench run. It tells how the concierge's own generation model
was chosen — sixteen candidates measured against the ask-api citation gate, a
hall of shame for fabricated citations, and a LoRA fine-tune that ships 21/21
at half the memory. It shares the philosophy (same harness, same gate,
receipts) but it is a different job from ggufbench: ggufbench ranks GGUFs for
coding agents; the companion article chooses the porter's voice. The porter
itself runs on that fine-tune, not on the ggufbench winner.

## How is it related to the rest of the building?

ggufbench sits on **F1 — Tooling & Platform**, the workshop floor, next to
Harness, MD + Mermaid to PDF and MCP Transparent PNG. It was built with Jordi's
harness, and its results feed the article above. The other local-model project
on the site is the porter itself: `ask-api` uses a
fine-tuned Qwen3.5-2B (porter-qwen3.5-2b-ft, Q4_K_M) for generation and nomic
embeddings for retrieval, chosen by the citation gate — see the companion
article and the ask-api README.

## ¿En resumen? (resumen en español)

ggufbench es el benchmark agéntico de Jordi para modelos GGUF locales: mide
velocidad de prompt, tool-calling, generación de código y trabajo agéntico
multi-paso bajo un mismo harness, con los recibos en bruto de cada llamada y
100% en local. El cuadro de mando en vivo está en
`https://jordimarsal.github.io/ggufbench/` (Bench Board, con las pestañas
Board y Retired y las filas agrupadas por set de tareas); la comparación cara a
cara está en `https://jordimarsal.github.io/ggufbench/compare.html` y también
se genera en local con `run.py --compare "slug,off" "slug,on"`. El set actual
es v5: 18 tareas de herramientas, 72 de código y 72 de agente, tres
ejecuciones por tarea (semillas 42/43/44), modos de thinking medidos por
separado y exclusiones anotadas con motivo. El artículo largo — en inglés,
español y catalán — se titula "Which local model should a coding agent run?
Seven GGUFs and a Strata engine, one harness, receipts" y está en
`https://jordimp.net/es/blog/which-local-model-for-coding-agents/`. El artículo
compañero "Dieciséis modelos, una puerta" cuenta cómo se eligió el modelo del
conserje con su propia puerta de citas, no con ggufbench.

## I en resum? (resum en català)

ggufbench és el benchmark agèntic d'en Jordi per a models GGUF locals: mesura
velocitat de prompt, tool-calling, generació de codi i treball agèntic
multi-pas sota un mateix harness, amb els rebuts en brut de cada crida i 100%
en local. El tauler en viu és a `https://jordimarsal.github.io/ggufbench/`
(Bench Board, amb les pestanyes Board i Retired i les files agrupades per set
de tasques); la comparació cara a cara és a
`https://jordimarsal.github.io/ggufbench/compare.html` i també es genera en
local amb `run.py --compare "slug,off" "slug,on"`. El set actual és v5: 18
tasques d'eines, 72 de codi i 72 d'agent, tres execucions per tasca (llavors
42/43/44), modes de thinking mesurats per separat i exclusions anotades amb
motiu. L'article llarg — en anglès, castellà i català — es titula "Quin model
local hauria d'executar un agent de codi? Sis GGUFs i un motor Strata, un
harness, rebuts" i és a
`https://jordimp.net/ca/blog/which-local-model-for-coding-agents/`. L'article
company "Setze models, una porta" explica com es va triar el model del porter
amb la seva pròpia porta de cites, no amb ggufbench.
