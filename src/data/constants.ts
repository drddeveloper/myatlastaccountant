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
    // Privacy Policy. The live WP page is still the unmodified WordPress
    // template (it literally contains "Suggested text:" placeholders), so it was
    // NOT migrated. Set this once the client supplies real policy copy — the
    // careers form consent line renders as plain text while it's empty.
    privacyPolicy: "",
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
    // GA4 Measurement ID ("G-XXXXXXXXXX"). PENDING — not yet supplied by the team;
    // this is NOT a decision to decline analytics. While empty, BaseLayout.astro
    // renders no gtag script at all (see its `{SITE_DATA.seo.googleAnalyticsId && …}`
    // guard), so the site ships with zero analytics. Set this before launch, then
    // confirm real-time hits in checklist section B2. Tracked as A4-6.
    googleAnalyticsId: ""
  }
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
