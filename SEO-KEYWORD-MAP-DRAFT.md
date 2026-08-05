# SEO Keyword Map — DRAFT v2 (revised against Search Console)

**Changed since v1.** v1 was inferred from page copy alone. This version is
rebuilt against the **12-month GSC export** (Aug 2025 – Aug 2026: 1,046 queries,
57 pages, 616k impressions, 1,883 clicks). The data contradicted several v1
proposals and killed four of the nine cannibalization conflicts outright.

**Still true:** Yoast's original focus keyphrases are unrecoverable — they live
in private WordPress post meta and the REST API doesn't expose them. But GSC
tells us what the pages *actually* rank for, which is better evidence anyway.

**Nothing is written to `seo-map.mjs` yet.** Confirm and I'll apply it.

---

## The headline finding: you have the strategy backwards

| | Clicks | Impressions |
|---|---|---|
| **Blog posts** | ~1,540 (82%) | ~571k (93%) |
| Homepage (mostly brand) | 286 | 8,868 |
| **All six service/money pages combined** | **~5** | ~5,500 |

`/construction-accountants/`, `/hvac-accounting/` and
`/accountants-for-electricians/` have **608 impressions and 0 clicks each** over
twelve months. `/pricing/` has 222 impressions, 0 clicks. The pages the site is
architected around earn nothing; five blog posts earn essentially all of it.

That doesn't mean the service pages are pointless — they're the conversion
destination. It does mean **v1's suggestion to treat the blog as secondary and
maybe skip mapping it was wrong**, and I'd retract it. The blog is the
acquisition engine and deserves the most careful targeting.

---

## 1. The five pages that actually earn — get these exactly right

| Route | Clicks | Impr. | Pos. | v1 proposed | **v2 — actual top query** |
|-------|-------:|------:|-----:|-------------|---------------------------|
| `/blog/average-profit-margin-for-electrical-contractors/` | 322 | 274,823 | 4.1 | `average profit margin for electrical contractors` | **`electrical contractor profit margin`** |
| `/blog/target-hvac-business-profit-margin/` | 120 | 148,106 | 6.0 | `hvac profit margin` | **`hvac profit margins`** (plural) |
| `/blog/construction-chart-of-accounts-2025/` | 656 | 58,694 | 6.6 | `construction chart of accounts` | **`construction chart of accounts`** ✓ confirmed |
| `/blog/construction-profit-and-loss-statement/` | 271 | 24,470 | 6.5 | `construction profit and loss statement` | **`construction profit and loss statement`** ✓ confirmed |
| `/blog/quickbooks-servicetitan-integration/` | 71 | 24,772 | 9.4 | `quickbooks servicetitan integration` | **`servicetitan quickbooks`** |

Three of five needed correcting. The singular/plural and word-order changes
matter — "hvac profit margins" alone is 5,213 impressions; the whole HVAC margin
cluster is **28,095 impressions across 22 query variants for 11 clicks**.

### The two big opportunities this exposes

**Chart of accounts is your best asset, and you just built the thing people are searching for.**
121 queries, 30,986 impressions, **242 clicks** — the largest click cluster on
the site. And the query intent is explicitly *download*:

| Query | Clicks | Impr. |
|---|---:|---:|
| construction chart of accounts | 37 | 2,079 |
| construction chart of accounts pdf | 28 | 527 |
| construction chart of accounts excel | 25 | 848 |
| chart of accounts for construction company | 17 | 1,943 |
| sample chart of accounts for construction company | 14 | 762 |
| construction chart of accounts template | 14 | 726 |

You added `Atlas-Standard-Chart-of-Accounts.xlsx` to the toolbox today. People
are searching for *exactly that file*. **Recommendation:** put the download
prominently inside the chart-of-accounts post, not just on `/toolbox/`. Same for
the Sample P&L — `construction p&l` and friends are 33 queries / 32 clicks, and
you just published a sample P&L. These two downloads land precisely on the two
best-performing content clusters on the site. That is the highest-leverage thing
in this whole document.

**A dead-CTR cluster at position 2.** 54 workers-comp queries — "typical workers
comp percentage for electrical contractors" and variants — sit at **position
~2.0 with 0 clicks** across 1,944 impressions. Same pattern on 12 payroll-burden
queries (804 impressions, position 2.0, 0 clicks). Ranking 2nd and getting no
clicks usually means the answer is being consumed in the SERP (AI Overview or
featured snippet) — plausible given the AEO focus, but worth confirming in the
GSC "Search appearance" tab. There's real demand here and no page purpose-built
for it.

---

## 2. Service pages — keywords confirmed, but the problem isn't the keyword

Demand exists; the pages just aren't competitive.

