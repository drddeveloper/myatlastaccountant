# Client Onboarding Checklist 📋

Use this checklist to gather all necessary assets and information from the client before starting the build. This ensures a smooth development process and minimizes back-and-forth.

## 1. Core Identity & Data 📇

Open `src/data/constants.ts` and ensure you have the following:

- [ ] **Business Name**: Full legal name.
- [ ] **Phone Number**: Main contact number.
- [ ] **Email Address**: Public-facing email.
- [ ] **Physical Address**: Street, City, State, Zip (for Local SEO).
- [ ] **Hours of Operation**: e.g., "Mon-Fri: 9am-5pm".
- [ ] **Google Analytics ID**: `G-XXXXXXXXXX` (Optional but recommended).
- [ ] **Social Media Links**: Facebook, Instagram, LinkedIn, etc.

## 2. Design & Branding 🎨

Update the `branding` section in `src/data/constants.ts` and `tailwind.config.mjs` (if strictly necessary, though constants usually suffice).

- [ ] **Primary Color**: Hex code (e.g., `#3B82F6`). Used for buttons, links, highlights.
- [ ] **Secondary Color**: Hex code (e.g., `#1E40AF`). Used for hover states, accents.
- [ ] **Accent Color**: Hex code (e.g., `#F59E0B`). Used for call-to-actions, warnings.
- [ ] **Heading Font**: Preferred font family (e.g., Inter, Montserrat).
- [ ] **Body Font**: Preferred font family (e.g., Open Sans, Roboto).

## 3. Essential Images & Assets 🖼️

Place these inside `src/assets/images/branding/` unless otherwise noted.

| Asset | Format | Recommended Size | naming_convention |
| :--- | :--- | :--- | :--- |
| **Logo (Color)** | SVG (best) or PNG | Height: ~100px | `logo-color.svg` |
| **Logo (White)** | SVG (best) or PNG | Height: ~100px | `logo-white.svg` |
| **Logo (Black)** | SVG (best) or PNG | Height: ~100px | `logo-black.svg` |
| **Favicon** | PNG or ICO | 32x32 | `favicon.png` (in `public/`) |
| **Site Icon** | PNG | 192x192 | `site-icon.png` (for Web Manifest) |
| **Apple Touch Icon**| PNG | 180x180 | `apple-touch-icon.png` (in `public/`) |
| **OG Image** | JPG | 1200x630 | `og-image.jpg` (Social Sharing) |

## 4. Content & Copy 📝

- [ ] **Home Page Headline**: The main "H1" hook.
- [ ] **Home Page Sub-headline**: The 1-2 sentence elevator pitch.
- [ ] **Call to Action**: What should users do? (Call, Book, Email).
- [ ] **About Us Blurb**: Short paragraph for the footer/about page.
- [ ] **Service List**: List of core services offered.

## 5. Technical Access 🔑

- [ ] **Domain Access**: Registrar login or DNS access (Cloudflare setup).
- [ ] **Google Business Profile**: Manager access (for review monitoring/linking).
