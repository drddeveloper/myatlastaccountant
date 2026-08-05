# Client Onboarding Checklist 📋

Use this checklist to gather all necessary assets and information from the client before starting the build. This ensures a smooth development process and minimizes back-and-forth.

## 1. Core Identity & Data 📇

Open `src/data/constants.ts` and ensure you have the following:

- [ ] **Business Name**: Full legal name.
- [ ] **Phone Number**: Main contact number.
- [ ] **Email Address**: Public-facing email.
- [ ] **Physical Address**: Street, City, State, Zip (for Local SEO).
- [ ] **Hours of Operation**: e.g., "Mon-Fri: 9am-5pm".
- [ ] **Google Analytics ID**: `G-XXXXXXXXXX` (Optional but recommended).
- [ ] **Social Media Links**: Facebook, Instagram, LinkedIn, etc.

## 2. Design & Branding 🎨

Update the `branding` section in `src/data/constants.ts` **and** the matching `@theme` tokens in `src/styles/global.css` (Tailwind v4 is configured in CSS — there is no `tailwind.config.mjs`).

- [ ] **Primary Color**: Hex code (e.g., `#3B82F6`). Used for buttons, links, highlights.
- [ ] **Secondary Color**: Hex code (e.g., `#1E40AF`). Used for hover states, accents.
- [ ] **Accent Color**: Hex code (e.g., `#F59E0B`). Used for call-to-actions, warnings.
- [ ] **Heading Font**: Preferred font family (e.g., Inter, Montserrat).
- [ ] **Body Font**: Preferred font family (e.g., Open Sans, Roboto).

## 3. Essential Images & Assets 🖼️

Place these inside `src/assets/images/branding/` unless otherwise noted.

| Asset | Format | Recommended Size | naming_convention |
| :--- | :--- | :--- | :--- |
| **Logo (Color)** | SVG (best) or PNG | Height: ~100px | `logo-color.svg` |
| **Logo (White)** | SVG (best) or PNG | Height: ~100px | `logo-white.svg` |
| **Logo (Black)** | SVG (best) or PNG | Height: ~100px | `logo-black.svg` |
| **Favicon** | SVG (best) or ICO | 32x32 | `favicon.svg` / `favicon.ico` (in `public/`) |
| **Site Icons** | PNG | 192x192 **and** 512x512 | `site-icon-192.png`, `site-icon-512.png` (in `public/` — referenced by the generated web manifest) |
| **Apple Touch Icon**| PNG | 180x180 | `apple-touch-icon.png` (in `public/`) |
| **OG Image** | JPG | 1200x630 | `og-image.jpg` (in `public/` — must be served at `/og-image.jpg`, referenced by BaseLayout meta tags) |

## 4. Content, Copy & SEO Map 📝

- [ ] **Home Page Headline**: The main "H1" hook.
- [ ] **Home Page Sub-headline**: The 1-2 sentence elevator pitch.
- [ ] **Call to Action**: What should users do? (Call, Book, Email).
- [ ] **About Us Blurb**: Short paragraph for the footer/about page.
- [ ] **Service List**: List of core services offered.

### The SEO Map (required deliverable) 🗺️

The SEO map is the per-page keyword and metadata plan. It is authored **before pages are built** and lives in [`src/data/seo-map.mjs`](./src/data/seo-map.mjs) — one entry per planned public page. At launch, `npm run preflight` and checklist section A2 verify the built site against it, so it must exist first: **the launch check verifies the site against the map; it never invents targets at launch time.**

**Who produces it:** the agency's SEO lead drafts it (keyword research + the client's service list from above); the client signs off on keyword targets and page priorities before build starts.

**One row per page, with:**

| Field | What it is | Acceptance criteria |
|-------|-----------|---------------------|
| `route` | Planned URL slug, with trailing slash | Slug contains the keyword's core terms |
| `primaryKeyword` | The ONE search phrase the page targets | Unique across all indexable pages — no two pages may share a target (cannibalization) |
| `intent` | `transactional` / `informational` / `navigational` / `local` | Matches what actually ranks for the keyword |
| `title` | Page part of the `<title>` (layout appends "\| Business Name") | Keyword front-loaded, ≤ 60 chars total |
| `description` | Meta description | 150–160 chars, keyword + value proposition + CTA |
| `h1` | Intended on-page H1 | Aligned with the title, not identical to it |
| `noindex` | `true` for utility pages (thank-you, brand guide) | Set deliberately — drives the sitemap filter and noindex meta |
| `notes` | Secondary keywords, internal-link anchor plans | Optional |

**Definition of done:** every planned indexable page has all fields filled (navigational pages like site credits may leave `primaryKeyword` empty), no two indexable rows share a keyword, and the client has approved the keyword→page assignments in writing.

## 5. Technical Access 🔑

- [ ] **Domain Access**: Registrar login or DNS access (Cloudflare setup).
- [ ] **Google Business Profile**: Manager access (for review monitoring/linking).
