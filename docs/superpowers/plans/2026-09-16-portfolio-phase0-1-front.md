# Portfolio Front (Phase 0–1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Construction is wrapped by `harness-standard` roles (Leader / Implementer / Reviewer).

**Goal:** Ship the static portfolio site (Astro, trilingual EN/ES/CA, all content + SEO/AI discoverability) live on GitHub Pages at `https://jordimp.net`.

**Architecture:** Astro 5 static output, zero client-side frameworks — vanilla TypeScript islands only (theme toggle, project filter, GoatCounter). Content is typed JSON collections with localized fields; one render template per page type. Deploy via GitHub Actions to GitHub Pages with custom domain.

**Tech Stack:** Astro ^5, TypeScript (strict), vanilla CSS (design tokens, no CSS frameworks), @fontsource (self-hosted Inter + JetBrains Mono), @astrojs/sitemap, Playwright (smoke), Lighthouse CI.

**Spec:** `docs/superpowers/specs/2026-09-16-portfolio-web-design.md` — this plan implements its Phase 0–1. Plans 2/3/4 (status-api, ask-api, polish) are separate documents.

**Plan 1 of 4.**

## Global Constraints

- Node.js ≥ 22 LTS, npm, TypeScript `strict: true`.
- Locales: `en` (default), `es`, `ca`. **All routes prefixed** (`/en/projects/…`); `/` redirects to `/en/`.
- Site base URL: `https://jordimp.net` (owned). Future APIs: `https://api.jordimp.net`.
- Fonts self-hosted via @fontsource — **no** Google Fonts requests.
- No CSS frameworks, no UI libraries, no analytics besides GoatCounter (loaded only if `PUBLIC_GOATCOUNTER` env is set).
- **Never** put the phone number (`609 940 649`) or street address on the site. Public contact = email + GitHub + LinkedIn only.
- Public data (verbatim): email `jordi.marsal@gmail.com` · GitHub `https://github.com/jordimarsal` · LinkedIn `https://www.linkedin.com/in/jordi-marsal-poy`.
- Featured project repo URLs: `https://github.com/jordimarsal/{kafka-adapter-telemetry, codebaserag, redis-toolkit, harness-standard, mcp-transparent-png}`.
- Lighthouse ≥ 95 on all four categories (gated in Task 14).
- Conventional commits; every task ends green: `astro check` + `astro build` pass.
- YAGNI: no search, no RSS, no comments, no form.

## File Structure (end state)

```
├── astro.config.mjs              # site, sitemap, i18n (prefixDefaultLocale: true)
├── tsconfig.json                 # strict
├── package.json
├── lighthouserc.json             # ≥95 gate
├── playwright.config.ts          # smoke against `astro preview`
├── CNAME  (via public/CNAME)     # jordimp.net
├── public/cv/*.pdf               # downloadable CVs (EN/ES)
├── src/
│   ├── config.ts                 # SITE constants (url, author, socials)
│   ├── content.config.ts         # 3 collections: projects, experience, skills
│   ├── content/
│   │   ├── projects/*.json       # 5 featured + 6 secondary
│   │   ├── experience/*.json     # 4 jobs
│   │   └── skills/*.json         # 5 groups
│   ├── lib/i18n.ts               # Locale type + L(field, lang) helper
│   ├── i18n/ui.ts                # UI strings en/es/ca
│   ├── styles/{tokens,global}.css
│   ├── layouts/BaseLayout.astro
│   ├── components/{Monogram,ThemeToggle,LocaleSwitcher,ProjectCard,Footer,SEO,JsonLd}.astro
│   └── pages/
│       ├── [lang]/{index,projects/index,projects/[slug],experience,skills,about,cv}.astro
│       ├── 404.astro
│       ├── robots.txt.ts
│       ├── llms.txt.ts
│       └── llms-full.txt.ts
├── .github/workflows/deploy.yml
└── tests/smoke.spec.ts           # Playwright
```

---

### Task 0: Prerequisites gate

**Files:** none (checks only).

**Interfaces:**
- Produces: confirmation that GitHub repos referenced by content exist publicly.

- [ ] **Step 1: Verify tooling and repo access**

Run: `node --version && gh auth status`
Expected: Node ≥ 22; logged in as `jordimarsal`.

- [ ] **Step 2: Verify featured repos are public**

Run: `gh repo view jordimarsal/kafka-adapter-telemetry jordimarsal/redis-toolkit jordimarsal/harness-standard jordimarsal/mcp-transparent-png --json name,isPrivate -q '.[] | "\(.name) private=\(.isPrivate)"'`
Expected: all `private=false`.

- [ ] **Step 3: Note pending pre-work (not blocking)**

`codebaserag` and `interview-simulator` are local-only. Cards in this site link to `github.com/jordimarsal/codebaserag` and `github.com/jordimarsal/interview-simulator`. If a URL 404s at Task 15 QA, the Leader flips that card from featured to "secondary — source available on request" in `src/content/projects/`. Do not block this plan on Phase 0 external work.

---

### Task 1: Scaffold Astro project

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/env.d.ts`, `README.md`, `.gitignore`
- Create: `src/pages/[lang]/index.astro` (minimal placeholder, replaced in Task 8)

**Interfaces:**
- Produces: runnable Astro app; `npm run {dev,build,preview,check}` scripts; SITE constant consumed by all later tasks.

- [ ] **Step 1: Scaffold**

```bash
npm create astro@latest . -- --template minimal --install --no-git --yes
```

- [ ] **Step 2: Add deps**

```bash
npm i @astrojs/sitemap && npm i -D @astrojs/check typescript
```

- [ ] **Step 3: Replace `astro.config.mjs`**

```js
// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://jordimp.net',
  trailingSlash: 'ignore',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'ca'],
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: true },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', es: 'es', ca: 'ca' } },
    }),
  ],
});
```

- [ ] **Step 4: Enforce strict `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "src/**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 5: Add scripts to `package.json`** — `"check": "astro check"`, `"preview": "astro preview"` (build/dev exist from template).

