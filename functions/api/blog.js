/**
 * POST /api/blog — publish a blog post to the site.
 *
 * Cloudflare Pages Function. Accepts a JSON payload, writes a Markdown file
 * to src/content/blog/ in the GitHub repo via the Contents API, which
 * triggers the normal Pages build — the post is live when the deploy
 * finishes (typically 1–2 minutes).
 *
 * Auth: `Authorization: Bearer <BLOG_API_KEY>` header.
 *
 * Required environment variables (Pages → Settings → Environment variables):
 *   BLOG_API_KEY   – long random secret shared with the posting system
 *   GITHUB_TOKEN   – fine-grained PAT, Contents: Read & write on this repo only
 * Optional:
 *   GITHUB_REPO    – "owner/repo" (default: drddeveloper/myatlastaccountant)
 *   GITHUB_BRANCH  – branch to commit to (default: main)
 *
 * Payload (JSON):
 *   title        string, required, 3–200 chars
 *   body         string, required, Markdown, 50–100000 chars
 *   description  string, optional (default: first ~155 chars of body text)
 *   pubDate      string, optional ISO date (default: now)
 *   author       string, optional (default: "Atlas Accounting Group")
 *   tags         string[] of 1–10 tags, optional
 *   image        string, optional — featured image URL. Must be site-relative
 *                (/...) or hosted on myatlasaccountant.com (Astro only
 *                optimizes remote images from allowed domains).
 *   draft        boolean, optional (default false; drafts build but don't list)
 *
 * Responses:
 *   201 { ok, slug, url, path, commit }   – committed; live after deploy
 *   400 { error }                         – validation failure
 *   401 { error }                         – bad/missing bearer token
 *   405 { error }                         – non-POST method
 *   502 { error, detail }                 – GitHub API failure
 *   503 { error }                         – server not configured (env vars)
 */

const SITE_ORIGIN = 'https://www.myatlasaccountant.com';
const DEFAULT_REPO = 'drddeveloper/myatlastaccountant';
const POSTS_DIR = 'src/content/blog';

const json = (status, data) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });

// Constant-time-ish string comparison to avoid trivial timing probes.
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

