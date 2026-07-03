# Pre-Launch Checklist 🚀

Before launching any Deep River Digital site, verify these items to ensure maximum search visibility and performance.

---

## Instructions for AI Agent (Google Antigravity)

This checklist is designed to be executed sequentially by an autonomous AI agent with access to the project's editor, terminal, and browser. Follow these rules:

1. **Work through one section at a time.** Do not skip ahead.
2. **Each item has a unique ID** (e.g., `T-1`, `M-2`). Reference items by ID when reporting.
3. **Each item is tagged with an action level:**
   - 🔧 **FIX** — You can and should fix this autonomously if it fails.
   - 🔧⚠️ **FIX WITH REVIEW** — You can attempt a fix, but flag it for human review before moving on.
   - 👁️ **VERIFY ONLY** — You can audit this but cannot fix it. Report the issue and move on.
4. **Fix-then-verify flow:** When an item is tagged 🔧 FIX or 🔧⚠️ FIX WITH REVIEW and fails the audit, attempt the fix immediately, then re-verify before reporting the item status.
5. **After completing each section**, stop and report a status summary using this format before moving to the next section:

```
### Section Status: [Section Name]
- T-1: ✅ PASS / ❌ FAIL / ⚠️ WARNING / 🔧 FIXED — [brief note]
- T-2: ✅ PASS / ❌ FAIL / ⚠️ WARNING / 🔧 FIXED — [brief note]
...
```

6. **At the end**, compile a full summary with all FAILs, WARNINGs, and FIXes grouped for easy review.

---

## 1. Technical Foundations ⚙️

| ID | Action | Check | How to Verify | If Failed |
|----|--------|-------|---------------|-----------|
| T-1 | 🔧 FIX | **Sitemap** | Run `npm run build` and confirm `dist/sitemap-index.xml` (or `sitemap-0.xml`) exists and lists all public pages. | If missing, check that `@astrojs/sitemap` is installed and configured in `astro.config.mjs`. Add it if absent. Ensure the `site` property is set in the Astro config. |
| T-2 | 🔧 FIX | **Robots.txt** | Open `public/robots.txt`. Verify it allows indexing (`Allow: /`) and the `Sitemap:` directive points to the correct production URL. | Fix directives in `public/robots.txt`. Ensure the `Sitemap:` URL matches the production domain set in `astro.config.mjs`. |
| T-3 | 🔧 FIX | **Canonical URLs** | View source on the homepage and one inner page. Confirm `<link rel="canonical" ...>` uses the preferred production URL (consistent trailing slash behavior, no query params). | Update the canonical URL logic in the base layout component. Ensure it derives from the `site` property in `astro.config.mjs`. |
| T-4 | 🔧⚠️ FIX WITH REVIEW | **Redirects** | Check `public/_redirects` for any legacy URL mappings required by the client. | If the file is missing or empty, create it with a comment placeholder. Flag for human review — redirect mappings require client input. |
| T-5 | 👁️ VERIFY ONLY | **SSL / HTTPS** | Load the staging or production URL over `https://` using the browser. Confirm no mixed-content warnings in the console. | Report any mixed-content issues with the specific URLs causing them. SSL configuration is handled at the hosting level. |
| T-6 | 🔧 FIX | **404 Page** | Navigate to a non-existent URL (e.g., `/this-page-does-not-exist`) using the browser. Confirm the custom `404.astro` page renders — not a hosting provider default. | If `src/pages/404.astro` exists but doesn't render: check hosting config. For Netlify, ensure `public/_redirects` is not overriding it. For Cloudflare Pages or Vercel, Astro's 404 should work automatically in static mode. If `404.astro` doesn't exist at all, create one using the site's base layout with a user-friendly "Page Not Found" message and a link back to the homepage. |
| T-7 | 👁️ VERIFY ONLY | **DNS / Domain** | Confirm the production domain resolves correctly using the browser or terminal (`dig` / `nslookup`). Verify `www` vs. non-`www` redirect behavior. | Report DNS issues. This requires action at the domain registrar or hosting provider. |
| T-8 | 👁️ VERIFY ONLY | **WWW Canonical Redirect (Cloudflare)** | Run `curl -I https://www.<domain>` and `curl -I https://www.<domain>/about` (or any inner page) from the terminal. Confirm both return a **301** status with a `location` header pointing to the non-`www` equivalent. Verify the path is preserved through the redirect and no redirect loop occurs. | In the Cloudflare dashboard, go to the domain → **Rules → Redirect Rules**. Ensure a wildcard rule exists with **Request URL:** `https://www.<domain>/*` and **Target URL:** `https://<domain>/${1}`, status code **301**, with **Preserve query string** enabled. Also confirm both the apex domain and `www` subdomain are added as custom domains in the Cloudflare Pages project settings and show "Active" status. If the redirect rule uses an overly broad pattern (e.g., `https://www.*`), narrow it to the specific domain to prevent 403 errors or unintended matches. |

