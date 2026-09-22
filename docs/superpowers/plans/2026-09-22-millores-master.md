# MILLORES Master Execution Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking. In-repo construction is wrapped by `harness-standard`
> roles (Leader / Spec Author / Implementer / Reviewer).

**Goal:** Turn `MILLORES.md` into a sequenced, auditable execution plan: reposition the offer,
curate the showcase around three thesis repos, publish one essay and two public artifacts, and
align the professional surfaces (email, LinkedIn, GitHub) with the site.

**Architecture:** This is an umbrella plan, not a single feature. It (a) records the positioning
decision, (b) registers the in-repo features as SDD specs + superpowers plans, (c) scopes the
out-of-repo workstreams, and (d) fixes the execution order and gates. Each in-repo feature is
implemented **one at a time** through the normal SDD flow (`spec_ready → HUMAN → in_progress →
reviewer → done`). The in-repo site stays a pure static Astro build; no stack or visual change.

**Tech Stack:** Astro 7 static output, TypeScript strict, vitest, Playwright, Lighthouse CI,
`@astrojs/sitemap`, zero production dependencies beyond `astro` + `@astrojs/sitemap`.

**Specs and plans (this plan references, never duplicates):**

| Workstream | SDD spec (local, `harness/`, gitignored) | Superpowers plan (tracked) |
|---|---|---|
| F11 front-desk-positioning | `harness/specs/front-desk-positioning/{requirements,design,tasks}.md` | `docs/superpowers/plans/2026-09-22-front-desk-positioning.md` |
| F12 showcase-curation | `harness/specs/showcase-curation/{requirements,design,tasks}.md` | `docs/superpowers/plans/2026-09-22-showcase-curation.md` |
| F13 rag-eval-article | `harness/specs/rag-eval-article/{requirements,design,tasks}.md` | `docs/superpowers/plans/2026-09-22-rag-eval-article.md` |
| F14 contact-email | `harness/specs/contact-email/{requirements,design,tasks}.md` | `docs/superpowers/plans/2026-09-22-contact-email.md` |
| EXT-1..3 public artifacts | out of repo (other GitHub repos) | `docs/superpowers/plans/2026-09-22-external-public-artifacts.md` |
| BRAND hygiene | out of repo (accounts/DNS) | `docs/superpowers/plans/2026-09-22-external-brand-hygiene.md` |

**Source:** `MILLORES.md` (Catalan review, 2026-09-22) — §§0–9.

## Execution status (updated 2026-09-22)

- ✅ **F11 front-desk-positioning** — `done`. Merged `e6b37ad`; 240-test gate green.
- ✅ **F12 showcase-curation** — `done`. Merged `6cbd690`; 240 unit + 108 e2e green.
- ⏳ **Next: F13 rag-eval-article** — spec at `harness/specs/rag-eval-article/`, plan at
  `docs/superpowers/plans/2026-09-22-rag-eval-article.md`. Flow: approve spec → implement → review → merge.
- ⏳ **Then: F14 contact-email** — blocked on **BRAND Task 1** (provision `hello@jordimp.net` on a free
  tier; options in the F14 design). Fails closed until the mailbox exists.
- ⏳ **External workstreams** — EXT-1/2/3 and BRAND not started
  (`docs/superpowers/plans/2026-09-22-external-public-artifacts.md`, `…-external-brand-hygiene.md`).
- **Parked environment condition:** `npm run qa:content` / `qa:links` fail only on the LinkedIn URL
  returning HTTP 999 (anti-bot), reproduced with a browser UA and present on `main`;
  `qa:lighthouse` needs `CHROME_PATH` pointing at Playwright chromium in this environment.
- **Harness note:** the SDD specs live in the gitignored `harness/specs/`; the durable, tracked
  artifacts are the plans under `docs/superpowers/plans/`. Progress for the last session is in
  `harness/progress/history.md` (F11, F12) and `harness/progress/current.md` (next step).

## Global Constraints

- **Trilingual invariant:** every new or changed string exists in `en`, `es`, `ca`; technical
  terms stay English. Enforced by `src/data/content.spec.ts` + `npm run qa:content`.
- **Two SITE constants:** `src/config.ts` and `src/data/content.ts` both hold `email`; any change
  must keep them consistent (F14 makes one the single source for the other).
- **Oracle-first:** the production Astro site is the port of the zero-dep generator
  (`spike/front/final`) and is gated by the committed fixture `tests/fixtures/parity.json`
  (`_meta.counts` = 63 locale routes / 65 pages today). Regenerate only with
  `npm run build && node scripts/distill-parity.mjs` (`npm run distill:parity`); never hand-edit.
  Visible-copy features change the fixture; attribute-only features must leave it byte-identical.
