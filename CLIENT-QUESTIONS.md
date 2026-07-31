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
- [ ] **Careers — form endpoint. BLOCKING.** The application form is built
  (name, email, phone, location, role, resume upload, privacy consent) with
  full client-side validation including the 50 MB cap. It has nowhere to POST:
  set `SITE_DATA.forms.careers` once we have an endpoint that accepts
  multipart/form-data. Until then the form falls back to opening a prefilled
  email and asking the applicant to attach the resume manually.
- [ ] **Newsletter signup.** Old site used a Gravity Form; rebuild has a
  styled section with an email CTA as a stub. What list/provider should this
  actually feed? (LeadFlow form endpoint preferred on our side.)
- [x] **Blog migration.** DONE — all 51 posts pulled off the WordPress REST
  API into the content collection, original slugs kept, featured images stored
  locally in `src/assets/images/blog/`. Per-post 301s (`/post/<slug>/` →
  `/blog/<slug>/`) plus a `/post/*` splat are in `public/_redirects`.

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
- [ ] **Privacy Policy. BLOCKING for the careers form.** The live
  `/privacy-policy/` page is the *unmodified* WordPress template — it still
  contains "Suggested text:" placeholders throughout. It was deliberately NOT
  migrated. We need real policy copy from the client; then set
  `SITE_DATA.links.privacyPolicy` and the careers consent line becomes a link
  instead of plain text.
- [ ] **Toolbox pre-order items** currently use a waitlist email link (old
  site used a Gravity Forms popup). OK, or wire to a form?

## Waiting on Roman

- [ ] **Zach German — team page.** Roman is sending name, role, bio and
  headshot. Add to the roster in `src/pages/meet-the-team.astro` (and to
  `/why-we-are-different/`, which carries its own copy of the team grid) once
  the details land.

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
- [ ] **Navy button hover contrast.** `.btn-primary:hover` fills sky-ink per
  the client's direction; white on sky-ink is ~4.0:1, just under the 4.5:1 AA
  floor for 15px text. Darkening `--color-sky-ink` to #1E7AA8 clears it —
  decide whether AA or the exact brand blue wins.
- [ ] LeadFlow → site publishing contract: confirm LeadFlow's outbound
  capabilities, then lock the endpoint spec (see BLOG-API.md as v1).
- [ ] Domain cutover plan + old-URL 301 map (especially /post/*).
