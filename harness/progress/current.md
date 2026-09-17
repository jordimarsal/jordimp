# Current session

> This file is cleared on session close and moved to `history.md`.
> Keep it updated in real time while you work — not at the end.

- **Feature in progress:** F4 deploy — local part done + review APPROVED; **BLOCKED ON HUMAN ACTIVATION (T5–T6)**
- **Started:** 2026-09-17
- **Agent:** leader (opencode session)

## State

- F1 front-foundation: **done**. F2 site-pages: **done**. F3 seo-analytics: **done**.
- F4 deploy: implemented local part (T1–T4, commits 5a7ae66..1cdd141: public/CNAME, .github/workflows/deploy.yml SHA-pinned, docs/deploy-dns-checklist.md, verificació) + review **APPROVED** (0382607; SHAs re-resolvats 5/5 amb ls-remote, checklist contrastat amb docs oficials GitHub, 0 canvis). Traçabilitat 18/18: R1–R14 done, R15–R18 blocked-human. Leader committed harness flow state (c7a6e1e).
- **BLOCKER: human activation.** The human must execute docs/deploy-dns-checklist.md: (0) GitHub repo + merge feat/front-phase-0-1 → main + push, observe Actions green; (1) registrar DNS (4×A apex, www CNAME → jordimarsal.github.io, TXT opcional verificació); (2) Pages settings (Source: GitHub Actions, custom domain jordimp.net, DNS check, Enforce HTTPS — cert Let's Encrypt automàtic, res de comprar); (3) curl suite R15–R18; (4) record outputs in harness/progress/impl_deploy.md.

## Log

- 2026-09-17: F4 review APPROVED (0382607). Human asked what manual work deploy needs; answered: no external cert (GitHub auto Let's Encrypt), target is GitHub Pages, needs GitHub account+repo+push, DNS at registrar + Pages settings. Checklist doc delivered (docs/deploy-dns-checklist.md). Leader committed flow state (c7a6e1e).
- 2026-09-17: F4 implementer T1–T4 done (5a7ae66..1cdd141), gates green, traceability 14/18 + 4 blocked-human.
- 2026-09-17: F4 spec approved ("aprovo") → in_progress, Wekan 4SWGETasGm75ZjZ2A → in_progress.
- 2026-09-17: F3 closure (see history.md).
- Pending human decision (carried over): uncommitted deletion of `opencode.json` in working tree (pre-existing, prior session pause).

## Next step

_If the session is interrupted, this is what the next session should do first._

- Wait for the human to complete docs/deploy-dns-checklist.md (T5/T6). When they report the curl suite results: record them in impl_deploy.md (R15–R18 → done), flip F4 → done in feature_list.json, Wekan 4SWGETasGm75ZjZ2A → done list (HxgNZMSLNDNyHC8LM), archive to history.md. Then spec-author for F5 qa-gate.