- **Gate for every in-repo feature:** `./harness/init.sh` green (vitest), `npm run check`,
  `npm run build`, `npm run test:e2e`, `npm run qa:content`, `npm run qa:links`,
  `npm run qa:lighthouse`. No task closes red.
- **One feature `in_progress` at a time** (`harness/feature_list.json` invariant I1). The four
  in-repo features all touch `src/data/content.ts` and the parity fixture/snapshots, so they run
  **sequentially**, not in parallel.
- **Human approval gate:** F11–F14 sit at `spec_ready` until a human approves the spec. Then the
  Leader flips to `in_progress` and dispatches the implementer.
- **No invented facts/numbers.** Only the published facts: recall@5 `0.409`, MRR `0.231`,
  nDCG@5 `0.277`, golden set `≥40`, `3×DOWN → 1`, `100%` idempotent inserts, `~90` adapters,
  `4` countries, `7` stacks, `1` command. `0.409` is a committed floor, never SOTA.
- **`harness/` is gitignored in this repo.** The SDD specs are intentionally local session state
  (like the existing F1–F10 specs); the durable, tracked artifacts are the
  `docs/superpowers/plans/2026-09-22-*.md` files. Do not "fix" this by force-adding `harness/`.
- **Do not do** (`MILLORES.md` §9): no 12-draft blog, no prices on the site, no visual restyle,
  no vague "AI platform" monorepo merging CodebaseRAG + MCP + Interview Simulator, never inflate
  `0.409`, and no new repo until a stranger has installed the harness or run `make eval`.

---

## Phase 0 — The positioning decision (before moving anything)

Recorded here so every workstream argues from the same premise (`MILLORES.md` §0):

- **Primary offer:** Senior backend engineer (Java / Python / applied AI you can evaluate). Open
  to a platform, events, or applied-AI role where the retriever and the alerts can be audited.
- **Secondary offer (one line, not a second business):** short spec-first engagements
  (4–8 weeks) only — RAG with evals, adapter telemetry, agent harness. Not "build me an app
  with ChatGPT".
- **One-person firm = craft brand, not an active consultancy while employed:**
  "Jordimp & Co. is how the work is done — currently inside a telco platform team, not a
  staffing firm."
- **Success criterion:** a staff platform engineer, in 90 seconds on the home page, can say
  "this person does specs, measures retrieval and has actually seen 90 adapters — I'll write."

This decision is implemented on the site by **F11** and on the profiles by **BRAND**.

---

## Workstream map

| ID | Workstream | Type | Trigger / dependency | Primary deliverable |
|---|---|---|---|---|
| **F11** | front-desk-positioning | in-repo SDD | none | New hero copy, Front Desk "Open for / Not open for" offer, F2 conflict line |
| **F12** | showcase-curation | in-repo SDD | after F11 (shared files) | `tier` model, curated floors, annex, skills cleanup, F0 impact lines |
| **F14** | contact-email | in-repo SDD | **blocked on BRAND Task 1** (mailbox) | `hello@jordimp.net` everywhere on the site |
| **F13** | rag-eval-article | in-repo SDD | after F12 (parity/route matrix) | One dated trilingual essay at `/en|es|ca/writing/rag-eval-gate/` |
| **EXT-1** | Harness Standard installable | other repo | site badge coordinated after v0.1.0 | Real one-command installer, 60s README, `v0.1.0`, gif, issue template |
| **EXT-2** | CodebaseRAG evidence | other repo | none | README metrics-first, `make eval`, public golden set, 1-page ADR |
| **EXT-3** | Kafka Telemetry walkthrough | other repo | none | Conflict line in README + 45s `demo.sh` walkthrough |
| **BRAND** | Email / LinkedIn / GitHub | accounts + DNS | none | Domain mailbox, aligned headline/about/experience, 3 pins |
| **SITE-BADGE** | "built with harness-standard" | in-repo, small | after EXT-1 `v0.1.0` | Badge on the tooling floor |

### F11 — front-desk-positioning (in-repo)

**Implements:** §§0, 2, and the §5 conflict line. **Files:** `src/data/types.ts`,
`src/data/content.ts`, `src/pages/[lang]/departments/[dept].astro`, `src/lib/llms.ts` snapshot,
`src/data/content.spec.ts`, `tests/home.spec.ts`, `tests/departments.spec.ts`,
`tests/fixtures/parity.json`.
**Highlights:** kicker → `SENIOR BACKEND ENGINEER — SYSTEMS YOU CAN AUDIT`; H1 →
`One company. One engineer. <mark>Specs before code.</mark>`; new typed `offer` block
(Open for / Not open for / firm line / how line / desk line); rewritten front-desk line/intro;
footer line; `PAGES.home/frontdesk.description`; the F2 disclaimer
`Personal study of the Open Gateway telemetry problem. Not Telefónica code. Not production
traffic.` No stylesheet change, no email change.
Full spec + tasks: see links table.