function slugify(title) {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

// UTF-8 → base64 without blowing the call stack on long posts.
function toBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

// YAML-safe double-quoted scalar (JSON string quoting is valid YAML).
const yamlStr = (s) => JSON.stringify(String(s));

function buildMarkdown({ title, description, pubDate, author, tags, image, draft, body }) {
  const lines = [
    '---',
    `title: ${yamlStr(title)}`,
    `description: ${yamlStr(description)}`,
    `pubDate: ${yamlStr(pubDate)}`,
    `author: ${yamlStr(author)}`,
  ];
  if (tags && tags.length) {
    lines.push('tags:');
    for (const t of tags) lines.push(`  - ${yamlStr(t)}`);
  }
  if (image) lines.push(`image: ${yamlStr(image)}`);
  if (draft) lines.push('draft: true');
  lines.push('---', '', body.trim(), '');
  return lines.join('\n');
}

async function github(env, method, path, payload) {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'atlas-blog-api',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(payload ? { 'Content-Type': 'application/json' } : {}),
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  return res;
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function onRequest(context) {
  const { request } = context;
  if (request.method === 'OPTIONS') return onRequestOptions();
  if (request.method !== 'POST') {
    return json(405, { error: 'Method not allowed. POST a JSON payload to publish a post.' });
  }
  return onRequestPost(context);
}

export async function onRequestPost({ request, env }) {
  if (!env.BLOG_API_KEY || !env.GITHUB_TOKEN) {
    return json(503, { error: 'Blog API not configured: set BLOG_API_KEY and GITHUB_TOKEN in the Pages environment.' });
  }

  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!safeEqual(token, env.BLOG_API_KEY)) {
    return json(401, { error: 'Invalid or missing bearer token.' });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json(400, { error: 'Body must be valid JSON.' });
  }

  const title = typeof payload.title === 'string' ? payload.title.trim() : '';
  const body = typeof payload.body === 'string' ? payload.body.trim() : '';
  if (title.length < 3 || title.length > 200) {
    return json(400, { error: 'title is required (3–200 characters).' });
  }
  if (body.length < 50 || body.length > 100000) {
    return json(400, { error: 'body is required (50–100000 characters of Markdown).' });
  }

  let pubDate = new Date();
  if (payload.pubDate !== undefined) {
    pubDate = new Date(payload.pubDate);
    if (isNaN(pubDate.getTime())) return json(400, { error: 'pubDate must be a valid ISO date string.' });
  }

  let tags;
  if (payload.tags !== undefined) {
    if (
      !Array.isArray(payload.tags) ||
      payload.tags.length > 10 ||
      payload.tags.some((t) => typeof t !== 'string' || !t.trim() || t.length > 50)
    ) {
      return json(400, { error: 'tags must be an array of up to 10 non-empty strings (max 50 chars each).' });
    }
    tags = payload.tags.map((t) => t.trim());
  }

  const description =
    typeof payload.description === 'string' && payload.description.trim()
      ? payload.description.trim().slice(0, 300)
      : body.replace(/[#*_`>\[\]()!-]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 155);

  const author =
    typeof payload.author === 'string' && payload.author.trim()
      ? payload.author.trim().slice(0, 100)
      : 'Atlas Accounting Group';

  const draft = payload.draft === true;

  // Featured image: site-relative path or a URL on an allowed image domain.
  // A disallowed domain would fail the Astro build and block ALL future
  // deploys, so reject it here instead.
  let image;
  if (payload.image !== undefined) {
    if (typeof payload.image !== 'string' || !payload.image.trim()) {
      return json(400, { error: 'image must be a URL string.' });
    }
    image = payload.image.trim();
    if (!image.startsWith('/')) {
      let host;
      try {
        host = new URL(image).hostname;
      } catch {
        return json(400, { error: 'image must be an absolute URL or a site-relative path starting with /.' });
      }
      const allowed = ['www.myatlasaccountant.com', 'myatlasaccountant.com'];
      if (!allowed.includes(host)) {
        return json(400, {
          error: `image host "${host}" is not allowed. Use ${allowed.join(' or ')}, or a site-relative path.`,
        });
      }
    }
  }

  const baseSlug = slugify(title);
  if (!baseSlug) return json(400, { error: 'title produced an empty slug — use some letters or numbers.' });

  const repo = env.GITHUB_REPO || DEFAULT_REPO;
  const branch = env.GITHUB_BRANCH || 'main';

  // Find a free slug: base, then base-2 … base-6.
  let slug = baseSlug;
  for (let i = 2; i <= 7; i++) {
    const probe = await github(env, 'GET', `/repos/${repo}/contents/${POSTS_DIR}/${slug}.md?ref=${branch}`);
    if (probe.status === 404) break;
    if (!probe.ok) {
      return json(502, { error: 'GitHub API error while checking for existing post.', detail: await probe.text() });
    }
    if (i === 7) return json(400, { error: `Too many posts with slug "${baseSlug}" — vary the title.` });
    slug = `${baseSlug}-${i}`;
  }

  const markdown = buildMarkdown({
    title,
    description,
    pubDate: pubDate.toISOString(),
    author,
    tags,
    image,
    draft,
    body,
  });

  const put = await github(env, 'PUT', `/repos/${repo}/contents/${POSTS_DIR}/${slug}.md`, {
    message: `Add blog post: ${title}\n\nPublished via /api/blog`,
    content: toBase64(markdown),
    branch,
  });

  if (!put.ok) {
    return json(502, { error: 'GitHub API error while committing the post.', detail: await put.text() });
  }

  const result = await put.json();
  return json(201, {
    ok: true,
    slug,
    url: `${SITE_ORIGIN}/blog/${slug}/`,
    path: `${POSTS_DIR}/${slug}.md`,
    commit: result.commit && result.commit.sha,
    note: 'Committed. The post goes live when the Cloudflare Pages deploy finishes (typically 1–2 minutes).',
  });
}