- [ ] **Step 6: Placeholder home + verify**

`src/pages/[lang]/index.astro`:
```astro
---
export function getStaticPaths() {
  return ['en', 'es', 'ca'].map((lang) => ({ params: { lang }, props: { lang } }));
}
const { lang } = Astro.props;
---
<html><body><h1>jordimp.net — {lang}</h1></body></html>
```

Run: `npm run check && npm run build`
Expected: 0 errors; `dist/en/index.html`, `dist/es/index.html`, `dist/ca/index.html` exist; `dist/index.html` redirects to `/en/`.

- [ ] **Step 7: Commit** — `git add -A && git commit -m "chore: scaffold astro site with i18n (en/es/ca)"`

---

### Task 2: Design tokens, fonts, BaseLayout, ThemeToggle, Monogram

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `src/components/{Monogram,ThemeToggle}.astro`
- Modify: `package.json` (fontsource deps)

**Interfaces:**
- Produces: `<BaseLayout lang title description>` layout used by every page; `tokens.css` custom properties used by all styling.

- [ ] **Step 1: Fonts** — `npm i @fontsource-variable/inter @fontsource/jetbrains-mono`

- [ ] **Step 2: `src/styles/tokens.css`** — exact locked palette:

```css
:root {
  --font-sans: 'Inter Variable', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --radius: 10px; --radius-sm: 6px;
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-6: 24px; --space-8: 32px; --space-12: 48px; --space-16: 64px; --space-24: 96px;
  --container: 72rem; --prose: 46rem;
}
:root[data-theme='dark'] {
  color-scheme: dark;
  --bg: #0b1220; --surface: #121a2b; --border: #1f2b40;
  --text: #e6edf3; --muted: #8b98ab;
  --accent: #2dd4bf; --accent-strong: #14b8a6; --accent-contrast: #04211d;
  --code-bg: #0d1524;
}
:root[data-theme='light'] {
  color-scheme: light;
  --bg: #fafbfd; --surface: #ffffff; --border: #e3e8ef;
  --text: #0f172a; --muted: #5b6779;
  --accent: #0d9488; --accent-strong: #0f766e; --accent-contrast: #ffffff;
  --code-bg: #f1f5f9;
}
```

- [ ] **Step 3: `src/styles/global.css`** — imports tokens + fonts, resets, `body { background: var(--bg); color: var(--text); font-family: var(--font-sans); }`, `.container { max-width: var(--container); margin-inline: auto; padding-inline: var(--space-4); }`, `.prose { max-width: var(--prose); }`, card utility `.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); }`, `:focus-visible { outline: 2px solid var(--accent); }`, and `@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }`.

- [ ] **Step 4: `src/components/Monogram.astro`** — inline SVG, no JS:

```astro
---
const { size = 40 } = Astro.props;
---
<svg width={size} height={size} viewBox="0 0 40 40" role="img" aria-label="JM">
  <rect x="1" y="1" width="38" height="38" rx="8" fill="none" stroke="var(--accent)" stroke-width="2" />
  <text x="20" y="26" text-anchor="middle" font-family="var(--font-mono)" font-size="15" fill="var(--text)">JM</text>
</svg>
```

- [ ] **Step 5: `src/components/ThemeToggle.astro`** — no-flash + toggle:

```astro
---
import { ui } from '../i18n/ui';
const lang = Astro.props.lang as 'en' | 'es' | 'ca';
---
<button id="theme-toggle" type="button" aria-label={ui[lang]['theme.toggle']} title={ui[lang]['theme.toggle']}>◐</button>
<script>
  const KEY = 'theme';
  const stored = localStorage.getItem(KEY);
  const initial = stored ?? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  document.documentElement.dataset.theme = initial;
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem(KEY, next);
  });
</script>
```

Note: the `is:inline` no-flash snippet goes in BaseLayout head (Step 6) so first paint is correct even before the module loads.

- [ ] **Step 6: `src/layouts/BaseLayout.astro`**

```astro
---
import '@fontsource-variable/inter';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/600.css';
import '../styles/global.css';
import SEO from '../components/SEO.astro';
export interface Props { lang: 'en' | 'es' | 'ca'; title: string; description: string; path?: string; }
const { lang, title, description, path } = Astro.props;
---
<!doctype html>
<html lang={lang} data-theme="dark">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script is:inline>
      (() => { const s = localStorage.getItem('theme');
        document.documentElement.dataset.theme = s ?? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'); })();
    </script>
    <SEO {lang} {title} {description} {path} />
  </head>
  <body>
    <header class="container">
      <a href={`/${lang}/`} aria-label="Home"><slot name="logo" /></a>
      <nav><slot name="nav" /></nav>
      <slot name="actions" />
    </header>
    <main class="container"><slot /></main>
    <slot name="footer" />
  </body>
</html>
```

`SEO.astro` and `JsonLd.astro` are created in Task 11 — for now create `src/components/SEO.astro` as a stub that renders only `<title>{title}</title><meta name="description" content={description} />` and `<link rel="canonical">`; Task 11 replaces it. **Type contract kept stable**: `Props = { lang, title, description, path? }`.

- [ ] **Step 7: Verify** — `npm run build` passes; visually check dev server (dark default, toggle persists via localStorage, no flash on reload).

- [ ] **Step 8: Commit** — `git commit -am "feat: design tokens, base layout, theme toggle, monogram"`

