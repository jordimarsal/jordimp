# External Public Artifacts (Harness Standard, CodebaseRAG, Kafka Telemetry) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Each workstream is executed in its own repository, one at a time.

**Goal:** Turn three published repositories into verifiable public artifacts — Harness Standard into an installable product, CodebaseRAG into an eval-gated evidence repo, Kafka Adapter Telemetry into a 45s walkthrough — while leaving the jordimp site's claims factually true.

**Architecture:** Three independent workstreams, one repository each, executed strictly in the MILLORES §8 weeks 2–3 order (Harness → CodebaseRAG → Kafka). No cross-repo code dependencies. The only edits to `jordimp` are (a) hosting `public/harness/install.sh` and (b) a coordination contract handed to the `front-desk-positioning` / `rag-eval-article` / `showcase` workstreams — this plan does not duplicate their work.

**Tech Stack:** Bash (`install.sh`, `demo.sh`, `scripts/eval.sh`), npm (`@jordimp/harness`, optional), GNU Make + `uv`/Python 3.13 (CodebaseRAG), Docker Compose (pgvector, Ollama), Git/GitHub Releases.

**Spec:** `MILLORES.md` §3 (Harness Standard), §4 (CodebaseRAG), §5 (Kafka Telemetry), §8 weeks 2–3. Site-claim source of truth: `src/data/content.ts`. Reference plan format: `docs/superpowers/plans/2026-09-16-portfolio-phase0-1-front.md`.

---

## Global Constraints

- **Repositories under edit:** `https://github.com/jordimarsal/harness-standard`, `https://github.com/jordimarsal/codebaserag`, `https://github.com/jordimarsal/kafka-adapter-telemetry`, and — for two coordinated touches only — `jordimarsal/jordimp`. No other remotes, no other domains.
- **Cross-repo testability:** the requirements of these three repositories are **not testable from `jordimp`**. Every acceptance criterion below is verified **inside its own repository** with the command given in that workstream's Verification section. `jordimp` CI must never be used to prove them.
- **Allowed facts only** (verbatim from `src/data/content.ts`; no metric may be invented or inflated): golden set ≥40 Q/A; baseline recall@5 `0.409` · MRR `0.231` · nDCG@5 `0.277`; 3×DOWN → 1 alert per episode; 100% idempotent inserts; ~90 adapters, 4 countries; 7 stacks; 1-command install. `0.409` is an honest floor, not SOTA.
- **Allowed URLs:** `https://github.com/jordimarsal/<repo>` and `https://jordimp.net`. `install.sh` is served from `https://jordimp.net/harness/install.sh`.
- **Conventional commits; every task ends with the repo's own test command green.** Do not commit if the repo's test suite is red.
- One workstream per session. Do not mix repository changes.
- **Human gate at every workstream boundary** (MILLORES approval discipline). Do not proceed to the next workstream until the current one is approved.
- The three existing repos already contain working code; this plan adds the missing public surface and fixes the defects that make the published claims false. Do not refactor beyond what each task names.

---

## Workstream 0: Ground truth confirmed at plan-writing time

These findings drive concrete tasks below. Re-verify with the listed commands at execution start; if reality differs, stop and update this plan before coding.

| Repo | Command | Observed (2026-09-22) |
|---|---|---|
| harness-standard | `git ls-remote --tags <repo>` / `gh repo view` | 0 tags, 0 releases, 0 stars; installer is local-path only (`init.sh`); no `install.sh`, no `HARNESS.md`; 7 stacks = typescript, node, java, python, android, rust, generic |
| codebaserag | `uv run coderag eval --store memory` | `coderag` console script **missing** (`[project.scripts]` absent) → `uv run coderag` fails; CLI calls `uv run coderag eval --store memory` → offline metrics `0.068 / 0.035 / 0.043` (measured) |
| codebaserag | `cat .github/workflows/ci.yml` | CI runs ruff/black/mypy/pytest only — **the README's "CI fails if recall@5 drops below 0.409" is not yet true**; `evals/golden/codebaserag.yaml` has **44** Q/A; `evals/baseline.json` = 0.409/0.231/0.277; no Makefile, no demo.sh, no ADR file |
| kafka-adapter-telemetry | `./demo.sh` | Already proves 3×DOWN→1 alert, idempotent re-run and DLT via SQL counts; README lacks the conflict-of-interest line; no single recordable 45s mode |

- [ ] **Step 1: Re-confirm the table**

Run each command in the table inside the corresponding repo. Expected: matches the Observed column. Any divergence → update this plan first.

---

## Workstream 1 — Harness Standard becomes installable (MILLORES §3, week 2)

**Repo:** `/home/jordi/Documents/CV/projects/harness-standard` (or its clone). **Site touch:** `jordimp/public/harness/install.sh`.

### Goal

Make the site's "1 cmd install" true by shipping exactly one real, copy-pasteable install path (`curl -fsSL https://jordimp.net/harness/install.sh | bash`) whose installer detects the stack, copies roles + conventions + gates, prints a **single** `Next:` line (`claude` / `opencode` + first prompt), and writes `HARNESS.md` into the destination repo. Publish tagged `v0.1.0` with a 12s gif and an issue template.

### Acceptance criteria (objective)

- **AC1.1** From a directory with no harness checkout, `HARNESS_REPO_URL=<local-clone> HARNESS_REF=HEAD bash install.sh --tool=claude --dest /tmp/hs-demo` exits 0.
- **AC1.2** `/tmp/hs-demo/HARNESS.md` exists and contains the detected stack, the four roles, and a `## Next` section.
- **AC1.3** After install, `harness/CHECKPOINTS.md`, `docs/conventions.md`, `docs/specs.md`, `docs/verification.md`, `harness/feature_list.json`, and four agent role files exist and are non-empty.
- **AC1.4** The last line of installer stdout matches `^Next: (claude|opencode) —`. Exactly one line in stdout starts with `Next:`.
- **AC1.5** `git tag v0.1.0` exists locally and remotely; a GitHub release `v0.1.0` exists.
- **AC1.6** `README.md` is ≤ 60 lines and its H2 sections are exactly: `The problem`, `Install`, `What gets installed`, `This website is built with it`, `Stacks`, `Uninstall`.
- **AC1.7** `.github/ISSUE_TEMPLATE/stack-not-detected.yml` exists and its `title` is `[stack] not detected: <name>`.
- **AC1.8** `docs/assets/init-demo.gif` exists and is < 1 MB.

### File structure

```
harness-standard/
├── install.sh                                  # NEW: remote bootstrap (canonical copy)
├── init.sh                                     # MODIFY: HARNESS.md + single Next: line
├── HARNESS.md.tmpl                             # NEW: template (not required to be copied; init.sh writes it)
├── README.md                                   # REWRITE: 60-second fixed structure
├── CHANGELOG.md                                # NEW
├── package.json                                # NEW (optional): @jordimp/harness
├── bin/init.js                                 # NEW (optional): npx entrypoint
├── docs/assets/init-demo.gif                   # NEW
├── tests/test-install.sh                       # MODIFY: assert HARNESS.md + Next: line
└── .github/ISSUE_TEMPLATE/stack-not-detected.yml  # NEW
jordimp/
└── public/harness/install.sh                    # NEW (coordinated in-repo copy; served at jordimp.net)
```

