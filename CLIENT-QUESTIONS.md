# Client Questions — Atlas Accounting Group Rebuild

Open items to review with the client after the build walkthrough. Working
checklist — check items off and note decisions inline.

## Content & editing

- [x] **Content editing / CMS.** DECIDED 2026-08-04 — no self-editing of job
  postings or blog posts at this point. All updates go through us. Revisit
  later if the volume of job postings makes it worth it.
- [ ] **Careers — form endpoint. BLOCKING.** The application form is built
  (name, email, phone, location, role, resume upload, privacy consent) with
  full client-side validation including the 50 MB cap. It has nowhere to POST:
  set `SITE_DATA.forms.careers` once we have an endpoint that accepts
  multipart/form-data. Until then the form falls back to opening a prefilled
  email and asking the applicant to attach the resume manually.
- [x] **Newsletter signup.** BUILT 2026-08-04 — wired to ActiveCampaign
  (atlasaccountantgroup.activehosted.com, form u=1/f=1). Our own markup and
  styling in `src/components/sections/NewsletterSignup.astro`; it posts
  same-origin to `functions/api/subscribe.js`, which forwards to AC's proc.php
  server-side. No AC CSS/JS on the page, no CSP change, no API key needed.
  Honeypot field for bots; works without JavaScript (falls back to a native
  POST and a 303 to /thank-you/). Validation, honeypot, method-guard and error
  paths all tested locally; the success path is NOT tested — that would put a
  real contact in the production list.
- [ ] **Newsletter — two things still open.** (a) Is double opt-in on? The
  success message currently reads "Thanks — you're signed up," which is wrong
  if AC sends a confirmation email first. (b) The AC form requires first AND
  last name; three fields on a blog-footer band will cost signups versus
  email-only. Both are one-line changes.
- [x] **Blog migration.** DONE — all 51 posts pulled off the WordPress REST
  API into the content collection, original slugs kept, featured images stored
  locally in `src/assets/images/blog/`. Per-post 301s (`/post/<slug>/` →
  `/blog/<slug>/`) plus a `/post/*` splat are in `public/_redirects`.

## Copy & attribution

- [ ] **Testimonial attribution conflict.** The same quote appears credited
  to Noah Swadener (homepage), Ryann Blake / Chimney Techniques (HVAC, trade
  pages), and the quote body itself mentions "Alysia." Which attribution is
  correct for each placement?
- [x] **"Mackenzie" references.** DONE 2026-08-04 — removed everywhere.
  Chris's bio no longer says "taking the helm from Mackenzie Gray"; the
  team-page intro reads "the Atlas team has earned its reputation"; the
  homepage and HVAC testimonial now read "[The Atlas Team] has been essential
  to my business" (square brackets = editor substitution, and have → has for
  agreement); the "Protect Your Profits" blog attribution became "As the Atlas
  team puts it" with the quote shifted from I/my to we/our.
- [x] **Electrical page typo.** FIXED 2026-08-04 — now "as if it were our own".
- [x] **"(see pricing page)"** in the construction hero. DONE 2026-08-04 —
  now links to /pricing/.

## SEO items (kept verbatim from live for parity; recommend fixing)

All fixed 2026-08-04 per client sign-off. Everything else stays verbatim
pending review.

- [x] Profit calculator `<title>` "Profit" → "Profit Margin Calculator".
- [x] Truncated meta descriptions rewritten on Pricing and Labor Calculator.
  Careers wasn't truncated after all — it was ~240 chars, well past where
  Google cuts off — so it was shortened instead.
- [x] Toolbox meta rewritten; it also described a paid store that no longer
  exists.
- [x] **Brand suffix in titles.** DECIDED 2026-08-05 — dropped on blog posts,
  kept on the homepage, service and utility pages. `og:site_name` added and the
  `WebSite` schema node already existed, so Google can still render the site
  name in results. Over-length titles 62 → 26.
- [ ] **Not changed, flagging:** the Careers page `<title>` is "Career"
  (singular) while the URL and nav both say "Careers". One-word fix, left
  alone because it wasn't on the approved list.

## Links & products

