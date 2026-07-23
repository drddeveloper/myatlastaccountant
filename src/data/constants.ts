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
    siteCredits: "https://deepriverdigital.com",
  },
  branding: {
    colors: {
      primary: "#003954",   // deep navy — headings, dark sections
      secondary: "#181818", // near-black — body headings, footer
      accent: "#F4832B",    // orange — CTAs, highlights
      sky: "#79CAE9",       // light blue — secondary accent (dark surfaces only)
      skyInk: "#2387B8",    // darkened sky for highlight text on light surfaces (WCAG)
      accentInk: "#B4540A", // darkened orange for small text/links on light surfaces (WCAG)
      cream: "#F7F5F4",     // warm off-white surface
      creamDark: "#FFEDDF", // pale peach surface
      themeColor: "#003954",
    },
    fonts: { heading: "'Sofia Pro', sans-serif", body: "'Sofia Pro', sans-serif" }
  },
  seo: {
    description: "Atlas Accounting Group is the #1 accounting firm for contractors and specialty trades — bookkeeping, payroll, and tax for construction, HVAC, electrical, plumbing, and solar businesses.",
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
    { label: "Pricing", href: "/pricing/" },
    { label: "The Team", href: "/meet-the-team/" },
    { label: "Shop", href: "/toolbox/" },
    { label: "Blog", href: "/blog/" },
  ],
  more: [
    { label: "Payroll", href: "/construction-payroll/" },
    { label: "Tax", href: "/tax-services/" },
    { label: "Why We're Different", href: "/why-we-are-different/" },
    { label: "Careers", href: "/careers/" },
    { label: "FAQs", href: "/frequently-asked-questions/" },
    { label: "Try Our Labor Calculator", href: "/labor-calculator/" },
    { label: "Solar", href: "/accountants-for-solar-companies/" },
  ],
};
