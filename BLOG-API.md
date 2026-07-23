# Blog Posting API

Publish blog posts to the site with a single HTTP request — designed for the
leadflow system, Zapier/Make, or any script. Posts are committed as Markdown
to this repo, which triggers the normal Cloudflare Pages build. A post is live
**1–2 minutes** after a successful API call.

There is no database and no CMS to maintain: **the Git repo is the CMS.**

## One-time setup (Cloudflare dashboard)

1. **Create a GitHub token** — GitHub → Settings → Developer settings →
   Fine-grained personal access tokens → Generate new token:
   - Repository access: **Only** `drddeveloper/myatlastaccountant`
   - Permissions → Repository → **Contents: Read and write**
   - Expiration: 1 year (calendar a renewal reminder)
2. **Generate an API key** — any long random string, e.g. `openssl rand -hex 32`.
3. **Add both to Pages** — Cloudflare dashboard → the Pages project →
   Settings → Environment variables → Production:
   - `GITHUB_TOKEN` = the PAT from step 1 (encrypt)
   - `BLOG_API_KEY` = the random key from step 2 (encrypt)
4. Redeploy once so the function picks up the variables.

Give `BLOG_API_KEY` to the leadflow system; the GitHub token never leaves
Cloudflare.

## Endpoint

```
POST https://www.myatlasaccountant.com/api/blog
Authorization: Bearer <BLOG_API_KEY>
Content-Type: application/json
```

| Field         | Type      | Required | Notes                                                        |
| ------------- | --------- | -------- | ------------------------------------------------------------ |
| `title`       | string    | yes      | 3–200 chars. Becomes the slug (`/blog/<slug>/`).             |
| `body`        | string    | yes      | Markdown, 50–100k chars. Headings start at `##`.             |
| `description` | string    | no       | Meta/list excerpt. Default: first ~155 chars of the body.    |
| `pubDate`     | ISO date  | no       | Default: now.                                                |
| `author`      | string    | no       | Default: `Atlas Accounting Group`.                           |
| `tags`        | string[]  | no       | Up to 10.                                                    |
| `image`       | string    | no       | Featured image URL — must be on `myatlasaccountant.com` (e.g. the WordPress media library) or a site-relative path. Cards show a branded panel when omitted. |
| `draft`       | boolean   | no       | `true` = committed but not listed on /blog/.                 |

### Example

```bash
curl -X POST https://www.myatlasaccountant.com/api/blog \
  -H "Authorization: Bearer $BLOG_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Job Costing Basics for HVAC Contractors",
    "description": "What job costing is, why HVAC margins hide without it, and a simple way to start.",
    "tags": ["HVAC", "Job Costing"],
    "body": "Every HVAC owner knows the feeling...\n\n## Why margins hide\n\nMore markdown here."
  }'
```

### Response — `201 Created`

```json
{
  "ok": true,
  "slug": "job-costing-basics-for-hvac-contractors",
  "url": "https://www.myatlasaccountant.com/blog/job-costing-basics-for-hvac-contractors/",
  "path": "src/content/blog/job-costing-basics-for-hvac-contractors.md",
  "commit": "abc1234...",
  "note": "Committed. The post goes live when the Cloudflare Pages deploy finishes (typically 1–2 minutes)."
}
```

Duplicate titles get `-2`, `-3`, … suffixes automatically. Errors come back as
JSON with `400` (validation), `401` (bad key), `502` (GitHub problem), or
`503` (env vars not set yet).

## Alternative ways to post

- **By hand / with an agent:** drop a `.md` file in `src/content/blog/` with
  the frontmatter below and push to `main`. Identical result.
- **Editing or deleting:** edit or delete the file in the repo (GitHub web UI
  works fine) and the site rebuilds.

```markdown
---
title: "Post Title"
description: "One-sentence summary for the listing and meta tags."
pubDate: "2026-07-08"
tags: ["Construction"]
---

Post body in Markdown…
```