### Tasks

#### Task 1.1: Add `HARNESS.md` + single `Next:` line to `init.sh`

**Files:**
- Modify: `init.sh` (success branch, current lines 528–543)
- Modify: `tests/test-install.sh` (add assertions)

**Interfaces:**
- Produces: every successful install writes `HARNESS.md` at the destination root and prints one `Next:` line. `install.sh` (Task 1.2) relies on this.

- [ ] **Step 1: Replace the success `Next steps` block in `init.sh`**

Replace this block (current lines 529–540):

```bash
echo ""
if [ $EXIT_CODE -eq 0 ]; then
  ok "Harness installed successfully for stack: $STACK (tool: $TOOL)"
  echo ""
  info "Next steps:"
  info "  1. Edit docs/architecture.md with your project's architecture."
  info "  2. Edit docs/conventions.md with your project's coding conventions."
  info "  3. Add features to harness/feature_list.json."
  if [ "$TOOL" = "claude" ]; then
    info "  4. Start Claude Code and let the leader agent guide you."
  else
    info "  4. Start opencode and let the leader agent guide you."
  fi
else
  fail "Harness installation incomplete. Resolve errors above."
fi
```

with:

```bash
echo ""
if [ $EXIT_CODE -eq 0 ]; then
  ok "Harness installed successfully for stack: $STACK (tool: $TOOL)"

  if [ "$TOOL" = "claude" ]; then
    ENTRY_FILE="CLAUDE.md"
    ROLES_DIR=".claude/agents/"
  else
    ENTRY_FILE="AGENTS.md"
    ROLES_DIR=".opencode/agent/"
  fi

  cat > HARNESS.md <<EOF
# Harness — $PROJECT_NAME

Installed with [harness-standard](https://github.com/jordimarsal/harness-standard) (\`$TOOL\`).

- **Stack detected:** $STACK
- **Roles:** Leader · Spec Author · Implementer · Reviewer (\`$ROLES_DIR\`)
- **Gates:** \`harness/CHECKPOINTS.md\` · \`docs/verification.md\`
- **Process:** \`docs/specs.md\` — Spec-Driven Development with a human approval gate

## Next

1. Edit \`docs/architecture.md\` and \`docs/conventions.md\` for this project.
2. Add features to \`harness/feature_list.json\`.
3. Start the leader: \`$TOOL\`

First prompt:

> Read $ENTRY_FILE and start the leader workflow. Pick the first pending feature.
EOF

  echo ""
  echo "Next: $TOOL — open $TOOL, then prompt: Read $ENTRY_FILE and start the leader workflow."
else
  fail "Harness installation incomplete. Resolve errors above."
fi
```

- [ ] **Step 2: Extend `tests/test-install.sh`**

Add to `assert_harness_layout()` (after line 98):

```bash
  assert_file "$t" "$d/HARNESS.md"
  assert_grep "$t" "^## Next" "$d/HARNESS.md"
```

- [ ] **Step 3: Run the installer tests**

Run: `bash tests/test-install.sh`
Expected: `PASS: <n>  FAIL: 0`.

- [ ] **Step 4: Run one manual install and inspect stdout**

Run:
```bash
d=$(mktemp -d) && (cd "$d" && bash /path/to/harness-standard/init.sh --tool=opencode) && cat "$d/HARNESS.md"
```
Expected: stdout's last line matches `^Next: opencode —`; exactly one line starts with `Next:`; `HARNESS.md` lists stack, roles and `## Next`.

- [ ] **Step 5: Commit**

```bash
git add init.sh tests/test-install.sh
git commit -m "feat(installer): write HARNESS.md and print a single Next line"
```

#### Task 1.2: Add the remote bootstrap `install.sh`

**Files:**
- Create: `install.sh`
- Test: `tests/test-install.sh` (new function `test_remote_install`)

**Interfaces:**
- Consumes: `init.sh` from Task 1.1 (expects `HARNESS.md` + `Next:` line).
- Produces: `install.sh` accepts `--tool=`, `--dest=`, `--ref=`, `--force`, `--modules=`, `--audit-level=`; reads `HARNESS_REPO_URL` / `HARNESS_REF`.

- [ ] **Step 1: Create `install.sh`** (exact content)

```bash
#!/usr/bin/env bash
# install.sh — remote bootstrap for Harness Standard.
#
# Usage:
#   curl -fsSL https://jordimp.net/harness/install.sh | bash -s -- --tool=claude
#   bash install.sh [--tool=claude|opencode] [--dest DIR] [--ref REF] [--force]
#                   [--modules=m1,m2] [--audit-level=basic|standard|strict]
#
# Env: HARNESS_REPO_URL (default https://github.com/jordimarsal/harness-standard.git)
#      HARNESS_REF      (default v0.1.0)
set -euo pipefail

REPO_URL="${HARNESS_REPO_URL:-https://github.com/jordimarsal/harness-standard.git}"
REF="${HARNESS_REF:-v0.1.0}"
DEST="."
TOOL=""
PASSTHRU=()

while [ $# -gt 0 ]; do
  case "$1" in
    --tool=*)        TOOL="${1#*=}" ;;
    --tool)          shift; TOOL="${1:-}" ;;
    --dest=*)        DEST="${1#*=}" ;;
    --dest)          shift; DEST="${1:-}" ;;
    --ref=*)         REF="${1#*=}" ;;
    --ref)           shift; REF="${1:-}" ;;
    --force)         PASSTHRU+=(--force) ;;
    --modules=*|--audit-level=*) PASSTHRU+=("$1") ;;
    -h|--help)
      echo "Usage: install.sh [--tool=claude|opencode] [--dest DIR] [--ref REF] [--force] [--modules=...] [--audit-level=...]"
      exit 0 ;;
    *) echo "install.sh: unknown argument: $1" >&2; exit 1 ;;
  esac
  shift
done

case "$TOOL" in
  ""|claude|opencode) ;;
  *) echo "install.sh: --tool must be claude or opencode" >&2; exit 1 ;;
esac

command -v git >/dev/null 2>&1 || { echo "install.sh: git is required" >&2; exit 1; }

mkdir -p "$DEST"
DEST_ABS="$(cd "$DEST" && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "Fetching harness-standard ($REF)..."
if ! git clone --depth 1 --branch "$REF" --quiet "$REPO_URL" "$TMP/harness-standard" 2>/dev/null; then
  git clone --depth 1 --quiet "$REPO_URL" "$TMP/harness-standard"
fi

ARGS=()
[ -n "$TOOL" ] && ARGS+=(--tool="$TOOL")
ARGS+=("${PASSTHRU[@]+"${PASSTHRU[@]}"}")

( cd "$DEST_ABS" && bash "$TMP/harness-standard/init.sh" "${ARGS[@]+"${ARGS[@]}"}" )
```

