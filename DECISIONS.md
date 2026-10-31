# Decisions

Choices not covered by the plan, with a one-line reason each.

## Repo and workflow
- **GitHub Flow with milestone branches, merge commits only.** PRs are phase-sized, so merge commits keep the granular history on `main`; `git log --first-parent` gives the per-PR view.
- **CMS edits go through PRs on `content/*` branches.** Agreed with Sid. Keystatic will not commit to a branch that requires PRs (an app bypass doesn't change that), and keeping `main` fully locked was preferred over direct saves; content PRs also get Vercel previews.
- **`.gitattributes` normalises line endings to LF.** The repo is developed on Windows; avoids CRLF churn in diffs.

## Scope
- **No contact form; social links only.** Agreed with Sid. Drops `SubmitButton` from the motion components and avoids a form backend.
- **Placeholder fonts and colours until a palette is chosen.** Agreed with Sid; to be revisited.

## Stack
- **Astro 7 with default `static` output plus the Vercel adapter.** Pages prerender; the adapter lets Keystatic's admin and API routes render on demand. Astro no longer has a `hybrid` mode.
- **Tailwind v4 via `@tailwindcss/vite`.** The current official setup; `@astrojs/tailwind` is deprecated.
- **Markdoc (`@astrojs/markdoc`) for rich text.** Keystatic's Astro guide uses Markdoc, and it supports custom content components for the pipeline diagram later.
- **Content read through Astro content collections, not Keystatic's Reader API.** Follows Keystatic's Astro guide and gives typed, Zod-validated data.
- **Keystatic storage chosen by env.** `local` in dev, `github` in production; `PUBLIC_KEYSTATIC_STORAGE=github` forces GitHub mode locally for the one-time GitHub App setup.
- **Own GitHub App rather than Keystatic Cloud.** No extra third-party account; the app is created by Keystatic's built-in flow.
- **`@astrojs/rss` for the feed.** Official Astro package; the plan requires `/rss.xml`.

## Content model
- **Alt text fields next to every image (`coverAlt`, `headshotAlt`).** Keystatic image fields have no alt text; required for project covers, and the Zod schema rejects an optional image without one.
- **Project `stats` items have an optional `suffix`.** Lets values like "42%" or "10k+" stay numeric for the count-up animation.
- **About has `name`, `role` and `shortBio` beyond the plan's fields.** The homepage blurb and page heading need them, and they shouldn't be hard-coded.
- **Settings has a `description` field.** Used for meta descriptions and the RSS feed.
- **Singletons stored at `src/content/about/index.mdoc` and `src/content/settings/index.yaml`.** Keystatic's singleton path format; read in Astro as one-entry collections.
- **Images are stored under `src/assets/<collection>/<slug>/`.** Keystatic's default layout for image fields; keeps each entry's images together for Astro's `<Image />`.

## Pages
- **Filters are a small vanilla script, not a React island.** Cards are server-rendered with optimised images; the script only toggles visibility, so no framework JS ships. Without JS, all items show. Filter state is kept in the URL (`?tag=`, `?status=`) so tag links work.
- **Reading time is computed from word count at 200 wpm.** Avoids a dependency for a one-line calculation.
- **Table of contents shows h2/h3 and only when a post has at least two.** A one-item contents list adds nothing.
- **Drafts show in dev (with a "Draft" badge) and are excluded from production builds, RSS and related-post lists.**
- **"Get in touch" links to the social links section on `/about`.** There is no contact form.
- **Projects and Blog page intros are settings fields (`projectsIntro`, `blogIntro`).** Keeps page copy in the CMS rather than hard-coded.

## Design system
- **Fonts: Space Grotesk (headings) and Inter (body), self-hosted via Fontsource.** Two typefaces as the plan asks; self-hosting avoids a third-party request and layout shift from Google Fonts. Placeholder until Sid picks a style.
- **Placeholder palette: warm neutrals (stone) with an indigo accent.** All text pairs pass WCAG AA in both themes (muted text ≥ 6.9:1, accent ≥ 6:1). Change the values in `src/styles/tokens.css`.
- **Tokens are CSS variables in `tokens.css`, exposed to Tailwind through `@theme inline`.** Utilities like `bg-surface`, `text-muted` and `text-accent` switch with the theme, so components don't need `dark:` variants.
- **Theme: stored choice, else the OS preference, applied by an inline script before first paint.** Avoids a flash of the wrong theme; without JS the site follows the OS and the toggle stays hidden.
- **Fluid type scale with `clamp()`.** One scale that works from 360px phones to desktop without breakpoints.
- **Whole-card click targets.** The card title's link stretches over the card, so the full card is clickable while keeping a single link per card for screen readers.
- **The hero has a static radial-gradient backdrop in the accent colour.** Looks finished without animation and doubles as the shader hero's fallback in Phase 4.
