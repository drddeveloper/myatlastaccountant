export const SITE_DATA = {
  company: {
    name: "Atlas Accounting Group",
    legalLine: "Atlas Accounting Group, a Lewis Group CPAs company",
    // No public street address — the practice is remote-first and booking driven.
    address: { street: "", city: "", state: "", zip: "", full: "" },
    phone: "(360) 900-0421",
    phoneHref: "tel:3609000421",
    email: "ready@myatlasaccountant.com",
    hours: "Mon-Fri: 9am-5pm",
  },
  links: {
    url: "https://www.myatlasaccountant.com",
    bookACall: "/getting-started/",
    calendly: "https://calendly.com/atlas-group/discovery-call",
    parentCompany: "https://lewisgroupcpas.com",
    googleBusiness: "#",
    socials: { facebook: "#", instagram: "https://www.instagram.com/atlasaccountinggroup/", x: "#", youtube: "#", linkedin: "#" },
    // Legal pages. These render Termageddon-hosted policies (see LEGAL below),
    // so the copy is maintained in the Termageddon dashboard, not in this repo.
    //
    // The live WP privacy page was never migrated — it was still the unmodified
    // WordPress template, placeholders and all. These replace it (2026-08-31).
    //
    // privacyPolicy doubles as a feature flag: the careers form consent line
    // renders as plain text while it is empty.
    privacyPolicy: "/privacy-policy/",
    termsOfService: "/terms-of-service/",
    cookiePolicy: "/cookie-policy/",
  },
  forms: {
    // Careers application endpoint. Basin accepts multipart/form-data, so the
    // resume upload posts natively — no JS, no CORS. Basin is configured to
    // redirect to /thank-you/ after a successful submission.
    //
    // NOTE: the redirect in Basin currently targets the APEX
    // (myatlasaccountant.com/thank-you/). The site canonicalises to www, so
    // that costs applicants an extra redirect hop; switch it to
    // https://www.myatlasaccountant.com/thank-you/ in the Basin dashboard.
    //
    // If this is ever emptied, the form falls back to a prefilled email so
    // applicants are never left with a dead submit button.
    careers: "https://usebasin.com/f/7e241f8689e4",
    // Lead / "Schedule Free Assessment" endpoint. This replaced the Calendly
    // embed sitewide (client direction, 2026-08-12), so it is the site's only
    // conversion path — nothing else captures an enquiry.
    //
    // Supplied by the client 2026-08-13. The mailto fallback in LeadForm.astro
    // is now dormant: it only fires if this string is emptied again.
    //
    // The redirect to /thank-you/ is NOT a Basin setting — do not go looking
    // for it in the dashboard. Basin's own "Custom Redirect" is paid-plan only,
    // and left blank it shows Basin's default success page, which is exactly
    // what visitors hit on launch day (2026-08-17: submissions logged fine,
    // nobody reached /thank-you/). LeadForm.astro now POSTs over fetch and does
    // the redirect itself, so the destination lives in this repo instead.
    //
    // STILL TO CONFIRM IN THE BASIN DASHBOARD (cannot be set from this repo):
    //   Notification recipients — otherwise submissions sit in Basin unseen.
    // Verify with one real submission on production (checklist B3).
    leads: "https://usebasin.com/f/30f99ad0845a",
  },
  branding: {
    colors: {
      primary: "#003954",   // deep navy — headings, dark sections
      secondary: "#181818", // near-black — body headings, footer
      accent: "#F4832B",    // orange — CTAs, highlights
      accentLight: "#F69C55", // accent + 20% white — orange button hover fill
      sky: "#79CAE9",       // light blue — secondary accent (dark surfaces only)
      skyInk: "#1E7AA8",    // darkened sky for highlight text on light surfaces + navy button hover fill (WCAG AA)
      accentInk: "#B4540A", // darkened orange for small text/links on light surfaces (WCAG)
      inputBorder: "#8A8A8A", // control boundary for inputs/steppers — 3:1 min per WCAG 1.4.11
      cream: "#F7F5F4",     // warm off-white surface
      creamDark: "#FFEDDF", // pale peach surface
      // Neutral scale. These were in global.css's @theme but had no entry here
      // and no brand-guide swatch, so five of the site's colours were invisible
      // on the page that is meant to be the visual source of truth (A3-4).
      base100: "#FFFFFF",   // page surface
      base200: "#F7F5F4",   // subtle fill (same value as cream — inline code, chips)
      base300: "#CDCDCD",   // decorative hairline borders ONLY — 1.59:1 on white,
                            // never use as a control boundary (that is inputBorder)
      baseContent: "#454545", // default body text — 9.59:1 on white (8.82:1 on cream)
      themeColor: "#003954",
    },
    fonts: { heading: "'Sofia Pro', sans-serif", body: "'Sofia Pro', sans-serif" }
  },
  seo: {
    description: "Atlas Accounting Group is the #1 accounting firm for contractors and specialty trades — bookkeeping, payroll, and tax for construction, HVAC, electrical, plumbing, and solar businesses.",
    // Analytics moved to SITE_DATA.analytics (2026-08-12). Google tags are no
    // longer configured page-side at all — they are fired by the GTM container.
  }
};