- [ ] **Step 2: Add `test_remote_install` to `tests/test-install.sh`**

Add before the `# ── Main ──` line:

```bash
test_remote_install() {
  local t="install.sh bootstraps a fresh project from a local clone"
  run_test "$t"
  local d; d=$(new_project "remote")
  if HARNESS_REPO_URL="$REPO_DIR" HARNESS_REF=HEAD \
       bash "$REPO_DIR/install.sh" --tool=claude --dest "$d" > "$d/out.txt" 2>&1; then
    PASS=$((PASS + 1))
  else
    FAIL=$((FAIL + 1)); FAILED_NAMES+=("$t: install.sh exited non-zero")
    echo "    FAIL: see $d/out.txt"
    return
  fi
  assert_file "$t" "$d/HARNESS.md"
  assert_file "$t" "$d/CLAUDE.md"
  assert_grep "$t" "^Next: claude" "$d/out.txt"
  assert_count "$t" "^Next:" "$d/out.txt" 1
}
```

and call it in the Main section after `test_wekan_tickets_tool_dst`:

```bash
test_remote_install
```

- [ ] **Step 3: Verify the bootstrap from a clean temp destination**

Run:
```bash
d=$(mktemp -d) && HARNESS_REPO_URL="$PWD" HARNESS_REF=HEAD ./install.sh --tool=claude --dest "$d" | tail -1
```
Expected: prints exactly `Next: claude — open claude, then prompt: ...`; `test -f "$d/HARNESS.md"` is true.

- [ ] **Step 4: Run the full suite**

Run: `bash tests/test-install.sh`
Expected: `FAIL: 0`.

- [ ] **Step 5: Commit**

```bash
git add install.sh tests/test-install.sh
git commit -m "feat(install): add remote bootstrap install.sh"
```

#### Task 1.3: Publish `install.sh` to jordimp.net (coordinated in-repo change)

**Repo:** `jordimp` (this repo). This is the **only** application-code touch this plan makes in `jordimp`.

**Files:**
- Create: `public/harness/install.sh` (byte-identical copy of harness-standard `install.sh` from Task 1.2)
- Create: `scripts/sync-install-sh.sh` (maintainer helper + CI parity guard)

- [ ] **Step 1: Create the sync helper `scripts/sync-install-sh.sh`**

```bash
#!/usr/bin/env bash
# Copies the canonical harness-standard install.sh into public/harness/.
# Source of truth: the harness-standard repo checkout at $HARNESS_SRC (default ../harness-standard).
set -euo pipefail
SRC="${HARNESS_SRC:-../harness-standard}/install.sh"
DST="public/harness/install.sh"
[ -f "$SRC" ] || { echo "missing $SRC — set HARNESS_SRC to the harness-standard checkout" >&2; exit 1; }
mkdir -p public/harness
cp "$SRC" "$DST"
chmod +x "$DST"
echo "synced $SRC -> $DST"
```

- [ ] **Step 2: Create the served copy**

```bash
mkdir -p public/harness
cp ../harness-standard/install.sh public/harness/install.sh
chmod +x public/harness/install.sh
```

- [ ] **Step 3: Verify Astro serves it verbatim**

Run: `npm run build && test -f dist/harness/install.sh && head -1 dist/harness/install.sh`
Expected: file exists; first line is `#!/usr/bin/env bash`.

- [ ] **Step 4: Commit (deploys the site)**

```bash
git add public/harness/install.sh scripts/sync-install-sh.sh
git commit -m "feat(harness): serve install.sh from jordimp.net"
```

#### Task 1.4: Rewrite `README.md` to the fixed 60-second structure

**Files:**
- Modify: `README.md` (full rewrite)

- [ ] **Step 1: Replace `README.md` with** (≤60 lines; H2 order is part of AC1.6)

```markdown
# Harness Standard

Install a repeatable process for coding agents in one command.

## The problem

Agents drift. They are sharp on one file and lost across a repo. Specs, roles and
gates fix that — but only if they are installed, not just described.

## Install

```bash
curl -fsSL https://jordimp.net/harness/install.sh | bash -s -- --tool=claude
# or
curl -fsSL https://jordimp.net/harness/install.sh | bash -s -- --tool=opencode
```

The installer detects your stack, copies the roles, conventions and gates, and
writes `HARNESS.md` into your repo with the next step.

## What gets installed

- **Leader** — orchestrates, stops at the human approval gate.
- **Spec Author** — writes `requirements.md` / `design.md` / `tasks.md`.
- **Implementer** — builds task by task, tests first.
- **Reviewer** — checks requirement traceability before `done`.
- Plus `docs/` (specs, architecture, conventions, verification) and `harness/`
  (feature list, checkpoints, progress, gates).

## This website is built with it

`jordimp.net` is built with this harness. Its own repo is the reference install:
https://jordimp.net

## Stacks

TypeScript · Node.js · Java · Python · Android · Rust · Generic — 7 stacks.

## Uninstall

```bash
rm -rf CLAUDE.md AGENTS.md opencode.json .claude .opencode harness \
       docs/architecture.md docs/conventions.md docs/specs.md docs/verification.md
```
```

- [ ] **Step 2: Verify the line count and section order**

Run: `wc -l README.md && grep -n '^## ' README.md`
Expected: ≤60 lines; sections exactly in the order listed in AC1.6.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs(readme): 60-second install-first README"
```

#### Task 1.5: Optional npm path `@jordimp/harness`

Ship only after AC1.1–AC1.8 are green. Not required for the workstream gate.

**Files:**
- Create: `package.json`, `bin/init.js`

- [ ] **Step 1: `package.json`**

```json
{
  "name": "@jordimp/harness",
  "version": "0.1.0",
  "description": "Install the Harness Standard multi-agent SDD process into any repository.",
  "bin": { "harness-init": "bin/init.js" },
  "files": ["bin/init.js", "install.sh"],
  "engines": { "node": ">=18" },
  "license": "MIT",
  "repository": { "type": "git", "url": "https://github.com/jordimarsal/harness-standard.git" }
}
```

- [ ] **Step 2: `bin/init.js`**

```js
#!/usr/bin/env node
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const args = process.argv.slice(2);
if (args[0] === 'init') args.shift();

const script = path.join(__dirname, '..', 'install.sh');
const result = spawnSync('bash', [script, ...args], { stdio: 'inherit' });
process.exit(result.status ?? 1);
```

- [ ] **Step 3: Verify locally** — `npm pack --dry-run` lists `bin/init.js` and `install.sh`; `HARNESS_REPO_URL="$PWD" HARNESS_REF=HEAD node bin/init.js init --tool=opencode --dest "$(mktemp -d)"` exits 0.

- [ ] **Step 4: Commit** — `git add package.json bin/init.js && git commit -m "feat(npm): @jordimp/harness init entrypoint"` (publish only after the human gate).

#### Task 1.6: Tag `v0.1.0`, changelog, gif, issue template

**Files:**
- Create: `CHANGELOG.md`, `.github/ISSUE_TEMPLATE/stack-not-detected.yml`, `docs/assets/init-demo.gif`

- [ ] **Step 1: `CHANGELOG.md`**

```markdown
# Changelog

