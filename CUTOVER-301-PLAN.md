# Domain Cutover & 301 Plan — Atlas Accounting Group

Companion to [DEPLOY.md](./DEPLOY.md). Covers the WordPress → Astro switchover on
`www.myatlasaccountant.com` and the complete old-URL → new-URL map.

**URL inventory verified 2026-08-04** by pulling the live WordPress sitemaps
(`/sitemap_index.xml` → `post-sitemap.xml`, `page-sitemap.xml`,
`category-sitemap.xml`) and probing each URL for status + `<title>`. Re-run the
audit in `## Re-running the inventory` before cutover — WordPress may have gained
or lost pages since.

---

## 1. What the live site currently is

| Property | Value | Matches the rebuild? |
|---|---|---|
| Canonical host | `www.myatlasaccountant.com` (apex 301s to www, http 301s to https) | Yes — `site` in `astro.config.mjs` |
| Trailing slash | Always (`/pricing` 301s to `/pricing/`) | Yes — `trailingSlash: 'always'` |
| Sitemap | `/sitemap_index.xml` (Yoast) | **No** — Astro emits `/sitemap-index.xml` (hyphen) |
| robots.txt | `Crawl-delay: 10`, `Disallow: /wp-admin/` | New file drops both; correct for a static site |
| RSS | `/feed/` returns 200 | **No feed in the rebuild** — see §4 |
| Indexed URLs | 27 pages + 51 posts + 1 category + `/blog/` | See §3 |

**Content parity is good.** All 51 published posts are migrated with their
original slugs, and 17 of the 27 old pages exist at identical paths in the
rebuild. The redirect surface is therefore small — 10 orphan pages plus WordPress
infrastructure URLs.

---

## 2. Already in `public/_redirects` — no action

These are live in the repo today and verified against the old sitemap:

- `/bookeeping-for-electricians/` → `/accountants-for-electricians/` (misspelled legacy slug)
- `/hvac-bookkeeping/` → `/hvac-accounting/`
- `/hvac-payroll/` → `/construction-payroll/`
- 51 explicit `/post/<slug>/` → `/blog/<slug>/` rules, plus a `/post/*` splat

Paths that need **no** redirect because they're identical old→new:
`/`, `/accountants-for-electricians/`, `/accountants-for-plumbers/`,
`/accountants-for-solar-companies/`, `/blog/`, `/careers/`,
`/construction-accountants/`, `/construction-payroll/`,
`/frequently-asked-questions/`, `/getting-started/`, `/hvac-accounting/`,
`/labor-calculator/`, `/meet-the-team/`, `/pricing/`,
`/profit-margin-calculator/`, `/thank-you/`, `/toolbox/`,
`/why-we-are-different/`.

---

## 3. Orphan pages — the actual 301 map

Ten old pages have no counterpart in the rebuild. Targets below are proposals;
the four marked **DECIDE** need a call before they go in.

| # | Old URL | Old page title | Proposed target | Status |
|---|---|---|---|---|
| 1 | `/atlas-accounting-group-difference/` | "We're Different Construction Accountants" | `/why-we-are-different/` | Applied — same page, renamed slug |
| 2 | `/conference/` | "Getting Started - Conference" | `/getting-started/` | Applied — event variant of getting-started |
| 3 | `/post/category/post/` | category archive | `/blog/` | Applied |
| 4 | `/author/*` | author archive (already 301s on WP) | `/blog/` | Applied |
| 5 | `/sitemap_index.xml` | Yoast sitemap | `/sitemap-index.xml` | Applied — GSC has the underscore version submitted |
| 5b | `/tax-services/` | "Strategic Tax Services for Construction" | `/construction-tax-services/` | Applied — slug renamed pre-launch so it carries the keyword |
| 6 | `/bookkeeper-for-construction/` | "Find a Bookkeeper For Construction" | `/construction-accountants/` | **DECIDE** |
| 7 | `/advisory-events/` | "Advisory Workshops" | `/toolbox/` | **DECIDE** |
| 8 | `/free-diagnostic/` | "Holiday Special" | `/getting-started/` | **DECIDE** |
| 9 | `/newsletter/` | "Sign Up for Construction Newsletter" | `/blog/` (interim) | **DECIDE** — blocked on the newsletter provider |
| 10 | `/untitled/` | "Untitled" | *(none — let it 404)* | **DECIDE** |
| 11 | `/privacy-policy/` | "Privacy Policy" | *(none — page must exist)* | **BLOCKING** |

