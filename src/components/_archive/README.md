# Archived components

Nothing in this folder is imported by the site. Astro only compiles what a page
actually imports, so these files add zero bytes to the build — they are kept as
working code rather than as a git-history archaeology exercise.

## CalendlyCta.astro / CalendlyEmbed.astro

Retired 2026-08-12 (client direction). Calendly was replaced sitewide by the
lead form: `src/components/sections/LeadFormCta.astro`, which wraps
`src/components/sections/LeadForm.astro`.

`CalendlyCta` is a drop-in swap for `LeadFormCta` — same band, same
`heading` / `id` props — so restoring the scheduler is a matter of moving both
files back and reverting the imports. Two things to fix if you do:

- The in-page CTAs now point at `#schedule`, not `#calendly`. Either pass
  `id="schedule"` to `CalendlyCta` or change the links back.
- `SITE_DATA.links.calendly` is still populated in `constants.ts`, so the embed
  will work as soon as it is imported again.

## FloatingAssessmentCta.astro

Retired 2026-08-15 (client direction). The desktop-only "Schedule Free
Assessment" slide-out panel was switched off sitewide and replaced by
`src/components/MobileCtaBar.astro` — a mobile sticky Call / Schedule Call bar.
Desktop now has no floating CTA at all; the header's "Book a Call" button is the
persistent desktop CTA.

If you restore it, note that the BaseLayout prop was renamed `floatingCta` →
`mobileCta` and now controls the mobile bar, so the two need separate props to
coexist. `.btn-outline-light` was added to `global.css` for this component and
is deliberately kept — it is documented on `/brand-guide/` as the dark-surface
outline button.

## LaborCalcPopup.astro

Retired 2026-08-12 (client direction). The homepage slide-in promoting the
labor calculator was removed — `FloatingAssessmentCta.astro` now occupies that
corner of the viewport on every page, and two competing slide-ins would have
collided.

The labor calculator itself is untouched: `/labor-calculator/` still ships, and
it is still linked from the "More" dropdown and the mobile menu.
