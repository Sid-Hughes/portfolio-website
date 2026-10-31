// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // The site's public URL, used for RSS, canonical URLs, Open Graph images and the sitemap.
  // Update this one line when adding a custom domain.
  site: 'https://portfolio-website-six-gilt-38.vercel.app',
  // Pages prerender by default; Keystatic's admin and API routes render on demand via the adapter.
  // Web Analytics also needs turning on in the Vercel dashboard (Project → Analytics).
  adapter: vercel({ webAnalytics: { enabled: true } }),
  integrations: [
    react(),
    markdoc(),
    keystatic(),
    sitemap({ filter: (page) => !/\/(admin|keystatic)(\/|$)/.test(new URL(page).pathname) }),
  ],
  redirects: {
    '/admin': '/keystatic',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
