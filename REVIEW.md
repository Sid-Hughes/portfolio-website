# Review

Summary of the finished build, for reviewing the site as a whole. Choices made along the way, with reasons, are in [DECISIONS.md](DECISIONS.md). Setup and content instructions are in [README.md](README.md).

## What was built

A portfolio and blog on **Astro 7**, with content managed in **Keystatic** at `/keystatic` and hosted on **Vercel**. All pages are prerendered static files; only the CMS admin runs on the server.

| Phase | What it delivered | PR |
|---|---|---|
| 1. Foundations | Astro + React + Markdoc + Tailwind + Keystatic + Vercel adapter. Local CMS in dev, GitHub-backed CMS in production. CMS edits go through `content/*` branches and PRs because `main` is protected. | #1, #2 |
| 2. Content model and pages | Projects, posts, About and Site settings schemas (Keystatic + Zod). Every route, two-way project/post links, tag and status filters, drafts, RSS, reading time, table of contents, placeholder content. | #4 |
| 3. Design system | Tokens as CSS variables, light/dark theme, self-hosted fonts, core components, all pages styled. | #5 |
| 4. Motion | View Transitions, Lenis, WebGL liquid hero, word fill, scroll reveals, pinned horizontal strip, scale-up cover, count-up stats, reading progress, tilt cards, magnetic buttons, arrow and text-roll links, self-drawing pipeline diagram (insertable from the CMS). Reduced-motion and no-JS fallbacks for all of it. | #6, #7 |
| 5. Polish and launch | Meta tags, canonical URLs, Open Graph and Twitter cards, auto-generated social images per page, sitemap, robots.txt, Vercel Web Analytics, accessibility pass, Lighthouse audit, README content guide. | this PR |

### Lighthouse (mobile, production build, run locally)

| Route | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| `/` | 98 | 95 | 96 | 100 |
| `/blog/<post>` | 99 | 100 | 96 | 100 |
| `/projects/<project>` | 99 | 100 | 96 | 100 |
| `/projects` | 100 | 100 | 96 | 100 |
| `/blog` | 99 | 100 | 96 | 100 |
| `/about` | 99 | 100 | 96 | 100 |

Best practices is 96 only because the analytics script 404s outside Vercel (see known issues). Home accessibility is 95 because of the word-fill contrast (see known issues).

## Running it locally

```bash
npm install
npm run dev        # http://127.0.0.1:4321, CMS at /keystatic
npm run check      # type-check
npm run build      # production build
```

## What you need to do

Already done during the build: GitHub repo and branch protection, Vercel project, Keystatic GitHub App and its env vars.

1. **Turn on Web Analytics** in Vercel → Project → Analytics. Until then the analytics script returns 404.
2. **Replace the placeholder content** in the CMS: Site settings, About (including a headshot and real social links), and the two placeholder projects and posts. Everything labelled "Placeholder" is meant to go.
3. **Pick a colour scheme and fonts.** Colours are all in `src/styles/tokens.css`, for both themes; the shader hero and social images follow them automatically. Fonts are set in `src/styles/global.css`. After changing colours, re-check contrast.
4. **Optional: custom domain.** Follow README → "Custom domain". It's one line in `astro.config.mjs` plus a redirect URL on the GitHub App.
5. **Optional: remove the unused Keystatic app from the `protect-main` bypass list.** Keystatic doesn't use it, since content goes through PRs.

## Known issues

- **Word-fill contrast:** the homepage intro line starts its words at 15% opacity (as specified), which fails WCAG contrast until scrolled. Screen readers get the full sentence. Raising the start to about 50% fixes it, at the cost of a subtler effect.
- **Analytics 404 until enabled:** `/_vercel/insights/script.js` only exists on Vercel once Web Analytics is turned on.
- **npm audit reports 13 advisories (7 high).** All are in build-time tooling or the authenticated CMS, and the suggested fixes are downgrades, so they're not applied. Details in DECISIONS.md.
- **60fps on a mid-range phone was not measured.** Lighthouse shows ~0ms blocking time, and the shader caps pixel ratio at 1.5 and pauses off-screen, but it hasn't been profiled on a real device.
- **CMS edits take a PR each.** That's the trade-off for keeping `main` fully locked (agreed in Phase 1).
- **The CMS only works on the production domain**, not on deployment or preview URLs (GitHub sign-in redirect).
- **Social images use the light theme** only.
- **Build warning about a >500kB chunk** comes from the Keystatic admin bundle. It's only loaded at `/keystatic`, not on the public site.

## What to look at first

1. **The homepage on your phone and on a laptop**, in both themes: the shader hero, the word-fill line, and the "Selected work" strip (pinned sideways scroll on desktop, swipe on mobile).
2. **A project page** (`/projects/placeholder-weather-dashboard`): the cover scaling in, the count-up stats, and the pipeline diagram (try **Replay**).
3. **The CMS end to end:** create a `content/` branch at the production `/keystatic`, edit Site settings or add a post with a pipeline diagram, open the PR, check the preview, merge.
4. **Reduced motion:** turn on your OS's "reduce motion" setting and reload. Everything should be static and fully readable.
5. **Link previews:** paste a post URL into Slack, Discord or iMessage to see its generated social card.