> **🛑 CHECKPOINT:** Report Section 1 status before continuing.

---

## 1.5 URL Canonicalization & Trailing Slashes 🔗

| ID | Action | Check | How to Verify | If Failed |
|----|--------|-------|---------------|-----------|
| U-1 | 🔧 FIX | **www vs. non-www** | First, determine which version the host is serving by running `curl -sI https://www.example.com` and `curl -sI https://example.com` — one should return `200`, the other a `301` redirect. Then confirm the `site` property in `astro.config.mjs` matches the version that returns `200` (the primary). Also verify `robots.txt` sitemap URL matches. | Update the `site` property in `astro.config.mjs` and `robots.txt` to match whichever version the host serves as primary. On **Cloudflare Pages**: the primary custom domain in the dashboard (Settings → Custom domains) determines which version is served; Cloudflare auto-301s the other. On **Netlify**: add a `_redirects` rule (e.g., `https://www.example.com/* https://example.com/:splat 301!`). On **Vercel**: set the redirect in project settings. |
| U-2 | 🔧 FIX | **Trailing Slash Config** | Check `astro.config.mjs` for a `trailingSlash` setting. It should be set to `'always'` (recommended for static hosts like Cloudflare Pages — avoids 308 redirect chains) or `'never'` (if using a server adapter). It should NOT be `'ignore'` or absent. | Add `trailingSlash: 'always'` to `astro.config.mjs`. This ensures Astro generates all URLs, canonical tags, and sitemap entries with consistent trailing slashes, preventing search engines from indexing duplicate URLs. |
| U-3 | 🔧 FIX | **Internal Link Consistency** | Grep the `src/` directory for all internal `href` values pointing to page routes (e.g., `href="/about"`, `href="/services"`). Verify they match the `trailingSlash` setting — if `'always'`, every internal page link should end with `/` (e.g., `/about/`, `/services/`). Links with hash fragments should also include the trailing slash before the hash (e.g., `/contact/#section`). | Update all non-conforming `href` values across components and pages. Check: Header nav links, Footer links, CTA buttons, inline content links, and the `_redirects` file targets (right-hand side). Run `grep -rn 'href="/' src/ --include='*.astro' --include='*.tsx'` to find all instances. |
| U-4 | 🔧 FIX | **Redirect Target Consistency** | Open `public/_redirects`. Verify all redirect target paths (right-hand column) use trailing slashes consistent with the `trailingSlash` setting. Source paths (left-hand column) should match the incoming URLs being caught and do not need trailing slashes. | Update redirect targets to include trailing slashes (e.g., `/about` → `/about/`). This avoids double-redirect chains where the `_redirects` rule forwards to `/about`, which then 308-redirects to `/about/`. |
| U-5 | 🔧 FIX | **Robots.txt Sitemap URL** | Open `public/robots.txt`. Verify the `Sitemap:` directive URL uses the same www/non-www domain as the `site` property in `astro.config.mjs`. | Update the `Sitemap:` URL in `public/robots.txt` to match the preferred domain (e.g., `https://www.example.com/sitemap-index.xml`). |

> **🛑 CHECKPOINT:** Report Section 1.5 status before continuing.

---


## 2. Meta Data 🏷️

