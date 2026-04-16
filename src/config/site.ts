/* ═══════════════════════════════════════════════════════════════
   SITE CONFIG — SEO, contact, and social data
   Edit this file ONCE per project.
   SeoHead and OG tags read from here.
   Navigation lives in Header.tsx (needs icons + routes).
   ═══════════════════════════════════════════════════════════════ */

import { env } from './env';

export const siteConfig = {
  name: env.APP_NAME,
  url: env.APP_URL,
  locale: 'en',
  language: 'en',

  // ─── SEO defaults ──────────────────────────────────────────
  title: env.APP_NAME,
  description:
    'Compress JPEG, PNG, WebP and AVIF images right in your browser. Private by design — no upload, no server.',
  ogImage: '', // Add your OG image to public/images/ and update this path

  // ─── Contact ───────────────────────────────────────────────
  email: '',
  phone: '',
  address: '',

  // ─── Social links ─────────────────────────────────────────
  socials: {
    instagram: '',
    facebook: '',
    linkedin: '',
  },

  // WHY: Set to true by /init — controls setup banner and Header display
  initialized: false,
} as const;