### F12 — showcase-curation (in-repo)

**Implements:** §1 (featured = thesis; satellites; annex) + §M skills + §F0 impact lines.
**Highlights:** add `tier: 'thesis' | 'satellite' | 'annex'` to `Project`; thesis == `FEATURED`
(codebaserag, kafka-adapter-telemetry, harness-standard); group `/projects` into three labelled
sections while keeping the stack filter; floors shrink to research 2 / telemetry 2 / tooling 3
without deleting any project or route (PROJECTS stays 11, matrix stays 21 routes); Bible Text
Analysis moves to F0 as a "2019 · Data Science roots" note; Kubernetes/CDK/Cassandra/Snowflake/
RabbitMQ/pandas move to an F0 "Operations toolbelt" note; `SKILLS` cut to five thesis piles;
one honest outcome line added to Mapfre/Zitro/Attendre. Case pager resolves within the tier
cohort. Full spec + tasks: see links table.

### F14 — contact-email (in-repo, gated)

**Implements:** §7 email. **Pattern:** one canonical `hello@jordimp.net` (defined once and
imported by both SITE objects), flowing to footer, front-desk contact row + copy button,
Person JSON-LD, and both llms endpoints. **Blocking Task 0 (human):** provision
`hello@jordimp.net` → Gmail on a **free tier** (options surveyed from
`ripienaar/free-for-dev`, Email section, 2026-09-22: ImprovMX / forwardemail.net forwarding,
or Zoho Mail Free / DNSExit for a real mailbox — see the F14 design) and verify receipt
(MX/SPF); the swap fails closed if the mailbox does not exist. Regenerates the parity fixture
(3 front-desk `mainText` lines only). Full spec + tasks: see links table.

### F13 — rag-eval-article (in-repo)

**Implements:** §6, and is the same essay as EXT-2's 1-page ADR (cross-referenced, never
duplicated). **Highlights:** new directory route `writing/rag-eval-gate.html` registered in
`PAGES` (`nav: 'departments'`), typed `ArticleContent`, five fixed sections (problem · golden
set · CI gate · hexagonal · baseline), `0.409` framed as a committed floor and explicitly
`not SOTA`, `Article` JSON-LD, discovery via `llms.txt`/`llms-full.txt` and links from the F3
Research page + CodebaseRAG case page. Route matrix grows 21 → 22 routes (65 → 68 pages), so
the parity fixture `_meta.counts` changes. Full spec + tasks: see links table.

### SITE-BADGE — "this floor is built with harness-standard" (in-repo, small)

MILLORES §3 week 2. A one-line proof badge on the tooling floor linking to the harness repo.
It depends on EXT-1 shipping `v0.1.0`; it is deliberately **not** folded into F11 so the
positioning feature stays copy-only. Register as a small follow-up feature (suggested `F15`,
name `harness-badge`) once EXT-1 is verified, or fold it into the F11 revisit if desired.

### EXT-1..3 and BRAND

Fully specified in `docs/superpowers/plans/2026-09-22-external-public-artifacts.md` and
`docs/superpowers/plans/2026-09-22-external-brand-hygiene.md`. They are **not testable from
this repo**; each workstream has its own acceptance criteria and verification commands, and its
ground truth was checked against the live repos at plan-writing time (state: harness-standard has
0 tags/releases and a local-path-only installer; codebaserag's README claim that CI fails below
0.409 is currently untrue because CI never runs the eval gate; kafka's demo already proves the
beats but the README lacks the conflict line).

---

## Sequencing (MILLORES §8, four weeks)

> Order by leverage, not by convenience. Do not open a new repo until a stranger has installed
> the harness or run `make eval`.

**Week 1 — truth and clarity (site + profiles):**
1. `- [ ]` BRAND Task 1 — provision `hello@jordimp.net` → Gmail (unblocks F14).
2. `- [x]` F11 — approve spec → implement → review → `done`.
3. `- [x]` F12 — approve spec → implement → review → `done`.
4. `- [ ]` F14 — approve spec → implement → review → `done` (only after step 1 verified).
5. `- [ ]` BRAND Tasks 2–7 — LinkedIn headline/about/experience, GitHub profile README + pins.
6. `- [x]` Register the newly approved features in `harness/feature_list.json` (see Task 0).

**Week 2 — Harness installable for real (EXT-1):**
7. `- [ ]` EXT-1 Tasks 1.1–1.3 — `HARNESS.md` + `Next:` line, remote `install.sh`, publish
   `public/harness/install.sh` in this repo.
8. `- [ ]` Tag `v0.1.0`, 60s README, 12s gif, stack issue template.
9. `- [ ]` SITE-BADGE — implement after `v0.1.0` is verified.

