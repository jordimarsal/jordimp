# Tasks: front-foundation

> All tasks are complete. This feature was implemented pre-harness on
> `feat/front-phase-0-1` (plan Tasks 1–7 + env fix, each reviewed and approved);
> every task lists the commit that delivered it. Traceability: every R1–R21 is
> referenced below; commit `8aa20ef` is current HEAD.

- [x] T1: Scaffold Astro 5 site — `package.json` scripts/deps, strict `tsconfig.json`, `astro.config.mjs` (site, i18n `prefixDefaultLocale`, sitemap), `src/env.d.ts`, placeholder `src/pages/[lang]/index.astro` + root `src/pages/index.astro`
      depends_on: (none)
      refs: R1, R2, R3, R4
      commit: cf3f29b

- [x] T2: Design tokens + global styles, fonts, `BaseLayout` (inline no-flash script, slots), `ThemeToggle`, `Monogram`, `SEO` stub (stable props contract)
      depends_on: T1
      refs: R5, R6, R7, R8, R9, R20
      commit: 674428f

- [x] T3: `src/config.ts` (SITE), `src/lib/i18n.ts` (`LOCALES`/`L`/`localeNames`), trilingual `src/i18n/ui.ts` (strict `UiKey`), `LocaleSwitcher`
      depends_on: T1
      refs: R10, R11, R12
      commit: e9171db

- [x] T4: `src/content.config.ts` (projects/experience/skills schemas + `localized()`) + first featured project `kafka-adapter-telemetry.json`
      depends_on: T1
      refs: R13, R14
      commit: 5007226

- [x] T5: Featured projects `codebaserag`, `redis-toolkit`, `harness-standard`, `mcp-transparent-png`
      depends_on: T4
      refs: R14
      commit: 9c9fdf2

- [x] T6: Secondary projects `interview-simulator`, `md-mermaid-pdf`, `rustcut`, `spring-boot-casino`, `product-offers`, `bible-text-analysis`
      depends_on: T4
      refs: R14
      commit: a616252

- [x] T7: `ProjectCard`, projects index (featured/secondary sections + stack filter script), `projects/[slug]` detail pages (derived repo link text)
      depends_on: T2, T3, T4
      refs: R13, R15, R16, R17, R18, R19, R20
      commit: 037c513

- [x] T8: Verification harness (env fix) — `vitest`, `vitest.config.ts`, `src/lib/i18n.spec.ts` (5 tests: `L()` selection/fallback, ui key parity, non-empty values, phone canary), `npm test` script
      depends_on: T3
      refs: R10, R11, R21
      commit: 8aa20ef

---

Note on T8: included in F1 by spec-author judgment (ADR-7 in `design.md`). The
env-fix commit exists solely so `harness/init.sh` passes and so R10/R11 have
executable unit tests; it ships no site behavior. It maps to no plan task —
plan Tasks 1–7 map exactly to T1–T7.