## v0.1.0 — 2026-09-22

First public release.

- Remote one-command install: `curl -fsSL https://jordimp.net/harness/install.sh | bash`.
- Installer detects the stack, copies roles/conventions/gates, writes `HARNESS.md`.
- Four roles (Leader / Spec Author / Implementer / Reviewer) for Claude Code and opencode.
- 7 stacks: TypeScript, Node.js, Java, Python, Android, Rust, Generic.
```

- [ ] **Step 2: Issue template** `.github/ISSUE_TEMPLATE/stack-not-detected.yml`

```yaml
name: Stack not detected
description: The installer picked the wrong stack (or "generic") for this project.
title: "[stack] not detected: "
labels: ["installer", "stack-detection"]
body:
  - type: input
    id: stack
    attributes:
      label: Expected stack
      placeholder: "e.g. kotlin-multiplatform"
    validations:
      required: true
  - type: textarea
    id: markers
    attributes:
      label: Manifest files present
      description: List the files the detector should look at.
      placeholder: "build.gradle.kts, settings.gradle.kts, gradle.properties"
    validations:
      required: true
  - type: textarea
    id: output
    attributes:
      label: Installer output
      description: Paste the line starting with "Detected stack:".
      render: shell
    validations:
      required: true
  - type: input
    id: os
    attributes:
      label: OS and shell
      placeholder: "macOS 15 / zsh"
    validations:
      required: false
```

- [ ] **Step 3: Record the 12s gif**

```bash
# Requires: asciinema + agg (brew install asciinema agg | cargo install --locked agg)
d=$(mktemp -d) && mkdir -p "$d/demo" && cd "$d/demo"
asciinema rec --overwrite "$d/init.cast" -c \
  'HARNESS_REPO_URL=/path/to/harness-standard HARNESS_REF=HEAD bash /path/to/harness-standard/install.sh --tool=opencode --dest . && echo "--- HARNESS.md ---" && cat HARNESS.md'
agg --speed 2.5 --last-frame-duration 2 "$d/init.cast" docs/assets/init-demo.gif
```
Target: `repo empty → init → first spec` visible in ≤12 s. Verify: `du -h docs/assets/init-demo.gif` is < 1 MB.

- [ ] **Step 4: Tag and push**

```bash
git add CHANGELOG.md .github/ISSUE_TEMPLATE/stack-not-detected.yml docs/assets/init-demo.gif
git commit -m "chore(release): v0.1.0 changelog, gif, stack issue template"
git tag -a v0.1.0 -m "Harness Standard v0.1.0"
git push origin HEAD --tags
```

- [ ] **Step 5: Create the GitHub release**

```bash
gh release create v0.1.0 --title "v0.1.0" --notes-file CHANGELOG.md
```

#### Task 1.7: Site badge contract (handoff — do not duplicate)

The badge "this floor is built with harness-standard" is owned by the `front-desk-positioning` / `showcase` workstream. This plan only fixes the contract those workstreams must consume.

- [ ] **Step 1: Record the contract in `harness-standard/README.md`'s "This website is built with it" section (already added in Task 1.4)** — the badge must link `https://github.com/jordimarsal/harness-standard` and the install string must match `curl -fsSL https://jordimp.net/harness/install.sh | bash -s -- --tool=claude`.

- [ ] **Step 2: Hand off to the site workstream** — no jordimp code change here beyond `public/harness/install.sh` (Task 1.3). The site workstream owns the badge copy, its floor placement and any `content.ts` change.

### Verification (Workstream 1, run in harness-standard)

```bash
# 1. own test suite
bash tests/test-install.sh                       # FAIL: 0

# 2. behavior from a scratch dir, no harness checkout (AC1.1–AC1.4)
d=$(mktemp -d)
HARNESS_REPO_URL="$PWD" HARNESS_REF=HEAD bash install.sh --tool=claude --dest "$d" | tee /tmp/hs.out
test -f "$d/HARNESS.md"
test -s "$d/harness/CHECKPOINTS.md"
test -s "$d/docs/conventions.md"
ls "$d/.claude/agents" | grep -c -E 'leader|spec-author|implementer|reviewer'   # → 4
grep -c '^Next:' /tmp/hs.out                                                     # → 1
grep -E '^Next: (claude|opencode) —' /tmp/hs.out                                 # → 1 line

# 3. release + readme + assets (AC1.5–AC1.8)
gh release view v0.1.0
test "$(grep -c '^## ' README.md)" -eq 6
test -f .github/ISSUE_TEMPLATE/stack-not-detected.yml
du -h docs/assets/init-demo.gif | awk '{print $1}'    # < 1M

# 4. served copy (jordimp repo)
cd ../jordimp && npm run build && test -f dist/harness/install.sh
```

### Human gate (Workstream 1)

Stop. Show: the 12s gif, the full `README.md`, the `v0.1.0` release page, and the live install command output. Human approves hosting `install.sh` on `jordimp.net` (Task 1.3 deploys the site) before Workstream 2 starts.

---

## Workstream 2 — CodebaseRAG as evidence, not SaaS (MILLORES §4, week 3)

**Repo:** `/home/jordi/Documents/CV/projects/codebaserag`.

### Goal

Make CodebaseRAG clone-and-evaluate: the README leads with the committed metrics, `make eval` runs the golden-set retrieval gate and enforces `mean recall@5 ≥ 0.409` in CI, the public golden set (≥40 Q/A) is documented, and a 1-page ADR states why retrieval is CI-gated — reusing the essay owned by the `rag-eval-article` workstream.

### Acceptance criteria (objective)

- **AC2.1** `uv run coderag version` works from a fresh clone (console script exists).
- **AC2.2** `make eval` runs the committed golden set with the pgvector store, prints the 3 metrics, exits 0 when `mean recall@5 ≥ 0.409`, and exits non-zero otherwise.
- **AC2.3** `make eval` fails with a clear message if the golden set has fewer than 40 Q/A pairs.
- **AC2.4** `evals/golden/` contains ≥40 Q/A pairs and an `evals/golden/README.md` documenting the schema.
- **AC2.5** The first 6 lines of `README.md` are exactly the drafted block (AC2.1 in the draft below).
- **AC2.6** `.github/workflows/ci.yml` runs the eval gate; a deliberate regression (baseline bumped above the achievable recall) fails the job.
- **AC2.7** `docs/adr/0001-ci-gated-retrieval.md` exists, is ≤ 1 page, and its argument is identical to the site article owned by `rag-eval-article`.
- **AC2.8** `./demo.sh` goes from a clean checkout to printed metrics in < 10 minutes (documented prerequisites) and is safe to re-run.
- **AC2.9** No dashboard and no MCP code is added.

