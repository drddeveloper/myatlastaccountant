# AI / Agent Readiness — Pre-Launch Checklist

> Companion to the standard Pre-Launch Checklist. Use for any client site before go-live.
> **Last verified: 2026-06-29.** Every emerging standard below is moving monthly — re-verify
> status, syntax, and crawler-honoring before relying on any claim here. Treat "adoption %"
> and "X company honors this" statements as point-in-time, not durable.

---

## How to read this checklist

Cloudflare's "Is Your Site Agent-Ready?" scan bundles two unrelated things into one score:

1. **Content-site signals** — is the site discoverable, crawlable, and does it declare how AI
   may use its content. *Relevant to almost every site we build.*
2. **Agentic-application signals** — does the site expose APIs, auth, MCP servers, agent skills,
   and machine payments. *Relevant only if the site is an application or transacts.*

For a static Astro marketing / lead-gen site for a local service business, bucket (2) is **N/A by
design**. A low Cloudflare score there is an artifact of the rubric, not a defect. **Do not chase
100.** Implement Tier 0 and Tier 1; mark Tier 2/3 N/A unless the trigger condition is met.

The scan also **omits** the two highest-leverage AI-visibility signals for a local business —
structured data (JSON-LD) and crawlable server-rendered content. Those are in Tier 0 here because
they matter more for AI answer-engine citation than anything the scan scores.

**Opinion vs fact:** adoption figures, standard statuses, and what-the-scan-checks are factual
(sourced). Tier assignments, the "don't chase 100" stance, the "schema is highest-leverage" claim,
and the recommended Content-Signal posture are **judgment calls** — marked where they appear.

---

## Tier 0 — Baseline (every site; established standards)

These are stable, broadly honored, and worth 100% completion.

- [ ] **Crawlable, server-rendered HTML content** *(not a Cloudflare scan item — added)*
  - **Why:** AI answer engines and search crawlers (GPTBot, ClaudeBot, OAI-SearchBot,
    Claude-SearchBot, PerplexityBot, Googlebot) primarily parse HTML directly. Content gated
    behind client-side JS rendering can be missed. This is the single most important "AI-ready"
    factor and it is upstream of every file-based signal below.
  - **Astro:** default static/SSG output already satisfies this. Verify that primary copy,
    headings, contact info, and service/location content are in the served HTML, not injected by
    a client island. Avoid putting core content inside `client:only` components.
  - **Verify:** `curl -s https://DOMAIN/ | grep -i "<key phrase>"` returns the content; or view
    source and confirm text is present without JS.

- [ ] **Structured data / JSON-LD** *(not a Cloudflare scan item — added; judgment: highest leverage)*
  - **Why:** Feeds entity understanding for AI answers, GBP/knowledge-graph alignment, and rich
    results. For a local service business this is the highest-ROI machine-readability work, and
    the Cloudflare scan does not check it at all.
  - **Minimum set per site:** `Organization` or `LocalBusiness` (use the most specific subtype,
    e.g. `Accountant`, `Attorney`, `MedicalClinic`), `WebSite`, `BreadcrumbList`. Add `Service`
    per service page, `FAQPage` where genuine Q&A exists, `Person` for named practitioners. For
    multi-location clients, one `LocalBusiness` node per location with distinct `address`,
    `geo`, `telephone`, `openingHours`, and a stable `@id`.
  - **Consistency:** NAP (name/address/phone) in schema must match GBP and on-page exactly.
  - **Astro:** emit `<script type="application/ld+json">` from a layout or per-page; drive it
    from content collection frontmatter so it can't drift from visible content.
  - **Verify:** Google Rich Results Test + Schema.org validator. No errors; entity types resolve.

- [ ] **robots.txt** *(Cloudflare: Discoverability)*
  - **Status:** RFC 9309. ~78% of sites have one (Cloudflare Radar). Stable; honored by
    well-behaved crawlers, voluntary for the rest.
  - **Astro:** static `public/robots.txt`, or generate via `src/pages/robots.txt.ts` if rules
    are dynamic. Must reference the sitemap.
  - **Verify:** `GET /robots.txt` → 200, `text/plain`, valid `User-agent` + `Sitemap` lines.

- [ ] **XML sitemap, referenced from robots.txt** *(Cloudflare: Discoverability)*
  - **Status:** sitemaps.org de facto standard. Stable.
  - **Astro:** `@astrojs/sitemap` integration (requires `site` set in `astro.config`); outputs
    `/sitemap-index.xml` + `/sitemap-0.xml`. Add `Sitemap: https://DOMAIN/sitemap-index.xml` to
    robots.txt.
  - **Verify:** `GET /sitemap-index.xml` → 200, valid XML; URLs resolve; referenced in robots.txt.

---

## Tier 1 — AI crawl & usage signaling (cheap, emerging; do for client sites with caveats)

Low cost to add. Honoring by AI companies is **partial and unconfirmed** — implement for
hygiene/optionality, not because payoff is proven.

