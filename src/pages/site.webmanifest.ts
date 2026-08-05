import type { APIRoute } from 'astro';
import { SITE_DATA } from '../data/constants';

// Generated at build time from constants.ts so the manifest name and colors
// can never drift from the brand data. Icon files are brand assets that must
// be placed in public/ (see ONBOARDING.md §3).
export const GET: APIRoute = () => {
  const manifest = {
    name: SITE_DATA.company.name,
    short_name: SITE_DATA.company.name,
    // Project deviation from the starter: this site's PWA icons were generated
    // as favicon-192/512 (and are referenced by BaseLayout's <link rel="icon">),
    // so the manifest points at those rather than the starter's site-icon-*
    // names. Preflight PF-10 warns about the missing site-icon-* files — that
    // warning is dispositioned here, not a real gap.
    icons: [
      { src: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/favicon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    theme_color: SITE_DATA.branding.colors.themeColor,
    background_color: '#ffffff',
    display: 'browser',
  };
  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { 'Content-Type': 'application/manifest+json' },
  });
};