---

### Task 3: i18n strings, site config, LocaleSwitcher

**Files:**
- Create: `src/config.ts`, `src/lib/i18n.ts`, `src/i18n/ui.ts`, `src/components/LocaleSwitcher.astro`

**Interfaces:**
- Produces: `SITE` (name, url, author, email, github, linkedin), `type Locale = 'en'|'es'|'ca'`, `LOCALES`, `L(field, lang)`, `ui` dict with **all** UI strings (full list in Step 3 — later tasks consume these exact keys).

- [ ] **Step 1: `src/config.ts`**

```ts
export const SITE = {
  name: 'Jordi Marçal Poy',
  url: 'https://jordimp.net',
  role: 'Senior Backend Engineer',
  tagline: 'Java · Python · AI/LLM',
  email: 'jordi.marsal@gmail.com',
  github: 'https://github.com/jordimarsal',
  linkedin: 'https://www.linkedin.com/in/jordi-marsal-poy',
} as const;
```

- [ ] **Step 2: `src/lib/i18n.ts`**

```ts
export const LOCALES = ['en', 'es', 'ca'] as const;
export type Locale = (typeof LOCALES)[number];
export function L<T>(field: Record<Locale, T>, lang: Locale): T {
  return field[lang] ?? field.en;
}
export const localeNames: Record<Locale, string> = { en: 'EN', es: 'ES', ca: 'CA' };
```

- [ ] **Step 3: `src/i18n/ui.ts`** — full dict. Keys (exact, used by later tasks): `nav.projects, nav.experience, nav.skills, nav.about, nav.cv, hero.role, hero.tagline, hero.pillar1.title/desc, hero.pillar2.title/desc, hero.pillar3.title/desc, hero.cta.projects, hero.cta.ask, hero.cta.cv, projects.title, projects.subtitle, projects.filter.all, projects.metrics, projects.stack, experience.title, skills.title, about.title, about.values.title, cv.title, cv.download.en, cv.download.es, cv.print, footer.builtWith, footer.contact, theme.toggle, notfound.title, notfound.body`.

Fill **all three locales** yourself (short, natural copy; pillars: "Backend & APIs", "Data & AI", "Quality & Craft" / ES: "Backend y APIs", "Datos e IA", "Calidad y oficio" / CA: "Backend i APIs", "Dades i IA", "Qualitat i ofici"). `footer.builtWith` = "Built with Astro, Java 25 & a local LLM" / ES: "Construida con Astro, Java 25 y un LLM local" / CA: "Construïda amb Astro, Java 25 i un LLM local".

- [ ] **Step 4: `src/components/LocaleSwitcher.astro`**

```astro
---
import { LOCALES, localeNames, type Locale } from '../lib/i18n';
const { lang, path = '' } = Astro.props as { lang: Locale; path?: string };
---
<nav aria-label="Language" class="locale-switch">
  {LOCALES.map((l) => (
    <a href={`/${l}/${path}`} hreflang={l} aria-current={l === lang ? 'true' : undefined}
       class:list={['locale-link', { active: l === lang }]}>{localeNames[l]}</a>
  ))}
</nav>
```

CSS in `global.css`: inline links, `aria-current` gets `var(--accent)` underline.

- [ ] **Step 5: Verify** — `npm run check` green. Commit: `feat: i18n strings, site config, locale switcher`

---

### Task 4: Content schema + first featured project

**Files:**
- Create: `src/content.config.ts`, `src/content/projects/kafka-adapter-telemetry.json`

**Interfaces:**
- Produces: collections `projects`, `experience`, `skills` via glob loaders; type `Localized<T>`; consumed by pages (Tasks 7–10) and `llms*.txt` endpoints (Task 11).

- [ ] **Step 1: `src/content.config.ts`**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const localeEnum = z.enum(['en', 'es', 'ca']);
const localized = <T extends z.ZodTypeAny>(inner: T) => z.object({ en: inner, es: inner, ca: inner });

const projects = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    year: z.number().int().gte(2017),
    featured: z.boolean(),
    summary: localized(z.string()),
    problem: localized(z.string()),
    highlights: localized(z.array(z.string())),
    stack: z.array(z.string()),
    metrics: z.array(z.object({ value: z.string(), label: z.string() })),
    links: z.object({ github: z.string().url(), ci: z.string().url().optional() }),
  }),
});

const experience = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/experience' }),
  schema: z.object({
    company: z.string(), role: localized(z.string()), period: z.string(),
    current: z.boolean().default(false),
    points: localized(z.array(z.string())),
    stack: z.array(z.string()),
    order: z.number().int(),
  }),
});

const skills = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/skills' }),
  schema: z.object({
    group: localized(z.string()),
    items: z.array(z.string()),
    order: z.number().int(),
  }),
});

export const collections = { projects, experience, skills };
```

- [ ] **Step 2: `src/content/projects/kafka-adapter-telemetry.json`** (full, real):

```json
{
  "name": "kafka-adapter-telemetry",
  "year": 2026,
  "featured": true,
  "summary": {
    "en": "Event-driven adapter telemetry: a Kafka gateway + hub pipeline with idempotent Oracle persistence, per-adapter health tracking, alerting, and a live SSE mission-control dashboard.",
    "es": "Telemetría de adaptadores dirigida por eventos: pipeline Kafka gateway + hub con persistencia idempotente en Oracle, salud por adaptador, alertas y dashboard de misión en vivo vía SSE.",
    "ca": "Telemetria d'adaptadors dirigida per esdeveniments: pipeline Kafka gateway + hub amb persistència idempotent a Oracle, salut per adaptador, alertes i dashboard de missió en viu via SSE."
  },
  "problem": {
    "en": "Fleets of ~90 API adapters across 4 countries need operational visibility: who is DOWN, when did it start, and what already alerted. Built as a personal study of the Open Gateway telemetry problem, end to end.",
    "es": "Una flota de ~90 adaptadores de API en 4 países necesita visibilidad operativa: quién está DOWN, desde cuándo y qué ha alertado ya. Construido como estudio personal del problema de telemetría de Open Gateway, de punta a punta.",
    "ca": "Una flota de ~90 adaptadors d'API a 4 països necessita visibilitat operativa: qui està DOWN, des de quan i què ha alertat ja. Construït com a estudi personal del problema de telemetria d'Open Gateway, de punta a punta."
  },
  "highlights": {
    "en": ["Hexagonal per service: gateway publishes transit profiles (low/moderate/high/overload), hub persists idempotently by event id.", "Alert rule pinned by tests: 3 consecutive DOWN → exactly 1 alert per episode.", "DLT with retries absorbs duplicate and corrupted JSON without blocking the lane.", "demo.sh proves the whole loop from zero: idempotent counts, single alert, DLT routing.", "10/10 tasks delivered with Spec-Driven Development; 3 ADRs; diagrams auto-published to GitHub Pages in CI."],
    "es": ["Hexagonal por servicio: el gateway publica perfiles de tránsito (low/moderate/high/overload), el hub persiste de forma idempotente por event id.", "Regla de alerta fijada por tests: 3 DOWN consecutivos → exactamente 1 alerta por episodio.", "DLT con reintentos absorbe duplicados y JSON corrupto sin bloquear el carril.", "demo.sh demuestra el ciclo completo desde cero: recuentos idempotentes, una alerta, enrutado a DLT.", "10/10 tareas entregadas con Spec-Driven Development; 3 ADRs; diagramas publicados automáticamente en GitHub Pages por CI."],
    "ca": ["Hexagonal per servei: el gateway publica perfils de trànsit (low/moderate/high/overload), el hub persisteix idempotentment per event id.", "Regla d'alerta fixada per tests: 3 DOWN consecutius → exactament 1 alerta per episodi.", "DLT amb reintents absorbeix duplicats i JSON corrupte sense bloquejar el carril.", "demo.sh demostra el cicle complet des de zero: recomptes idempotents, una alerta, encaminament a DLT.", "10/10 tasques lliurades amb Spec-Driven Development; 3 ADRs; diagrames publicats automàticament a GitHub Pages per CI."]
  },
  "stack": ["Java 25", "Spring Boot 4.1", "Kafka", "Oracle", "Flyway", "Testcontainers", "SSE"],
  "metrics": [
    { "value": "3×DOWN → 1", "label": "alert per episode" },
    { "value": "100%", "label": "idempotent inserts" },
    { "value": "10/10", "label": "SDD tasks done" }
  ],
  "links": { "github": "https://github.com/jordimarsal/kafka-adapter-telemetry" }
}
```

- [ ] **Step 3: Verify schema validation** — `npm run check && npm run build` green (Astro validates on build).
- [ ] **Step 4: Commit** — `feat(content): projects schema + kafka-adapter-telemetry`

---

### Task 5: Remaining 4 featured projects

**Files:**
- Create: `src/content/projects/{codebaserag,redis-toolkit,harness-standard,mcp-transparent-png}.json`

**Interfaces:** same schema as Task 4.

- [ ] **Step 1: `codebaserag.json`** — year 2026, featured. summary en: "Hexagonal RAG over your own codebase, with a deterministic, eval-first core: ingest, query, and CI-gated retrieval evals."; problem en: "RAG demos are easy; trustworthy RAG is not. This one pins retrieval quality with a golden Q/A set (≥40 pairs) and fails CI if mean recall@5 drops below its committed baseline."; highlights en: ["Eval baseline gate in CI: recall@5 0.409 · MRR 0.231 · nDCG@5 0.277 (committed baseline, ADR-gated overrides).", "Ports & adapters: pgvector (default) or Qdrant; Ollama or Anthropic embeddings & LLM; Langfuse observability.", "Python 3.13 · Pydantic v2 · typer · FastAPI · ruff · black · mypy --strict."]; stack ["Python 3.13", "FastAPI", "pgvector", "Qdrant", "Ollama", "Langfuse", "mypy strict"]; metrics [{"value":"0.409","label":"mean recall@5"},{"value":"≥40","label":"golden Q/A pairs"},{"value":"strict","label":"mypy"}]; links.github `https://github.com/jordimarsal/codebaserag`.
Write es/ca fields in the same style (translate the en copy faithfully; technical terms stay in English).

- [ ] **Step 2: `redis-toolkit.json`** — year 2026, featured. summary en: "Rate-limiting toolkit for LLM gateways: atomic token-bucket quotas, pluggable stores, honest failure modes — with a Javalin gateway demo exposing an OpenAI-style endpoint."; problem en: "LLM inference is expensive: unbounded traffic is a DoS on your own wallet. Most limiters race under concurrency or hard-fail when Redis does."; highlights en: ["Every quota decision computed atomically — never a read-modify-write that slips a token past the limit.", "On Redis failure: graceful local fallback + loud metrics, not mass 5xx.", "Contract test suite shared by in-memory and Redis implementations, plus concurrency and parity tests.", "Standard X-RateLimit-* headers and correct 429 + Retry-After."]; stack ["Java", "Javalin", "Redis", "Testcontainers"]; metrics [{"value":"429+Retry-After","label":"correct rate-limit contract"},{"value":"2","label":"stores, one contract suite"}]; links.github `https://github.com/jordimarsal/redis-toolkit`. Translate es/ca.

