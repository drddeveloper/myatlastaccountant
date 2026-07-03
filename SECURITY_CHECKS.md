# Security Checks — Tier A (Always Applies)

**Scope:** Every project built from this starter, regardless of stack. Static brochure sites, static sites with payment forms, headless WordPress, custom SSR — all must pass these checks before launch.

**For backend / payments / SSR / headless WordPress checks:** see [SECURITY_CHECKS_BACKEND.md](./SECURITY_CHECKS_BACKEND.md).

---

## How To Use This File

Before submitting any code for review, or before a deployment:

1. Work through every section below. Tier A applies to every project, no exceptions.
2. If the project takes payments, has auth, uses a database, or talks to a headless backend, **also** work through the relevant sections of [SECURITY_CHECKS_BACKEND.md](./SECURITY_CHECKS_BACKEND.md).
3. Fix any failures before marking the project complete.
4. Note which sections were checked in the deploy / PR description.

If you are unsure whether a check applies, apply it anyway.

---

## 1. Secrets & Environment Variables

**The risk:** API keys, analytics IDs, form-handler tokens, and other credentials hardcoded in source files get committed to version control. Even private repos can be exposed through forks, CI logs, or accidental visibility changes.

### Checks

- [ ] Search the entire codebase for these patterns — none should appear as literal strings outside of `.env` files:
  - `sk-ant-` (Anthropic API key prefix)
  - `whsec_` (Stripe webhook secret prefix)
  - `pk_live_` or `sk_live_` (Stripe live keys)
  - `xkeysib-` (Brevo/Sendinblue API key prefix)
  - Any string matching `/[a-zA-Z0-9_-]{32,}/` that is not a comment or test fixture
  - SMTP credentials
  - OAuth client secrets / app secrets
  - WordPress Application Passwords or JWT signing secrets (headless WP projects)

  ```bash
  grep -rEn "sk-ant-|pk_live_|sk_live_|whsec_|xkeysib-" src/ public/
  ```

- [ ] All secrets are read from `import.meta.env.VARIABLE_NAME` (Astro) or `process.env.VARIABLE_NAME` (Node scripts) — never as string literals in source.

- [ ] `.env` is listed in `.gitignore` — verify with `git check-ignore -v .env`.

- [ ] `.env.example` exists with placeholder values only — no real keys, even expired ones.

- [ ] If any secret was ever hardcoded and then removed, treat it as compromised — flag it for rotation.

- [ ] Server-only secrets are never imported into client-side components or passed to the browser via props, `define:vars`, or inline scripts.

### Astro-Specific

- [ ] Any variable that must stay server-only does NOT start with `PUBLIC_` in the env file.
- [ ] `PUBLIC_` prefixed variables contain nothing sensitive — they are readable by anyone in the browser. Acceptable: GA4 Measurement IDs, public form-handler endpoints. Not acceptable: API keys, signing secrets, admin URLs.

---

## 2. Security Headers & CSP

**The risk:** Missing HTTP security headers allow clickjacking, MIME sniffing, and cross-site scripting attacks that a single configuration line would prevent.

Cloudflare Pages reads headers from [`public/_headers`](./public/_headers). Other static hosts use equivalent files (`netlify.toml`, `vercel.json`).

### Checks

- [ ] These headers are present on all routes (`/*`) in `public/_headers`:

  | Header | Recommended Value |
  |--------|-------------------|
  | `X-Frame-Options` | `SAMEORIGIN` |
  | `X-Content-Type-Options` | `nosniff` |
  | `X-XSS-Protection` | `1; mode=block` |
  | `Referrer-Policy` | `strict-origin-when-cross-origin` |
  | `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
  | `Permissions-Policy` | Disable unused browser features (camera, microphone, geolocation, etc.) |
  | `Content-Security-Policy` | See below |

- [ ] Content Security Policy is configured. Start restrictive and loosen only as needed. Baseline for a static site with no third-party scripts:

  ```
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  font-src 'self' data:;
  img-src 'self' data: https:;
  connect-src 'self';
  frame-src 'self';
  form-action 'self';
  object-src 'none';
  base-uri 'self';
  frame-ancestors 'self';
  ```

- [ ] CSP extends the baseline only for services the site actually uses. Common additions:
  - **Analytics:** `script-src` / `connect-src` — `https://www.googletagmanager.com https://*.google-analytics.com`
  - **Form handler:** `connect-src` / `form-action` — `https://usebasin.com`, `https://formspree.io`, etc.
  - **Video embeds:** `frame-src` — `https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com`
  - **Fonts (CDN):** `font-src` — `https://fonts.gstatic.com`
  - **Maps:** `frame-src` — `https://www.google.com/maps`