| Route | Keyword | GSC evidence |
|-------|---------|--------------|
| `/` | `accountants for contractors` | 816 impr, pos 10.9, 0 clicks — right keyword, page 2 |
| `/accountants-for-plumbers/` | `accountants for plumbers` | 287 impr, pos 7.9 + "accountant for plumbers" 161 impr |
| `/construction-accountants/` | `construction accountants` | 608 impr, no query-level signal |
| `/hvac-accounting/` | `hvac accounting` | 608 impr, no query-level signal |
| `/accountants-for-electricians/` | `accountants for electricians` | 608 impr, no query-level signal |
| `/accountants-for-solar-companies/` | `accountants for solar companies` | no data |
| `/construction-payroll/` | `construction payroll` | 1,047 impr, 3 clicks, pos 8.2 |

All keep their v1 keywords — GSC confirms the targeting is sensible.

**Unexpected: there's demand for the bookkeeping pages you didn't rebuild.**
"bookkeeping for plumbers" (302 impr, pos 29.3), "plumbing bookkeeping" (258,
pos 29.8), plus a ServiceTitan-bookkeeping mini-cluster (~750 impr). This is
evidence for building the dedicated bookkeeping pages rather than pointing those
cards at `/pricing/` — and it changes the `/bookkeeper-for-construction/` 301
decision in `CUTOVER-301-PLAN.md`.

---

## 3. Cannibalization — four of nine are dead

| ID | Verdict from GSC |
|----|------------------|
| **C1** labor calculator vs post | ❌ **Not a conflict.** Zero queries for labor cost / labor burden / cost-of-an-employee in 12 months. Neither page earns anything. Give the tool page `labor burden calculator` and stop worrying about it. |
| **C7** tax credits (3 posts) | ❌ **Not a conflict.** Zero tax-credit queries. Still 301 the superseded 2023 post, but for tidiness, not rankings. |
| **C9** HVAC cash flow (2 posts) | ❌ **Not a conflict.** Zero "hvac cash flow" queries. `/blog/profitable-hvac-cash-flow/` gets 1,625 impr / 1 click from unrelated terms. |
| **C5** KPI posts | ❌ **Not a conflict.** 18 KPI queries, 835 impr, 0 clicks, positions 47–61. Nothing to cannibalize. |
| **C8** ServiceTitan+QB (3 posts) | ✅ **Real, and now settled.** `/blog/quickbooks-servicetitan-integration/` earns 24,772 impr / 71 clicks. `/blog/servicetitan-and-quickbooks/` earns **nothing — it isn't in the export at all**. 301 it into the winner. |
| **C2** toolbox vs chart-of-accounts post | ✅ **Real, resolution changed.** The post is the strongest page on the site — it keeps `construction chart of accounts` outright. `/toolbox/` (92 impr, 0 clicks) is not a ranking page; make it navigational and surface its downloads *from* the post. |
| **C4** two bookkeeping posts | ⚠️ **Unresolved but low-stakes.** Neither appears in the top pages. Bookkeeping demand is plumbing/ServiceTitan-flavoured, which neither post targets. Retarget one at `bookkeeping for plumbers` (302 impr, pos 29) or leave both alone. |
| **C6** two construction cash-flow posts | ⚠️ **Real demand, both losing.** 27 queries / 1,439 impr / 0 clicks, positions 40–57. Merging into one strong page is more sensible than splitting keywords. |
| **C3** construction accountants (3 pages) | ✅ Unchanged — money page keeps it, other two carry no keyword. |

---

## 4. Revised recommendations

1. **Map all 51 blog posts**, not the 15 I suggested in v1. That's where the traffic is.
2. **Fix the five earning pages' keywords first** (§1) — those five are 93% of impressions.
3. **Put the toolbox downloads inside the two matching posts.** Highest-value action here.
4. **Investigate the position-2 / zero-click clusters** (workers comp, payroll burden) before writing new content — 2,700 impressions of demand with an unclear ceiling.
5. **Reconsider building the bookkeeping pages** — there's measured demand.
6. **`/toolbox/`, `/pricing/`, `/frequently-asked-questions/` → navigational.** GSC shows 92, 222 and 900 impressions with 0, 0 and 3 clicks. They convert; they don't acquire.
7. `/tax-services/` slug decision from v1 still stands — no GSC data either way (0 impressions), which is itself an argument for renaming it now while it costs nothing.

---

## 5. Caveats

- **GSC exports don't map queries to pages.** Queries and Pages are separate
  sheets with no join. Every query→page attribution above is my inference from
  topical match. High confidence on the big clusters, lower on the small ones.
- Query totals (510 clicks) are far below page totals (1,883 clicks) because
  Google anonymizes long-tail queries. The gap is normal, not an error.
- Still no search-volume or difficulty data. This is what the site *does* rank
  for, not necessarily what it *should* target.
- 12-month window includes the pre-rebuild WordPress site, so all page URLs are
  the old `/post/…` form.
