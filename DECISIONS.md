# Decisions

Choices not covered by the plan, with a one-line reason each.

## Repo and workflow
- **GitHub Flow with milestone branches, merge commits only.** PRs are phase-sized, so merge commits keep the granular history on `main`; `git log --first-parent` gives the per-PR view.
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