/**
 * Analytics. Ported from the live WordPress site 2026-08-12.
 *
 * The WP site loads SEVEN tags: two GA4 properties, two GTM containers,
 * Clarity, Hotjar, and the DRD tracker — and each GA4 property is configured
 * BOTH page-side and again inside a GTM container, so both were very likely
 * counting every pageview twice. That is not reproduced here.
 *
 * The rebuild loads exactly two things:
 *   1. One GTM container, which owns every Google/Meta/Clarity tag.
 *   2. The DRD first-party tracker (see below).
 *
 * Nothing else is hardcoded, so nothing can double-fire with a container tag,
 * and tag changes no longer need a deploy.
 */
export const ANALYTICS = {
  /**
   * The single GTM container. GTM-P33FRLD2 was chosen over GTM-MQFMTT8K because
   * it already carries the richer tag set: GA4 G-696ZEHHK32, Google Ads
   * AW-16860441463, and a Meta Pixel (705778782363299).
   *
   * WHAT STILL HAS TO BE DONE IN THE GTM UI (this container does not fire them
   * yet, and nothing in this repo can add them):
   *   - GA4 config tag for G-FXS0D8YFKQ  — the second property, previously
   *     fired by Site Kit + GTM-MQFMTT8K. Client wants both properties kept,
   *     one page_view each.
   *   - Microsoft Clarity tag, project qtb32zg360 — was hand-placed in the WP
   *     theme, so it is NOT in either container.
   * Verify all of it in GTM Preview against a deploy before cutover.
   *
   * Deliberately dropped: Hotjar (site 3474959) — duplicated Clarity's job, and
   * GTM-MQFMTT8K, whose only tag (G-FXS0D8YFKQ) moves into the container above.
   */
  gtmId: "GTM-P33FRLD2",

  /**
   * Deep River Digital first-party tracker. Kept page-side rather than moved
   * into GTM: it needs `window.drdTrack` set before the script evaluates, and
   * as first-party infrastructure it should not depend on a third-party tag
   * manager loading. Move it into GTM if you'd rather manage it there — blank
   * `key` here at the same time so it can't load twice.
   *
   * `key` is a publishable client-side key (it ships in page source on the live
   * site), not a secret. It is scoped `_live_`; swap it for a staging key on
   * preview deploys if one exists.
   */
  drd: {
    endpoint: "https://track.deepriverdigital.com/ingest",
    script: "https://track.deepriverdigital.com/drd-track.js",
    key: "pk_atlas_accounting_live_23c046f8e4137417925ffc66",

    /**
     * Hostnames the tracker is allowed to run on. It is NOT loaded anywhere
     * else, because it cannot work anywhere else: track.deepriverdigital.com
     * only sends Access-Control-Allow-Origin for origins on its own allow-list,
     * so /config and /discover fail CORS on every other host and log two
     * console errors per page load. PageSpeed counts those against Best
     * Practices — that is what this list fixes (2026-08-13).
     *
     * Verified 2026-08-13 by sending each Origin to /config: the apex and www
     * are both allowed and reflected back; myatlastaccountant.pages.dev is not
     * and falls back to the apex value, which is what the browser rejects.
     *
     * So the tracker works on the production domain either way. If you want it
     * live on preview deploys too, add the pages.dev host to the allow-list on
     * the DRD server FIRST, then add it here — doing it here alone just
     * reinstates the CORS errors.
     */
    hosts: ["myatlasaccountant.com", "www.myatlasaccountant.com"],
  },
};

/**
 * Legal / privacy stack. Two vendors, one dependency between them.
 *
 * 1. TERMAGEDDON hosts the three policy documents. Each page renders an empty
 *    <div id="<embedId>"> plus a per-policy loader script; the script fires on
 *    window.load, XHRs the policy HTML from embed.termageddon.com, and drops it
 *    into the div. Nothing is prerendered.
 *
 *    CONSEQUENCE FOR SEO, know this before you rely on these pages ranking: the
 *    policy text does NOT exist in the built HTML. Only the page shell — H1,
 *    intro, and the "view the policy" fallback link — is in dist/. Google
 *    renders JavaScript so it can see the text on a second pass, but no
 *    non-rendering crawler (and no AI crawler that skips JS) ever will. That is
 *    the trade for policies that stay legally current without a deploy.
 *
 *    The embed ids are opaque, per-policy, and public — they appear in the
 *    embed code Termageddon hands out. They are not secrets.
 *
 * 2. USERCENTRICS is the CMP, bundled with the Termageddon licence, which is
 *    why its custom translations are pulled from a Termageddon CDN bucket.
 *    `settingsId` selects the configuration (banner copy, categories, legal
 *    basis, geo rules) — all of which live in the Usercentrics dashboard, not
 *    here. If the banner behaves unexpectedly, that dashboard is the place to
 *    look; this file only decides whether it loads at all.
 *
 *    Blank `settingsId` to remove the CMP from the build entirely. The footer's
 *    "Privacy Settings" control degrades to a link to the cookie policy.
 */