- [ ] **Step 3: `harness-standard.json`** — year 2026, featured. summary en: "A standardized multi-agent harness for Claude Code and OpenCode: Spec-Driven Development roles (Leader, Spec Author, Implementer, Reviewer) installed into any project with a single command."; problem en: "Coding agents work well in the small and drift in the large. Teams need one repeatable process — specs, roles, gates — independent of stack."; highlights en: ["7 stacks covered (Java/Spring, Python, Node/TS, Rust, and more) with per-stack conventions.", "Single-command install; conventions template includes SonarQube/code-quality rules.", "Born from daily use across personal projects — this portfolio is built with it."]; stack ["Agents", "SDD", "CLI", "Conventions"]; metrics [{"value":"7","label":"stacks"},{"value":"1 cmd","label":"install"}]; links.github `https://github.com/jordimarsal/harness-standard`. Translate es/ca.

- [ ] **Step 4: `mcp-transparent-png.json`** — year 2026, featured. summary en: "MCP (Model Context Protocol) server that makes PNG colors transparent (alpha channel) with rgb/auto/greenscreen modes."; problem en: "Agents increasingly need real file operations; MCP is the protocol, and small focused tools are the best way to learn it for real."; highlights en: ["Implements MCP over stdio in Python 3.13+.", "Three transparency modes: exact rgb match, auto dominant-color detection, greenscreen.", "GitHub Actions smoke checks on every push."]; stack ["Python 3.13", "MCP", "Pillow", "GitHub Actions"]; metrics [{"value":"3","label":"transparency modes"}]; links.github `https://github.com/jordimarsal/mcp-transparent-png`. Translate es/ca.

- [ ] **Step 5: Verify + commit** — `npm run build` green; `git commit -m "feat(content): featured projects (codebaserag, redis-toolkit, harness-standard, mcp-transparent-png)"`

---

### Task 6: Secondary projects

**Files:**
- Create: `src/content/projects/{interview-simulator,md-mermaid-pdf,rustcut,spring-boot-casino,product-offers,bible-text-analysis}.json`

**Interfaces:** same schema; `featured: false`; `metrics: []`; highlights may hold 1 bullet.

- [ ] **Step 1: Write the six cards** (schema-compliant; summaries localized en/es/ca, 1–2 sentences; `problem` reuses summary, `highlights` holds one bullet naming the strongest proof):
  - `interview-simulator` (2026): voice interview simulator with local LLM interviewer + Whisper transcription; runs fully offline. github `https://github.com/jordimarsal/interview-simulator`.
  - `md-mermaid-pdf` (2026): Markdown+Mermaid → PDF CLI; TDD, mypy strict, CI. github `https://github.com/jordimarsal/md-mermaid-pdf`.
  - `rustcut` (2026): tiny URL shortener, Actix-web + SQLite. github `https://github.com/jordimarsal/rustcut`.
  - `spring-boot-casino` (2026): assessment — casino domain in Spring Boot, hexagonal. github `https://github.com/jordimarsal/spring-boot-casino`.
  - `product-offers` (2026): assessment — product offers API. github `https://github.com/jordimarsal/product-offers`.
  - `bible-text-analysis` (2019): NLP study — scraping, NLTK, LDA topic modeling, sentiment analysis (Data Science roots). github `https://github.com/jordimarsal/bible_text_analysis` (use exact repo case `bible_text_analysis` for `name`; keep `name` lowercase-kebab only if you also set `"name": "bible_text_analysis"` consistently — do **not** rename, use the literal repo name).
- [ ] **Step 2: Verify + commit** — `npm run build` green; `git commit -m "feat(content): secondary projects"`

---

### Task 7: Projects index + detail page + filter

**Files:**
- Create: `src/components/ProjectCard.astro`, `src/pages/[lang]/projects/index.astro`, `src/pages/[lang]/projects/[slug].astro`

**Interfaces:**
- Consumes: collections (Task 4–6), `L`, `ui`, BaseLayout.
- Produces: routes `/en/projects/` and `/en/projects/<id>/` (id = JSON filename slug); card shows name, year, summary, stack chips; featured cards bigger.

- [ ] **Step 1: `ProjectCard.astro`**

```astro
---
import { L, type Locale } from '../lib/i18n';
import type { CollectionEntry } from 'astro:content';
const { project, lang } = Astro.props as { project: CollectionEntry<'projects'>; lang: Locale };
const { data, id } = project;
---
<article class:list={['card', 'project-card', { featured: data.featured }]}>
  <a href={`/${lang}/projects/${id}/`}>
    <h3>{data.name} <span class="muted">· {data.year}</span></h3>
    <p>{L(data.summary, lang)}</p>
  </a>
  <ul class="chips">{data.stack.map((s) => <li class="chip">{s}</li>)}</ul>
</article>
```

- [ ] **Step 2: Index page** — `getStaticPaths()` over locales; fetch `getCollection('projects')`, sort featured first then year desc; render two sections (`ui[lang]['projects.title']` heading); stack filter buttons (from union of `stack` tags) with a tiny inline `<script>` toggling `hidden` on cards by `data-stack` attribute list; `LocaleSwitcher` path `"projects/"`.