### Notes on the DECIDE rows

**6 — `/bookkeeper-for-construction/`.** This is the strongest of the orphans
topically: a dedicated bookkeeping landing page that the rebuild didn't
reproduce. `/construction-accountants/` is the closest topical match and is where
the equity should flow. Note this conflicts with the interim UI decision in
CLIENT-QUESTIONS.md, where bookkeeping service cards point at `/pricing/` — a
pricing page is a poor 301 target for an informational query, so the redirect and
the card link should differ. Better outcome: rebuild the bookkeeping pages and
redirect 1:1.

**7 — `/advisory-events/`.** "Advisory Workshops." Nothing in the rebuild covers
events. `/toolbox/` is the closest (it houses the advisory products), but if
workshops are discontinued, `/getting-started/` is the more honest target. If
they're returning, build the page instead of redirecting.

**8 — `/free-diagnostic/`.** Titled "Holiday Special," so it's a seasonal offer
page wearing a permanent slug. The free diagnostic is step 2 of the process on
`/why-we-are-different/`; `/getting-started/` is where the conversion happens.
Pick based on which one the inbound links point at.

**9 — `/newsletter/`.** No newsletter page exists in the rebuild — only a styled
stub section. Until the list provider is chosen (open item in
CLIENT-QUESTIONS.md), any target is a guess. `/blog/` is the least-bad interim.

**10 — `/untitled/`.** A junk page that WordPress published and Yoast indexed.
**Do not redirect it to the homepage** — mass-redirecting irrelevant URLs to `/`
is read as a soft 404 and dilutes nothing useful. Let it 404 so it drops out of
the index naturally. Optionally request removal in Search Console.

**11 — `/privacy-policy/`.** Returns 200 today and was deliberately not migrated
because the live page is the unmodified WordPress template (it still contains
"Suggested text:" placeholders). At cutover this URL goes from 200 to 404 — a
regression on a page type that regulators, ad platforms, and the careers form all
expect to exist. **This must be resolved before cutover, not redirected away.**
It is already tracked as blocking in CLIENT-QUESTIONS.md.

---

## 3b. What the Search Console export changed (added 2026-08-04)

The 12-month GSC page export was run — the step §6 flagged as the one that
catches URLs Yoast never put in a sitemap. It caught four things.

**Two legacy post slugs the sitemap audit could not have found.** Both still
earn impressions and neither exists in the migrated content, so the `/post/*`
splat would have rewritten them to a `/blog/<old-slug>/` that 404s. Now
explicitly redirected **above** the splat:

| Old URL | Impr. | Pos. | Target |
|---|---:|---:|---|
| `/post/what-is-your-target-hvac-business-profit-margin-2025-02-18` | 26 | 1.0 | `/blog/target-hvac-business-profit-margin/` |
| `/post/quickbooks-contractor-invoices` | 16 | 6.5 | `/blog/contractor-invoices-types-quickbooks-simplifies-the-process/` |

**Advisory event sub-pages.** `/advisory-events/{may,june,september,november}`
are indexed; only the parent was in the WP sitemap. A `/advisory-events/*` rule
now catches the children. The parent's target is still the open decision in §3
row 7 — change both together.

**Trailing-slash duplicates are already indexed. ⚠️ Verify in B1-6.** GSC shows
the *same post* indexed at both `/post/<slug>` and `/post/<slug>/`, splitting
impressions across two URLs:

