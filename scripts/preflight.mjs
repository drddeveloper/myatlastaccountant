/**
 * Pre-launch preflight — deterministic checks over the built site (dist/).
 *
 * ⚠️ LOCAL PATCHES — this copy diverges from drd-astro-starter (2026-08-04).
 * Four checks produced false positives on this project. Each fix is marked
 * `PATCH:` inline below. Fold them back into the starter when convenient;
 * until then, re-pulling preflight.mjs from the starter will REVERT them.
 *
 *   PF-13  bare `alt` attribute (valid HTML5 empty alt) was read as missing
 *   PF-16  editorial tel:/mailto: in blog copy was read as a stale site contact
 *   PF-16  mailto: with ?subject=/&body= compared the query string too
 *   PF-17  LocalBusiness subtypes (AccountingService, …) were rejected
 *   PF-17  a deliberately unpublished address was a hard error
 *
 * Run `npm run preflight` (builds first, then runs this). Everything here is
 * mechanical: it either passes or it doesn't, no judgment required. Judgment
 * items (wording quality, alt-text accuracy, visual checks) live in the
 * PRE-LAUNCH-CHECKLIST.md sections and are handled by a human or agent.
 *
 * Outputs:
 *  - console summary (exit code 1 if any ERROR)
 *  - reports/pre-launch/preflight-report.md  (full results, evidence for the ledger)
 *  - reports/pre-launch/seo-matrix.md        (per-page SEO alignment matrix)
 *
 * Severities:
 *  - ERROR : launch blocker, must be fixed (script exits 1)
 *  - WARN  : needs judgment or a human-provided asset — triage in checklist A1/A2
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PUBLIC = path.join(ROOT, 'public');
const REPORT_DIR = path.join(ROOT, 'reports', 'pre-launch');

const { SEO_MAP } = await import(path.join(ROOT, 'src/data/seo-map.mjs'));

// ─── Result collection ───────────────────────────────────────────────────────

const results = []; // { id, severity: 'ERROR'|'WARN'|'PASS', check, detail }
const add = (id, severity, check, detail = '') => results.push({ id, severity, check, detail });

// ─── Helpers ─────────────────────────────────────────────────────────────────

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const read = (p) => fs.readFileSync(p, 'utf8');
const exists = (p) => fs.existsSync(p);
const digits = (s) => s.replace(/\D/g, '');

/** Extract attributes from a single HTML tag string. */
function attrs(tag) {
  const out = {};
  for (const m of tag.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)) out[m[1].toLowerCase()] = m[2];
  return out;
}

/** Very small HTML page model — good enough for Astro's generated output. */
function parsePage(file) {
  const html = read(file);
  const rel = path.relative(DIST, file);
  const route = rel === 'index.html' ? '/' : rel === '404.html' ? '/404.html' : '/' + rel.replace(/\/index\.html$/, '/');
  const metas = [...html.matchAll(/<meta\s[^>]*>/g)].map((m) => attrs(m[0]));
  const meta = (key, val) => metas.find((a) => a.name === val || a.property === val)?.content ?? (key === 'any' ? undefined : undefined);
  const links = [...html.matchAll(/<link\s[^>]*>/g)].map((m) => attrs(m[0]));
  const headings = [...html.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/g)].map((m) => ({
    level: Number(m[1]),
    text: m[2].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(),
  }));
  const anchors = [...html.matchAll(/<a\s[^>]*>/g)].map((m) => attrs(m[0]));
  const imgs = [...html.matchAll(/<img\s[^>]*>/g)].map((m) => m[0]);
  const jsonLdBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const bodyMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/) ?? html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
  const bodyText = (bodyMatch?.[1] ?? '')
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return {
    file: rel,
    route,
    html,
    title: html.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim(),
    description: meta('d', 'description'),
    robotsMeta: meta('r', 'robots'),
    canonical: links.find((l) => l.rel === 'canonical')?.href,
    og: {
      title: meta('o', 'og:title'),
      description: meta('o', 'og:description'),
      image: meta('o', 'og:image'),
      url: meta('o', 'og:url'),
    },
    twitterCard: meta('t', 'twitter:card'),
    headings,
    anchors,
    imgs,
    jsonLdBlocks,
    bodyText,
  };
}

// ─── Guards ──────────────────────────────────────────────────────────────────