export const LEGAL = {
  termageddon: {
    privacy: "ZWxKVU9Hb3pOMWhtVWtGcU1FRTlQUT09",
    terms: "TWtaM1JWZ3lVR0pNY3l0RlNWRTlQUT09",
    cookies: "YW1aQ2FIUTNhbGhCYzNOUlNsRTlQUT09",
  },
  usercentrics: {
    /**
     * DISABLED 2026-09-01 (client direction). Blanking this removes the consent
     * manager from the build entirely — no banner, no blocking, no request to
     * either usercentrics.eu host. CookieConsent.astro renders nothing.
     *
     * To turn it back on, restore the id below. Nothing else needs changing:
     * the CSP origins are still in public/_headers, and the footer + cookie
     * policy controls come back with it (see CookieConsent.astro).
     *
     *   settingsId: "St1tcXPP44pggW"
     *
     * Why it went off: the banner ran opt-in for every visitor worldwide, which
     * US law does not require, and the switch to notice/opt-out for US traffic
     * (`ccpa.isActive` in the Usercentrics configuration) could not be found in
     * Termageddon's interface. The blocking banner was costing analytics and
     * Ads conversion data in the meantime. Sort the framework out with
     * Termageddon support first, then re-enable.
     */
    settingsId: "",
    /** Termageddon-supplied translation overrides for the Usercentrics UI. */
    translations: "https://termageddon.ams3.cdn.digitaloceanspaces.com/translations/",
  },
};

// Site navigation — matches the live site's flat header menu + "More" dropdown.
export const NAV = {
  main: [
    { label: "Construction", href: "/construction-accountants/" },
    { label: "HVAC", href: "/hvac-accounting/" },
    { label: "Electrical", href: "/accountants-for-electricians/" },
    { label: "Plumbing", href: "/accountants-for-plumbers/" },
    { label: "Solar", href: "/accountants-for-solar-companies/" },
    { label: "Pricing", href: "/pricing/" },
    { label: "The Team", href: "/meet-the-team/" },
    { label: "Toolbox", href: "/toolbox/" },
  ],
  more: [
    { label: "Payroll", href: "/construction-payroll/" },
    { label: "Tax", href: "/construction-tax-services/" },
    { label: "Why We're Different", href: "/why-we-are-different/" },
    { label: "Careers", href: "/careers/" },
    { label: "FAQs", href: "/frequently-asked-questions/" },
    { label: "Try Our Labor Calculator", href: "/labor-calculator/" },
    { label: "Blog", href: "/blog/" },
  ],
};

// Mobile menu structure. The flat desktop list is 16 links — too many to scan on
// a phone — so the trade, service and company pages collapse into groups and
// only the two highest-intent links stay at the top level. Call + Contact are
// pinned to the bottom of the panel (see Nav.astro).
export const MOBILE_NAV = {
  top: [
    { label: "Pricing", href: "/pricing/" },
    { label: "Toolbox", href: "/toolbox/" },
  ],
  groups: [
    {
      label: "Industries",
      items: [
        { label: "Construction", href: "/construction-accountants/" },
        { label: "HVAC", href: "/hvac-accounting/" },
        { label: "Electrical", href: "/accountants-for-electricians/" },
        { label: "Plumbing", href: "/accountants-for-plumbers/" },
        { label: "Solar", href: "/accountants-for-solar-companies/" },
      ],
    },
    {
      label: "Services",
      items: [
        { label: "Payroll", href: "/construction-payroll/" },
        { label: "Tax", href: "/construction-tax-services/" },
        { label: "Labor Calculator", href: "/labor-calculator/" },
        { label: "Profit Margin Calculator", href: "/profit-margin-calculator/" },
      ],
    },
    {
      label: "Company",
      items: [
        { label: "The Team", href: "/meet-the-team/" },
        { label: "Why We're Different", href: "/why-we-are-different/" },
        { label: "Careers", href: "/careers/" },
        { label: "FAQs", href: "/frequently-asked-questions/" },
        { label: "Blog", href: "/blog/" },
      ],
    },
  ],
};
