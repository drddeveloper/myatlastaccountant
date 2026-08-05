import type { APIRoute } from 'astro';

// Generated at build time from the `site` value in astro.config.mjs,
// so the sitemap URL can never drift from the production domain.
//
// ── Content Signals (checklist A3-6, Tier 1) ────────────────────────────────
// NOT emitted yet — deliberately BLOCKED, not forgotten. The recommended
// posture for a lead-gen site is:
//
//   Content-Signal: search=yes, ai-input=yes, ai-train=no
//
// `search=yes` (be indexed) and `ai-input=yes` (be eligible for citation in AI
// answers) are settled: both serve the visibility the site exists for. But
// `ai-train` is a client business/legal decision, not ours to make, so nothing
// ships until Atlas confirms. Add the directive INSIDE the `User-agent: *`
// group below once they do. Note it expresses a preference only — Cloudflare-
// led IETF draft, no enforcement, and Google has not committed to honouring it.
// If the zone later uses Cloudflare's managed robots.txt, reconcile first:
// verify which file is authoritative before editing this one.
const robotsTxt = (sitemapURL: URL) => `User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}
`;

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL('sitemap-index.xml', site);
  return new Response(robotsTxt(sitemapURL), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
