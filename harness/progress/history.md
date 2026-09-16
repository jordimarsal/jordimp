# Historical log (append-only)

> Each time a session closes, its summary is appended here.
> Do not edit previous entries. Only append.

## F1 front-foundation — done (2026-09-16)

- Scope: Astro 5 scaffold i18n en/es/ca, design tokens (dark/light, teal accent), BaseLayout/ThemeToggle/Monogram, LocaleSwitcher, typed trilingual content collections (11 projectes: 5 destacats), projects index amb filtre per stack + 33 pàgines de detall, CV-ready SEO stub.
- Commits: cf3f29b..531ed92 (+ 8c14322, 253057e, 380b2e5, 45b05f9 de traçabilitat/audit).
- Gates: spec aprovada (humà) · traceability 21/21 PASS · vitest 11/11 · build 39 pàgines · init.sh [OK] · audit strict amb waiver astro-crític (re-gate a F5).
- Rulings: ThemeToggle cablejat a BaseLayout (R9); check-traceability.py estès a specs col·localitzats TS; overrides sharp/esbuild; Astro^5 pin (upgrade v7 a F5/Phase 4).
- Review: APPROVED (ronda 2) — harness/progress/review_front-foundation.md.