- [ ] **Step 3: Detail page `[slug].astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import { L, LOCALES, type Locale } from '../../../lib/i18n';
import { ui } from '../../../i18n/ui';

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return LOCALES.flatMap((lang) =>
    projects.map((project) => ({ params: { lang, slug: project.id }, props: { lang, project } })),
  );
}
const { lang, project } = Astro.props as { lang: Locale; project: { data: any; id: string } };
const d = project.data;
---
<BaseLayout lang={lang} title={`${d.name} — Jordi Marçal Poy`} description={L(d.summary, lang)} path={`projects/${project.id}/`}>
  <article class="prose">
    <p class="muted mono">{d.year} · <a href={d.links.github}>github.com/jordimarsal/{d.name}</a></p>
    <h1>{d.name}</h1>
    <p><strong>{L(d.summary, lang)}</strong></p>
    <h2>Problem</h2><p>{L(d.problem, lang)}</p>
    <h2>{ui[lang]['projects.highlights']}</h2>
    <ul>{L(d.highlights, lang).map((h) => <li>{h}</li>)}</ul>
    <h2>{ui[lang]['projects.stack']}</h2>
    <ul class="chips">{d.stack.map((s) => <li class="chip mono">{s}</li>)}</ul>
    <h2>{ui[lang]['projects.metrics']}</h2>
    <dl class="metrics">{d.metrics.map((m) => <div><dt class="mono">{m.value}</dt><dd>{m.label}</dd></div>)}</dl>
  </article>
</BaseLayout>
```

Add `projects.highlights` key to `ui.ts` (en/es/ca). Style `.metrics` as a card grid (grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))).

- [ ] **Step 4: Verify** — `npm run build` → `dist/en/projects/kafka-adapter-telemetry/index.html` exists; visit and review. Commit: `feat: projects index with stack filter + detail pages`

---

### Task 8: Home page

**Files:**
- Modify: `src/pages/[lang]/index.astro` (replace placeholder)

- [ ] **Step 1: Hero** — left: `<h1>{SITE.name}</h1>`, mono role line `hero.role + ' · ' + SITE.tagline`, tagline paragraph (from `ui[lang]['hero.tagline']` — one sentence: EN "I build the APIs and data plumbing that products run on — and I prove it with tests, ADRs, and now with AI agents." / natural ES / CA); CTAs: primary button `hero.cta.projects` → `/{lang}/projects/`, secondary `hero.cta.cv` → `/{lang}/cv/`, accent-outline `hero.cta.ask` → links to `/en/ask/` with `title` "phase 3" and `aria-disabled` (page lands in Phase 3 — the button is honest, not dead). Right: `<Monogram size={160} />`.
- [ ] **Step 2: Pillars grid** — 3 `.card`s from `hero.pillar1..3` keys; each lists 2–3 mono stack chips (pillar1: Java 25 · Spring Boot 4 · FastAPI; pillar2: Kafka · RAG · llama.cpp; pillar3: TDD · hexagonal · CI/CD).
- [ ] **Step 3: Featured strip** — top 3 featured `ProjectCard`s + link to all projects.
- [ ] **Step 4: Verify + commit** — build green; `git commit -m "feat: home hero, pillars, featured strip"`

---

### Task 9: Experience, Skills, About, Footer, 404

**Files:**
- Create: `src/content/experience/*.json` (4), `src/content/skills/*.json` (5), `src/components/Footer.astro`, pages `[lang]/{experience,skills,about}.astro`, `src/pages/404.astro`

**Interfaces:** consumed keys from `ui`: nav labels, `about.values.title`, `footer.*`, `notfound.*`.

- [ ] **Step 1: Experience data** — `order` newest-first: `telefonica-open-gateway` (2022–present, current: true, role "Backend Engineer — Microservicios & Automatización" localized; points en: ["Design and evolution of REST microservice adapters for Open Gateway.", "Author of a 12+ tool Python CLI suite operating ~90 adapters across 4 countries.", "Automatic OpenAPI (Swagger v2/v3) code generation and CI-integrated docs & diagrams."], stack ["Java", "Spring Boot", "Python", "Kafka", "CI/CD"]); `axpe-mapfre` (2026, period "Jan–May 2026", points en: ["Drove the tech-modernization analysis of 39 corporate APIs to Node.js 24.", "Homogenized the stack and reduced technical debt across the API estate."], stack ["Node.js 24", "TypeScript", "REST"]); `zitro` (2020–2022, points en: ["Maintenance and evolution of the Java server of the betting engine, Backoffice and online-casino integrations.", "Server-to-server sign-in, AWS Snowflake + Cassandra historicals, OneSignal integration."], stack ["Java", "Spring", "AWS", "Cassandra", "Snowflake"]); `attendre` (2017–2020, points en: ["Evolution of Attend® (tickets/inventory/projects) and License Manager (Spring Boot 2.3 + REST)."], stack ["Java", "Spring Boot", "REST"]).
Translate `role` and `points` to es/ca faithfully (source facts above are non-negotiable — no invention).

- [ ] **Step 2: Skills data** — 5 groups (order fixed): Backend & APIs (Java 11/21/25, Spring Boot 4, Python, FastAPI, Node.js, TypeScript, REST, OpenAPI, Kafka, RabbitMQ); Data (SQL Oracle/MySQL/SQLServer, MongoDB, Redis, Cassandra, Snowflake, Machine Learning, pandas/scikit-learn); AI & LLMs (RAG & vector search, MCP, llama.cpp local inference, agents & evals, prompt engineering); DevOps & Quality (Docker, Kubernetes, AWS Lambda/CDK/CloudFormation, GitHub Actions, Jenkins, SonarQube, SonarLint, Testcontainers, pytest, JUnit/Mockito); Leadership (team coordination, code review culture, mentoring, conflict resolution). Group titles localized; item names stay technical English.

- [ ] **Step 3: Pages** — `experience.astro`: vertical timeline (period mono, company h2, points ul, chips); `skills.astro`: grid of 5 group cards with inline item lists; `about.astro`: `prose` — 3 paragraphs (bio, how I work, what I value — from the professional profile: SOLID/Clean Code/TDD, "Tell, Don't Ask", I/O at the edges, knowledge sharing) + values card (`about.values.title`) + contact block (email mailto with `subject=Portfolio contact`, GitHub, LinkedIn — **no phone**); `404.astro` (root, EN, links home).