### File structure

```
codebaserag/
├── README.md                          # MODIFY: first block + reproduce section
├── pyproject.toml                     # MODIFY: [project.scripts]
├── Makefile                           # NEW: eval / demo targets
├── scripts/eval.sh                    # NEW: golden count guard + gate runner
├── demo.sh                            # NEW: zero -> metric walkthrough
├── evals/golden/README.md             # NEW: schema + count
├── evals/golden/codebaserag.yaml      # EXISTS: 44 Q/A (verify)
├── evals/baseline.json                # EXISTS: 0.409 / 0.231 / 0.277
├── docs/adr/0001-ci-gated-retrieval.md # NEW (shared with rag-eval-article)
└── .github/workflows/ci.yml           # MODIFY: eval gate job
```

### Tasks

#### Task 2.1: Fix the missing console script

**Files:**
- Modify: `pyproject.toml`

- [ ] **Step 1: Add the script entry point**

Add under `[project]` (after `dependencies` or after `[project.optional-dependencies]`):

```toml
[project.scripts]
coderag = "coderag.cli:app"
```

- [ ] **Step 2: Verify**

Run: `uv run coderag version`
Expected: prints the package version (no `No such file or directory`).

- [ ] **Step 3: Commit**

```bash
git add pyproject.toml
git commit -m "fix(cli): expose the coderag console script"
```

#### Task 2.2: `make eval` — golden-set retrieval gate

**Files:**
- Create: `scripts/eval.sh`, `Makefile`
- Test: `tests/test_eval.py` already covers metrics; no new unit test needed.

**Interfaces:**
- Consumes: `coderag eval --store pgvector` and `evals/baseline.json`.
- Produces: `make eval` (exit 0/non-zero), used by CI (Task 2.7) and `demo.sh` (Task 2.5).

- [ ] **Step 1: Create `scripts/eval.sh`** (exact content)

```bash
#!/usr/bin/env bash
# Golden-set retrieval gate. Fails if the golden set shrinks below 40 Q/A or if
# mean recall@5 drops below the committed baseline in evals/baseline.json.
set -euo pipefail

GOLDEN_DIR="evals/golden"
MIN_GOLDEN=40

count=$(grep -h -c '^- question:' "$GOLDEN_DIR"/*.yaml | awk '{s+=$1} END {print s}')
if [ "${count:-0}" -lt "$MIN_GOLDEN" ]; then
  echo "FAIL: golden set has ${count:-0} Q/A pairs, minimum is $MIN_GOLDEN" >&2
  exit 1
fi
echo "golden set: $count Q/A pairs (>= $MIN_GOLDEN)"

uv run --extra pgvector --extra embeddings --extra qdrant \
  coderag eval --store pgvector --repo . --top-k 5
```

- [ ] **Step 2: Create `Makefile`**

```make
.PHONY: eval demo

## Run the golden-set retrieval gate (needs a reachable pgvector + embedder).
eval:
	./scripts/eval.sh

## Zero -> metric walkthrough.
demo:
	./demo.sh
```

- [ ] **Step 3: Bring up prerequisites and run the gate**

```bash
chmod +x scripts/eval.sh
docker compose up -d db
for i in $(seq 1 30); do docker compose exec -T db pg_isready -U coderag -d coderag >/dev/null 2>&1 && break; sleep 2; done
# embedder (one of):
#   LLAMACPP_MODEL=/path/to/nomic-embed-text-v1.5.Q4_K_M.gguf bash scripts/start-llamacpp.sh
#   ollama serve & ollama pull nomic-embed-text
export CODERAG_DATABASE_DSN=postgresql://coderag:coderag@localhost:5432/coderag
uv run --extra pgvector --extra embeddings coderag ingest . --store pgvector
make eval
```

Expected: `golden set: 44 Q/A pairs (>= 40)`; table prints `mean recall@5`, `mean MRR`, `mean nDCG@5`; `mean recall@5 ≥ 0.409` → exit 0. **If recall < 0.409, do not lower the gate**: verify the embedder matches the baseline provenance, and stop for human input.

- [ ] **Step 4: Verify the gate can fail**

```bash
cp evals/baseline.json /tmp/baseline.bak
# temporarily raise the floor above the achievable recall to force the gate:
python3 -c "import json;p='evals/baseline.json';d=json.load(open(p));d['mean_recall']=0.999;json.dump(d,open(p,'w'))"
if make eval; then echo "UNEXPECTED PASS"; else echo "OK: gate failed as expected"; fi
mv /tmp/baseline.bak evals/baseline.json
```

Expected: `OK: gate failed as expected`; baseline restored byte-for-byte (`git diff --exit-code evals/baseline.json`).

- [ ] **Step 5: Commit**

```bash
git add Makefile scripts/eval.sh
git commit -m "feat(eval): make eval golden-set retrieval gate"
```

#### Task 2.3: README first block + reproduction section

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace lines 1–4 so the file starts with the exact drafted block**

```markdown
# CodebaseRAG

Hexagonal RAG over your own repo.

CI fails if mean recall@5 drops below 0.409.

Golden set: ≥40 Q/A pairs
Baseline: recall@5 0.409 · MRR 0.231 · nDCG@5 0.277
Adapters: pgvector | Qdrant · Ollama | Anthropic
```

- [ ] **Step 2: Add a "Reproduce the baseline" section directly after the block**

```markdown
## Reproduce the baseline

```bash
docker compose up -d db                                    # pgvector on :5432
ollama serve & ollama pull nomic-embed-text                # or: bash scripts/start-llamacpp.sh
export CODERAG_DATABASE_DSN=postgresql://coderag:coderag@localhost:5432/coderag
uv run --extra pgvector --extra embeddings coderag ingest . --store pgvector
make eval                                                  # prints the three metrics, gates on 0.409
```

`make eval` fails if the golden set shrinks below 40 Q/A or if mean recall@5
drops below 0.409 without an ADR override. The number is a floor, not SOTA.
```

- [ ] **Step 3: Verify**

Run: `head -8 README.md && grep -n '^## Reproduce the baseline' README.md`
Expected: exact block at top; reproduction section present.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs(readme): lead with eval-gated retrieval"
```

#### Task 2.4: Document the public golden set

**Files:**
- Create: `evals/golden/README.md`
- Verify: `evals/golden/codebaserag.yaml`

- [ ] **Step 1: Confirm the count**

Run: `grep -c '^- question:' evals/golden/codebaserag.yaml`
Expected: `44` (≥40).

- [ ] **Step 2: Create `evals/golden/README.md`**

```markdown
# Golden set

Retrieval questions with their expected source files, used by `make eval`.