**Week 3 — CodebaseRAG clonable (EXT-2):**
10. `- [ ]` EXT-2 — metrics-first README, `make eval` printing the 3 metrics, public golden set
    (or documented subset), `demo.sh` zero → metric in <10 min.

**Week 4 — the article + the new Front Desk live (F13):**
11. `- [ ]` F13 — approve spec → implement → review → `done`; the same essay becomes EXT-2's
    1-page ADR.
12. `- [ ]` Final sweep: confirm F11/F12/F14 copy is live, `hello@jordimp.net` is everywhere,
    and the home page passes the 90-second criterion.

---

## Task 0 — Register the features (Leader, after approval)

**Files:** `harness/feature_list.json` (local, gitignored).

- [ ] **Step 1: Add F11–F14 as `pending`** with `name` = the kebab spec dir, `description` =
      the one-line scope, `status: "pending"`. Do not set `spec_ready` until a human has
      reviewed and approved the spec (`docs/specs.md` spec gate).
- [ ] **Step 2: Transition one feature at a time** through
      `pending → spec_ready → ⏈ HUMAN → in_progress → done`; never more than one
      `in_progress` (invariant I1 enforced by `harness/init.sh`).
- [ ] **Step 3: On `done`,** move the session summary to `harness/progress/history.md` and clear
      `harness/progress/current.md`.

---

## Cross-cutting risks and how the plan handles them

1. **All four in-repo features edit `src/data/content.ts` and regenerate the same parity
   fixture.** Run them sequentially. Each feature's plan regenerates the fixture and diff-reviews
   only its own lines. F12 → F13 changes the fixture counts (65 → 68); F14 changes only the
   address lines. Never hand-edit `tests/fixtures/parity.json`.
2. **Two SITE constants can drift.** F14 removes the duplication; until then, any feature that
   touches `email`/`url`/`github` must update both `src/config.ts` and `src/data/content.ts`.
3. **`harness/` is gitignored.** The SDD specs are local; if a future session needs them, they
   must be re-derived or the directory force-added as a deliberate decision. The tracked plans in
   `docs/superpowers/plans/` are the source of truth for execution.
4. **Route-matrix coupling.** `scripts/qa-content.mjs` derives expected pages from `PAGES` × 3
   locales and asserts an exact file count. F13 changes it; F11/F12/F14 must not.
5. **External plans touch other repos and real accounts.** They cannot be verified here; each has
   its own gate. The only in-repo couplings are `public/harness/install.sh` (EXT-1) and the badge
   (SITE-BADGE), both explicitly scheduled.
6. **No invented numbers.** Every copy/README change is bounded by the fact list in Global
   Constraints. `0.409` is a floor; the golden set is `≥40`.

## File inventory (everything this plan produces)

```
docs/superpowers/plans/
  2026-09-22-millores-master.md          ← this file
  2026-09-22-front-desk-positioning.md
  2026-09-22-showcase-curation.md
  2026-09-22-rag-eval-article.md
  2026-09-22-contact-email.md
  2026-09-22-external-public-artifacts.md
  2026-09-22-external-brand-hygiene.md
harness/specs/                            (local, gitignored)
  front-desk-positioning/{requirements,design,tasks}.md
  showcase-curation/{requirements,design,tasks}.md
  rag-eval-article/{requirements,design,tasks}.md
  contact-email/{requirements,design,tasks}.md
```

## Self-Review (done at plan-writing time)

- **MILLORES coverage:** §0 → Phase 0 + F11 + BRAND; §1 → F12; §2 → F11; §3 → EXT-1 + SITE-BADGE;
  §4 → EXT-2; §5 → EXT-3 + F11 conflict line; §6 → F13 (and EXT-2 ADR); §7 → BRAND + F14;
  §8 → Sequencing; §9 → Global Constraints "Do not do". No section left without an owner.
- **Traceability:** each in-repo feature has EARS requirements mapped to tests and to tasks with
  `depends_on`/`refs` (see the per-feature specs). External workstreams state that their
  requirements are not testable from this repo and give repo-local acceptance + verification.
- **Consistency fixes applied:** feature-ID collision resolved (F11 front-desk, F12 showcase,
  F13 article, F14 contact-email); sibling plans cross-referenced by exact filename.
- **Placeholders:** none — every plan carries exact paths, exact strings, and exact commands.
- **Open decision left to the human:** whether SITE-BADGE is registered as `F15` or folded into a
  front-desk revisit; the final choice between `hello@` and `jordi@` (default `hello@`,
  alternative documented in the F14 design); and the **free mail provider** for `hello@jordimp.net`
  — forwarding (ImprovMX / forwardemail.net) vs. a real free mailbox (Zoho Mail Free / DNSExit),
  all surveyed from `ripienaar/free-for-dev` on 2026-09-22 and compared in the F14 design.
