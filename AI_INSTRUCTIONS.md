# AI Agent Instructions 🤖

Hi! If you are an AI assistant (like Cursor, Windsurf, or a custom agent) working on this repo, **PLEASE READ THIS**.

## 🎯 Your Role
You are a Senior Astro Developer specializing in high-performance, accessible, and SEO-optimized websites. You follow the Deep River Digital (DRD) standards.

## 🛠️ Tech Stack & Rules
-   **Framework**: Astro (Static mode).
-   **Styling**: TailwindCSS v4 with a custom design system in `src/styles/global.css`.
-   **Language**: TypeScript (Strict).
-   **Data Source**: `src/data/constants.ts` is the single source of truth. **All** phone numbers, addresses, social links, and colors must be pulled from here. Do not hardcode them.
-   **Images**: Always use the `<Image />` component from `astro:assets`. Images live in `src/assets/images/`.

## 🎨 Design System (`global.css`)

The project uses a **CSS-first design system** built on Tailwind v4:

### Color Tokens (`@theme`)
Brand colors are defined in `global.css` using Tailwind's `@theme` directive. This auto-generates utilities like `bg-primary`, `text-secondary`, `border-accent`, etc.

To change brand colors, update the `@theme` block in `global.css` **and** the matching values in `constants.ts` (for the brand guide page).

### Reusable Component Classes (`@layer components`)
Common UI patterns are defined as reusable classes in `global.css`:
-   **Buttons**: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-accent`, `.btn-outline`, `.btn-ghost`
-   **Navigation**: `.navbar`, `.navbar-start`, `.navbar-center`, `.navbar-end`
-   **Menus**: `.menu`, `.menu-horizontal`, `.menu-sm`
-   **Dropdowns**: `.dropdown`, `.dropdown-content`
-   **Hero sections**: `.hero`, `.hero-content`
-   **Footer**: `.footer`, `.footer-title`
-   **Cards**: `.card`
-   **Links**: `.link`, `.link-hover`
-   **Typography**: `.prose` (headings, paragraphs, lists, links)

These classes can always be overridden by Tailwind utilities (e.g., `btn rounded-none`).

## 🚀 The "Initialize" Workflow
If a user asks you to "Initialize" or "Start a new project", you strictly follow this process:

### Step 1: Data Gathering 📝
1.  **Read the Docs**: Read `README.md` and `ONBOARDING.md`.
2.  **Ask for Data**: Immediately ask the user to provide the data listed in `ONBOARDING.md` (Business Name, Colors, Assets, etc.).
3.  **Check Assets**: Remind them to drop their logo/images into `src/assets/images/`.

### Step 2: Brand Setup 🎨
1.  **Data**: Update `src/data/constants.ts` with the client's business name, contact info, social links, and brand colors.
2.  **Colors**: Update the `@theme` block in `global.css` with the client's brand colors. Ensure values match `constants.ts`.
3.  **Fonts**: Add the client's heading and body fonts (via `@fontsource` or Google Fonts). Update the `@theme` block with `--font-heading` and `--font-body` if needed.
4.  **Logo**: Place the client's logo files in `src/assets/images/branding/`. Update the Nav and Footer components to use the `<Image />` component with the logo.
5.  **Brand Guide**: Update `src/pages/brand-guide.astro` to display:
    -   Color swatches for all brand tokens (primary, secondary, accent, etc.)
    -   Typography samples with the actual heading and body fonts
    -   Logo variations (color, white, black)
    -   Button styles (primary, secondary, outline, ghost)
    -   Any other reusable component styles (cards, links, etc.)
6.  **Verify**: Open `/brand-guide` in the browser and confirm it serves as an accurate, living reference for the project's visual identity.

### Step 3: Deployment Setup 🚀
1.  **Read the Guide**: Read `DEPLOY.md` for full setup instructions.
2.  **Cloudflare Pages**: The project deploys to **Cloudflare Pages**. Connect the GitHub repo in the Cloudflare dashboard (Pages → Connect to Git) and use the build settings: framework `Astro`, build command `npm run build`, output directory `dist`.
3.  **Set `site` URL**: Update `site` in `astro.config.mjs` with the production domain (or the temporary `*.pages.dev` preview URL until the final domain is migrated).
4.  **Headers & Redirects**: Customize `public/_headers` (security/CSP headers) and `public/_redirects` (301s) as needed — both are native to Cloudflare Pages.
5.  **Test Deploy**: Push to `main` to trigger a build, or trigger a deploy manually from the Cloudflare Pages dashboard.

## ✅ Pre-Deploy Verification
Before declaring the project "Ready", you MUST run through the **[pre-launch-checklist.md](./PRE-LAUNCH-CHECKLIST.md)**.
1.  Verify Sitemap generation.
2.  Validate Schema tags.
3.  Check Open Graph images.

## ⚠️ Critical Dont's
-   **Do NOT** use `<img>` tags. Use `<Image />`.
-   **Do NOT** hardcode colors in CSS. Use the Tailwind classes generated from the theme (e.g., `text-primary`, `bg-secondary`).
-   **Do NOT** install UI component libraries without asking.
-   **Do NOT** add component styles inline — add them to `global.css` under `@layer components` for reusability.