| Post | With slash | Without slash |
|---|---:|---:|
| average-profit-margin-for-construction-companies | 17,982 | 27,893 |
| quickbooks-servicetitan-integration | 7,038 | 24,772 |
| construction-chart-of-accounts-2025 | 58,694 | 2,133 |
| target-hvac-business-profit-margin | 148,106 | 2,320 |

The 51 explicit rules all carry a trailing slash on the source, so a request for
`/post/<slug>` (no slash) falls through to the splat, which produces
`/blog/<slug>` — also without a slash — and Cloudflare then issues a *second*
redirect to add it. **That is a redirect chain, which B1-6 requires be a single
hop.** Options: add a placeholder rule `/post/:slug /blog/:slug/ 301` above the
splat (Cloudflare Pages placeholder syntax — needs testing on a preview deploy,
I could not verify it locally), or duplicate the 51 rules without the source
slash. Test on the `*.pages.dev` preview before cutover.

**`/wp-content/uploads/*` is confirmed live in Google Images**, not theoretical
— four image URLs appear in the export with impressions. Small (≈20 impressions
total) but it settles the §4 question: preserving the uploads directory has
measurable, if minor, value.

---

## 4. WordPress infrastructure URLs

| Old URL pattern | What happens after cutover | Recommendation |
|---|---|---|
| `/feed/`, `/blog/feed/`, `/post/<slug>/feed/` | 404 | Add `@astrojs/rss` and emit `/rss.xml`, then 301 `/feed/` → `/rss.xml`. If no feed is wanted, 301 `/feed/` → `/blog/`. Decide — a 404 on a feed that subscribers or aggregators still poll is worse than either. |
| `/post/<slug>/feed/` via the existing `/post/*` splat | Rewrites to `/blog/<slug>/feed/`, which 404s | Add an explicit `/post/*/feed/` rule **above** the splat |
| `/wp-json/*`, `/wp-admin/*`, `/xmlrpc.php`, `/wp-login.php` | 404 | Leave. These disappearing is a security win, not an SEO loss. |
| `/wp-content/uploads/*` | 404 | **Assess before cutover.** Blog featured images were re-hosted into `src/assets/images/blog/` under Astro's hashed filenames, so a 1:1 map isn't practical. If Google Images traffic or external hotlinks matter, copy the uploads directory into `public/wp-content/uploads/` verbatim so the old image URLs keep resolving. Otherwise accept the loss. |
| `/?p=<id>`, `/?page_id=<id>` | Ignored by `_redirects` (query strings aren't matched) | Low value — WordPress already canonicalises these to the pretty permalink, so they carry little standalone equity. Skip unless GSC shows impressions on them. |

---

## 5. Ready-to-paste `_redirects` block

Append below the existing `/post/*` splat **except** the `/post/*/feed/` rule,
which must go **above** it — Cloudflare Pages matches top to bottom and the first
match wins.

```text
# ── Pages consolidated in the rebuild (verified against the WP sitemap 2026-08-04)
/atlas-accounting-group-difference/  /why-we-are-different/     301
/conference/                         /getting-started/          301

# ── Archives & feeds
/post/category/post/                 /blog/                     301
/category/*                          /blog/                     301
/author/*                            /blog/                     301

# ── Yoast sitemap URL submitted in Search Console (underscore → hyphen)
/sitemap_index.xml                   /sitemap-index.xml         301

# ── DECIDE: targets need sign-off (see CUTOVER-301-PLAN.md §3)
# /bookkeeper-for-construction/      /construction-accountants/ 301
# /advisory-events/                  /toolbox/                  301
# /free-diagnostic/                  /getting-started/          301
# /newsletter/                       /blog/                     301

# ── DECIDE: feed handling (see §4). This rule must sit ABOVE the /post/* splat.
# /post/*/feed/                      /blog/                     301
# /feed/                             /rss.xml                   301
```

---

## 6. Cutover sequence

**Pre-flight (before touching DNS)**

1. Resolve the two blockers: privacy policy copy, careers form endpoint.
2. Re-run the URL inventory (§7) and diff against this document.
3. Export **Search Console → Performance → Pages**, last 12 months. Any URL with
   impressions that isn't in §2 or §3 is a gap in this map. This is the one step
   that catches URLs Yoast never put in a sitemap.
4. Export **Search Console → Links → Top linked pages**. Confirm every
   externally-linked URL has a target.
5. Confirm `site` in `astro.config.mjs` is the production domain (it already is).
6. Decide whether `/brand-guide/` should be public — it is currently in the
   generated sitemap with no `noindex`. It is an internal reference page and
   probably should not be indexed.
7. Set `BLOG_API_KEY` and `GITHUB_TOKEN` in Cloudflare Pages (see BLOG-API.md).
8. Set `SITE_DATA.seo.googleAnalyticsId` — analytics is silently disabled while
   it is empty, so cutover traffic would be invisible.
9. Deploy to the `*.pages.dev` preview and crawl it (Screaming Frog, free tier
   covers 500 URLs — the site is ~73). Zero 404s, zero redirect chains.

**Cutover**

10. Take a full WordPress backup — database and `wp-content/uploads/`. Do not
    decommission the host until step 14 is clean; the uploads directory is the
    only copy of any image not migrated.
11. Point DNS at Cloudflare Pages. Keep TTL low (300s) for 24h beforehand so a
    rollback is fast.
12. Add the custom domain in Pages; confirm the certificate provisions and that
    the apex → www redirect still holds at the Cloudflare level (WordPress was
    doing this before; it must not be lost).

**Post-cutover, day 0**

13. Verify by hand: apex → www, http → https, `/pricing` → `/pricing/`,
    three `/post/<slug>/` redirects, and the §3 rows.
14. Re-crawl the live domain. Every 301 must be a single hop — no chains.
15. Submit `https://www.myatlasaccountant.com/sitemap-index.xml` in Search
    Console. Leave the old sitemap submitted too; it now 301s to the new one and
    that is how Google discovers the redirects fastest.
16. Use the URL Inspection tool on the homepage and 2–3 orphan redirects to
    force early recrawl.

**Weeks 1–4**

17. Watch **Coverage → Not found (404)** weekly. Anything appearing there is a
    URL this map missed — add a rule and note it here.
18. Watch **Performance** for per-page impression drops. A 10–20% dip for 2–4
    weeks after a full-site migration is normal; a sustained drop past 6 weeks
    is not.
19. Once 404s are quiet for 30 days, decommission the WordPress host.

---

## 7. Re-running the inventory

The live WordPress sitemaps and REST API are both public and unauthenticated:

```bash
# Every indexed URL, by type
for s in post page category; do
  curl -s "https://www.myatlasaccountant.com/$s-sitemap.xml" \
    | grep -o '<loc>[^<]*</loc>' | sed -E 's|</?loc>||g'
done > old-urls.txt

# Diff old post slugs against what the rebuild actually ships
find dist/blog -maxdepth 1 -mindepth 1 -type d -exec basename {} \; | sort > new-slugs.txt
```

The REST API (`/wp-json/wp/v2/pages?per_page=100`) also returns drafts-excluded
page records with IDs, which is the only way to build a `/?page_id=<id>` map if
GSC shows those URLs earn impressions.

---

## Open decisions blocking a complete map

1. Privacy policy copy — **blocking cutover**, not just the redirect map.
2. Targets for rows 6–10 in §3.
3. RSS feed: build one, or redirect `/feed/` to `/blog/`.
4. `/wp-content/uploads/` — preserve verbatim under `public/`, or accept 404s.
5. Whether `/brand-guide/` stays indexable.
