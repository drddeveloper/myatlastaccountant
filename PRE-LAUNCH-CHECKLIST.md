# Pre-Launch Checklist — Runbook 🚀

Before launching any Deep River Digital site, work through this process to ensure maximum search visibility, performance, and security.

This is the **orchestrator document**. The actual checks live in section files under [`checklists/pre-launch/`](./checklists/pre-launch/), split so each section can be executed — and verified — in a fresh agent context. Mechanical checks are handled by `npm run preflight` (a deterministic script); the section files contain only the checks that need judgment, a browser, or a live URL.

---

## Why it's structured this way

Long monolithic checklists cause silent misses: an agent samples instead of enumerating, and skipped items are invisible. This process counters that with four mechanisms:

1. **Deterministic preflight** — everything machine-checkable runs as a script with a 0% miss rate. Agents triage script output instead of re-deriving checks.
2. **One section per context** — each section file is executed by a fresh agent session/subagent that reads only that file plus the repo. Results are written to a ledger file before moving on.
3. **Evidence-or-it-didn't-happen** — every PASS must cite the command run and its output, or a file:line. A PASS without evidence is treated as unchecked.
4. **Independent verification** — after each section, a *different* agent instance audits the ledger against reality. The context that made a mistake will confirm the mistake; a fresh one won't.

---

## Phases

**Phase A — repo-only.** Runnable any time, no deployment needed.

| Section | File | Covers |
|---------|------|--------|
| A1 | [A1-preflight.md](./checklists/pre-launch/A1-preflight.md) | Run + triage the mechanical preflight (placeholders, meta, links, headers, schema, sitemap/noindex, manifest) |
| A2 | [A2-seo-alignment.md](./checklists/pre-launch/A2-seo-alignment.md) | SEO map completeness, per-page keyword alignment matrix, cannibalization |
| A3 | [A3-content-schema-a11y.md](./checklists/pre-launch/A3-content-schema-a11y.md) | Alt-text quality, per-page schema types, image optimization, brand guide page, llms.txt content, AI readiness |
| A4 | [A4-security-config.md](./checklists/pre-launch/A4-security-config.md) | Secrets, dependency audit, exposed files, git history, CSP scope, analytics config |

**Phase B — live URL required.** Runs after deploy to staging/production.

| Section | File | Covers |
|---------|------|--------|
| B1 | [B1-domain-delivery.md](./checklists/pre-launch/B1-domain-delivery.md) | DNS, www→apex redirect, SSL/mixed content, live headers, live 404, redirects |
| B2 | [B2-live-validation.md](./checklists/pre-launch/B2-live-validation.md) | Social preview debuggers, Rich Results test, agent-readiness scan, GA real-time, Search Console, NAP vs. GBP |
| B3 | [B3-forms-performance.md](./checklists/pre-launch/B3-forms-performance.md) | Form submissions, CTA click-through, Lighthouse, responsive breakpoints |

Run A1 → A2 → A3 → A4, deploy, then B1 → B2 → B3. Phase A can be re-run after any fix; A1 (the preflight) is cheap — re-run it after **every** code change made during the process.

---

## Execution rules (for the AI agent)

These rules apply to every section. Each section file repeats the ones specific to it.

