# Security Checks — Backend, Payments & Headless

**Scope:** This file covers security checks that apply *when the project includes any of the following:* payment forms, order forms posting to your own endpoints, headless WordPress, custom SSR with auth or sessions, a database, or paid external APIs.

**For checks that apply to every project regardless of stack** (secrets, headers, deps, git hygiene, exposed files, HTTPS, build output): see [SECURITY_CHECKS.md](./SECURITY_CHECKS.md). Run through that file first.

---

## Project-Type Quick Start

Identify the project shape, then run the listed sections in this file. Tier A from [SECURITY_CHECKS.md](./SECURITY_CHECKS.md) applies in every case.

| Project Shape | Run These Sections |
|---|---|
| Static brochure site | None — Tier A only |
| Static site with **payment form** (Stripe Checkout, Square, etc.) | §1 Forms & Payment Processors, §3 Input Validation |
| Static site with **order form** posting to your own endpoint | §1 Forms & Payment Processors, §3 Input Validation, §5 Rate Limiting, §6 Error Handling |
| **Headless WordPress** front-end | §2 Auth & Authorization, §3 Input Validation, §4 Injection & Output Safety, §7 Data Exposure, **§9 Headless WordPress** |
| **Custom SSR** with auth / sessions | §2, §3, §4, §5, §6, §7, §8 Astro SSR Specifics |
| Project calling **paid external APIs** (Claude, OpenAI, etc.) | §5 Rate Limiting, §3 Input Validation, §6 Error Handling |
| Project with a **database** (SQLite, Postgres, MySQL, etc.) | §2, §4, §7 |

If multiple shapes apply, run every applicable section.

---

## How To Use This File

1. Read every section the project-type table says applies.
2. Search the codebase for the patterns listed under each check.
3. Fix any failures before marking the work complete.
4. Note which sections were checked in the deploy / PR description.

If you are unsure whether a check applies, apply it.

---

## §1 Forms & Payment Processors

**The risk:** Payment flows and order forms work in testing because you click buttons yourself. Without backend validation and webhook verification, an attacker can submit fake payment events, manipulate order totals client-side, or spam the form into the connected back end.

This section covers both **direct-to-processor flows** (form posts to Stripe Checkout, Square, PayPal, etc.) and **bring-your-own-endpoint flows** (form posts to an endpoint you operate, which then calls the processor).

### Direct-to-processor flows (preferred for static sites)

This is the simplest and safest path. The form posts directly to the processor's hosted page (Stripe Checkout, Square Payment Links, etc.) — you never see or store card data.

- [ ] **PCI scope reduction:** The form posts the order details (line items, return URL) to the processor's hosted page. Card fields are NEVER captured on your domain.

- [ ] Order amounts are not trusted from the client. Either:
  - Use price IDs / product IDs the processor stores on its side (e.g., Stripe `price_xxxxx`), OR
  - Compute the price server-side before redirecting to the processor (requires a small endpoint)

  Never let the page POST a freeform `amount` field to the processor — an attacker rewrites it to `0.01`.

- [ ] Success / cancel return URLs are validated against an allowlist of your own domains. Attackers will try to insert their own URLs to phish post-checkout.

- [ ] No payment status is read from the client redirect (`?success=true`). Truth comes from the webhook (next subsection) or a server-side processor lookup.

### Webhook verification (any flow that receives processor callbacks)

The processor calls your webhook endpoint to confirm a payment succeeded. Without signature verification, anyone can POST a fake "payment succeeded" event to your endpoint and unlock paid content for free.

- [ ] Webhook endpoint verifies the processor's signature on every incoming request. Example for Stripe — adapt the pattern for any processor (Square has `Square-Signature`, PayPal has `PAYPAL-TRANSMISSION-SIG`, etc.):

  ```typescript
  const sig = request.headers.get('stripe-signature');
  const event = stripe.webhooks.constructEvent(
    rawBody,       // must be raw bytes, not parsed JSON
    sig,
    import.meta.env.STRIPE_WEBHOOK_SECRET
  );
  ```

- [ ] The webhook handler reads the **raw** request body before signature verification. Parsing with `request.json()` first breaks the signature check.

- [ ] Payment / order status is stored server-side (database, processor lookup) — never in a client-side cookie, localStorage, or URL parameter.