| ID | Action | Check | How to Verify | If Failed |
|----|--------|-------|---------------|-----------|
| M-1 | 🔧⚠️ FIX WITH REVIEW | **Title Tags** | View source on every page. Each must be unique and follow the format: `Page Name \| Business Name`. | Fix title tags in page frontmatter or the base layout's `<title>` logic. If a page is missing a title or using a duplicate, update it to follow the format. Flag changes for review — wording may need client input. |
| M-2 | 🔧⚠️ FIX WITH REVIEW | **Meta Descriptions** | View source on every page. Each must be unique, 150–160 characters, and include a clear value proposition or call to action. | Write missing or duplicate meta descriptions based on the page content. Keep to 150–160 characters. Flag all new descriptions for human review. |
| M-3 | 🔧 FIX | **Theme Color** | Verify `<meta name="theme-color">` is present and matches the brand primary color from the style guide. | Check `src/data/constants.ts` or the brand guide page for the primary color value. Update the theme-color meta tag in the base layout. |
| M-4 | 🔧 FIX | **Favicon & Web Manifest** | Confirm `favicon.ico` (or `.svg`) loads in the browser tab. Check that `<link rel="manifest">` points to a valid `site.webmanifest` with correct `name`, `icons`, and `theme_color`. | If `site.webmanifest` has incorrect values, update `name`, `short_name`, `theme_color`, and `icons` to match the brand. If the favicon is missing entirely, flag for human action — a brand asset is needed. |

> **🛑 CHECKPOINT:** Report Section 2 status before continuing.

---

## 3. Social Sharing (Open Graph) 🖼️

