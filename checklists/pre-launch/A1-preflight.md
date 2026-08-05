# Section A1 — Preflight & Triage ⚙️

Phase A (repo-only). Read [PRE-LAUNCH-CHECKLIST.md](../../PRE-LAUNCH-CHECKLIST.md) execution rules first. Enumerate all item IDs before starting; write your ledger to `reports/pre-launch/A1.md`.

The preflight script does the mechanical checking. Your job in this section is to **run it, fix what it flags, and re-run until clean** — not to re-derive its checks by hand.

| ID | Action | Check | How to Verify | If Failed |
|----|--------|-------|---------------|-----------|
| A1-1 | 🔧 FIX | **Preflight runs** | Run `npm run preflight`. The build must complete and the script must produce `reports/pre-launch/preflight-report.md`. Paste the summary line (n errors / n warnings) as evidence. | Fix build errors first. If the script itself crashes, report the stack trace as ❌ FAIL — do not hand-verify around it. |
| A1-2 | 🔧 FIX | **Zero placeholder content (PF-1, PF-2)** | Preflight PF-1 and PF-2 pass: no "Client Name", placeholder phone/email/address, "example.com", or lorem text anywhere in `dist/`, and `site` in `astro.config.mjs` is the production domain. | Replace placeholder values in `src/data/constants.ts`, page content, and `astro.config.mjs`. If a real value is unknown (e.g., final domain undecided), mark ⏸ BLOCKED with exactly which value is missing. |
| A1-3 | 🔧 FIX | **All mechanical ERRORs resolved (PF-3 … PF-19)** | Preflight reports 0 errors. Work through each ❌ in `preflight-report.md`; the report names the file and problem. Typical fixes: seo-map entries for new pages (PF-3), noindex prop or sitemap filter (PF-4), title/description edits (PF-6/7), trailing slashes on hrefs (PF-14), missing `noopener` (PF-15), `_headers` directives (PF-19). | Fix, re-run `npm run preflight`, repeat until 0 errors. Evidence = final clean summary line. Wording changes to titles/descriptions must additionally be flagged for human review. |
| A1-4 | 🔧⚠️ FIX WITH REVIEW | **WARNs triaged** | Every ⚠️ in the preflight report is either fixed or explicitly dispositioned in your ledger with a reason. WARNs are judgment items — description length (PF-7), missing brand assets (PF-10), missing geo (PF-17), SEO-map gaps (PF-20). | Fix what you can (e.g., set `address.geo` in `constants.ts` from the client's Google Maps listing). Asset WARNs (og-image, icons) that need client files → ⏸ BLOCKED on the deferred queue. SEO-map WARNs are handled in depth in section A2 — note the handoff, don't duplicate the work. |

> **🛑 CHECKPOINT:** Write the ledger, then run the verification pass per the runbook before starting A2.