- [x] **Interim service-card links.** DECIDED 2026-08-04 — bookkeeping cards
  keep pointing at /pricing/ for now. No dedicated bookkeeping pages. Note this
  leaves the `/bookkeeper-for-construction/` 301 target still open (see
  CUTOVER-301-PLAN.md §3 row 6): /pricing/ is a weak redirect target for an
  informational query, so the card link and the redirect probably shouldn't
  match.
- [ ] **Plumbing services cards — needs a re-read.** The tracker entry was
  stale: the cards on /accountants-for-plumbers/ are already linked, to
  /pricing/, /construction-payroll/ and /tax-services/, matching every sibling
  trade page. "Point them at the plumbing page" would make them self-links on
  the page they live on. Left as-is pending confirmation.
- [x] **Kajabi.** RETIRED 2026-08-04 — no checkout links anywhere. The store,
  the prices, the Add to Cart buttons and the pre-order/waitlist cards are all
  removed from /toolbox/; every tool there is now a free download. 21 in-content Kajabi links across 10 blog posts were
  repointed to /toolbox/.
- [ ] **Privacy Policy. BLOCKING for the careers form.** The live
  `/privacy-policy/` page is the *unmodified* WordPress template — it still
  contains "Suggested text:" placeholders throughout. It was deliberately NOT
  migrated. We need real policy copy from the client; then set
  `SITE_DATA.links.privacyPolicy` and the careers consent line becomes a link
  instead of plain text.
- [x] **Toolbox pre-order items.** REMOVED 2026-08-04 — no store, no
  pre-orders.
- [x] **Toolbox file URLs.** COMPLETE 2026-08-04 — all six tools are real
  downloads from `public/downloads/`: Standard Chart of Accounts (XLSX), Sample
  P&L by Class or Project (CSV), KPI Dashboard, Profit Allocation Projector,
  Cash Flow Forecast, Labor Burden Calculator (all XLSX). The mailto fallback
  and the `SITE_DATA.links.toolboxFiles` placeholders are removed. Note the
  payload: 13 MB total, of which the Profit Allocation Projector is 7.1 MB and
  the Cash Flow Forecast 5.0 MB — fine to serve, but worth a look at whether
  those two carry embedded images or unused sheets that could be trimmed.
- [ ] **Surface the toolbox downloads inside the matching blog posts.** GSC
  says the chart-of-accounts post is the site's biggest click earner (656
  clicks) and searchers explicitly want "excel", "pdf", "template", "sample" —
  the exact file now sitting on /toolbox/. Same for the construction P&L post
  and the new Sample P&L. See SEO-KEYWORD-MAP-DRAFT.md §1.
- [x] **Sample P&L arithmetic error.** FIXED 2026-08-05 — `800 Other Expenses
  $335.00` never rolled into the subtotal, Net Other Income, or Net Income, so
  Net Income equalled Net Operating Income. Now: Total 800 = $335.00, Net Other
  Income = -$335.00, Net Income = $100,687.00 (was $101,022.00). Nothing on the
  site cited the old figure.
- [ ] **Filename typo in the source asset.** The supplied CSV was
  `SAMPLE_Golidlocks_P&L by Class or Project.csv` — the sheet content itself
  says "Goldilocks." The public download is named
  `Atlas-Sample-PL-by-Class-or-Project.csv`, so the typo isn't visible to
  visitors, but the master file should probably be corrected too.

## Waiting on Roman

- [x] **Zach German — team page.** DONE — added as Onboarding Specialist to
  both rosters (`/meet-the-team/` full bio, `/why-we-are-different/` navy
  grid), placed between Liz and Madison. Headshot converted to JPEG at
  1200×1200 to match the other portraits.

## Contact & business info

- [x] **Phone number (360) 900-0421.** CONFIRMED correct 2026-08-04. Already
  in `SITE_DATA.company.phone`; now also rendered in the footer next to the
  email address. Appears in three places site-wide: footer, mobile menu Call
  button, and the AccountingService structured data.
- [x] **Street address.** CONFIRMED 2026-08-04 — intentionally not published.
  Schema continues to omit it.