- [ ] **Step 4: `Footer.astro`** — `footer.contact` (mail/GitHub/LinkedIn icons-as-text links), `footer.builtWith` string, `© {year} {SITE.name}`; included on every page via BaseLayout `footer` slot.

- [ ] **Step 5: Verify + commit** — build green; review each route visually; `git commit -m "feat: experience timeline, skills, about, footer, 404"`

---

### Task 10: CV page + print stylesheet

**Files:**
- Create: `src/pages/[lang]/cv.astro`, `public/cv/` (PDFs), print CSS in `global.css`

**Interfaces:** uses `ui['cv.*']` keys; experience/skills collections.

- [ ] **Step 1: Copy real PDFs**

```bash
mkdir -p public/cv
cp ~/Documents/CV/"CV Jordi Marçal 2026-09 Senior EN.pdf" "public/cv/Jordi-Marcal-Poy-CV-EN.pdf"
cp ~/Documents/CV/"CV Jordi Marçal 2026-09 Senior ES.pdf" "public/cv/Jordi-Marcal-Poy-CV-ES.pdf"
```

- [ ] **Step 2: Page** — h1 `cv.title`; two download buttons (`cv.download.en` → `/cv/Jordi-Marcal-Poy-CV-EN.pdf`, `cv.download.es` → `…-ES.pdf`, `download` attr); a print button (`cv.print`) calling `window.print()`; then an on-page summary rendered from the same collections (experience entries compact + skills groups) so the page is useful as HTML too.

- [ ] **Step 3: Print CSS** (in `global.css`):

```css
@media print {
  header, footer, .no-print { display: none !important; }
  body { background: #fff; color: #000; }
  .card { border-color: #ccc; }
}
```

- [ ] **Step 4: Verify + commit** — print preview looks clean (nav/footer hidden); `git commit -m "feat: cv page with downloads and print styles"`

---

### Task 11: SEO, JSON-LD, robots.txt, llms.txt endpoints

**Files:**
- Modify: `src/components/SEO.astro` (replace stub)
- Create: `src/components/JsonLd.astro`, `src/pages/robots.txt.ts`, `src/pages/llms.txt.ts`, `src/pages/llms-full.txt.ts`

**Interfaces:**
- Produces: full meta per page; `https://jordimp.net/{robots.txt, llms.txt, llms-full.txt, sitemap-index.xml}`.

- [ ] **Step 1: `SEO.astro` (full)** — Props `{ lang, title, description, path? }`: `<title>`, description, canonical `https://jordimp.net/{lang}/{path}`; `hreflang` alternates for all 3 locales + `x-default` → `en`; OG (`og:title/description/type/url/locale:en_ES etc.`) + `twitter:card summary`; `<meta name="author" content={SITE.name}>`.

- [ ] **Step 2: `JsonLd.astro`** — `<script type="application/ld+json" set:html={JSON.stringify(schema)} />`; Person schema on home/about:

```ts
{ '@context': 'https://schema.org', '@type': 'Person', name: SITE.name,
  url: `${SITE.url}/en/`, email: `mailto:${SITE.email}`, jobTitle: SITE.role,
  sameAs: [SITE.github, SITE.linkedin],
  knowsLanguage: ['en', 'es', 'ca'],
  knowsAbout: ['Java', 'Spring Boot', 'Python', 'FastAPI', 'Apache Kafka', 'REST APIs',
    'RAG', 'LLMs', 'MCP', 'Machine Learning', 'Data Engineering'] }
```

BreadcrumbList on project detail pages (Home → Projects → name).

- [ ] **Step 3: `robots.txt.ts`**

```ts
import type { APIRoute } from 'astro';
export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: https://jordimp.net/sitemap-index.xml\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
```

- [ ] **Step 4: `llms.txt.ts` / `llms-full.txt.ts`** — build-time generated from collections (never hand-copied). `llms.txt`: H1 `# Jordi Marçal Poy — Senior Backend Engineer`, blockquote one-liner (role + tagline + trilingual note), sections: `## Featured projects` (name, one-line summary EN, link to GitHub and to page), `## Contact` (email/GitHub/LinkedIn). `llms-full.txt` adds full experience timeline and all project sheets (summary+problem+highlights EN). Generate with `getCollection` + template literals; `Content-Type: text/plain; charset=utf-8`.
- [ ] **Step 5: Verify**

```bash
npm run build && head -5 dist/robots.txt && head -12 dist/llms.txt
```

Expected: sitemap line present; llms.txt lists 5 featured projects. Commit: `feat(seo): meta/OG/hreflang, JSON-LD, robots, generated llms.txt`

---

### Task 12: GoatCounter (optional analytics)

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

**Interfaces:** env `PUBLIC_GOATCOUNTER` (site code). Absent → nothing rendered.

- [ ] **Step 1:** In BaseLayout `<head>`, after SEO:

```astro
---
const gc = import.meta.env.PUBLIC_GOATCOUNTER;
---
{gc && <script is:inline data-goatcounter={`https://${gc}.goatcounter.com/count`} async src="//gc.zgo.at/count.js" />}
```

- [ ] **Step 2:** README documents: create free GoatCounter site for `jordimp.net`, set repo ** Actions secret** `PUBLIC_GOATCOUNTER` (no code change needed).
- [ ] **Step 3: Verify** — build without env renders nothing; with env renders script. Commit: `feat: optional goatcounter analytics`

---

### Task 13: Deploy to GitHub Pages

**Files:**
- Create: `.github/workflows/deploy.yml`, `public/CNAME`
- Modify: `README.md`

**Interfaces:** produces live site at `https://jordimp.net` (needs one-time manual steps below).

