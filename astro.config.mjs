// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';
import llmsMd from 'astro-llms-md';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com', // Updated by CI/CD or Manual Input
  devToolbar: { enabled: false },
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [sitemap(), llmsMd()]
});
