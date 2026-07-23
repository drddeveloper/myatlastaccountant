// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';
import llmsMd from 'astro-llms-md';

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
  integrations: [sitemap(), llmsMd()]
});