- [ ] Test the CSP in the browser console after deploy — fix any violation reports that surface on real user paths.

- [ ] All traffic is served over HTTPS in production. No mixed-content warnings in the browser console.

---

## 3. Dependency Security

**The risk:** Outdated or compromised npm packages introduce known vulnerabilities. Single-maintainer packages are the classic supply-chain attack surface.

### Checks

- [ ] Run `npm audit` before every deployment. Fix or explicitly document any high or critical findings.

  ```bash
  npm audit
  npm audit fix          # auto-fix where possible
  ```

- [ ] Review every new dependency the agent (or any contributor) adds before committing:
  - Reputable maintainer with a track record?
  - Recent commits and active maintenance?
  - Could a built-in Node.js API or an existing dependency do the same job?
  - For small or single-maintainer packages: read the source before accepting it
  - For single-maintainer or low-download packages: pin to an exact version (`"pkg": "1.2.3"`, not `"^1.2.3"`) so Dependabot surfaces bumps for review

- [ ] `node_modules` is in `.gitignore`.

- [ ] Lock file (`package-lock.json`) is committed so installs are deterministic across environments.

- [ ] No `postinstall` / `preinstall` scripts in new dependencies without review — these run arbitrary code at install time. If you must accept one, document why.

---

## 4. Git Hygiene & Secret Leakage

**The risk:** A secret committed once lives forever in git history, even if a later commit removes it. Public-facing repos and shared CI logs amplify this.

### Checks

- [ ] No `.env`, `.env.production`, or equivalent has ever been committed:

  ```bash
  git log --all --diff-filter=A -- '*.env' '.env.*'
  ```

  Result should be empty.

- [ ] No secret prefixes ever appeared in committed code:

  ```bash
  git log --all -p -S 'sk-ant-' -S 'pk_live_' -S 'sk_live_' -S 'whsec_'
  ```

- [ ] If any secret was ever committed, the affected credential must be rotated immediately — git history removal alone (BFG, `git filter-repo`) does not invalidate a leaked key.

- [ ] Tool/editor session state, scratch files, AI-agent caches, etc. are gitignored. This starter includes `.claude/`, `.astro/`, `.idea/`. Add others as needed.

- [ ] `.gitignore` covers OS metadata (`.DS_Store`, `Thumbs.db`).

---

## 5. Exposed Files Audit

**The risk:** Documentation, config, or build-process files that contain internal notes get deployed to the public directory and become accessible to anyone who guesses the URL.

### Checks

- [ ] These files / directories must NOT be publicly accessible via the deployed site:
  - `.env`, `.env.*`
  - `.git/`
  - `node_modules/`
  - Any internal documentation: `AI_INSTRUCTIONS.md`, `CLAUDE.md`, `ONBOARDING.md`, `PRE-LAUNCH-CHECKLIST.md`, `SECURITY_CHECKS.md`, `SECURITY_CHECKS_BACKEND.md`, `DEPLOY.md`, `README.md`
  - Any working drafts (`*-draft.md`, content-pre-launch notes)

- [ ] For Astro static builds: only files in `public/` and the built `dist/` are served. Verify none of the sensitive files above were accidentally copied into `public/`.

- [ ] Auto-generated build outputs (e.g., `dist/llms.txt`, `dist/llms-full.txt`, per-page `.md` files from `astro-llms-md`) are expected outputs and are **not** considered sensitive — they are designed to be public. Distinguish them from the source-control sensitive files above.

- [ ] `public/robots.txt` does not list sensitive paths (which would advertise their existence to anyone reading the file).