if (!exists(DIST)) {
  console.error('❌ dist/ not found. Run `npm run build` first (or use `npm run preflight`).');
  process.exit(1);
}

const siteMatch = read(path.join(ROOT, 'astro.config.mjs')).match(/site:\s*['"]([^'"]+)['"]/);
const SITE = siteMatch?.[1] ?? '';
const constantsSrc = read(path.join(ROOT, 'src/data/constants.ts'));
const PHONE = constantsSrc.match(/phone:\s*"([^"]+)"/)?.[1] ?? '';
const EMAIL = constantsSrc.match(/email:\s*"([^"]+)"/)?.[1] ?? '';

const pages = walk(DIST)
  .filter((f) => f.endsWith('.html'))
  .map(parsePage);
const sitePages = pages.filter((p) => p.route !== '/404.html'); // 404 is excluded from route-level checks
const routes = new Set(sitePages.map((p) => p.route));

// ─── PF-1: Placeholder scan ──────────────────────────────────────────────────

const PLACEHOLDERS = [
  'Client Name',
  '555) 555-5555',
  'hello@example.com',
  'example.com',
  'ADD-YOUR-SITE-URL',
  'lorem ipsum',
  'Short one-line description',
  '123 Main St',
];
{
  const targets = walk(DIST).filter((f) => /\.(html|xml|txt|webmanifest)$/.test(f));
  const hits = [];
  for (const f of targets) {
    const content = read(f).toLowerCase();
    for (const ph of PLACEHOLDERS) {
      if (content.includes(ph.toLowerCase())) hits.push(`${path.relative(DIST, f)}: "${ph}"`);
    }
  }
  if (hits.length) add('PF-1', 'ERROR', 'Placeholder content in build output', hits.join('; '));
  else add('PF-1', 'PASS', 'Placeholder content in build output', 'none found');
}

// ─── PF-2: Site URL configured ───────────────────────────────────────────────

if (!SITE || SITE.includes('example.com')) {
  add('PF-2', 'ERROR', 'Production site URL', `astro.config.mjs site is "${SITE || '(missing)'}" — set the production domain`);
} else {
  add('PF-2', 'PASS', 'Production site URL', SITE);
}

// ─── PF-3: SEO map ↔ built pages agree ──────────────────────────────────────

{
  const mapRoutes = new Set(SEO_MAP.map((e) => e.route));
  const missingFromMap = [...routes].filter((r) => !mapRoutes.has(r));
  const missingFromBuild = [...mapRoutes].filter((r) => !routes.has(r));
  if (missingFromMap.length) add('PF-3', 'ERROR', 'Pages missing from seo-map.mjs', missingFromMap.join(', '));
  if (missingFromBuild.length) add('PF-3', 'ERROR', 'seo-map.mjs routes with no built page', missingFromBuild.join(', '));
  if (!missingFromMap.length && !missingFromBuild.length) add('PF-3', 'PASS', 'SEO map ↔ built pages agree', `${routes.size} routes`);
}

// ─── PF-4: noindex + sitemap consistency (driven by the SEO map) ─────────────

