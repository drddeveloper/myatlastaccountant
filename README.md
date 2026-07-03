# Deep River Digital Master Starter SOP

This is the official Deep River Digital starter template for Astro projects. It breaks the "blank page" problem and enforces agency standards for speed, SEO, and structure.

## 🚀 Quick Start for New Clients

1.  **Clone & Install**:
    ```bash
    git clone <repo-url> new-client-name
    cd new-client-name
    npm install
    ```

    > **📋 START HERE:** Review [ONBOARDING.md](./ONBOARDING.md) for the complete checklist of client assets and data required to launch.

2.  **Configure Data**:
    - Open `src/data/constants.ts`
    - Update `SITE_DATA` with the client's Name, Component, Phone, Email, and Socials.
    - **CRITICAL**: Update `branding.colors` to match their brand identity.

3.  **Theme Setup**:
    - The `tailwind.config.mjs` pulls colors directly from `constants.ts`.
    - No manual Tailwind config editing is required for basic color changes.

4.  **Content**:
    - Build pages in `src/pages/`.
    - Use `src/layouts/BaseLayout.astro` for every page.
    - Components are in `src/components/`.

5. ## 🚀 Deployment

The project is pre-configured for **Cloudflare Pages**.

1.  **Push to GitHub**:
    ```bash
    git push origin main
    ```
2.  **Connect Cloudflare**:
    - Go to Cloudflare Dashboard > Pages.
    - "Connect to Git" -> Select this repo.
    - **Build Settings**:
        - Framework: `Astro`
        - Build Command: `npm run build`
        - Output Directory: `dist`

### 301 Redirects
Manage redirects in `public/_redirects`. This file is native to Cloudflare Pages.
```text
/old-page /new-page 301
```

## 🛠️ Tech Stack

-   **Astro**: Static Site Generation (Zero JS by default).
-   **TailwindCSS**: Utility-first styling.
-   **Custom Design System**: Reusable component classes defined in `global.css` (buttons, cards, navbars, etc.).
-   **TypeScript**: Type safety for our data layer.

## 📂 Project Structure

-   `src/data/constants.ts`: **The Brain**. All client data lives here.
-   `src/layouts/BaseLayout.astro`: **The Skeleton**. Handles SEO, Meta, Analytics, Nav, Footer.
-   `src/components/`: Reusable UI blocks.
-   `src/pages/`: URL routes.
-   `src/assets/images/`: **Optimized Images**.
    -   Subdirectories: `branding`, `icons`, `services`, `about`, `locations`.
    -   Images here are optimized by Astro at build time.

## 🖼️ Image Handling

To use images with Astro's optimization:

1.  Place images in `src/assets/images/`.
2.  Import them in your component/page:
    ```astro
    ---
    import { Image } from 'astro:assets';
    import myImage from '../assets/images/branding/logo.png';
    ---
    <Image src={myImage} alt="Brand Logo" />
    ```