- [ ] Feature / content access checks read order status from the database (or live processor lookup) on the server. Nothing the client sends is trusted.

- [ ] Webhook secret (e.g. `STRIPE_WEBHOOK_SECRET`) is a separate value from the API key (e.g. `STRIPE_SECRET_KEY`). Both are required.

- [ ] Webhook handler is **idempotent**: it checks whether an event ID has already been processed before acting on it. Processors retry the same event on transient failures.

  ```typescript
  // Example pattern — vendor-agnostic
  const existing = await db.query.processedEvents.findFirst({
    where: eq(processedEvents.eventId, event.id)
  });
  if (existing) return new Response(null, { status: 200 });
  ```

- [ ] Failed webhook events log enough detail to debug (event ID, type, timestamp) without storing card data, full request bodies, or PII.

- [ ] Live keys (`pk_live_*`, `sk_live_*`, equivalents) are never used in development or staging environments. Test keys only outside production.

### Order forms posting to your own endpoint (bring-your-own-endpoint)

If the static site posts to your own endpoint that then talks to the processor — you also need every check in §2, §3, §5, §6.

- [ ] The endpoint validates every input server-side (§3) before talking to the processor.

- [ ] The endpoint applies rate limiting (§5) — order endpoints are a favorite spam target.

- [ ] The endpoint never echoes processor errors directly to the client (they often contain internal IDs or sensitive context). Return a sanitized message; log the full error server-side.

### Form spam protection (every public form)

