# External Brand Hygiene Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **This is manual/external work**: there is no test suite. Verification is observable evidence (a URL, a field, a received email) — record the evidence next to each step.

**Goal:** Align the three surfaces a recruiter or CTO hits before the site (domain email, LinkedIn, GitHub profile/pins) with the offer, the F0 ledger and the three featured projects, so the web is not undercut by a 2018 CV.

**Architecture:** No application code changes. Copy is pasted into external products (registrar/mail provider, LinkedIn, GitHub). Copy is derived verbatim from `MILLORES.md` §0/§7/§8 and from `src/data/content.ts` (`EXPERIENCE`, `FEATURED`, `PAGES.home`). Two sibling features own the code side and are referenced, not implemented here: `front-desk-positioning` (site-copy implementation of §0) and `contact-email` (the site's email swap, gated by Task 1).

**Tech Stack:** None (browser UIs + registrar DNS panel). Discovery tools: `dig`, `curl`, a mail client.

**Spec:** `MILLORES.md` and this document. The plan argues from those sources; executors read both.

**Sources of truth (do not invent beyond these):**
- `MILLORES.md` §0 (offer decision), §2 (copy proposals), §7 (brand hygiene table), §8 (week 1), §9 (do not do).
- `src/data/content.ts`: `SITE` (L33–45), `HOME` (L98–129), `PAGES.home` (L940–954), `EXPERIENCE` (L685–780), `FEATURED` (L683).

## Global Constraints

- Manual/external work: **no test suite applies**; every task ends with explicit paste copy and a verification step that names the exact field/URL where the change is visible.
- **No invented facts**: no new employers, dates, degrees, metrics or recommendations. Only reuse the numbers already committed in `MILLORES.md` and `src/data/content.ts`.
- **One feature at a time** (AGENTS.md §3): do this as its own session; do not touch `src/` from this plan.
- Public identity constants (verbatim): site `https://jordimp.net` · GitHub `https://github.com/jordimarsal` · LinkedIn `https://www.linkedin.com/in/jordi-marsal-poy` · personal Gmail `jordi.marsal@gmail.com`.
- **Gate (hard):** `contact-email` (the site swap to `hello@jordimp.net`) must not merge before Task 1 passes.
- Copy must match the site after `front-desk-positioning` ships. If that feature lands different wording, re-check LinkedIn/GitHub against it and change the external surface to match (never the reverse inside this plan).
- This plan does not create a blog, prices, a visual rewrite, or new repos (Task 9).

---

## 0. The offer decision (record before anything else)

**Decision (verbatim from `MILLORES.md` §0):**

- **Primary offer:** Senior backend engineer (Java / Python / applied AI you can evaluate). Open to a platform, events, or applied-AI role where the retriever and the alerts can be audited.
- **Secondary offer (one line, not a second business):** Short spec-first engagements (4–8 weeks) only — RAG with evals, adapter telemetry, agent harness. Not "build me an app with ChatGPT".
- **"One-person firm" stance:** `Jordimp & Co. is how the work is done — currently inside a telco platform team, not a staffing firm.` Without this line, "one-person firm" reads as selling hours while employed.

**Where it is implemented:** the site-copy implementation of this decision lives in the `front-desk-positioning` feature (Front Desk block and hall CTA). **This plan only records the decision and aligns the LinkedIn / GitHub / email surfaces to it.** Do not edit site copy here; do not create a second business narrative.

- [ ] **Step 1: Confirm the decision is reflected in this plan's copy**
  Check that the Primary offer, Secondary offer and the "one-person firm" line above are quoted exactly as written and that every later task orients to them.

- [ ] **Step 2: Confirm the site-side owner**
  State in `harness/progress/current.md`: "Offer decision recorded; site copy implementation owned by `front-desk-positioning`; external surfaces aligned by this plan."

---

### Task 1: Domain email `hello@jordimp.net` → personal Gmail

**Files:** none (registrar/mail provider + DNS only).

**Interfaces:**
- Produces: a working `hello@jordimp.net` mailbox/alias that forwards to `jordi.marsal@gmail.com`, with SPF/DKIM where offered.
- Consumed by: `contact-email` (site swap), Task 3 (LinkedIn), Task 6 (GitHub profile README), Task 8 (repo READMEs).

- [x] **Step 1: Discover where `jordimp.net` DNS and mail are managed**

Run:
```bash
dig +short NS jordimp.net
dig +short MX jordimp.net
```
Expected: NS records name the provider hosting DNS (registrar or a DNS host); MX may be empty (no mail configured yet). Record the provider name in `harness/progress/current.md`. Then open that provider's control panel (the registrar where `jordimp.net` was bought, or the DNS host named by NS).

- [x] **Step 2: Create the address — pick the branch the provider supports**

  - **Branch A — registrar offers email forwarding (most common):** open the domain's **Email / Email Forwarding** section → *Add forwarding rule* → local part `hello`, domain `jordimp.net`, destination `jordi.marsal@gmail.com` → Save. The provider writes its own MX records automatically.
  - **Branch B — registrar has no mail: use a free custom-domain mail/forwarding service** (surveyed from `ripienaar/free-for-dev`, Email section, 2026-09-22; no paid plan required):
    - **ImprovMX** (free forwarding) or **forwardemail.net** (free forwarding, unlimited addresses; `.net` is free) → register the domain, create `hello@jordimp.net`, keep Gmail as destination, then set the MX records they print at the DNS panel.
    - **Zoho Mail (Free)** — a real mailbox (5 users, 5 GB, one domain) that can also *send as* `hello@jordimp.net`; choose this if a reply-from-domain identity matters for the brand.
    - **Cloudflare Email Routing** — free forwarding, but only if you are willing to move `jordimp.net` nameservers to Cloudflare.
    - **DNSExit** (2 addresses, 100 MB, IMAP/POP3/SMTP) or **KaiMail** (forwarding + DKIM, 300 emails/mo) as fallbacks.
  - Record the chosen provider and its free tier in `harness/progress/current.md` (evidence for `contact-email` R8). Re-check the provider's current free-tier terms before committing.

- [x] **Step 3: Set MX records (Branch B only; skip if Branch A already did it)**

At the DNS panel for `jordimp.net`, add the MX records exactly as the mail host specifies (host + priority). Do not replace existing non-mail records (keep the GitHub Pages `A`/`CNAME` records for the site).

- [x] **Step 4: Wait for propagation, then verify MX**

Run (after ~15–60 min; up to 24–48 h worst case):
```bash
dig +short MX jordimp.net
```
Expected: the records from Step 2/3 are returned. If empty, wait and re-run; do not proceed to Step 5 until MX resolves.

> **Evidence 2026-09-23:** `dig +short MX jordimp.net` → `mx1.forwardemail.net`, `mx2.forwardemail.net`.
> Provider: **forwardemail.net** (free custom-domain forwarding), Branch B.

- [ ] **Step 5: Send and receive the test mail (the gate)**

From the personal Gmail, send a message to `hello@jordimp.net`. Expected: it arrives in `jordi.marsal@gmail.com` inbox within a few minutes. Then reply from Gmail and confirm the reply reaches a third address, proving the forward chain.

Evidence to record: timestamp, subject, "arrived: yes".

> **Open (2026-09-23):** forwarding is enabled (owner-confirmed) and MX/SPF resolve; the explicit
> "test message received in Gmail" receipt is still pending the owner's confirmation before F14
> may merge.

- [x] **Step 6: Check authentication records**

Run:
```bash
dig +short TXT jordimp.net
```
Expected: an SPF record is present if the provider offers one (`v=spf1 …`). If the provider exposes a DKIM key/signature in its mail settings, add the printed DNS `TXT`/`CNAME` records. If the provider offers neither, record that fact; forwarding still passes Step 5.

> **Evidence 2026-09-23:** `TXT` → `"forward-email=jordi.marsal@gmail.com"`; DMARC `_dmarc` →
> `"v=DMARC1; p=quarantine; adkim=r; aspf=r; …"`.

- [ ] **Step 7: Gates and handoff**

- [ ] `contact-email` (site swap to `hello@jordimp.net`) is **not merged** until Step 5 is confirmed. Write this gate into `harness/progress/current.md`.
- [ ] Only after Step 5: `hello@jordimp.net` becomes the contact email used in Task 3 (LinkedIn), Task 6 (GitHub README) and Task 8. Until then, those surfaces keep the existing contact.

---

### Task 2: LinkedIn headline

**Files:** none (LinkedIn profile UI).

**Interfaces:** Consumes the offer decision (§0). Produces the headline reused as the professional one-liner on LinkedIn search.

- [ ] **Step 1: Set the headline**

LinkedIn → **Me → View profile → Edit intro (pencil) → Headline**. Replace with exactly:

```
Senior Backend Engineer · Java · Python · applied AI you can evaluate · Barcelona
```

- [ ] **Step 2: Verify**

Open `https://www.linkedin.com/in/jordi-marsal-poy` in a private window (logged out). The headline under the name must read the string above verbatim, including the `·` separators. Record the URL and the visible line as evidence.

---

### Task 3: LinkedIn About

**Files:** none (LinkedIn profile UI).

**Interfaces:** Consumes Task 1 (`hello@jordimp.net` must work first) and `FEATURED` (L683). Produces the profile intro a CTO reads after the headline.

- [ ] **Step 1: Replace the About section**

LinkedIn → **Me → View profile → About → pencil**. Replace all existing text with exactly:

```
Backend engineer in Barcelona: event pipelines and applied AI treated as infrastructure — designed, built and audited by the same pair of hands since 2017.

Three projects carry the thesis:

• CodebaseRAG — hexagonal RAG over your own codebase. CI fails if mean recall@5 drops below the committed 0.409 baseline (golden set ≥40 Q/A pairs). Applied AI you can evaluate, not a chatbot demo.

• Kafka Adapter Telemetry — gateway → Kafka → hub → Oracle with idempotent inserts and an alert rule pinned by tests: 3 consecutive DOWN → exactly 1 alert per episode. A personal study of the Open Gateway problem (~90 adapters, 4 countries). Not Telefónica code, not production traffic.

• Harness Standard — multi-agent Spec-Driven Development harness (Leader / Spec Author / Implementer / Reviewer) for Claude Code and OpenCode; this site is built with it.

How I work: Brief → Spec → Build (tests first) → Audit. If it can't be written down, it doesn't start.

Java · Python · event pipelines · applied AI with evals · Barcelona · English / Español / Català.

Currently inside a telco platform team. Open to senior/staff platform, events or applied-AI roles; short spec-first engagements (4–8 weeks) on a case-by-case basis.

jordimp.net · github.com/jordimarsal
```

- [ ] **Step 2: Enforce the rule — no Master's in the first paragraph**

Confirm the first paragraph is the backend/event-pipelines/applied-AI line above. The **Master's / education must not appear in the first paragraph** (`MILLORES.md` §7). It stays only in the Education section, untouched.

- [ ] **Step 3: Verify**

In a logged-out window, the About section shows the three featured projects, the `Brief → Spec → Build → Audit` process, and the `hello@jordimp.net`-era contact line. Record the visible text as evidence.

---

### Task 4: LinkedIn Experience (copy the F0 ledger, one impact line per role)

**Files:** none (LinkedIn profile UI).

**Interfaces:** Consumes `EXPERIENCE` in `src/data/content.ts` (L685–780) verbatim — no new numbers. Produces the experience list matching the site's Operations floor.

**Copy (paste one headline bullet per role; keep company, role title and dates as in `src/data/content.ts`):**

- **Telefónica Kernel · Open Gateway — Backend Engineer, Microservices & Automation — 2022–present**
  - `12+ Python CLI tools over ~90 REST adapters in 4 countries; automatic OpenAPI generation and CI-published docs.`
- **Axpe Consulting / Mapfre — Software Engineer, API Modernization — 2026**
  - `39 corporate APIs modernized to Node.js 24; homogenized the stack and reduced technical debt across the API estate.`
- **Zitro Laboratory — Java Backend Engineer — 2020–2022**
  - `Server-to-server sign-in and Snowflake + Cassandra historicals for the Java betting engine.`
- **Attendre S.L. — Java Backend Developer — 2017–2020**
  - `Attend® (tickets/inventory/projects) and License Manager — a live product, Spring Boot 2.3 + REST.`

- [ ] **Step 1: Enter each role**

For each of the four roles: LinkedIn → **Me → View profile → Experience → + / pencil**. Set company, title and dates to match the entries above (dates mirror the site: `2022—NOW`, `2026`, `2020—2022`, `2017—2020`). Paste the matching one-line bullet into the role description.

- [ ] **Step 2: Verify each role shows exactly one impact line and no inventated metrics**

Open the logged-out profile and read each role. Only the four bullets above (no 39/90/12 claims beyond them; no degrees, no recommendations). Record the rendered list as evidence.

---

### Task 5: Request 1–2 LinkedIn recommendations

**Files:** none (LinkedIn messaging).

**Interfaces:** Consumes the offer decision (§0). Produces external social proof (`MILLORES.md` §què li treu valor: "zero recomanacions").

- [ ] **Step 1: Pick 1–2 former colleagues**

Choose people who worked with you directly (Telefónica Kernel/Open Gateway or a previous team). Do **not** write the recommendation for them and do not ask for a fabricated one.

- [ ] **Step 2: Send the request using this template verbatim**

Subject/body:
```
Hi <name>,

I'm tidying up my LinkedIn to match how I actually work now — specs before code, backend and event pipelines, applied AI with evals.

Would you be up for writing a short recommendation? Two or three sentences from your own experience is plenty — no need to look anything up. If it helps, the concrete things I'd love you to speak to if you saw them: <pick 1–2 from: designing REST adapters for Open Gateway; the Python CLI suite over ~90 adapters; CI-integrated OpenAPI/docs; how I run reviews and specs>.

No pressure either way — and I'm happy to write one back for you.

Thanks,
Jordi
```

- [ ] **Step 3: Verify**

LinkedIn → profile → **Recommendations → Received**. At least one recommendation from a former colleague appears, written in their voice. Record the count and the recommender's relation.

---

### Task 6: GitHub profile README

**Files:** none in this repo. Target: the special profile repository `jordimarsal/jordimarsal` (its `README.md` renders on the profile).

**Interfaces:** Consumes Task 1 (`hello@jordimp.net`), §0 and Task 2's one-liner. Produces the profile landing page that GitHub search and the site outbound links reach.

- [ ] **Step 1: Ensure the profile repository exists**

Run:
```bash
gh repo view jordimarsal/jordimarsal --json name,visibility 2>/dev/null || echo "MISSING"
```
If `MISSING`, create it via GitHub → **New repository** → name `jordimarsal`, owner `jordimarsal`, **Public**, initialize with a README. The repo name must exactly equal the username for the README to render on the profile.

- [ ] **Step 2: Replace `README.md` with this exact content**

```markdown
# One company. One engineer. Specs before code.

Jordimp & Co. is the working name of one engineer: backend systems, event pipelines and applied AI, designed, built and audited by the same pair of hands since 2017. Answers you can audit, not vibes you can hope for.

**Java · Python · event pipelines · applied AI with evals** — Barcelona.

- Site: [jordimp.net](https://jordimp.net)
- CodebaseRAG: [jordimarsal/codebaserag](https://github.com/jordimarsal/codebaserag)
- Kafka Adapter Telemetry: [jordimarsal/kafka-adapter-telemetry](https://github.com/jordimarsal/kafka-adapter-telemetry)
- Harness Standard: [jordimarsal/harness-standard](https://github.com/jordimarsal/harness-standard)
- LinkedIn: [jordi-marsal-poy](https://www.linkedin.com/in/jordi-marsal-poy)
- Email: [hello@jordimp.net](mailto:hello@jordimp.net)
```

- [ ] **Step 3: Verify H1 identity with the site**

The H1 must equal the site H1 from `MILLORES.md` §2 / `front-desk-positioning`: `One company. One engineer. Specs before code.`
Run:
```bash
curl -s https://jordimp.net | grep -o 'Specs before code' | head -1
```
Expected once `front-desk-positioning` is live: a match. If it is not yet live (site still says "Walk the floors."), record the mismatch in `harness/progress/current.md` and re-run this check after that feature ships; the profile README is the target copy.

- [ ] **Step 4: Verify the rendered profile**

Open `https://github.com/jordimarsal` logged out. The H1, tagline, and all six links render; `hello@jordimp.net` is a `mailto:` that opens a compose window (Task 1 must be green). Record the URL and visible H1.

---

### Task 7: GitHub pins (exactly three)

**Files:** none (GitHub profile settings).

**Interfaces:** Consumes `FEATURED` (L683). Produces the three-item showcase on the profile.

- [ ] **Step 1: Pin exactly these three**

Open `https://github.com/jordimarsal` → **Customize your pins** → select exactly:
1. `codebaserag`
2. `kafka-adapter-telemetry`
3. `harness-standard`

Uncheck/deselect all others. Save.

- [ ] **Step 2: Unpin these four (explicit do-not-show list)**

Confirm none of the following remain pinned: `bible_text_analysis`, `rustcut`, `spring-boot-casino`, `product-offers`.

- [ ] **Step 3: Verify**

Reload `https://github.com/jordimarsal` logged out. The **Pinned** grid shows exactly those three repositories, in that order. Record a screenshot/URL and the three names as evidence.

---

### Task 8: Repo README level check (cross-reference `external-public-artifacts`)

**Files:** none in this repo. Target: `codebaserag`, `kafka-adapter-telemetry`, `harness-standard` READMEs.

**Interfaces:** Consumes the three pinned repos from Task 7. The full README rewrites are owned by the `external-public-artifacts` plan; this task only **verifies the required structure exists** so the pin click does not lose the visitor (`MILLORES.md` §què li treu valor).

- [ ] **Step 1: Check each pinned repo README has the three-part contract**

For each of the three repos, open its README on `github.com` and confirm the page states all three:
1. **Problem** — what breaks without it (one line, e.g. CodebaseRAG: "RAG demos are easy; trustworthy RAG is not").
2. **Rule pinned by tests** — the promise the tests enforce (e.g. Kafka: "3 consecutive DOWN → exactly 1 alert per episode"; CodebaseRAG: "CI fails if mean recall@5 < 0.409").
3. **How to reproduce in 10 minutes** — a single documented command (e.g. `make eval`, `./demo.sh`) that a stranger can run from a fresh clone.

- [ ] **Step 2: Record gaps for the sibling plan**

List every missing element per repo. Do **not** rewrite the READMEs here; hand the list to `external-public-artifacts`. If a repo has no reproducible-in-10-minutes command yet, that is a finding, not something to fake.

- [ ] **Step 3: Verify**

For each repo, the README top section shows the problem line and the pinned rule within the first screen; the reproduction command is copy-pasteable. Record each repo URL and what was present/absent.

---

### Task 9: Do not do (from `MILLORES.md` §9, brand-relevant)

**Files:** none. This is a guardrail checklist for the whole plan and for `front-desk-positioning`.

- [ ] **Step 1: Confirm none of these happen**

- [ ] No "blog" floor with 12 drafts. One dated article at most (`MILLORES.md` §6) — and not as part of this plan.
- [ ] No prices on the site. The `Brief → Spec → Build → Audit` process filters; no rate cards.
- [ ] No visual rewrite. The building, the ITE and the 39 KB bundle are the product; do not restyle.
- [ ] No vague "AI platform" monorepo merging CodebaseRAG + MCP + Interview Simulator. Three small tools and one thesis beat one vague monorepo.
- [ ] Do not inflate `0.409`. It is an honest floor with a committed golden set, not SOTA. Never market it as more.

- [ ] **Step 2: Record the guardrail acknowledgement**

Write in `harness/progress/current.md`: "§9 guardrails checked — no blog calendar, no prices, no visual rewrite, no AI-platform monorepo, 0.409 not inflated."

---

### Task 10: Week-1 sequence, dependencies and completion criterion

**Files:** none (scheduling/verification).

- [ ] **Step 1: Execute in this order** (from `MILLORES.md` §8 week 1)

1. Task 1 — domain email (gate for everything that publishes `hello@jordimp.net`).
2. Task 2 + Task 3 — LinkedIn headline + About.
3. Task 4 + Task 5 — LinkedIn experience + recommendation request.
4. Task 6 + Task 7 — GitHub profile README + pins.
5. Task 8 — repo README level check (handoff to `external-public-artifacts`).
6. Task 9 — guardrail check.

Moving `Bible / katas / Rustcut` out of the showcase, the "not a staffing firm / not Telefónica code" Front Desk lines, and the hall/CTA copy are owned by `front-desk-positioning`, not this plan.

- [ ] **Step 2: Confirm the explicit gates**

- [ ] `contact-email` not merged before Task 1 Step 5 passes.
- [ ] `hello@jordimp.net` not published on any surface before Task 1 Step 5 passes.
- [ ] LinkedIn H1/About and GitHub README reference the same offer decision (§0) and the same three projects (`FEATURED`).

- [ ] **Step 3: Completion criterion (`MILLORES.md` closing line)**

Confirmed when a staff platform engineer, in 90 seconds on LinkedIn or GitHub, can say: *this person writes specs, measures retrieval, and has seen 90 real adapters — I'll message them.* Evidence: logged-out LinkedIn profile shows the three projects + F0 ledger + ≥1 recommendation; logged-out GitHub profile shows the profile README H1 + exactly the three pins; a mail to `hello@jordimp.net` arrives at Gmail.

---

## Self-Review (done at plan-writing time)

- **Offer decision (§0) recorded at the top** ✓; site-copy implementation explicitly deferred to `front-desk-positioning` ✓; external surfaces (email/LinkedIn/GitHub) covered ✓.
- **Spec coverage:** §7 domain email ✓ (T1), LinkedIn headline ✓ (T2), About with 3 featured + no Master's in first paragraph ✓ (T3), experience = F0 ledger ✓ (T4), recommendations ✓ (T5), GitHub profile README + same H1 ✓ (T6), pins 3 + unpin 4 ✓ (T7), README problem→pinned-rule→reproduce ✓ (T8, cross-ref `external-public-artifacts`), §9 do-not-do ✓ (T9), §8 week-1 order + closing success criterion ✓ (T10).
- **No invented facts:** all copy derives from `MILLORES.md` §0/§2/§7/§9 and `src/data/content.ts` (`EXPERIENCE` L685–780, `FEATURED` L683, `HOME`/`PAGES.home` for H1/tagline). The Master's stays in Education only; no employer, date, degree or metric added.
- **Evidence-based verification:** each task names the logged-out URL/field or the `dig`/`curl` command that must show the change; the email gate is a received test mail, not an assertion.
- **No placeholders:** exact paste copy and exact UI paths are given; the one genuinely unknown input (DNS provider) is resolved by a concrete discovery command rather than assumed.
- **Known forward dependency:** LinkedIn/GitHub copy targets the post-`front-desk-positioning` site H1/tagline; T6 Step 3 re-checks against the live site once that feature ships.
