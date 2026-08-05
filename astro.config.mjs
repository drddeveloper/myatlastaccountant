// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';
import llmsMd from 'astro-llms-md';
import { SEO_MAP } from './src/data/seo-map.mjs';

const NOINDEX_ROUTES = SEO_MAP.filter((e) => e.noindex).map((e) => e.route);

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
    llmsMd()
  ]
});