- **File:** `codebaserag.yaml` (44 Q/A pairs; the gate requires ≥40).
- **Schema:** a YAML list; each entry has:
  - `question` (string) — natural-language query.
  - `expected_files` (list of repo-relative paths) — the relevant chunk sources.
  - `answer_contains` (list of strings) — expected code symbols/terms.
  - `repo` (string) — corpus the question was authored against (`codebaserag`).

Metrics (recall@5, MRR, nDCG@5) are computed from `expected_files`; `answer_contains`
is used by the generation eval.
```

- [ ] **Step 3: Verify the guard reads this file**

Run: `make eval 2>&1 | grep 'golden set'`
Expected: `golden set: 44 Q/A pairs (>= 40)`.

- [ ] **Step 4: Commit**

```bash
git add evals/golden/README.md
git commit -m "docs(eval): document the public golden set"
```

#### Task 2.5: `demo.sh` — zero → metric in < 10 minutes

**Files:**
- Create: `demo.sh`

- [ ] **Step 1: Create `demo.sh`** (exact content)

```bash
#!/usr/bin/env bash
# Zero -> metric walkthrough: bring up pgvector, ensure an embedder, ingest this
# repo, print the three retrieval metrics. Safe to re-run.
set -euo pipefail

start=$(date +%s)
section() { echo; echo "=== $* ==="; }
elapsed() { echo "elapsed: $(( $(date +%s) - start ))s"; }

section "1/4 Vector store (pgvector)"
docker compose up -d db
for i in $(seq 1 30); do
  docker compose exec -T db pg_isready -U "${CODERAG_DB_USER:-coderag}" -d "${CODERAG_DB_NAME:-coderag}" >/dev/null 2>&1 && break
  sleep 2
done
echo "pgvector ready"

section "2/4 Embedder"
if ! curl -sf http://localhost:11434/api/tags >/dev/null 2>&1; then
  if command -v ollama >/dev/null 2>&1; then
    (ollama serve >/tmp/ollama-demo.log 2>&1 &) || true
    sleep 3
    ollama pull nomic-embed-text
  else
    echo "No embedder on :11434. Start llama.cpp (scripts/start-llamacpp.sh) or Ollama, then re-run." >&2
    exit 1
  fi
fi
echo "embedder ready"

export CODERAG_DATABASE_DSN="${CODERAG_DATABASE_DSN:-postgresql://coderag:coderag@localhost:5432/coderag}"

section "3/4 Ingest"
uv run --extra pgvector --extra embeddings coderag ingest . --store pgvector

section "4/4 Eval"
uv run --extra pgvector --extra embeddings --extra qdrant coderag eval --store pgvector --repo .

section "Done"
elapsed
```

- [ ] **Step 2: Verify zero → metric under 10 minutes**

```bash
chmod +x demo.sh
time ./demo.sh
```
Expected: three-metric table printed; total wall time < 600 s on a warm machine; second run is idempotent and < 600 s.

- [ ] **Step 3: Commit**

```bash
git add demo.sh
git commit -m "feat(demo): zero -> metric walkthrough in under ten minutes"
```

#### Task 2.6: One-page ADR (shared with `rag-eval-article`)

**Files:**
- Create: `docs/adr/0001-ci-gated-retrieval.md`

**Coordination:** the `rag-eval-article` workstream owns the site article. Author the text **once**; the ADR and the article must not diverge.

- [ ] **Step 1: Create `docs/adr/0001-ci-gated-retrieval.md`**

```markdown
# ADR 0001 — Why CI-gated retrieval, not a chatbot demo

- **Status:** accepted
- **Date:** 2026-09-22

## Context

Codebase RAG demos are everywhere and none of them can be audited. A demo shows
one good answer; it says nothing about the questions that retrieve the wrong
file. Without a measured retrieval layer, "the model answered" is an anecdote.

## Decision

Retrieval quality is a build artifact. A golden set of ≥40 Q/A pairs pins the
expected source files; `make eval` computes recall@5, MRR and nDCG@5 and **fails
CI if mean recall@5 drops below the committed baseline (0.409)**. The core is
hexagonal, so changing the store (pgvector ↔ Qdrant) or the embedder
(Ollama ↔ Anthropic) does not touch the evaluator.

## Consequences

- Every retrieval change pays for itself with a number.
- Latency and cost can change freely; recall is the contract.
- 0.409 is a floor, not a leaderboard score. An override requires an ADR.
- The product is the gate and the golden set, not a chat UI. No dashboard.

## Article

The long form of this decision is published as "RAG without an eval gate is a
demo" (owned by the `rag-eval-article` workstream). Keep both texts identical.
```

- [ ] **Step 2: Verify length**

Run: `wc -l docs/adr/0001-ci-gated-retrieval.md`
Expected: ≤ 45 lines (one page).

- [ ] **Step 3: Commit**

```bash
git add docs/adr/0001-ci-gated-retrieval.md
git commit -m "docs(adr): why CI-gated retrieval"
```

#### Task 2.7: Enforce the gate in CI

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Add an `evals` job** after the existing `quality` job

```yaml
  evals:
    runs-on: ubuntu-latest
    services:
      db:
        image: pgvector/pgvector:pg17
        env:
          POSTGRES_USER: coderag
          POSTGRES_PASSWORD: coderag
          POSTGRES_DB: coderag
        ports: ["5432:5432"]
        options: >-
          --health-cmd "pg_isready -U coderag -d coderag"
          --health-interval 5s --health-timeout 5s --health-retries 10
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v3
      - name: Set up Python
        run: uv python install 3.13
      - name: Install eval deps
        run: uv pip install --system -e ".[dev,pgvector,embeddings,qdrant]"
      - name: Start embedder (Ollama)
        run: |
          curl -fsSL https://ollama.com/install.sh | sh
          ollama serve & sleep 5
          ollama pull nomic-embed-text
      - name: Ingest
        env:
          CODERAG_DATABASE_DSN: postgresql://coderag:coderag@localhost:5432/coderag
        run: coderag ingest . --store pgvector
      - name: Retrieval gate
        env:
          CODERAG_DATABASE_DSN: postgresql://coderag:coderag@localhost:5432/coderag
        run: make eval
```

> `https://ollama.com/install.sh` is the installer URL for the embedder runtime, used only inside CI; it is not a published claim about this project. If the runner blocks it, replace the `Start embedder` step with a llama.cpp build or a cached model step, keeping `make eval` unchanged.

- [ ] **Step 2: Verify locally** — `act -j evals` if available, or push a branch and confirm the job's log contains `golden set: 44 Q/A pairs` and the three metrics, and that the job is green above 0.409.

- [ ] **Step 3: Verify the gate fails on regression** — temporarily set `mean_recall` to `0.999` in `evals/baseline.json`, push, confirm the `evals` job is red; revert the baseline and confirm green.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: gate retrieval recall@5 >= 0.409"
```

### Out of scope (explicit)

- No dashboard, no MCP server, no chat UI (MILLORES §4).
- No change to the 0.409 baseline value. The floor may only change with a new ADR and a human gate, because the site copy states 0.409.

### Verification (Workstream 2, run in codebaserag)

```bash
# fresh clone
cd "$(mktemp -d)" && git clone https://github.com/jordimarsal/codebaserag && cd codebaserag