---

## 6. HTTPS & Mixed Content

**The risk:** A single `http://` image, script, or font tag in production causes browser mixed-content warnings, blocks the resource, or downgrades the page security.

### Checks

- [ ] Production / staging URL loads over `https://` with no mixed-content warnings in DevTools Console.

- [ ] All external resource URLs (fonts, scripts, images, iframes, form actions) use `https://` schemes — no `http://` references in the source.

  ```bash
  grep -rn "http://" src/ public/ --include="*.astro" --include="*.html" --include="*.css" --include="*.js" --include="*.ts"
  ```

  Filter out localhost references and code comments. Anything else needs to be fixed or removed.

- [ ] If a required third-party resource does not support HTTPS, flag it for human decision — either remove it, find an alternative, or document the accepted risk.

---

## 7. Data Exposure via Build Output

**The risk:** Source data passed to Astro at build time can end up serialized into the final HTML, even when the developer intended it to be server-only or build-only. For static sites this usually means metadata leaking into JSON-LD blocks, `define:vars`, or inline script tags.

### Checks

- [ ] No internal-only data is rendered into HTML. Examples to verify:
  - Database connection strings or environment variables in JSON-LD blocks
  - Internal email aliases or admin contact info shipped in `<meta>` tags
  - Build-time author / contributor info from `git log` or CI variables embedded in page source

- [ ] Anything passed to `JSON.stringify(...)` or `define:vars={...}` is reviewed — what reaches that point is published to the world.

- [ ] Client PII or internal notes in markdown / content collections are not rendered into the sitemap, `llms.txt`, or per-page `.md` outputs. The `astro-llms-md` integration renders every public page — anything in a public page becomes part of `llms-full.txt`.

- [ ] If the project uses content collections with draft entries (`draft: true`), verify drafts are filtered out of the build:

  ```typescript
  // src/pages/[...] etc.
  const entries = await getCollection('blog', ({ data }) => !data.draft);
  ```

---

## Pre-Deployment Checklist

Run through this before every production deployment:

```
SECRETS
  [ ] grep returns nothing for known secret prefixes in src/ and public/
  [ ] .env is in .gitignore and has never been committed
  [ ] .env.example has placeholder values only
  [ ] npm audit — no high or critical findings (or each is documented)

HEADERS
  [ ] public/_headers includes all six baseline security headers
  [ ] CSP is set and tested in the browser console
  [ ] Cookies (if any) have HttpOnly + Secure + SameSite

GIT HYGIENE
  [ ] git log shows no .env commits, ever
  [ ] git log shows no secret prefixes, ever
  [ ] .gitignore covers editor/AI/OS state files

EXPOSED FILES
  [ ] No internal docs in public/ or dist/
  [ ] Auto-generated llms.txt / .md outputs are intentional

TRANSPORT
  [ ] Production loads over HTTPS with no mixed-content warnings

BUILD OUTPUT
  [ ] No internal data leaked into HTML, JSON-LD, or astro-llms-md outputs
  [ ] Draft content collections excluded from the build
```

---

## When Tier A Is Not Enough

If the project does any of the following, you must also run through [SECURITY_CHECKS_BACKEND.md](./SECURITY_CHECKS_BACKEND.md):

| Project shape | Backend sections that apply |
|---|---|
| Static site with **payment forms** (Stripe Checkout, Square, etc.) | Forms & Payment Processors |
| Static site with **order forms** posting to any endpoint you operate | Forms & Payment Processors, Input Validation |
| **Headless WordPress** front-end | Headless WordPress, Auth & Authorization |
| **Custom SSR** with auth or sessions | Auth & Authorization, Input Validation, Rate Limiting, Error Handling, Astro SSR Specifics |
| Any project calling **paid external APIs** (Claude, OpenAI, etc.) | Rate Limiting, Input Validation |
| Any project with a **database** (SQLite, Postgres, etc.) | Auth & Authorization, Injection & Output Safety, Data Exposure |

---

*Maintain this file as the threat landscape evolves. Add a check only when it is universally applicable; project-shape-specific checks belong in `SECURITY_CHECKS_BACKEND.md`.*
