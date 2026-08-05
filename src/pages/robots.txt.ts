import type { APIRoute } from 'astro';

// Generated at build time from the `site` value in astro.config.mjs,
// so the sitemap URL can never drift from the production domain.
//
// ── Content Signals (checklist A3-6, Tier 1) ────────────────────────────────
// Client decision, 2026-08-05: AI access AND training are both allowed.
//
//   search=yes     be indexed by search engines
//   ai-input=yes   be eligible for citation in AI answers (the AEO play)
//   ai-train=yes   allow use as model training data
//
// This expresses a preference only — it is a Cloudflare-led IETF draft with no
// enforcement mechanism, and Google has not committed to honouring it. It sits
// inside the `User-agent: *` group because that is where the draft scopes it.
//
// If this zone later uses Cloudflare's managed robots.txt, reconcile before
// editing: verify which file is actually authoritative first.
const robotsTxt = (sitemapURL: URL) => `User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=yes
Allow: /

Sitemap: ${sitemapURL.href}
`;

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL('sitemap-index.xml', site);
  return new Response(robotsTxt(sitemapURL), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