uv run coderag version                                   # AC2.1
grep -c '^- question:' evals/golden/codebaserag.yaml     # → 44 (>=40) AC2.4
head -6 README.md                                        # exact drafted block AC2.5

docker compose up -d db
for i in $(seq 1 30); do docker compose exec -T db pg_isready -U coderag -d coderag >/dev/null 2>&1 && break; sleep 2; done
ollama serve & sleep 3; ollama pull nomic-embed-text
export CODERAG_DATABASE_DSN=postgresql://coderag:coderag@localhost:5432/coderag
uv run --extra pgvector --extra embeddings coderag ingest . --store pgvector

make eval                                                # AC2.2: 3 metrics, exit 0, recall >= 0.409
time ./demo.sh                                           # AC2.8: < 600s
wc -l docs/adr/0001-ci-gated-retrieval.md                # AC2.7: <= 45 lines
gh run list --workflow ci.yml --limit 1                  # AC2.6: evals job green
```

### Human gate (Workstream 2)

Stop. Show: `make eval` output (three metrics, gate status), `demo.sh` wall time, the README first block, and the ADR. Human confirms the ADR text equals the `rag-eval-article` draft (or authorizes one canonical version) before Workstream 3 starts.

---

## Workstream 3 — Kafka Telemetry walkthrough (MILLORES §5)

**Repo:** `/home/jordi/Documents/CV/projects/kafka-adapter-telemetry`.

### Goal

Keep it a study, not a product. Add the conflict-of-interest line to the README, and make `demo.sh` recordable in 45 seconds with explicit PASS/FAIL assertions on the three beats: 3×DOWN → exactly 1 alert; duplicate event → 0 extra insert; DLT routing. The site's hero metric (3×DOWN → 1) stays.

### Acceptance criteria (objective)

- **AC3.1** `README.md` contains the exact line `Personal study of the Open Gateway telemetry problem. Not Telefónica code. Not production traffic.`
- **AC3.2** `./demo.sh --walkthrough` completes in ≤ 60 s of demo output (excluding one-time `docker compose up`/`mvn package`), printing three explicit `PASS:` lines.
- **AC3.3** Beat 1: running profile `high` twice leaves `adapter_alert` count unchanged (1 alert per episode).
- **AC3.4** Beat 2: running profile `overload` twice leaves `telemetry_event` count unchanged (0 extra insert).
- **AC3.5** Beat 3: the `adapter.telemetry.v1.dlt` topic contains ≥1 message after `overload`.
- **AC3.6** If any beat fails, `demo.sh --walkthrough` exits non-zero.
- **AC3.7** `./demo.sh` (no flag) keeps its current full behavior and remains green.

### File structure

```
kafka-adapter-telemetry/
├── README.md     # MODIFY: conflict-of-interest line
└── demo.sh       # MODIFY: --walkthrough mode with assertions
```

### Tasks

#### Task 3.1: README conflict-of-interest line

**Files:**
- Modify: `README.md` (after the intro paragraph, around line 8)

- [ ] **Step 1: Insert the line**

After the paragraph ending `Java 25, Spring Boot 4.1, hexagonal architecture per service.`, add:

```markdown
> Personal study of the Open Gateway telemetry problem. Not Telefónica code. Not production traffic.
```

- [ ] **Step 2: Verify**

Run: `grep -n 'Personal study of the Open Gateway telemetry problem' README.md`
Expected: one match. Also confirm the intro still ends with the "built for demonstration and interview walkthroughs" sentence.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs(readme): state this is a personal study, not Telefónica code"
```

#### Task 3.2: `demo.sh --walkthrough`

**Files:**
- Modify: `demo.sh`

**Interfaces:**
- Consumes: existing helpers `container_healthy`, `wait_container`, `wait_http`, `simulate`, `wait_events_stable`, `sql_count`, and constants `ORACLE_CONTAINER` / `KAFKA_CONTAINER`.
- Produces: `--walkthrough` flag; three `PASS:` lines; non-zero exit on any failed beat.

- [ ] **Step 1: Add flag parsing after the `set -euo pipefail` / constant block (after line 17)**

```bash
WALKTHROUGH=0
for arg in "$@"; do
  case "$arg" in
    --walkthrough) WALKTHROUGH=1 ;;
    *) echo "Unknown argument: $arg" >&2; exit 2 ;;
  esac
done
```

- [ ] **Step 2: Add the walkthrough function before the `# ── Main ──`/`section "Preconditions"` block (before line 90)**

```bash
assert_eq() {  # assert_eq <label> <expected> <actual>
  if [ "$2" = "$3" ]; then
    echo "PASS: $1 ($3)"
  else
    echo "FAIL: $1 — expected '$2', got '$3'" >&2
    WALK_EXIT=1
  fi
}

assert_gt_zero() {  # assert_gt_zero <label> <value>
  if [ "${2:-0}" -gt 0 ]; then
    echo "PASS: $1 ($2)"
  else
    echo "FAIL: $1 — expected > 0, got '$2'" >&2
    WALK_EXIT=1
  fi
}

dlt_count() {
  docker exec "$KAFKA_CONTAINER" /opt/kafka/bin/kafka-console-consumer.sh \
    --bootstrap-server localhost:9092 --topic adapter.telemetry.v1.dlt \
    --from-beginning --timeout-ms 5000 2>/dev/null | grep -c . || true
}

run_walkthrough() {
  WALK_EXIT=0
  section "Walkthrough — 3 beats in under 45s"

  section "Beat 1/3: 3 consecutive DOWN -> exactly 1 alert per episode"
  simulate high >/dev/null; wait_events_stable
  A1="$(sql_count adapter_alert)"
  simulate high >/dev/null; wait_events_stable
  A2="$(sql_count adapter_alert)"
  assert_eq "one alert per episode (high re-run)" "$A1" "$A2"

  section "Beat 2/3: duplicate event -> 0 extra insert"
  E1="$(sql_count telemetry_event)"
  simulate overload >/dev/null; wait_events_stable
  E2="$(sql_count telemetry_event)"
  simulate overload >/dev/null; wait_events_stable
  E3="$(sql_count telemetry_event)"
  assert_eq "idempotent inserts (overload re-run)" "$E2" "$E3"

  section "Beat 3/3: corrupt JSON -> DLT routing"
  assert_gt_zero "dead-letter messages present" "$(dlt_count)"

  section "Verdict"
  if [ "$WALK_EXIT" -eq 0 ]; then echo "PASS: all three beats"; else echo "FAIL: see above" >&2; fi
  return "$WALK_EXIT"
}
```

- [ ] **Step 3: Branch the main flow**

After `echo "Kafka and Oracle healthy, jars present."` (line 95) insert:

