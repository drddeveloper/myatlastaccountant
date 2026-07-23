import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Blog posts live in src/content/blog as Markdown files.
// Note: the live WordPress site serves posts under /post/<category>/<slug>/ —
// those are NOT recreated here. Post migration (with redirects) is a separate
// follow-up task.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: z.string().default('Atlas Accounting Group'),
    tags: z.array(z.string()).optional(),
    // Featured image URL. Remote URLs must be on a domain listed in
    // astro.config.mjs image.domains or the build will fail.
    image: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
