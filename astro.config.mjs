// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';
import llmsMd from 'astro-llms-md';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.myatlasaccountant.com',
  devToolbar: { enabled: false },
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [sitemap(), llmsMd()]
});
