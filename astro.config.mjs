// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';
import llmsMd from 'astro-llms-md';
import { SEO_MAP } from './src/data/seo-map.mjs';

const NOINDEX_ROUTES = SEO_MAP.filter((e) => e.noindex).map((e) => e.route);

// Same routes, as dist-relative globs for astro-llms-md's `exclude`
// ('/brand-guide/' -> 'brand-guide/**'). A page we keep out of Google should
// not be advertised to language models either.
const NOINDEX_GLOBS = NOINDEX_ROUTES
  .map((r) => r.replace(/^\/|\/$/g, ''))
  .filter(Boolean)
  .map((r) => `${r}/**`);

// https://astro.build/config
export default defineConfig({
  site: 'https://www.myatlasaccountant.com',
  devToolbar: { enabled: false },
  // Remote featured images for blog posts (see BLOG-API.md) may live on the
  // client's WordPress media library while posts migrate.
  image: {
    domains: ['www.myatlasaccountant.com', 'myatlasaccountant.com'],
  },
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
    sitemap({
      // Driven by src/data/seo-map.mjs — routes marked noindex there are
      // excluded here. scripts/preflight.mjs verifies the built pages agree.
      filter: (page) => !NOINDEX_ROUTES.includes(new URL(page).pathname)
    }),
    llmsMd({
      // Without an explicit name the integration takes the llms.txt heading
      // from the homepage <h1>, which contains a <br />. That emitted a
      // two-line markdown heading whose second line ("#1 Accountants for
      // Contractors…") re-parsed as its own H1. Values mirror
      // SITE_DATA.company.name / SITE_DATA.seo.description in
      // src/data/constants.ts — that file is TypeScript, which this config
      // cannot import, so keep the two in sync by hand.
      name: 'Atlas Accounting Group',
      description:
        'Atlas Accounting Group is the #1 accounting firm for contractors and specialty trades — bookkeeping, payroll, and tax for construction, HVAC, electrical, plumbing, and solar businesses.',
      // Integration defaults, plus the noindex routes.
      exclude: ['404', '404.html', '_astro', '**.xml', '**.txt', 'node_modules', ...NOINDEX_GLOBS]
    })
  ]
});