- [ ] **Calendly:** discovery-call event (calendly.com/atlas-group/
  discovery-call, 45 min) is embedded on home, getting-started, and all
  closing bands. Confirm event + duration are current.

## Agency-side (not client, tracked here so nothing is lost)

- [ ] Set `BLOG_API_KEY` + `GITHUB_TOKEN` env vars in Cloudflare Pages so
  the blog posting API goes live (steps in BLOG-API.md).
- [ ] **Run the pre-launch process.** The phased checklist system was pulled
  in from the starter repo 2026-08-04 (`PRE-LAUNCH-CHECKLIST.md` runbook +
  `checklists/pre-launch/A1–B3` + `npm run preflight`). Baseline preflight:
  **5 errors, 182 warnings, 13 passed** — see the notes below before starting
  A1, two of the errors are false positives from the starter script.
- [x] **SEO map — keywords applied.** DONE 2026-08-04, client-confirmed.
  All 72 rows of `src/data/seo-map.mjs` are filled: 54 distinct keywords, zero
  duplicates, 18 rows deliberately navigational (conversion, brand and archive
  pages plus 8 announcement/301-candidate posts, each with a reason in `notes`).
  Targets came from the 12-month GSC export, not guesswork — evidence and the
  cannibalization analysis are in SEO-KEYWORD-MAP-DRAFT.md. Preflight PF-20
  completeness and cannibalization warnings are both zero.
  **Checklist A2 is unblocked.**
- [x] **`/tax-services/` slug renamed.** DONE 2026-08-04 — now
  `/construction-tax-services/`, with `/tax-services/ → /construction-tax-services/ 301`
  in `public/_redirects`. The old slug was inherited from WordPress, so that
  rule covers the legacy URL too. Internal links updated in the nav constants
  and the HVAC / construction / electrical / plumbing service cards. PF-20's
  slug warning is cleared; title, H1 and description still don't contain the
  keyword verbatim — that's a section A2 item.
- [x] **Navy button hover contrast.** RESOLVED — `--color-sky-ink` darkened
  #2387B8 → #1E7AA8 (white-on-fill 4.02:1 → 4.77:1). AA won. The token is also
  the blue used for highlight words in headings, so those got marginally darker
  too; the brand guide swatch and `SITE_DATA.branding.colors.skyInk` are updated
  to match.
- [ ] LeadFlow → site publishing contract: confirm LeadFlow's outbound
  capabilities, then lock the endpoint spec (see BLOG-API.md as v1).
- [ ] **In-content blog images still point at WordPress. WILL BREAK AT
  CUTOVER.** Found 2026-08-04. The migration pulled featured images local but
  not images embedded in post bodies: 10 `/wp-content/uploads/…` references
  across 6 posts, rendering as 20 URLs in the built HTML. They resolve today
  only because WordPress owns that path on the live domain. The moment DNS
  moves to Cloudflare Pages they 404 and those posts show broken images. Fix is
  mechanical — download the 10 files, drop them in `src/assets/images/blog/`,
  rewrite the references. Not done: outside the approved scope this round.
  Related but separate from the general `/wp-content/uploads/*` question in
  CUTOVER-301-PLAN.md §4, which is about externally-linked images.
- [x] **Domain cutover plan + old-URL 301 map.** DRAFTED — see
  CUTOVER-301-PLAN.md. Inventory pulled from the live Yoast sitemaps
  2026-08-04: 27 pages, 51 posts, 1 category. Unambiguous rules are already in
  `public/_redirects`; five orphan pages still need a target decision, and
  `/privacy-policy/` goes 200 → 404 at cutover unless the policy copy lands.
- [ ] **Accessibility — focus indicators and button hover contrast. DONE**
  2026-08-04. Orange focus rings (2.3–2.6:1 on light surfaces) replaced with
  navy; `.btn` focus ring gained a white halo so it stays visible on the navy
  CTA bands; `--color-sky-ink` darkened to #1E7AA8 so white-on-hover clears AA;
  new `--color-input-border` token for control boundaries. Supersedes the
  "navy button hover contrast" question below — no client decision needed.