- [ ] **Content Signals in robots.txt** *(Cloudflare: Bot Access Control)*
  - **Status:** Cloudflare-led, CC0-licensed, IETF-draft (launched ~Sept 2025). ~4% adoption.
    Expresses *preferences only* — no technical enforcement. Google has **not** committed to
    honoring it; treat any "it controls AI Overviews / AI answers" claim as aspirational.
  - **What it declares (three independent signals):** `search` (search index + snippets),
    `ai-input` (use as input for AI-generated/grounded answers — the AEO/GEO-relevant one),
    `ai-train` (model training/fine-tuning).
  - **Recommended posture for a lead-gen / marketing site** *(judgment, not fact):*
    ```
    User-agent: *
    Content-Signal: search=yes, ai-input=yes, ai-train=no
    ```
    Rationale: the site's goal is visibility, so you want to be indexed (`search=yes`) and
    eligible for AI answer citation/referral (`ai-input=yes`). `ai-train` carries no visibility
    benefit and is a **client business/legal decision** — `no` is a defensible default but
    confirm per client. Enforcement still depends on the crawler choosing to comply.
  - **Do NOT** add `ai-input=no` reflexively — for these clients that would signal *against* the
    AI-citation outcome you're being paid to produce.
  - **Astro/Cloudflare:** edit robots.txt directly. If the client's zone uses Cloudflare's
    *managed robots.txt*, Cloudflare may inject its own Content Signals — reconcile so you don't
    fight the managed file. Verify which is authoritative before editing.
  - **Verify:** `GET /robots.txt` shows the `Content-Signal:` directive(s) in the correct
    `User-agent` group.

- [ ] **llms.txt** *(NOT in the Cloudflare scan — added for completeness; low priority)*
  - **Status:** community convention (llmstxt.org), no standards body, no enforcement. Adoption
    ~6–10% depending on dataset/methodology. **No major AI provider** (OpenAI, Google, Anthropic,
    Meta, Mistral) has committed to reading it in production; search/answer crawlers fetch it
    negligibly. Real, demonstrated value is **developer tooling / agent routing** (Cursor,
    Claude Code, Copilot fetch it for docs) — *not* marketing-site citation.
  - **Honest call** *(judgment):* ship it if the build cost is near-zero; do **not** present it
    to clients as an AI-visibility lever — that claim is currently unsupported by evidence.
    Higher value if the client site is documentation-heavy or API-facing.
  - **Format:** Markdown — H1 title, `>` one-line summary, `## Sections` with
    `- [Title](url): short description`. Public pages only; never link confidential/client-report
    URLs (it is not an access control).
  - **Astro:** generate from content collections at build into `public/llms.txt`, or a
    `src/pages/llms.txt.ts` endpoint, so it stays in sync with the sitemap.
  - **Pitfall:** do not auto-generate a `.md` duplicate of every page and leave those
    indexable — that creates duplicate-content at scale.
  - **Verify:** `GET /llms.txt` → 200; links resolve.

- [ ] **Markdown content negotiation ("Markdown for Agents")** *(Cloudflare: Content)*
  - **Status:** Cloudflare feature. ~3.9% adoption. As of Feb 2026 only **Claude Code, OpenCode,
    and Cursor** send `Accept: text/markdown` by default; most agents don't, so a URL-based `.md`
    fallback is what actually gets used. Value concentrated in docs/dev-consumption, low for a
    brochure site. John Mueller (Google) has publicly questioned its usefulness.
  - **Conditional:** worth doing for documentation-style or content-heavy client sites; skip for
    thin brochure sites.
  - **Implementation options:**
    - **Cloudflare zone feature:** enable managed "Markdown for Agents" in the zone dashboard
      (AI Crawl Control / Settings). **Verify availability for Cloudflare *Pages* projects
      specifically** — confirm in-dashboard rather than assuming; this has been a full-zone
      feature and Pages parity should be checked at build time.
    - **Manual on Pages:** generate `.md` per page at build, then serve via a Pages Function /
      Worker that content-negotiates on `Accept: text/markdown` (and/or a `/path/index.md`
      URL fallback). Note: static `_headers` / `_redirects` **cannot** branch on a request
      header — header-based negotiation requires a Function/Worker.
  - **Verify:** `curl -s -H "Accept: text/markdown" https://DOMAIN/` returns
    `Content-Type: text/markdown` (not `text/html`).

---

## Tier 2 — Conditional / trigger-based (N/A by default for static lead-gen sites)

Each maps to a Cloudflare scan check. **Leave unchecked and mark N/A** unless the named trigger is
true. Implementing these on a brochure site adds maintenance/attack surface for zero benefit.

- [ ] **Link headers (RFC 8288)** *(Cloudflare: Discoverability)*
  - **Trigger:** the site actually has an API catalog, service docs, or status endpoint to point
    agents at. **N/A** for marketing sites with nothing to advertise.
  - **If triggered (Cloudflare Pages):** add to `_headers`, e.g.
    `Link: </.well-known/api-catalog>; rel="api-catalog"`.

- [ ] **DNS for AI Discovery (DNS-AID)** *(Cloudflare: Discoverability)*
  - **Status:** early IETF draft. **Trigger:** site exposes agent endpoints (A2A/MCP) worth
    advertising via DNS. **N/A** otherwise.