1. **One section per context.** Execute exactly one section file, then stop. The orchestrating human (or agent) starts a fresh context for the next section. Do not read ahead into other sections.
2. **Enumerate first.** Before checking anything, list every item ID in the section (e.g., "A3 contains A3-1 … A3-6"). Your final ledger must contain one row per ID — a missing row is a process failure.
3. **Evidence required for PASS.** Every ✅ PASS must include the exact command run and relevant output, or a file:line reference. No evidence → status must be ❓ UNCHECKED, never PASS.
4. **Statuses:** ✅ PASS · ❌ FAIL · 🔧 FIXED (was FAIL, agent fixed, re-verified — show the re-verification) · ⚠️ WARNING (passes but needs attention) · ⏸ BLOCKED (cannot be checked yet — state exactly what is missing, e.g. "staging URL not deployed", "client has not provided og-image.jpg") · ❓ UNCHECKED (ran out of ability to verify — explain).
5. **Fix-then-verify.** Items tagged 🔧 FIX: fix autonomously, re-run the verification, report FIXED with evidence. Items tagged 🔧⚠️ FIX WITH REVIEW: fix, flag for human sign-off. Items tagged 👁️ VERIFY ONLY: never modify anything; report.
6. **Write the ledger.** Save results to `reports/pre-launch/<section>.md` (e.g. `reports/pre-launch/A2.md`) using the ledger format below. The ledger is the handoff artifact — the next context reads it, you won't be there to explain.
7. **BLOCKED items go on the deferred queue.** Append them to `reports/pre-launch/deferred.md` with what unblocks them. Phase B sections and the final review MUST consume this file — a deferred item that never resurfaces is a miss.

### Ledger format

```markdown
# Section <ID> — <name>
Date: <date> · Agent: <model/tool> · Items: <n> of <n> reported

| ID | Status | Evidence / Detail |
|----|--------|-------------------|
| A2-1 | ✅ PASS | `npm run preflight` → PF-20 no completeness warnings (output pasted below) |
| A2-2 | 🔧 FIXED | title of /services/ rewritten; re-ran preflight → PF-6 PASS |
...

## Evidence appendix
<pasted command outputs>
```

### Verification pass (after every section)

Start a **fresh agent context** with only this instruction:

> Read `reports/pre-launch/<section>.md` and the section file it corresponds to. (1) Confirm every item ID in the section file appears in the ledger. (2) For every FIXED item, re-run its verification from scratch and confirm. (3) Pick 2 PASS items at random and re-run their evidence commands; confirm the output matches. (4) Append a `## Verified` block to the ledger with your findings, or change statuses you could not reproduce to ❓ UNCHECKED with a note.

A section is complete only when its ledger carries a `## Verified` block.

---

## Final report

After B3's verification, a final context compiles `reports/pre-launch/FINAL.md` from all ledgers:

```markdown
# 🚀 Pre-Launch Report: [Site Name]
**Date:** [Date] · **Compiled from:** A1–A4, B1–B3 ledgers

## Results
- ✅ Passed: [n] · 🔧 Fixed: [n] · ⚠️ Warnings: [n] · ❌ Failed: [n] · ⏸ Still blocked: [n]

## Deferred queue status
[Every item from deferred.md, each marked resolved or still open — none may be silently absent]

## 🔧 Fixes applied (review recommended)
[ID — what changed and why]

## ❌ Requires human action
[ID — issue and recommended fix]

## Launch recommendation
- [ ] CLEAR FOR LAUNCH — all items passed or fixed
- [ ] LAUNCH AFTER REVIEW — agent fixes need human sign-off
- [ ] DO NOT LAUNCH — critical issues open
```

---

## Companion documents

- **`npm run preflight`** — the mechanical check suite ([scripts/preflight.mjs](./scripts/preflight.mjs)). Writes `reports/pre-launch/preflight-report.md` and `seo-matrix.md`.
- **[src/data/seo-map.mjs](./src/data/seo-map.mjs)** — the per-page keyword/metadata plan. Authored during onboarding (see [ONBOARDING.md](./ONBOARDING.md) §4), consumed by the sitemap filter and preflight.
- **[SECURITY_CHECKS.md](./SECURITY_CHECKS.md)** — Tier-A security reference for every project. [SECURITY_CHECKS_BACKEND.md](./SECURITY_CHECKS_BACKEND.md) for payment forms, headless WP, SSR + auth, or paid APIs.
- **[AI-READINESS-PRE-LAUNCH-CHECKLIST.md](./AI-READINESS-PRE-LAUNCH-CHECKLIST.md)** — companion tiers for AI/agent readiness, driven from section A3.