{
  const sitemapFile = walk(DIST).find((f) => /sitemap-\d+\.xml$/.test(f));
  const sitemapRoutes = sitemapFile
    ? [...read(sitemapFile).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
    : [];
  if (!sitemapFile) add('PF-4', 'ERROR', 'Sitemap', 'no sitemap-*.xml found in dist/');
  const problems = [];
  for (const entry of SEO_MAP) {
    const page = sitePages.find((p) => p.route === entry.route);
    if (!page) continue; // PF-3 covers this
    const hasNoindex = /noindex/i.test(page.robotsMeta ?? '');
    const inSitemap = sitemapRoutes.includes(entry.route);
    if (entry.noindex && !hasNoindex) problems.push(`${entry.route}: map says noindex, page has no noindex meta`);
    if (!entry.noindex && hasNoindex) problems.push(`${entry.route}: page has noindex meta but map says indexable`);
    if (entry.noindex && inSitemap) problems.push(`${entry.route}: noindex page is in the sitemap`);
    if (!entry.noindex && sitemapFile && !inSitemap) problems.push(`${entry.route}: indexable page missing from sitemap`);
  }
  if (problems.length) add('PF-4', 'ERROR', 'noindex / sitemap consistency', problems.join('; '));
  else add('PF-4', 'PASS', 'noindex / sitemap consistency', 'map, meta tags, and sitemap agree');
}

// ─── PF-5: robots.txt ────────────────────────────────────────────────────────

{
  const p = path.join(DIST, 'robots.txt');
  if (!exists(p)) add('PF-5', 'ERROR', 'robots.txt', 'not generated');
  else {
    const txt = read(p);
    const ok = /Allow: \//.test(txt) && txt.includes('Sitemap:') && (SITE ? txt.includes(SITE.replace(/\/$/, '')) : true);
    add('PF-5', ok ? 'PASS' : 'ERROR', 'robots.txt', ok ? 'allows indexing, sitemap URL matches site' : `content:\n${txt}`);
  }
}

// ─── PF-6: Titles ────────────────────────────────────────────────────────────

{
  const problems = [];
  const seen = new Map();
  for (const p of sitePages) {
    if (!p.title) { problems.push(`${p.route}: missing <title>`); continue; }
    if (seen.has(p.title)) problems.push(`${p.route}: duplicate title of ${seen.get(p.title)} ("${p.title}")`);
    seen.set(p.title, p.route);
    if (!p.title.includes(' | ')) problems.push(`${p.route}: title not in "Page | Business" format ("${p.title}")`);
    if (p.title.length > 60) add('PF-6', 'WARN', 'Title length', `${p.route}: ${p.title.length} chars ("${p.title}") — aim ≤ 60`);
  }
  if (problems.length) add('PF-6', 'ERROR', 'Title tags', problems.join('; '));
  else add('PF-6', 'PASS', 'Title tags', 'present, unique, formatted');
}

// ─── PF-7: Meta descriptions ─────────────────────────────────────────────────

{
  const problems = [];
  const seen = new Map();
  for (const p of sitePages) {
    if (!p.description) { problems.push(`${p.route}: missing meta description`); continue; }
    if (seen.has(p.description)) problems.push(`${p.route}: duplicate description of ${seen.get(p.description)}`);
    seen.set(p.description, p.route);
    if (p.description.length < 120 || p.description.length > 165) {
      add('PF-7', 'WARN', 'Description length', `${p.route}: ${p.description.length} chars — aim 150–160`);
    }
  }
  if (problems.length) add('PF-7', 'ERROR', 'Meta descriptions', problems.join('; '));
  else add('PF-7', 'PASS', 'Meta descriptions', 'present and unique');
}

// ─── PF-8: Canonical URLs ────────────────────────────────────────────────────

{
  const problems = [];
  for (const p of sitePages) {
    if (!p.canonical) { problems.push(`${p.route}: missing canonical`); continue; }
    if (SITE && !p.canonical.startsWith(SITE.replace(/\/$/, ''))) problems.push(`${p.route}: canonical "${p.canonical}" not on site domain`);
    if (!p.canonical.endsWith('/')) problems.push(`${p.route}: canonical missing trailing slash ("${p.canonical}")`);
    if (p.canonical.includes('?')) problems.push(`${p.route}: canonical contains query params`);
  }
  if (problems.length) add('PF-8', 'ERROR', 'Canonical URLs', problems.join('; '));
  else add('PF-8', 'PASS', 'Canonical URLs', 'present, on-domain, trailing slashes consistent');
}

// ─── PF-9: Open Graph / Twitter tags ────────────────────────────────────────

{
  const problems = [];
  for (const p of sitePages) {
    for (const [k, v] of Object.entries(p.og)) if (!v) problems.push(`${p.route}: missing og:${k}`);
    if (!p.twitterCard) problems.push(`${p.route}: missing twitter:card`);
  }
  if (problems.length) add('PF-9', 'ERROR', 'Open Graph / Twitter tags', problems.join('; '));
  else add('PF-9', 'PASS', 'Open Graph / Twitter tags', 'all present');
}

// ─── PF-10: Brand assets referenced by meta/manifest exist ───────────────────

{
  const assets = ['og-image.jpg', 'apple-touch-icon.png', 'site-icon-192.png', 'site-icon-512.png'];
  const missing = assets.filter((a) => !exists(path.join(PUBLIC, a)));
  if (missing.length) add('PF-10', 'WARN', 'Brand asset files', `missing from public/: ${missing.join(', ')} — human-provided assets (see ONBOARDING.md §3)`);
  else add('PF-10', 'PASS', 'Brand asset files', 'og-image, apple-touch-icon, site icons present');
}

// ─── PF-11: Web manifest ─────────────────────────────────────────────────────

{
  const p = path.join(DIST, 'site.webmanifest');
  if (!exists(p)) add('PF-11', 'ERROR', 'Web manifest', 'dist/site.webmanifest not generated');
  else {
    try {
      const m = JSON.parse(read(p));
      const ok = m.name && m.theme_color && Array.isArray(m.icons) && m.icons.length;
      add('PF-11', ok ? 'PASS' : 'ERROR', 'Web manifest', ok ? `name "${m.name}", ${m.icons.length} icons` : 'missing name/theme_color/icons');
    } catch {
      add('PF-11', 'ERROR', 'Web manifest', 'invalid JSON');
    }
  }
}

// ─── PF-12: Heading hierarchy ────────────────────────────────────────────────

{
  const problems = [];
  for (const p of pages) {
    const h1s = p.headings.filter((h) => h.level === 1);
    if (h1s.length !== 1) problems.push(`${p.route}: ${h1s.length} <h1> elements`);
    let prev = 0;
    for (const h of p.headings) {
      if (h.level > prev + 1 && prev !== 0) problems.push(`${p.route}: heading jump h${prev} → h${h.level} ("${h.text.slice(0, 40)}")`);
      prev = h.level;
    }
  }
  if (problems.length) add('PF-12', 'ERROR', 'Heading hierarchy', problems.join('; '));
  else add('PF-12', 'PASS', 'Heading hierarchy', 'one h1 per page, no skipped levels');
}

// ─── PF-13: Images have alt attributes ───────────────────────────────────────

{
  const problems = [];
  for (const p of pages) {
    for (const img of p.imgs) {
      // PATCH (PF-13): Astro emits alt="" as a bare `alt` attribute, and
      // HTML5 treats <img alt> as an empty alt — correct for decorative
      // images. The original /\balt\s*=/ demanded the "=" and failed every
      // decorative icon. Match the attribute, with or without a value.
      if (!/\salt\b/.test(img)) problems.push(`${p.route}: <img> without alt (${img.slice(0, 80)}…)`);
    }
  }
  if (problems.length) add('PF-13', 'ERROR', 'Image alt attributes', problems.join('; '));
  else add('PF-13', 'PASS', 'Image alt attributes', 'every <img> has an alt attribute (quality is judged in checklist A3)');
}

// ─── PF-14: Internal links resolve + trailing slashes ────────────────────────

{
  const problems = [];
  for (const p of pages) {
    for (const a of p.anchors) {
      const href = a.href;
      if (!href || !href.startsWith('/') || href.startsWith('//')) continue;
      const clean = href.split('#')[0].split('?')[0];
      if (!clean) continue;
      if (/\.[a-z0-9]+$/i.test(clean)) {
        if (!exists(path.join(DIST, clean))) problems.push(`${p.route}: link to missing file ${clean}`);
      } else {
        if (!clean.endsWith('/')) problems.push(`${p.route}: internal link missing trailing slash ("${href}")`);
        else if (!exists(path.join(DIST, clean, 'index.html'))) problems.push(`${p.route}: broken internal link ${clean}`);
      }
    }
  }
  if (problems.length) add('PF-14', 'ERROR', 'Internal links', problems.join('; '));
  else add('PF-14', 'PASS', 'Internal links', 'all resolve, trailing slashes consistent');
}

// ─── PF-15: External links use rel="noopener" with target="_blank" ───────────

{
  const problems = [];
  for (const p of pages) {
    for (const a of p.anchors) {
      if (a.target === '_blank' && !/noopener/.test(a.rel ?? '')) {
        problems.push(`${p.route}: target="_blank" without rel="noopener" (${a.href})`);
      }
    }
  }
  if (problems.length) add('PF-15', 'ERROR', 'External link rel attributes', problems.join('; '));
  else add('PF-15', 'PASS', 'External link rel attributes', 'all target="_blank" links carry noopener');
}

// ─── PF-16: tel:/mailto: links match constants.ts ────────────────────────────

{
  // PATCH (PF-16): this check exists to catch a stale hardcoded copy of the
  // BUSINESS's own contact details. Long-form editorial content legitimately
  // contains example addresses and third-party numbers (a blog post about
  // invoice fraud citing "john@example.com" is not a stale site contact), so
  // content-collection routes are exempt. Nav, footer, contact sections and
  // schema — where a stale detail actually matters — are all still checked.
  const CONTENT_ROUTE_PREFIXES = ['/blog/'];
  const isEditorial = (route) =>
    CONTENT_ROUTE_PREFIXES.some((prefix) => route.startsWith(prefix) && route !== prefix);

  const problems = [];
  for (const p of pages) {
    if (isEditorial(p.route)) continue;
    for (const a of p.anchors) {
      const href = a.href ?? '';
      if (href.startsWith('tel:') && PHONE && digits(href) !== digits(PHONE)) {
        problems.push(`${p.route}: ${href} ≠ constants phone ${PHONE}`);
      }
      // PATCH (PF-16b): mailto: hrefs legitimately carry ?subject=/&body=
      // (prefilled application and file-request links). The original compared
      // the whole href after "mailto:", so every prefilled link read as a
      // mismatched address. Compare the address only, and decode entities —
      // the built HTML escapes & as &amp;.
      const mailAddress = href.startsWith('mailto:')
        ? href.slice(7).replace(/&amp;/g, '&').split('?')[0].toLowerCase()
        : '';
      if (mailAddress && EMAIL && mailAddress !== EMAIL.toLowerCase()) {
        problems.push(`${p.route}: ${href} ≠ constants email ${EMAIL}`);
      }
    }
  }
  if (problems.length) add('PF-16', 'ERROR', 'tel:/mailto: consistency', problems.join('; '));
  else add('PF-16', 'PASS', 'tel:/mailto: consistency', 'all match constants.ts');
}

// ─── PF-17: LocalBusiness structured data on homepage ────────────────────────

{
  const home = sitePages.find((p) => p.route === '/');
  const block = home?.jsonLdBlocks[0];
  if (!block) add('PF-17', 'ERROR', 'LocalBusiness JSON-LD', 'no JSON-LD block on homepage');
  else {
    try {
      const ld = JSON.parse(block);
      // PATCH (PF-17a): LocalBusiness has dozens of schema.org subtypes and the
      // most specific accurate type is always the right one — AccountingService
      // here. The original check hardcoded @type === 'LocalBusiness' and would
      // push a site toward a LESS accurate type to satisfy the script.
      const LOCALBUSINESS_SUBTYPES = [
        'LocalBusiness', 'AccountingService', 'ProfessionalService', 'FinancialService',
        'LegalService', 'HomeAndConstructionBusiness', 'GeneralContractor', 'HVACBusiness',
        'Plumber', 'Electrician', 'RoofingContractor', 'MedicalBusiness', 'AutomotiveBusiness',
        'FoodEstablishment', 'Store', 'EmergencyService', 'InsuranceAgency', 'RealEstateAgent',
      ];
      const types = [ld['@type']].flat().filter(Boolean);
      const missing = ['@id', 'name', 'telephone', 'url', 'openingHoursSpecification'].filter((k) => !ld[k]);
      if (!types.some((t) => LOCALBUSINESS_SUBTYPES.includes(t))) {
        missing.push(`@type must be LocalBusiness or a subtype (got "${types.join(', ') || 'none'}")`);
      }
      if (missing.length) add('PF-17', 'ERROR', 'LocalBusiness JSON-LD', `missing: ${missing.join(', ')}`);
      else add('PF-17', 'PASS', 'LocalBusiness JSON-LD', `required fields present (@type ${types.join(', ')})`);
      // PATCH (PF-17b): a published street address is strongly recommended for
      // local SEO but not universal — remote-first practices deliberately have
      // none. WARN so it gets dispositioned in A1-4 instead of blocking launch.
      if (!ld.address) {
        add('PF-17', 'WARN', 'LocalBusiness address', 'no postal address in schema — expected for local businesses; confirm this is a deliberate remote-first choice');
      }
      if (!ld.geo) add('PF-17', 'WARN', 'LocalBusiness geo', 'no geo coordinates — set address.geo in constants.ts (from Google Maps)');
    } catch {
      add('PF-17', 'ERROR', 'LocalBusiness JSON-LD', 'JSON does not parse');
    }
  }
}

// ─── PF-18: llms.txt outputs ─────────────────────────────────────────────────

{
  const missing = ['llms.txt', 'llms-full.txt'].filter((f) => !exists(path.join(DIST, f)));
  if (missing.length) add('PF-18', 'ERROR', 'llms.txt outputs', `missing: ${missing.join(', ')} — check astro-llms-md integration`);
  else add('PF-18', 'PASS', 'llms.txt outputs', 'llms.txt and llms-full.txt generated');
}

// ─── PF-19: Security headers file ────────────────────────────────────────────

{
  const p = path.join(PUBLIC, '_headers');
  if (!exists(p)) add('PF-19', 'ERROR', 'Security headers', 'public/_headers missing');
  else {
    const txt = read(p);
    const required = ['X-Frame-Options', 'X-Content-Type-Options', 'Referrer-Policy', 'Strict-Transport-Security', 'Permissions-Policy', 'Content-Security-Policy'];
    const missing = required.filter((h) => !txt.includes(h));
    const cspDirectives = ["default-src 'self'", "object-src 'none'", "base-uri 'self'", 'frame-ancestors'];
    const missingCsp = cspDirectives.filter((d) => !txt.includes(d));
    const problems = [];
    if (missing.length) problems.push(`missing headers: ${missing.join(', ')}`);
    if (missingCsp.length) problems.push(`CSP missing: ${missingCsp.join(', ')}`);
    if (txt.includes('X-XSS-Protection')) problems.push('X-XSS-Protection is deprecated — remove it');
    if (problems.length) add('PF-19', 'ERROR', 'Security headers', problems.join('; '));
    else add('PF-19', 'PASS', 'Security headers', 'all required headers and CSP directives present');
  }
}

// ─── PF-20: SEO map alignment heuristics + matrix report ─────────────────────

const matrixRows = [];
{
  const kwSeen = new Map();
  for (const entry of SEO_MAP) {
    const page = sitePages.find((p) => p.route === entry.route);
    if (!page) continue;
    const kw = entry.primaryKeyword.trim().toLowerCase();
    const h1 = page.headings.find((h) => h.level === 1)?.text ?? '';
    const first100 = page.bodyText.split(/\s+/).slice(0, 100).join(' ');
    const inText = (hay) => (kw ? hay.toLowerCase().includes(kw) : null);
    const slugText = entry.route.replace(/[/-]/g, ' ').trim();

    const row = {
      route: entry.route,
      noindex: entry.noindex,
      keyword: entry.primaryKeyword || '—',
      intent: entry.intent,
      title: page.title ?? '—',
      h1: h1 || '—',
      description: page.description ?? '—',
      kwInTitle: inText(page.title ?? ''),
      kwInSlug: kw ? slugText.toLowerCase().includes(kw) || kw.split(/\s+/).every((w) => slugText.toLowerCase().includes(w)) : null,
      kwInH1: inText(h1),
      kwInDescription: inText(page.description ?? ''),
      kwInOpening: inText(first100),
    };
    matrixRows.push(row);

    if (entry.noindex) continue;
    if (!kw) {
      // Navigational pages (site credits, legal, etc.) deliberately target no keyword.
      if (entry.intent !== 'navigational') {
        add('PF-20', 'WARN', 'SEO map completeness', `${entry.route}: no primaryKeyword set — map is incomplete (onboarding deliverable, checklist A2-1)`);
      }
      continue;
    }
    if (kwSeen.has(kw)) add('PF-20', 'WARN', 'Keyword cannibalization', `"${kw}" targeted by both ${kwSeen.get(kw)} and ${entry.route}`);
    kwSeen.set(kw, entry.route);
    const misses = [
      !row.kwInTitle && 'title',
      !row.kwInSlug && 'slug',
      !row.kwInH1 && 'h1',
      !row.kwInDescription && 'description',
      !row.kwInOpening && 'opening copy',
    ].filter(Boolean);
    if (misses.length) {
      add('PF-20', 'WARN', 'Keyword alignment (exact-match heuristic)', `${entry.route}: "${kw}" not found verbatim in: ${misses.join(', ')}. Close variants may be fine — judge in checklist A2.`);
    }
    if (entry.title && page.title && !page.title.startsWith(entry.title)) {
      add('PF-20', 'WARN', 'Title vs. SEO map', `${entry.route}: built title "${page.title}" ≠ map title "${entry.title}"`);
    }
    if (entry.description && page.description !== entry.description) {
      add('PF-20', 'WARN', 'Description vs. SEO map', `${entry.route}: built description differs from map`);
    }
  }
  if (!results.some((r) => r.id === 'PF-20')) add('PF-20', 'PASS', 'SEO map alignment', 'all keyword heuristics satisfied');
}

// ─── Reports ─────────────────────────────────────────────────────────────────

fs.mkdirSync(REPORT_DIR, { recursive: true });

const now = new Date().toISOString();
const errors = results.filter((r) => r.severity === 'ERROR');
const warns = results.filter((r) => r.severity === 'WARN');
const passes = results.filter((r) => r.severity === 'PASS');

const icon = { ERROR: '❌', WARN: '⚠️', PASS: '✅' };
const reportLines = [
  `# Preflight Report`,
  ``,
  `Generated: ${now}`,
  `Result: ${errors.length} error(s), ${warns.length} warning(s), ${passes.length} passed`,
  ``,
  `| ID | Status | Check | Detail |`,
  `|----|--------|-------|--------|`,
  ...results.map((r) => `| ${r.id} | ${icon[r.severity]} ${r.severity} | ${r.check} | ${r.detail.replace(/\|/g, '\\|').replace(/\n/g, ' ')} |`),
  ``,
];
fs.writeFileSync(path.join(REPORT_DIR, 'preflight-report.md'), reportLines.join('\n'));

const bool = (v) => (v === null ? '—' : v ? '✅' : '❌');
// PATCH (seo-matrix): every built <title> ends in " | Atlas Accounting Group",
// and several titles contain their own pipes. Unescaped, each one opened a new
// markdown cell, so every row of the matrix was shifted and the ✅/❌ columns
// lined up under the wrong headings — the artifact A2 is meant to be judged
// from was unreadable. Escape pipes in every cell. Report rendering only; no
// check is affected. (preflight-report.md already did this on line ~549.)
const cell = (s) => String(s).replace(/\|/g, '\\|');
const matrixLines = [
  `# SEO Alignment Matrix`,
  ``,
  `Generated: ${now}`,
  `One row per page from src/data/seo-map.mjs, values extracted from the built HTML in dist/.`,
  `Keyword columns use exact-substring matching — a ❌ may still be fine if a close variant is used. Judge each ❌ in checklist section A2.`,
  ``,
  `| Route | Keyword | Intent | Title (built) | H1 (built) | Description (built) | kw→title | kw→slug | kw→h1 | kw→desc | kw→opening |`,
  `|-------|---------|--------|---------------|------------|---------------------|----------|---------|-------|---------|------------|`,
  ...matrixRows.map((r) =>
    `| ${cell(r.route)}${r.noindex ? ' (noindex)' : ''} | ${cell(r.keyword)} | ${cell(r.intent)} | ${cell(r.title)} | ${cell(r.h1)} | ${cell(r.description.slice(0, 80))}${r.description.length > 80 ? '…' : ''} | ${bool(r.kwInTitle)} | ${bool(r.kwInSlug)} | ${bool(r.kwInH1)} | ${bool(r.kwInDescription)} | ${bool(r.kwInOpening)} |`
      .replace(/\n/g, ' ')
  ),
  ``,
];
fs.writeFileSync(path.join(REPORT_DIR, 'seo-matrix.md'), matrixLines.join('\n'));

// ─── Console output ──────────────────────────────────────────────────────────

console.log(`\n🔍 Preflight: ${pages.length} pages checked\n`);
for (const r of results) {
  if (r.severity === 'PASS') console.log(`  ✅ ${r.id} ${r.check}`);
}
for (const r of warns) console.log(`  ⚠️  ${r.id} ${r.check} — ${r.detail}`);
for (const r of errors) console.log(`  ❌ ${r.id} ${r.check} — ${r.detail}`);
console.log(`\n📄 Reports written to reports/pre-launch/ (preflight-report.md, seo-matrix.md)`);
console.log(`\n${errors.length} error(s), ${warns.length} warning(s)\n`);
process.exit(errors.length ? 1 : 0);