- [ ] **Step 1: `public/CNAME`** — content exactly: `jordimp.net`

- [ ] **Step 2: `.github/workflows/deploy.yml`**

```yaml
name: Deploy
on:
  push: { branches: [main] }
  workflow_dispatch:
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: pages, cancel-in-progress: true }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v3
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: ${{ steps.deployment.outputs.page_url }} }
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: One-time manual (document in README, execute with the human):** create repo `jordimarsal/jordimp`, push `main`; repo Settings → Pages → Source: **GitHub Actions**; Custom domain `jordimp.net`. DNS at the registrar: `A` `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`; `CNAME` `www` → `jordimarsal.github.io.`; (later Phase 2: `A`/`CNAME` `api` → homelab IP). Enable *Enforce HTTPS* after first certificate issue.
- [ ] **Step 4: Verify** — workflow green; `curl -sI https://jordimp.net/en/ | head -3` → `HTTP/2 200`; `curl -s https://jordimp.net/robots.txt` returns sitemap line. Commit: `ci: deploy to github pages with custom domain`

---

### Task 14: E2E smoke + Lighthouse gate

**Files:**
- Create: `tests/smoke.spec.ts`, `playwright.config.ts`, `lighthouserc.json`
- Modify: `package.json` (scripts `test:e2e`, `lint:lighthouse`), `.github/workflows/deploy.yml` (run Lighthouse after deploy — optional; local gate is authoritative)

**Interfaces:** smoke covers the 3 riskiest behaviors: render, routing, i18n.

- [ ] **Step 1: Install** — `npm i -D @playwright/test @lhci/cli && npx playwright install chromium --with-deps`

- [ ] **Step 2: `tests/smoke.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test('home renders hero', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Jordi Marçal Poy');
});

test('projects index lists featured and filters', async ({ page }) => {
  await page.goto('/en/projects/');
  await expect(page.getByRole('article').first()).toContainText('kafka-adapter-telemetry');
  await page.getByRole('button', { name: 'Kafka', exact: true }).click();
  await expect(page.getByRole('article')).toHaveCount(1);
});

test('locale switch to es works', async ({ page }) => {
  await page.goto('/en/');
  await page.getByRole('link', { name: 'ES', exact: true }).click();
  await expect(page).toHaveURL(/\/es\//);
});
```

- [ ] **Step 3: `playwright.config.ts`** — `testDir: 'tests'`, `use: { baseURL: 'http://localhost:4321' }`, `webServer: { command: 'npm run preview', url: 'http://localhost:4321', reuseExistingServer: true }`.

- [ ] **Step 4: `lighthouserc.json`**

```json
{
  "ci": {
    "collect": { "staticDistDir": "dist", "numberOfRuns": 1, "url": ["http://localhost/index.html", "http://localhost/en/projects/index.html"] },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.95 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.95 }]
      }
    },
    "upload": { "target": "filesystem", "outputDir": ".lighthouseci" }
  }
}
```

Note: adjust `collect.url` to the actual generated file paths inside `dist/` (verify with `ls dist` first); static collector needs `http://localhost/...` URLs served from the dist dir — if LHCI static serving of subpaths fights the base path, pin `collect.url` to the two absolute file URLs LHCI prints during collect.

- [ ] **Step 5: Run and fix until green**

```bash
npm run build && npx playwright test
npm run lint:lighthouse   # "lhci autorun"
```

Expected: 3 smoke tests pass; LHCI assertions pass (≥95 ×4). Any failure → fix real cause (contrast, missing alt, meta) — never lower the gate without an ADR note in the commit message.

- [ ] **Step 6: Commit** — `test: e2e smoke + lighthouse ≥95 gate`

---

### Task 15: Final QA & v0.1 tag

- [ ] **Step 1: Content QA** — every JSON string triple-checked in es/ca (no EN leftovers in ES/CA pages); no phone/address anywhere (`grep -r "609" src public` → empty); all GitHub links return 200 (`for u in $(grep -roh 'https://github.com/jordimarsal/[a-z0-9_-]*' src | sort -u); do curl -so /dev/null -w "%{http_code} $u\n" "$u"; done` → all 200; 404s → apply Task 0 Step 3 fallback).
- [ ] **Step 2: Full verification** — `npm run check && npm run build && npx playwright test && npm run lint:lighthouse` all green from a clean clone (`git clone` to temp dir, `npm ci`).
- [ ] **Step 3: Release** — `git tag v0.1.0 && git push origin main --tags`; announce URLs in repo README (site, llms.txt, sitemap).

---

## Self-Review (done at plan-writing time)

- **Spec coverage (Phase 0–1):** hero/pillars/CTAs ✓ (T8), projects featured+secondary+detail ✓ (T4–7), experience/skills/about ✓ (T9), CV downloads+print ✓ (T10), SEO/robots/sitemap/OG/JSON-LD/hreflang ✓ (T11), llms.txt+llms-full.txt ✓ (T11), GoatCounter ✓ (T12), deploy+domain ✓ (T13), Lighthouse+smoke ✓ (T14), pre-work gate ✓ (T0). Design system decided here (T2 locked palette/fonts). `/live` + `/ask` pages intentionally absent → Plans 2–3.
- **Placeholders:** none — all content values, palettes, and code are concrete; es/ca translations are written by executors following the given EN text + style rules (faithful, technical terms in English), which is content work, not unnamed design.
- **Type consistency:** `Locale = 'en'|'es'|'ca'` everywhere; `L(field, lang)`; BaseLayout/SEO props identical (`{lang,title,description,path?}`); collection field names match between schema and JSON examples.