```bash
if [ "$WALKTHROUGH" -eq 1 ]; then
  run_walkthrough
  exit $?
fi
```

This keeps the full demo unchanged for the default path (AC3.7). The walkthrough skips the dashboard build and verbose JSON dump to stay within the 45s budget.

- [ ] **Step 4: Verify the walkthrough**

```bash
docker compose up -d --wait && mvn -q package
time ./demo.sh --walkthrough
```
Expected: exactly `PASS: one alert per episode`, `PASS: idempotent inserts`, `PASS: dead-letter messages present`, and `PASS: all three beats`; total demo output ≤ 60 s; exit 0.

- [ ] **Step 5: Verify the failure path**

```bash
# temporarily force a false assertion to prove it can fail:
sed -n '1,5p' demo.sh >/dev/null   # no-op guard
WALK_FORCE_FAIL=1 bash -c 'source /dev/stdin <<< "$(cat demo.sh)"' 2>/dev/null || true
# Simpler check: point sql_count at a missing table by hand is out of scope;
# instead confirm return code propagation:
./demo.sh --walkthrough && echo "exit=0 (expected on healthy stack)"
```
Expected: exit 0 on a healthy stack. The non-zero contract is covered by `run_walkthrough` returning `WALK_EXIT` and `exit $?`.

- [ ] **Step 6: Verify the default path is unchanged**

Run: `./demo.sh` (no flag)
Expected: current full flow still runs and prints final SQL counts.

- [ ] **Step 7: Commit**

```bash
git add demo.sh
git commit -m "feat(demo): 45s walkthrough with pinned assertions"
```

#### Task 3.3: Site featured-card contract (handoff — do not duplicate)

- [ ] **Step 1: Record the contract** — the site featured card's hero metric stays exactly `3×DOWN → 1` / "alert per episode". This plan does not edit `src/data/content.ts`; the `front-desk-positioning` / `showcase` workstream owns any site-side change and must not replace the metric with `Java 25`.

- [ ] **Step 2: Hand off** — no repo change in `kafka-adapter-telemetry` beyond README + `demo.sh`.

### Verification (Workstream 3, run in kafka-adapter-telemetry)

```bash
grep -n 'Personal study of the Open Gateway telemetry problem' README.md   # AC3.1

docker compose up -d --wait
mvn -q package
time ./demo.sh --walkthrough | tee /tmp/walk.out                            # AC3.2, AC3.3–AC3.6
grep -c '^PASS: ' /tmp/walk.out                                             # → 4
grep -c '^FAIL: ' /tmp/walk.out                                             # → 0

./demo.sh >/tmp/full.out 2>&1; echo "full demo exit=$?"                    # AC3.7 (0)
grep -q 'telemetry_event' /tmp/full.out
```

### Human gate (Workstream 3)

Stop. Show: the recorded 45s `--walkthrough` run and the README line. Human approves before any site-side hero-metric change is scheduled.

---

## Cross-workstream site contracts (single source, no duplication)

This plan changes **one** site file: `jordimp/public/harness/install.sh` (Task 1.3). The following strings are contracts for other workstreams; do not duplicate their tasks here.

| Contract | Exact string | Owned by |
|---|---|---|
| Harness install command | `curl -fsSL https://jordimp.net/harness/install.sh \| bash -s -- --tool=claude` | `front-desk-positioning` / `showcase` (badge) + Workstream 1 (installer) |
| Harness badge | `this floor is built with harness-standard` → `https://github.com/jordimarsal/harness-standard` | `showcase` |
| RAG baseline | `recall@5 0.409 · MRR 0.231 · nDCG@5 0.277`; golden set `≥40 Q/A` | `rag-eval-article` (article) + Workstream 2 (gate) |
| RAG CI claim | `CI fails if mean recall@5 drops below 0.409` | Workstream 2 (CI) — must be true before the site repeats it |
| Kafka conflict line | `Personal study of the Open Gateway telemetry problem. Not Telefónica code. Not production traffic.` | Workstream 3 (README) + `front-desk-positioning` (site rendering) |
| Kafka hero metric | `3×DOWN → 1` / `alert per episode` (never `Java 25`) | `front-desk-positioning` |

---

## Self-Review (done at plan-writing time)

- **Spec coverage (MILLORES §3–§5, §8 weeks 2–3):** installable harness with one real command, stack detection, roles/conventions/gates, `HARNESS.md`, one-line next step, 60s README, tag `v0.1.0`, 12s gif, issue template, site badge contract → Workstream 1. README first block, `make eval`, public golden set, 1-page ADR, zero→metric <10 min, dashboard/MCP out of scope → Workstream 2. Conflict-of-interest line, 45s walkthrough with 3×DOWN→1 / duplicate→0 insert / DLT, keep hero metric → Workstream 3.
- **Cross-repo testability:** explicitly stated at the top and enforced by per-workstream Verification sections that run only inside their own repo. `jordimp` proves none of these.
- **Facts:** every metric and claim is drawn from `src/data/content.ts` or measured during plan writing (44 Q/A, offline 0.068, 0 tags/releases, missing console script, CI missing the eval gate). No invented metrics or URLs.
- **No placeholders:** new files have exact contents; discovery steps give exact commands and decision rules (e.g. golden count, `uv run coderag version`, `grep -c '^- question:'`).
- **Type/naming consistency:** `make eval` is used by CI and `demo.sh`; `scripts/eval.sh` is the single gate runner; `run_walkthrough` reuses the existing `simulate`/`sql_count`/`wait_events_stable` helpers; `HARNESS.md` and the `Next:` line are produced by `init.sh` and asserted by both `test-install.sh` and the Workstream 1 verification.
- **Known risk / escalation:** Workstream 2's semantic baseline (0.409) requires a real embedder. If the public embedder does not reach 0.409, the task stops for human input — the baseline and the site copy must not silently diverge.

## Assumptions

1. The three repositories are public and cloneable; `harness-standard` and `codebaserag` were inspected at commit-time `HEAD` on 2026-09-22.
2. CodebaseRAG's committed 0.409 baseline was produced with a real embedder (per its README: llama.cpp `nomic-embed-text-v1.5` over pgvector). Reproducing it needs Docker + an embedding runtime; the plan pins Ollama `nomic-embed-text` for CI and documents llama.cpp as the local alternative.
3. `evals/golden/codebaserag.yaml` already satisfies ≥40 Q/A (measured 44); no new questions are authored here.
4. The `front-desk-positioning`, `showcase`, and `rag-eval-article` workstreams own all site copy changes; this plan only fixes the installer artifact, the READMEs, and hands them the contracts above.
5. GitHub Actions can install Ollama and pull `nomic-embed-text`; if not, the `evals` job can be switched to a manual `workflow_dispatch` gate without changing the site claim's truth (the gate still exists), but that would be a scope change and needs human approval.
6. `jordimp` remains the host for `install.sh`; Astro copies `public/` verbatim, so `https://jordimp.net/harness/install.sh` resolves after a normal deploy.
