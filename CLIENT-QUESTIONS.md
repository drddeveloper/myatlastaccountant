# Client Questions — Atlas Accounting Group Rebuild

Open items to review with the client after the build walkthrough. Working
checklist — check items off and note decisions inline.

## Content & editing

- [ ] **Content editing / CMS.** Does the Atlas team want to edit content
  themselves (job postings, blog posts, team bios), or will all updates go
  through us? Proposal: add a lightweight editing UI (git-based CMS, email
  login, no technical knowledge needed) for Job Postings + Blog Posts as the
  pilot for our standard setup. Job postings would become add/close-a-job
  from a simple form; publishes in ~2 minutes.
- [ ] **Careers — resume submissions.** The old site had an upload form
  (50 MB). The rebuild currently uses email links (`ready@`) with prefilled
  subjects. Do they want a real application form with file upload? (Needs a
  form/storage service or LeadFlow — files can't be private on the static
  site itself.)
- [ ] **Newsletter signup.** Old site used a Gravity Form; rebuild has a
  styled section with an email CTA as a stub. What list/provider should this
  actually feed? (LeadFlow form endpoint preferred on our side.)
- [ ] **Blog migration.** ~60–70 posts live at `/post/<slug>/` on the old
  site. Migrate all, a selection, or none? (Old URLs need 301s either way —
  significant SEO equity at stake.)

## Copy & attribution

- [ ] **Testimonial attribution conflict.** The same quote appears credited
  to Noah Swadener (homepage), Ryann Blake / Chimney Techniques (HVAC, trade
  pages), and the quote body itself mentions "Alysia." Which attribution is
  correct for each placement?
- [ ] **"Mackenzie" references.** Live copy still references Mackenzie
  (team-page intro, homepage testimonial) although she's no longer on the
  team page. Keep or update?
- [ ] **Electrical page typo kept verbatim:** "as it if it were our own" —
  confirm we should fix at source.
- [ ] **"(see pricing page)"** in the construction hero is plain text on the
  live site — should it link to /pricing/?

## SEO items (kept verbatim from live for parity; recommend fixing)

- [ ] Profit calculator page `<title>` is just "Profit" — recommend
  "Profit Margin Calculator".
- [ ] Truncated meta descriptions on Pricing ("…exactly how much"), Labor
  Calculator ("…benefits, and"), Careers ("…what they do. If").
- [ ] Toolbox meta description is a run-on auto-excerpt — recommend rewrite.

## Links & products

- [ ] **Interim service-card links.** Bookkeeping cards point to /pricing/
  because the old bookkeeping subpages (/hvac-bookkeeping/, /bookkeeper-for-
  construction/, etc.) weren't rebuilt. Build dedicated bookkeeping pages,
  or keep the interim targets?
- [ ] **Plumbing services cards** are unlinked (matching live, where the
  link is broken/hidden). Should they link anywhere?
- [ ] **Kajabi checkout slug** for the Profit Allocation Projector points at
  "kpi-dashboard-1…" — looks copy-pasted from the KPI Dashboard product.
  Confirm the correct checkout URL.
- [ ] **Toolbox pre-order items** currently use a waitlist email link (old
  site used a Gravity Forms popup). OK, or wire to a form?

## Contact & business info

- [ ] **Phone number (360) 900-0421** appeared only on the old
  getting-started page; the rebuild now uses it in the mobile menu Call
  button and structured data. Confirm it's the right public number — and
  should it appear in the footer/header too?
- [ ] **Street address:** none published anywhere (schema omits it).
  Confirm that's intentional (remote-first).
- [ ] **Calendly:** discovery-call event (calendly.com/atlas-group/
  discovery-call, 45 min) is embedded on home, getting-started, and all
  closing bands. Confirm event + duration are current.

## Agency-side (not client, tracked here so nothing is lost)

- [ ] Set `BLOG_API_KEY` + `GITHUB_TOKEN` env vars in Cloudflare Pages so
  the blog posting API goes live (steps in BLOG-API.md).
- [ ] LeadFlow → site publishing contract: confirm LeadFlow's outbound
  capabilities, then lock the endpoint spec (see BLOG-API.md as v1).
- [ ] Domain cutover plan + old-URL 301 map (especially /post/*).
