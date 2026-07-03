# Deploying to Cloudflare Pages

This project deploys to **Cloudflare Pages**. Cloudflare auto-builds the Astro site on every push to `main` — no CI/CD scripts required.

```
Push to main → Cloudflare Pages builds Astro site → Static dist/ served from Cloudflare's edge
```

---

## Cloudflare Pages Setup

### 1. Connect the Repo

1. Log into the **Cloudflare Dashboard** → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Authorize Cloudflare to access the GitHub account, then select this repo.
3. Choose the production branch (typically `main`).

### 2. Build Settings

| Setting | Value |
|---|---|
| Framework preset | **Astro** |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | *(leave blank)* |
| Node version | `22` (set via env var `NODE_VERSION` if Cloudflare defaults are older) |

### 3. Set the `site` URL

Update `site` in [`astro.config.mjs`](./astro.config.mjs) with the production domain (or the temporary `*.pages.dev` preview URL until the final domain is migrated). This is required for sitemap generation and canonical links.

### 4. Custom Domain

Once the build is green:
1. **Pages → Custom domains → Set up a custom domain**.
2. Add the production domain — Cloudflare provisions the SSL certificate automatically.
3. Update DNS at the registrar if the domain is not already on Cloudflare.

---

## Headers & Redirects

Both are native to Cloudflare Pages and live in `public/`.

### `public/_headers`

Security headers and Content-Security-Policy. Update the CSP when adding new third-party scripts or embeds (analytics, form handlers, video embeds, maps, etc.).

Common additions by category:

| Category | Directives to extend |
|---|---|
| Analytics | `script-src` / `connect-src` — `https://www.googletagmanager.com https://*.google-analytics.com` |
| Form handler | `connect-src` / `form-action` — `https://usebasin.com`, `https://formspree.io`, etc. |
| Video embeds | `frame-src` — `https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com` |
| Fonts (CDN) | `font-src` — `https://fonts.gstatic.com` |
| Maps | `frame-src` — `https://www.google.com/maps` |

### `public/_redirects`

301/302 redirects. Format: `/source /target status_code`.

```text
/old-page /new-page 301
/blog/old-post /blog/new-post 301
```

---

## Manual Deploy

1. Open the project in the Cloudflare Pages dashboard.
2. **Deployments** tab → **Create deployment** → **Retry deployment** (or push an empty commit to trigger a fresh build).

---

## Troubleshooting

**Build fails on Cloudflare but passes locally**
Most often a Node version mismatch. Set `NODE_VERSION=22` under **Settings → Environment variables**.

**404 on routes after deploy**
Confirm `trailingSlash: 'always'` in [`astro.config.mjs`](./astro.config.mjs) matches how links are written in the site. Cloudflare Pages serves `/about/index.html` for `/about/`.

**Headers not applied**
Check `public/_headers` syntax — leading whitespace matters. Validate via `curl -I https://yourdomain.com/`.

**Sitemap wrong**
The `site` value in `astro.config.mjs` is the source of truth for sitemap URLs. Update it to the production domain before going live.