- [ ] At minimum one of: honeypot field (hidden input that bots fill in, real users don't), time-to-submit check (reject forms submitted in under ~2 seconds), or a managed CAPTCHA (Cloudflare Turnstile, hCaptcha).

- [ ] Email-only notifications for form submissions go to an internal alias, not a public mailbox. Reply-to is set from the validated form field, not the SMTP from address.

---

## §2 Authentication vs. Authorization

**The risk:** Auth systems verify *who* a user is but often skip verifying *what* they are allowed to access. User A can view, edit, or delete User B's records by changing an ID in the URL or request body.

This applies to any project with logged-in users, a headless backend (WordPress, Sanity, Contentful, custom CMS) where different users have different content, or admin routes.

### Checks

- [ ] Every endpoint that reads, updates, or deletes a record verifies that the authenticated user owns or has permission to access *that specific record* — not just that a session exists.

- [ ] Authorization checks happen server-side in the endpoint handler. Never client-side only.

- [ ] No endpoint trusts a user-supplied `userId`, `clientId`, `recordId`, or similar field to determine ownership. The owner ID always comes from the session, not the request body.

- [ ] Pattern to verify in every data endpoint (example uses Drizzle — translate the principle to any ORM, raw SQL with parameterization, or REST/GraphQL API):

  ```typescript
  // WRONG — trusts client-supplied ID, lets anyone read any record
  const record = await db.query.intake.findFirst({
    where: eq(intake.id, body.intakeId)
  });

  // CORRECT — ownership comes from the session
  const record = await db.query.intake.findFirst({
    where: and(
      eq(intake.id, body.intakeId),
      eq(intake.userId, session.userId)
    )
  });
  ```

  Equivalent principle when consuming a headless backend's REST/GraphQL API: the API request must include the session user's auth token (not an admin token), and the backend enforces row-level access.

- [ ] Confirm every endpoint has an ownership / permission check. Fill in the table per project:

  | Endpoint | Checks Ownership? | Session Field Used |
  |----------|-------------------|-------------------|
  | `GET /api/example/[id]` | ☐ | |
  | `POST /api/example/[id]` | ☐ | |
  | `DELETE /api/example/[id]` | ☐ | |

- [ ] Admin-only routes have a **role check in addition to** the auth check — session must have `role === 'admin'` or equivalent, not just be authenticated.

- [ ] If using IP allowlisting for admin routes, it is applied as middleware, not inside individual handlers (easy to forget on a new route).

- [ ] Sessions / auth cookies have `HttpOnly`, `Secure`, and `SameSite=Lax` or `Strict`.

- [ ] Password reset, email change, and account deletion flows require re-authentication or an email confirmation step.

---

## §3 Input Validation

**The risk:** Client-side validation only. The endpoint trusts the form sent valid data, so malformed, oversized, or malicious input reaches the database, the processor, or a downstream API.

Applies to every endpoint that accepts user input — order forms posting to your own endpoint, headless WordPress mutation endpoints, custom SSR API routes, anything calling a paid API.

### Checks

- [ ] Every endpoint validates inputs server-side before processing. Client-side validation is UX only, never security.

- [ ] Required fields are checked for presence and non-empty values.

- [ ] String fields have a maximum length cap server-side. Open textareas should cap at a reasonable limit (e.g. 10,000 chars) to prevent payload stuffing.

- [ ] Numeric fields validate that the value is actually a number and within an expected range.

- [ ] Enum-type fields validate against the allowed set of values. Arbitrary strings must not pass through to the database, processor, or downstream API.

- [ ] Validation uses Zod (or an equivalent schema validator), not ad-hoc if-checks:

  ```typescript
  import { z } from 'zod';

  const OrderSchema = z.object({
    customerName: z.string().min(1).max(200),
    email: z.string().email().max(254),
    items: z.array(z.object({
      sku: z.string().regex(/^[A-Z0-9-]{1,32}$/),
      qty: z.number().int().min(1).max(99)
    })).min(1).max(50),
    notes: z.string().max(10_000).optional()
  });
  ```

- [ ] Validation errors return HTTP 400 with a clear message. The endpoint does not proceed with invalid input.

- [ ] File uploads validate file type server-side by reading magic bytes, not just trusting the extension or `Content-Type` header. Cap file size before parsing.

---

## §4 Injection & Output Safety

**The risk:** Direct solutions reach for `eval()` on user input or render raw HTML from a database / CMS field. These are textbook XSS and injection vectors. Headless backends amplify this because CMS authors often have legitimate HTML in their content.

### Never do these

- [ ] `eval()` — grep the codebase, should return zero results in application code.
- [ ] `new Function(userInput)` — same, zero results.
- [ ] `set:html={userContent}` (Astro) or `dangerouslySetInnerHTML={{ __html: userContent }}` (React) — if present, the source must be sanitized first with DOMPurify (or equivalent), and that sanitization must be documented with an inline comment.

### Database queries (any ORM or raw SQL)

- [ ] No raw SQL strings with user input concatenated or interpolated directly. Parameterize every query.
- [ ] If using an ORM (Drizzle, Prisma, Kysely, etc.), use the query builder — these parameterize automatically.
- [ ] If raw SQL is necessary, use the ORM's tagged-template / bound-parameter API. Example for Drizzle: ``sql`SELECT * FROM users WHERE id = ${userId}` `` (Drizzle parameterizes); for `mysql2`/`pg`: use `?`/`$1` placeholders, never string interpolation.

### Headless backend queries (REST / GraphQL)

- [ ] User input passed to a REST query string or GraphQL variable is validated against §3 before being sent.
- [ ] GraphQL queries are not constructed via string concatenation of user input — use the client library's variables.
- [ ] If using WordPress as a headless backend, see §9 for WP-specific REST hardening.

### User-generated content display

- [ ] Fields displaying user-supplied or CMS-author-supplied text are rendered as text content, not HTML, unless the field is explicitly designed to be rich text.

- [ ] If markdown is rendered, it passes through a sanitization step before display (markdown-it with `html: false`, or a sanitizer like DOMPurify on the rendered HTML).

- [ ] HTML returned by a CMS / headless backend is sanitized before being rendered, even if the CMS has its own editor sanitization — defense in depth.

### Output from AI / LLM APIs

- [ ] Content returned from any LLM API (Claude, OpenAI, etc.) is treated as untrusted — sanitize before rendering to the page.
- [ ] JSON parsed from LLM responses is validated against an expected schema (Zod or equivalent) before use — do not assume the structure matches what was prompted.

---

## §5 Rate Limiting & Abuse Prevention

**The risk:** Endpoints that call paid external services (Claude, OpenAI, payment processors, email APIs) have no limits. A single bot can trigger thousands of API calls, creating unexpected costs and degrading service.

### Checks

- [ ] Every endpoint that calls a paid external API has rate limiting applied. At minimum, limit by IP address.

- [ ] Rate limiting is implemented server-side. Disabling a button is UX, not protection.

- [ ] Rate limiting can be implemented with:
  - A SQLite / Postgres table tracking call counts per IP per time window
  - An in-memory store (e.g. a Map keyed by IP) for very simple cases — note this resets on deploy
  - A managed service (Cloudflare Rate Limiting Rules, Upstash, Redis) for higher traffic

- [ ] Suggested starting limits for LLM API endpoints: **10 requests per IP per minute, 50 per hour.** Tune based on real usage.

- [ ] Order / form submission endpoints have rate limiting to prevent spam submissions.

- [ ] Rate-limited responses include the appropriate headers: `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`.

- [ ] Rate limit tracking storage is cleaned up periodically. Don't let it grow unbounded.

---

## §6 Error Handling & Failure States

**The risk:** AI-generated code builds the happy path only. API failures, database errors, and network timeouts produce white screens, broken UI, or silent data loss. Errors that are not logged cannot be diagnosed.

### Checks

- [ ] Every `async` function that calls an external service (LLM API, database, file system, headless backend, payment processor) is wrapped in try/catch.

- [ ] API endpoints always return a structured error response. Never let an unhandled exception reach the client:

  ```typescript
  try {
    // handler logic
  } catch (error) {
    console.error('[endpoint-name]', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
  ```

- [ ] Error messages returned to the client never include stack traces, file paths, database schema details, ORM error text, or internal variable names. Sanitize before sending.

- [ ] Client-side `fetch` calls handle non-2xx responses explicitly — check `response.ok` before calling `response.json()`.

- [ ] All LLM API calls have a timeout and a fallback message for when the API is slow or unavailable. The UI must not hang indefinitely.

- [ ] Database / backend write failures are caught and surfaced. A failed insert / mutation should never silently appear to succeed from the user's perspective.

- [ ] Loading, error, and empty states are implemented for every async UI component, not just the success state.

- [ ] No `console.log` debug statements remain in production code.

---

## §7 Data Exposure & Logging

**The risk:** Logs and API responses inadvertently expose sensitive client data, PII, or internal system structure.

### Checks

- [ ] API responses return only the fields the client needs. Full database rows or full headless-backend responses are never passed directly to `Response.json()` — pick fields explicitly.

- [ ] Log statements do not include full request bodies that may contain PII (names, emails, addresses, order contents, intake form data).

- [ ] Error logs capture enough to debug (error message, endpoint name, timestamp, correlation ID) without capturing sensitive field values.

- [ ] Database files (SQLite, etc.) are stored outside the public directory and are not accessible via the web server.

- [ ] Database backups are stored outside the web root and are not publicly accessible.

- [ ] Form data containing client PII is not forwarded to third-party logging / analytics services without explicit consideration of data retention and privacy. Common slip: sending intake form bodies to Sentry or LogRocket without scrubbing.

- [ ] If the project uses session replay or full-DOM analytics (LogRocket, FullStory, Hotjar), sensitive input fields are masked.

---

## §8 Astro SSR Specifics

**The risk:** Astro's hybrid rendering model creates subtle server / client boundaries that are easy to get wrong, leaking server-only data into the browser-rendered HTML.

Applies if `astro.config.mjs` sets `output: 'server'` or `output: 'hybrid'`.

### Checks

- [ ] Database queries only run in `.astro` frontmatter, API route handlers, or server-only utility files. Never in client-side `<script>` tags.

- [ ] Sensitive data fetched server-side is not serialized into `define:vars` or `JSON.stringify` blocks that get embedded in the HTML response.

- [ ] `output: 'server'` or `output: 'hybrid'` is confirmed in `astro.config.mjs`. Static output mode does not support server-side auth — if the project needs auth and the config is static, that's a foundational mismatch to flag.

- [ ] Middleware (`src/middleware.ts`) is used for auth checks on protected routes rather than repeating auth logic in every page file.

- [ ] API routes return `Response` objects with explicit `Content-Type` headers — do not rely on Astro to infer the content type.

- [ ] `Astro.cookies` operations are guarded — read returns `undefined` for missing cookies, must be handled.

- [ ] Server islands and partial hydration: if a server-rendered component receives sensitive props, those props become part of the HTML. Pass IDs, not records.

---

## §9 Headless WordPress

> ⚠️ **Note:** This section was drafted from standard WP hardening practices, not authored by the same security expert who wrote the rest of this file. Treat individual items as my best read of current consensus; flag for expert review before relying on it for a high-stakes project. Items I am less certain about are marked with **[verify]**.

**The risk:** Headless WordPress exposes the WP REST API (`/wp-json/*`) and possibly a GraphQL endpoint (`/graphql` via WPGraphQL) to the public internet. Default WP installs leak user enumeration data, accept comment spam, and grant more access than a headless front-end actually needs. Caching auth-gated content at the CDN edge can serve one user's data to another.

This section assumes: WordPress is the back-end CMS; the Astro static or SSR front-end reads content via REST or GraphQL; authors edit in WP-admin; the WP instance is hosted separately (Kinsta, WPEngine, self-hosted, etc.).

### WP REST API exposure

- [ ] `/wp-json/wp/v2/users` does NOT return author data without authentication. By default WordPress returns username and display name for any author who has published a post — this is user enumeration. Hide it via a plugin (e.g. "Disable WP REST API for Non-Authenticated Users") or a custom filter:

  ```php
  // functions.php — block unauthenticated /wp/v2/users
  add_filter('rest_endpoints', function ($endpoints) {
    if (isset($endpoints['/wp/v2/users'])) unset($endpoints['/wp/v2/users']);
    if (isset($endpoints['/wp/v2/users/(?P<id>[\d]+)'])) unset($endpoints['/wp/v2/users/(?P<id>[\d]+)']);
    return $endpoints;
  });
  ```

- [ ] Author archives (`/author/{slug}/`) are disabled or 301'd to home. They also enumerate users by URL.

- [ ] The XML-RPC endpoint (`/xmlrpc.php`) is disabled unless explicitly required. Common attack surface, rarely needed for headless setups.

- [ ] If the Astro front-end consumes a REST endpoint that returns more fields than it displays, the back-end is configured to return only the needed fields (via `_fields=` query param or a custom REST endpoint).

- [ ] **[verify]** The `application-passwords` endpoint is disabled or restricted unless Application Passwords are the chosen auth mechanism (see auth subsection below).

### WPGraphQL exposure (if used)

- [ ] The GraphQL endpoint requires authentication for any query that returns non-public data (user emails, draft posts, private custom post types). Public read-only queries (published posts, public pages) can remain unauthenticated.

- [ ] Query depth limiting and query complexity limiting are enabled. WPGraphQL ships with these as constants — verify they are set to reasonable values (e.g. depth ≤ 10) to prevent expensive nested queries.

- [ ] Introspection (`__schema`, `__type`) is disabled in production. It reveals the full schema to anyone.

- [ ] **[verify]** Persisted queries are used in production where possible — the Astro client sends a query hash, not the full query string. WPGraphQL supports this via the `wp-graphql-smart-cache` plugin.

### Authentication from Astro → WordPress

The Astro front-end needs credentials to read draft content (preview), submit form data, or perform mutations.

- [ ] One of these auth mechanisms is in use, NOT plain username + password sent on every request:
  - **Application Passwords** (built into WP since 5.6) — long random tokens, revocable per-application
  - **JWT** via a vetted plugin (e.g. `wp-graphql-jwt-authentication` for GraphQL setups) — note: JWT plugins have a checkered history, audit the chosen one
  - **OAuth** (heavier; only worth it for multi-tenant or multi-site setups)

- [ ] The credential is stored as an environment variable on the Astro side (`WP_APP_PASSWORD`, `WP_JWT_SECRET`), never committed.

- [ ] Server-side requests use the credential. Client-side requests do not — never ship a WP credential to the browser.

- [ ] For preview / draft access from Astro, the credential is scoped to read-only or to a specific user with limited capabilities (not Administrator).

### CDN / cache safety with auth-gated content

- [ ] Cache rules at the CDN (Cloudflare, Vercel, etc.) do NOT cache responses that vary by logged-in user. Common slip: caching `/api/me` or a personalized homepage.

- [ ] `Cache-Control: private, no-store` is set on any response that includes user-specific data.

- [ ] If the WP back-end is reached via a server-side fetch in Astro, the response is NOT cached at the CDN unless the data is genuinely public.

- [ ] **[verify]** Preview-mode tokens are single-use or short-lived (e.g. ≤ 15 min). A long-lived preview token shared in a Slack channel becomes a back door.

### WordPress hardening (back-end concerns the Astro front-end indirectly depends on)

These belong to whoever maintains the WP instance, but flag them to that owner — the headless Astro site is compromised if the WP back end is.

- [ ] WP core, all plugins, and theme are running the latest patched versions. Auto-updates enabled where the host supports them.

- [ ] Unused plugins are deleted, not just deactivated. Inactive plugins still ship code.

- [ ] Two-factor auth is enabled on every administrator account.

- [ ] `wp-admin/` is restricted: IP allowlist where feasible, or at minimum hidden behind a custom login URL (e.g. WPS Hide Login) and protected by a managed CAPTCHA / brute-force protection (Wordfence, Cloudflare).

- [ ] Database prefix is not the default `wp_` (changed at install time).

- [ ] `wp-config.php` security keys (`AUTH_KEY`, etc.) are unique per environment and rotated when staff with access changes.

- [ ] File editing in wp-admin is disabled: `define('DISALLOW_FILE_EDIT', true);` in `wp-config.php`.

- [ ] **[verify]** PHP error display is off in production (`display_errors = Off` in `php.ini` or `WP_DEBUG_DISPLAY = false`).

- [ ] If forms on the Astro site post to the WP back end (e.g. Gravity Forms via REST, contact form via custom endpoint), every check in §3 (input validation) and §5 (rate limiting) applies.

### Preview / draft handling

- [ ] The Astro preview / draft route is not publicly accessible. Either:
  - Requires a query param token validated server-side, OR
  - Sits behind HTTP basic auth at the host (preview deploy on Cloudflare Pages / Netlify supports this), OR
  - Is gated by an Astro middleware check against a known cookie or header.

- [ ] Preview URLs are not shared in places that get indexed (public Slack, GitHub issue bodies on public repos).

---

## Pre-Deployment Checklist

Run this in addition to the Tier A checklist in [SECURITY_CHECKS.md](./SECURITY_CHECKS.md). Only run the lines that apply to the project shape.

```
PAYMENTS / ORDER FORMS (§1)
  [ ] PCI scope reduced — card fields never on your domain
  [ ] Order amounts come from processor or server, not the client
  [ ] Webhook signatures verified, raw body before parse
  [ ] Webhook handler is idempotent
  [ ] Live keys not used in dev / staging
  [ ] Form spam protection in place

AUTH (§2)
  [ ] Every data endpoint verifies ownership, not just session presence
  [ ] Admin routes have role check in addition to auth
  [ ] Session cookies have HttpOnly + Secure + SameSite

INPUT VALIDATION (§3)
  [ ] Zod (or equivalent) schemas on every endpoint
  [ ] String lengths, enums, numeric ranges all capped
  [ ] File uploads check magic bytes + size cap

INJECTION (§4)
  [ ] No eval() / no unsanitized set:html / dangerouslySetInnerHTML
  [ ] ORM query builders or parameterized queries everywhere
  [ ] CMS HTML sanitized on output
  [ ] LLM output sanitized + schema-validated

RATE LIMITING (§5)
  [ ] Every paid-API endpoint rate-limited by IP
  [ ] Form submission endpoints rate-limited

ERROR HANDLING (§6)
  [ ] All async handlers wrapped in try/catch
  [ ] No stack traces in client responses
  [ ] LLM calls have timeouts + UI fallback

DATA EXPOSURE (§7)
  [ ] API responses pick fields explicitly
  [ ] Logs don't capture full PII bodies
  [ ] DB files / backups outside web root

ASTRO SSR (§8)
  [ ] output mode matches auth needs
  [ ] Middleware used for auth checks
  [ ] No sensitive data in define:vars or JSON.stringify blocks

HEADLESS WORDPRESS (§9)
  [ ] /wp-json/wp/v2/users blocked for unauth
  [ ] Author archives disabled / redirected
  [ ] XML-RPC disabled
  [ ] WPGraphQL: query depth + introspection locked down
  [ ] App Passwords or JWT in use, env-var stored, server-side only
  [ ] CDN cache rules don't cache user-specific responses
  [ ] WP core + plugins + theme patched, 2FA on admins
  [ ] Preview routes gated, preview tokens short-lived
```

---

*Maintain this file alongside [SECURITY_CHECKS.md](./SECURITY_CHECKS.md). When the threat landscape shifts (a payment processor changes its webhook format, a new WP REST vulnerability is disclosed, a new managed-WP host changes defaults), update both files together.*