- [ ] **API Catalog (RFC 9727)** *(Cloudflare: API/Auth/MCP)*
  - **Status:** real RFC, but <15 sites in Cloudflare's entire Radar dataset. **Trigger:** the
    site publishes a public API. **N/A** otherwise.

- [ ] **OAuth / OIDC discovery + OAuth Protected Resource** *(Cloudflare: API/Auth/MCP)*
  - **Status:** stable OAuth/OIDC standards. **Trigger:** the site has *protected* APIs agents
    must authenticate to. **N/A** for sites with no API.

- [ ] **auth.md agent registration** *(Cloudflare: API/Auth/MCP)*
  - **Status:** WorkOS-led convention, very new, not standardized. **Trigger:** agent
    registration flow exists. **N/A** otherwise.

- [ ] **MCP Server Card (SEP-1649 / in-progress standardization)** *(Cloudflare: API/Auth/MCP)*
  - **Status:** draft, schema still being standardized. **Trigger:** the client runs an MCP
    server you want discoverable. **N/A** for content sites. *(Note: this could become a genuine
    DRD productized offering — exposing a client's booking/quote/FAQ tools via MCP — but that's a
    build, not a checklist tick.)*

- [ ] **Agent Skills index (Cloudflare RFC v0.2.0)** *(Cloudflare: API/Auth/MCP)*
  - **Status:** very new. **Trigger:** you publish agent skills for the domain. **N/A** otherwise.

- [ ] **WebMCP (`navigator.modelContext`)** *(Cloudflare: API/Auth/MCP)*
  - **Status:** experimental browser API (Chrome / WebML community). **Trigger:** the site is an
    interactive web app exposing in-page tools to browser agents. **N/A** for static sites.

- [ ] **Web Bot Auth request signing** *(Cloudflare: Bot Access Control)*
  - **Status:** IETF draft for cryptographic bot identity. This is primarily an **edge/CDN
    concern** (verifying inbound bots), not something a static origin "serves" to be more AI-ready.
    Handle via Cloudflare bot verification settings if the client wants verified-bot gating;
    otherwise **N/A** at the site level.

---

## Tier 3 — Commerce (only transactional sites)

The Cloudflare scan marks these **optional / not scored** and only checks them when e-commerce
signals are detected. All are draft-stage. **N/A** unless the client site sells/transacts directly
(not just generates leads).

- [ ] **x402** — HTTP 402 agent micropayments (Coinbase/Cloudflare x402 Foundation). Trigger: paid
  agent-accessible resources.
- [ ] **MPP (Machine Payment Protocol)** — `x-payment-info` on an OpenAPI doc. Trigger: payable API ops.
- [ ] **UCP (Universal Commerce Protocol)** — `/.well-known/ucp`. Trigger: content payments.
- [ ] **ACP (Agentic Commerce Protocol)** — `/.well-known/acp.json`. Trigger: agent-checkout commerce.

---

## What the Cloudflare scan does NOT check (but matters as much or more)

Track these separately; they are not in the score and several outrank everything scored.

- [ ] **Structured data / JSON-LD** — see Tier 0. Highest leverage; absent from the scan.
- [ ] **GBP / entity / NAP consistency** across site, schema, and Google Business Profile.
- [ ] **Content answerability** — direct-answer openings, named entities, explicit local/service
  facts. This drives AI *citation*; file-based signals only help discovery.
- [ ] **Indexability of JS-rendered content** — see Tier 0.
- [ ] **Core Web Vitals / performance** — covered by the standard Pre-Launch Checklist; relevant
  because crawl efficiency and UX gate both classic and AI search.
- [ ] **Canonical/hreflang hygiene** for multi-location and multi-language client sites.

---

## Cloudflare score interpretation (set client expectations)

- A static lead-gen Astro site will score low (≈20s) **and that is correct.** ~70% of scored
  checks require being an API/auth/MCP/commerce platform the site is not.
- The honest target for these clients is: **all of Tier 0, the chosen Tier 1 items, everything
  else N/A-by-design** — not a high Cloudflare number.
- If a client fixates on the score, the fastest legitimate movement comes from Tier 0 + Content
  Signals; beyond that you'd be implementing infrastructure with no business purpose.

## Sources (verify before quoting to clients)

- Cloudflare Agent Readiness blog / Radar AI Insights — adoption figures (robots.txt ~78%,
  Content Signals ~4%, markdown negotiation ~3.9%, API Catalogs <15 sites) and the
  Claude Code/OpenCode/Cursor `Accept: text/markdown` default (Feb 2026).
- Cloudflare Content Signals Policy announcement (Sept 2025) + Search Engine Land — CC0 status,
  three signals, Google non-commitment.
- llms.txt adoption: SE Ranking (~10.13% of 300k domains), HTTP Archive (~5.6%), plus
  provider non-commitment statements (Q1–Q2 2026).
- All standard statuses (RFC vs draft vs convention) are point-in-time as of 2026-06-29.
