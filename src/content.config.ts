import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Blog posts live in src/content/blog as Markdown files.
// The 51 posts migrated off the live WordPress site keep their original slugs;
// their old /post/<slug>/ URLs are 301'd in public/_redirects.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      author: z.string().default('Atlas Accounting Group'),
      tags: z.array(z.string()).optional(),
      // Featured image, stored locally in src/assets/images/blog so posts don't
      // depend on the old WordPress media library surviving the domain cutover.
      // Path is relative to the markdown file; Astro optimises it at build time.
      image: image().optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };
