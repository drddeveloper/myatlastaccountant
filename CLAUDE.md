# CLAUDE.md

> Also read and follow all project-specific instructions in [AI_INSTRUCTIONS.md](./AI_INSTRUCTIONS.md).

---

## Frontend Design Philosophy

### Core Principle

Every interface should feel intentionally designed, not AI-generated. Avoid generic aesthetics. Commit to a clear visual point-of-view and execute it with precision.

### Brand Guide as Source of Truth

The `/brand-guide` page is the **living reference** for every visual decision. Before styling any component or page, check that your colors, fonts, buttons, and patterns align with what's defined there. If a style isn't on the brand guide yet, add it there first, then use it in the build.

### Before Writing Any Frontend Code

Ask yourself:

- **Purpose** — What problem does this component or page solve?
- **Tone** — What's the right aesthetic direction? (Refined/minimal, editorial, organic/natural, bold/graphic, etc.)
- **Differentiation** — What's the one thing a visitor will remember about this page?

Then commit fully to that direction.

### Typography

- Pair a distinctive display font with a refined body font
- Use Google Fonts, Adobe Fonts, or variable fonts to find characterful options
- Type scale should be deliberate — establish a clear hierarchy with meaningful size jumps
- Apply tight tracking for headings and generous line-height for body text
- ❌ Never use a single font (`font-sans`) everywhere without intentional pairing
- ❌ Avoid Inter, Roboto, Arial, Space Grotesk, or system-font stacks as the default choice

### Color

- All colors must use the design tokens defined in `global.css` via `@theme` — never hardcode hex values in templates
- Commit to a dominant palette with one or two sharp accents
- Timid, evenly-distributed palettes feel weak — anchor the design with a strong base
- Dark and light themes are both valid — vary between projects, don't always default to light
- ❌ Never use default Tailwind palette colors (`blue-500`, `indigo-600`, etc.) — always use project tokens (`bg-primary`, `text-accent`)

### Shadows & Depth

- Shadows should feel like light exists in the design, not like drop-shadow presets
- Use layered, color-tinted shadows for depth — not just `shadow-md` or `shadow-lg`
- Every background, card, and container is a chance to add depth
- ❌ Avoid flat `bg-white + shadow-md + rounded-lg` patterns — they read as generic

### Layout & Composition

- Break the grid deliberately when it serves the design
- Use asymmetry, overlap, and generous negative space as design tools
- Unexpected proportions beat predictable 12-column grids
- Mobile-first — design for small screens first, then enhance upward
- Use a consistent spacing scale — prefer grid-based layouts over ad-hoc stacking
- ❌ Avoid predictable hero → features → CTA layouts with no spatial surprise

### Backgrounds & Surfaces

- Solid white or solid dark backgrounds are often a missed opportunity
- Consider: gradient meshes, subtle noise textures, geometric patterns, layered transparencies
- Prefer custom gradients via design tokens instead of Tailwind presets
- ❌ Avoid flat fills (`bg-white`, `bg-gray-100`) as the only surface treatment

### Motion & Animation

- Prioritize CSS-only animations — no JS animation library unless complexity demands it
- One well-orchestrated page load with staggered reveals beats scattered micro-interactions
- Use scroll-triggered animations and hover states that feel considered, not gratuitous
- Only animate `transform` and `opacity` — use explicit utilities (`transition-transform`, `transition-opacity`) with controlled durations
- ❌ Never use `transition-all` — it's unpredictable and harms performance

### Interactive States

- Every interactive element must include `hover`, `focus-visible`, and `active` states. No exceptions.
- Never use raw images without treatment — add overlays (gradient), blending, or color tint to integrate them into the design
- ❌ Avoid unstyled or state-less interactive elements

### Component Styling

- Define reusable component classes in `global.css` under `@layer components`
- Use composition and variants — don't duplicate long utility strings across files
- ❌ Avoid cookie-cutter component patterns that look like every other service business site
- ❌ AI "slop" aesthetics — if it looks like a template, rethink it

---

## Code Quality Standards

### General

- Write clean, readable, well-commented code
- Use semantic HTML — structure should make sense without CSS applied
- Accessibility is not optional: proper heading hierarchy, alt text, ARIA where needed, keyboard navigability
- Performance matters: lazy load images, minimize render-blocking resources, keep JS lean

### CSS

- All design tokens (colors, spacing, type scale, radii, shadows) are defined in `global.css` via Tailwind v4's `@theme` directive
- Reusable component classes live in `global.css` under `@layer components`
- Avoid deeply nested selectors
- Media queries use `min-width` (mobile-first)

### Astro-Specific

- Components go in `/src/components/`
- Layouts go in `/src/layouts/`
- Pages go in `/src/pages/`
- If the project uses content collections, place them in `/src/content/` (not present in the base starter — add when needed)
- Keep frontmatter clean and typed
- Prefer Astro components for static content; use framework components (React/Vue/Svelte) only when interactivity requires it

### JavaScript

- Vanilla JS preferred for simple interactions
- No framework unless the project already uses one
- Avoid jQuery
- Use `const` and `let` — never `var`
- Event listeners should be cleaned up when components unmount