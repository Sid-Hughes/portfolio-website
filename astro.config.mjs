// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // The site's public URL, used for RSS, canonical URLs and the sitemap. Update when adding a custom domain.
  site: 'https://portfolio-website-six-gilt-38.vercel.app',
  // Pages prerender by default; Keystatic's admin and API routes render on demand via the adapter.
  adapter: vercel(),
  integrations: [react(), markdoc(), keystatic()],
  redirects: {
    '/admin': '/keystatic',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