| ID | Action | Check | How to Verify | If Failed |
|----|--------|-------|---------------|-----------|
| S-1 | 👁️ VERIFY ONLY | **OG Image** | Confirm `src/assets/images/branding/og-image.jpg` exists and is sized appropriately (1200×630px recommended). | Report that the OG image is missing or incorrectly sized. A human will need to create or resize the image. |
| S-2 | 🔧 FIX | **OG Tags** | View source on every page. Verify `og:title`, `og:description`, `og:image`, and `og:url` are present. | If OG tags are missing, check the base layout or SEO component. Add missing tags using existing page metadata (title, description) as values. |
| S-3 | 👁️ VERIFY ONLY | **Preview Test** | Run the staging URL through [Facebook Debugger](https://developers.facebook.com/tools/debug/) or [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) in the browser. Confirm the preview card renders correctly. | Report any rendering issues with screenshots. These typically trace back to S-1 or S-2 failures. |

> **🛑 CHECKPOINT:** Report Section 3 status before continuing.

---

## 4. Structured Data (Schema) 🧠

| ID | Action | Check | How to Verify | If Failed |
|----|--------|-------|---------------|-----------|
| D-1 | 🔧 FIX | **LocalBusiness Schema** | View source on the Homepage. Confirm a `LocalBusiness` (or appropriate subtype) JSON-LD block is present with name, address, phone, hours, and geo coordinates. | If missing or incomplete, build the JSON-LD block using business information from `src/data/constants.ts`, the site content, or the brand guide page. Insert it into the homepage layout. |
| D-2 | 🔧⚠️ FIX WITH REVIEW | **Per-Page Schema Audit** | Review every page and confirm each has content-appropriate schema. Common types: `WebSite` (homepage), `WebPage` (all pages), `Service` (service pages), `FAQPage` (FAQ sections), `Article` or `BlogPosting` (blog posts), `BreadcrumbList` (inner pages), `ContactPage` (contact page). Flag any page missing relevant schema. | Add missing schema based on page content and type. Use JSON-LD format. For pages where the correct schema type is ambiguous, flag for human review. |
| D-3 | 👁️ VERIFY ONLY | **Validation** | Paste the homepage source (and at least one inner page) into the [Google Rich Results Test](https://search.google.com/test/rich-results) via the browser. Ensure 0 errors. | Report any errors with details. Warnings are acceptable but should be noted. If errors trace back to schema you added in D-1 or D-2, go back and fix them. |

> **🛑 CHECKPOINT:** Report Section 4 status before continuing.

---

## 5. Brand Guide Page 🎨

| ID | Action | Check | How to Verify | If Failed |
|----|--------|-------|---------------|-----------|
| B-1 | 🔧 FIX | **Page Exists** | Confirm `brand-guide.astro` exists at its expected route (e.g., `/brand-guide`) and renders in the browser. | If the file exists but doesn't render, debug the build error. If the file doesn't exist, flag for human action — the brand guide template needs to be added from the blueprint. |
| B-2 | 🔧⚠️ FIX WITH REVIEW | **Client Content Updated** | Open the brand guide page in the browser. The page design will indicate what content sections are expected. At minimum, verify these have been updated from blueprint defaults: primary and secondary logos, full-size logo download links, complete brand color palette with hex values, typeface names and usage guidelines. | If you can identify the correct client values from `src/data/constants.ts`, the site's CSS custom properties, image assets in `src/assets/images/branding/`, or other data files — update the brand guide page accordingly. Flag all changes for human review. If client data is not available in the codebase, report exactly which sections still contain placeholder/default content. |
| B-3 | 👁️ VERIFY ONLY | **Download Links** | Click every download link on the brand guide page in the browser. Confirm files download correctly and are not placeholder/default files. | Report any broken links or placeholder files with specific URLs. |

> **🛑 CHECKPOINT:** Report Section 5 status before continuing.

---

## 6. Content & Accessibility ♿

| ID | Action | Check | How to Verify | If Failed |
|----|--------|-------|---------------|-----------|
| C-1 | 🔧⚠️ FIX WITH REVIEW | **Image Alt Text** | Inspect all `<img>` tags across the site. Every meaningful image should have a descriptive `alt` attribute. Decorative images should use `alt=""`. | Add missing alt text based on the image context and surrounding content. Flag all additions for human review — alt text should be accurate and descriptive, not just generated filenames. |
| C-2 | 🔧 FIX | **Heading Hierarchy** | View source on each page. Confirm a single `<h1>` per page and a logical `h1 → h2 → h3` order with no skipped levels. | Fix heading levels in the page content or components. Adjust skipped levels (e.g., `h1` → `h4` should become `h1` → `h2`). |
| C-3 | 🔧 FIX | **Image Optimization** | Confirm images are served using Astro's `<Image>` or `<Picture>` component (which handles WebP/AVIF conversion). Check that images below the fold use `loading="lazy"`. | Replace raw `<img>` tags with Astro's `<Image>` component where possible. Add `loading="lazy"` to off-screen images. |
| C-4 | 🔧 FIX | **Internal Links** | Crawl navigation and in-content links using the browser or by reviewing the source. Identify any broken internal links (404s). | Fix broken `href` values. If a link points to a page that doesn't exist, update the link or flag the missing page. |
| C-5 | 👁️ VERIFY ONLY | **NAP Consistency** | For local business sites: compare the Name, Address, and Phone number on the site against the Google Business Profile listing (search for the business in Google). They must match exactly — punctuation, abbreviations, and all. | Report any discrepancies between the site NAP and Google Business Profile listing, with specific differences noted. |

> **🛑 CHECKPOINT:** Report Section 6 status before continuing.

---

## 7. AI & LLMs 🤖

| ID | Action | Check | How to Verify | If Failed |
|----|--------|-------|---------------|-----------|
| A-1 | 🔧⚠️ FIX WITH REVIEW | **LLMs.txt** | Run `npm run build` and confirm `dist/llms.txt` is generated by the `astro-llms-md` integration. Open it and verify the page index, business name, and meta description are accurate and current. | Confirm `astro-llms-md` is registered in `astro.config.mjs` under `integrations`. Page titles and descriptions come from each page's `<BaseLayout title="..." description="...">` props — fix those if the index reads wrong. Flag for human review. |
| A-2 | 🔧⚠️ FIX WITH REVIEW | **LLMs-full.txt** | Confirm `dist/llms-full.txt` exists after build. This is the full-text concatenation of every page rendered to Markdown for LLM consumption. Verify it is current, accurate, and includes all public pages. | Generated automatically by `astro-llms-md`. If a page is missing, confirm it lives in `src/pages/` and uses `BaseLayout`. If content reads as garbled HTML, the page may have non-semantic markup that turndown can't parse cleanly — refactor to semantic HTML. Flag for human review. |
| A-3 | 👁️ VERIFY ONLY | **Agent-Readiness Scan** | Run the staging or production URL through **[isitagentready.com](https://isitagentready.com/)**. The scanner audits five categories: (1) Discoverability (robots.txt, sitemaps, link headers, DNS), (2) Content Accessibility (Markdown content negotiation), (3) Bot Access Control (AI bot rules, content signals, web bot auth), (4) Protocol Discovery (MCP servers, Agent Skills, WebMCP, OAuth, API catalogs), (5) Commerce (x402, MPP, UCP, ACP). Confirm at minimum the Discoverability and Content Accessibility categories pass. | Report failing categories with their specific signals. Discoverability/Content failures usually trace back to `robots.txt`, `sitemap-index.xml`, the `_headers` file (link headers), or missing `llms.txt`/`llms-full.txt` from A-1/A-2. Protocol Discovery and Commerce signals are aspirational for a marketing site — note them but don't block launch on them unless the client has agent/commerce requirements. |
| A-4 | 🔧⚠️ FIX WITH REVIEW | **AI Readiness Checklist** | Open **[AI-READINESS-PRE-LAUNCH-CHECKLIST.md](./AI-READINESS-PRE-LAUNCH-CHECKLIST.md)** and work through every Tier 0 item (crawlable HTML, JSON-LD, robots.txt, sitemap), the chosen Tier 1 items (Content Signals in robots.txt, llms.txt, optional Markdown content negotiation), and explicitly mark Tier 2 / Tier 3 items as **N/A by design** for static marketing / lead-gen sites unless their trigger condition applies. Confirm the recommended Content-Signal posture (`search=yes, ai-input=yes, ai-train=no` for marketing sites) is set in `robots.txt` after client confirmation on `ai-train`. | Add or correct the missing items per the companion checklist. JSON-LD is the highest-leverage gap most often — verify a `LocalBusiness` (or correct subtype) JSON-LD block is emitted on the homepage and matches the on-page NAP exactly. The `ai-train` value is a client business / legal decision — flag for human review before defaulting. |

> **🛑 CHECKPOINT:** Report Section 7 status before continuing.

---

## 8. Forms & Functionality 📝

| ID | Action | Check | How to Verify | If Failed |
|----|--------|-------|---------------|-----------|
| F-1 | 👁️ VERIFY ONLY | **Contact Form** | Submit a test entry through every form on the site using the browser. Confirm the success/error states display correctly. | Report which forms succeeded and which failed. Note any error messages. Form backend configuration (email routing, CRM integration) requires human action. |
| F-2 | 🔧 FIX | **Phone & Email Links** | Click all `tel:` and `mailto:` links in the browser. Verify they contain the correct contact info by inspecting the href values in the source. | Fix incorrect phone numbers or email addresses in the source code. Cross-reference with `src/data/constants.ts` or site content for the correct values. |
| F-3 | 🔧 FIX | **CTAs & External Links** | Click all call-to-action buttons and external links in the browser. Confirm correct destinations. Verify external links use `target="_blank"` and `rel="noopener noreferrer"` where appropriate. | Fix broken hrefs. Add missing `target="_blank"` and `rel="noopener noreferrer"` to external links. |
| F-4 | 🔧 FIX | **Autocomplete Attributes** | Inspect all `<input>`, `<select>`, and `<textarea>` elements in forms. Verify appropriate `autocomplete` attributes are set: `name`, `email`, `tel`, `street-address`, `postal-code`, `organization`, etc. Check that sensitive fields (e.g., one-time codes) use `autocomplete="off"` where appropriate. | Add missing `autocomplete` attributes to form fields using the [HTML autocomplete values spec](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete). Common mappings: name fields → `name`, email → `email`, phone → `tel`, address → `street-address`, city → `address-level2`, state → `address-level1`, zip → `postal-code`. |

> **🛑 CHECKPOINT:** Report Section 8 status before continuing.

---

## 9. Analytics & Search Console 📊

| ID | Action | Check | How to Verify | If Failed |
|----|--------|-------|---------------|-----------|
| G-1 | 🔧⚠️ FIX WITH REVIEW | **Google Analytics** | Confirm `googleAnalyticsId` is set in `src/data/constants.ts` (or equivalent config) and is not a placeholder value. | If the field exists but is empty or a placeholder, flag for human action — the GA4 Measurement ID must be provided by the team. If the field is set, verify the script loads in the browser by checking the Network tab for `gtag`. |
| G-2 | 👁️ VERIFY ONLY | **GA4 Real-Time** | Visit the live/staging site in the browser and check the GA4 "Realtime" report to confirm the visit is logged. | Report whether the visit was detected. If not, this typically traces back to G-1 or a domain mismatch in the GA4 data stream. |
| G-3 | 👁️ VERIFY ONLY | **Google Search Console** | Confirm a Search Console property exists for the production domain and the sitemap has been submitted. | Report if Search Console setup is incomplete. This requires Google account access and human action. |

> **🛑 CHECKPOINT:** Report Section 9 status before continuing.

---

## 10. Performance 🏎️

| ID | Action | Check | How to Verify | If Failed |
|----|--------|-------|---------------|-----------|
| P-1 | 🔧⚠️ FIX WITH REVIEW | **Lighthouse Audit** | Run a Lighthouse audit (Chrome DevTools → Lighthouse tab, or via terminal with `npx lighthouse`) on the homepage and one inner page. Target: Performance ≥ 90, Accessibility ≥ 90, Best Practices ≥ 90, SEO ≥ 90. | If scores are below target, review the specific Lighthouse recommendations. Fix low-hanging items: unoptimized images (C-3), missing alt text (C-1), missing meta descriptions (M-2), render-blocking resources. Flag significant architectural issues for human review. |
| P-2 | 👁️ VERIFY ONLY | **Mobile Responsiveness** | Preview the site at mobile (375px), tablet (768px), and desktop (1440px) widths in the browser. Confirm no layout breaks, overlapping text, or hidden content. | Report layout issues with screenshots at each breakpoint. Note the specific pages and viewport widths affected. CSS layout fixes may require human design decisions. |

> **🛑 CHECKPOINT:** Report Section 10 status before continuing.

---

## 11. Security 🔒

> **📄 Reference docs:** Tier-A checks that apply to every project (secrets, headers, deps, git hygiene, exposed files, HTTPS, build output) live in [SECURITY_CHECKS.md](./SECURITY_CHECKS.md). For projects with payment forms, headless WordPress, SSR + auth, or paid external APIs, also see [SECURITY_CHECKS_BACKEND.md](./SECURITY_CHECKS_BACKEND.md) — it covers webhook verification, ownership checks, input validation, rate limiting, injection prevention, and headless-WP hardening.

| ID | Action | Check | How to Verify | If Failed |
|----|--------|-------|---------------|-----------|
| X-1 | 🔧 FIX | **Security Headers** | Open `public/_headers` and confirm the following headers are present on all routes (`/*`): `X-Frame-Options` (SAMEORIGIN), `X-Content-Type-Options` (nosniff), `X-XSS-Protection` (1; mode=block), `Referrer-Policy` (strict-origin-when-cross-origin), `Strict-Transport-Security` (max-age=31536000; includeSubDomains), and `Permissions-Policy`. | Add or correct the missing headers in `public/_headers`. Use the values from [SECURITY_CHECKS.md](./SECURITY_CHECKS.md) §2 (Security Headers & CSP) as a baseline. |
| X-2 | 🔧 FIX | **Content Security Policy** | In `public/_headers`, confirm a `Content-Security-Policy` directive exists. Verify `default-src 'self'`, `object-src 'none'`, `base-uri 'self'`, and `frame-ancestors 'self'` are present. Ensure any third-party domains (Google Analytics, Google Maps, Fonts, etc.) are explicitly allowed only in the directives that need them. | Build or update the CSP using the site's actual third-party dependencies. Start restrictive (`default-src 'self'`) and add exceptions only for services the site uses. Test in the browser console for CSP violation reports. |
| X-3 | 🔧 FIX | **Secrets & Env Safety** | Run `grep -r "sk-ant-\|pk_live_\|sk_live_\|whsec_\|password\|secret" src/ --include='*.ts' --include='*.astro' --include='*.js'` — the search should return zero results containing hardcoded credentials. Verify `.env` is listed in `.gitignore`. If `.env.example` exists, confirm it contains only placeholder values. | Remove any hardcoded secrets and move them to environment variables. Add `.env` to `.gitignore` if missing. Replace real values in `.env.example` with placeholders. If any secret was ever committed, flag it for rotation. |
| X-4 | 🔧 FIX | **Dependency Audit** | Run `npm audit` in the terminal. Check for high or critical severity vulnerabilities. | Run `npm audit fix` for auto-fixable issues. For remaining high/critical findings, evaluate if the vulnerable dependency is used in client-facing output and either update to a patched version, find an alternative, or document the accepted risk. Flag for human review. |
| X-5 | 🔧 FIX | **Exposed Files Audit** | Confirm these files/directories are NOT publicly accessible via the browser: `.env`, `.git/`, `node_modules/`, `SECURITY_CHECKS.md`, `SECURITY_CHECKS_BACKEND.md`, `AI_INSTRUCTIONS.md`, `CLAUDE.md`, `ONBOARDING.md`, `DEPLOY.md`. For static Astro sites, only files in `public/` and the built `dist/` are served — verify none of these sensitive files have been copied there. Also check that `public/robots.txt` does not explicitly list sensitive paths. **Note:** auto-generated build outputs from `astro-llms-md` (`dist/llms.txt`, `dist/llms-full.txt`, per-page `dist/*.md`) are intentional and public — do not flag them. | Remove any sensitive files that were accidentally placed in `public/`. If the hosting provider serves the project root (not just `dist/`), configure the hosting to restrict access to only the `dist/` directory. |
| X-6 | 🔧 FIX | **Git Hygiene** | Run `git log --all --diff-filter=A -- '*.env' '.env.*'` to check if any `.env` file was ever committed. Run `git log --all -p -S 'sk-ant-' -S 'pk_live_' -S 'sk_live_'` to search for secrets in git history. | If secrets were ever committed, they must be considered compromised. Flag for the team to rotate the affected credentials. Use `git filter-branch` or `BFG Repo Cleaner` to remove sensitive data from history only if the repo is not yet shared publicly. |
| X-7 | 👁️ VERIFY ONLY | **HTTPS & Mixed Content** | Load the production or staging URL over `https://` in the browser. Open DevTools Console and confirm zero mixed-content warnings. Check that all external resource URLs (fonts, scripts, images, iframes) use `https://`. | Report any mixed-content resources with their URLs. Update the offending `http://` references to `https://` where possible. If a third-party resource does not support HTTPS, flag for human decision on whether to remove it or find an alternative. |

> **🛑 CHECKPOINT:** Report Section 11 status before continuing.

---

## Final Summary Template

After completing all sections, compile the final report:

```
## 🚀 Pre-Launch Report: [Site Name]
**Date:** [Date]
**Audited by:** Antigravity Agent

### Results Overview
- ✅ Passed: [count]
- 🔧 Fixed by agent: [count]
- ⚠️ Warnings: [count]
- ❌ Failed (requires human action): [count]

### 🔧 Items Fixed by Agent (Review Recommended):
1. [ID] — [What was changed and why]
2. [ID] — [What was changed and why]
...

### ❌ Items Requiring Human Action:
1. [ID] — [Description of issue and recommended fix]
2. [ID] — [Description of issue and recommended fix]
...

### ⚠️ Warnings:
1. [ID] — [Description]
...

### Launch Recommendation:
- [ ] CLEAR FOR LAUNCH — all items passed or fixed
- [ ] LAUNCH AFTER REVIEW — agent fixes need human sign-off
- [ ] DO NOT LAUNCH — critical issues require human resolution
```