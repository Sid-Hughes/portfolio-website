# Portfolio Website

Personal portfolio site with projects and blog posts, built with Astro and managed through Keystatic.

See [portfolio-plan.md](portfolio-plan.md) for the full build plan and [DECISIONS.md](DECISIONS.md) for choices made along the way.

## Running locally

Requires the Node version in `package.json` → `engines`.

```bash
npm install
npm run dev
```

- Site: http://127.0.0.1:4321
- CMS admin: http://127.0.0.1:4321/keystatic

In dev, Keystatic runs in **local mode**: saving in the admin writes files straight into `src/content/`. Commit them like any other change.

## Workflow

- `main` is protected and always deployable. Changes land via pull request only, merged with a merge commit.
- Work happens on short-lived branches (e.g. `phase-1/foundations`), one per milestone.
- Vercel builds a preview deployment for every pull request.

## Deployment setup (one-time)

### 1. Vercel

1. Sign in at https://vercel.com with GitHub and choose **Add New → Project**.
2. Import `Sid-Hughes/portfolio-website`. Vercel detects Astro; keep the defaults.
3. Deploy. Production deploys come from `main`; every pull request gets a preview URL.

### 2. Keystatic GitHub App

In production Keystatic runs in **GitHub mode**: editors sign in with GitHub and each save commits to the repo, which triggers a Vercel redeploy. This needs a GitHub App, which Keystatic creates for you:

1. Create a `.env` file in the project root containing `PUBLIC_KEYSTATIC_STORAGE=github`.
2. Run `npm run dev` and open http://127.0.0.1:4321/keystatic.
3. Follow the prompts: enter your deployed Vercel URL, click **Create GitHub App**, choose a name, then install the app on this repository.
4. Keystatic writes these to your `.env`:
   - `KEYSTATIC_GITHUB_CLIENT_ID`
   - `KEYSTATIC_GITHUB_CLIENT_SECRET`
   - `KEYSTATIC_SECRET`
   - `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`
5. In Vercel → Project → Settings → Environment Variables, add those four (not `PUBLIC_KEYSTATIC_STORAGE`), then redeploy.
6. In the GitHub App's settings (GitHub → Settings → Developer settings → GitHub Apps → Edit), check the **Redirect URLs** include `https://<your-production-domain>/api/keystatic/github/oauth/callback`. Keystatic usually adds it during setup.
7. Remove `PUBLIC_KEYSTATIC_STORAGE` from your local `.env` to go back to local mode. Never commit `.env`.

### 3. Web Analytics

The site already includes Vercel Web Analytics. Turn it on in Vercel → Project → **Analytics** → Enable. Until then, the analytics script returns a 404 (harmless, but it shows as a console error).

### 4. Custom domain (optional)

1. Vercel → Project → Settings → **Domains** → add the domain and follow the DNS instructions. Make it the primary domain so the `.vercel.app` address redirects to it.
2. Change `site` in `astro.config.mjs` to the new domain. Canonical URLs, the sitemap, RSS and Open Graph images all use it.
3. Add a redirect URL to the Keystatic GitHub App: `https://<your-domain>/api/keystatic/github/oauth/callback`. Keep the existing one.

## How to add content

All content is edited in the CMS at `/keystatic`. No code changes are needed.

### Where things are

| In the CMS | What it controls |
|---|---|
| **Projects** | Project cards and project pages. Tick **Featured** to show one in the homepage's "Selected work" strip. **Sort order** puts lower numbers first. |
| **Posts** | Blog posts. Tick **Draft** to hide one from the live site (drafts still show locally, with a badge). **Related projects** links a post to projects; the project pages list those posts automatically. |
| **About** | Your name, role, short bio (homepage), full bio, headshot, CV link, skills and social links. Social links also appear in the footer and the "Get in touch" section. |
| **Site settings** | Site title, tagline, description (search engines and RSS), navigation links, Projects and Blog page intros, footer text. |

### Tips

- **Images:** every image needs a description (alt text) for screen readers. Project covers require one; for optional images, the build fails if an image has no description, so the PR preview will flag it before it goes live.
- **Pipeline diagrams:** in a project or post body, use the editor's **+** menu → **Pipeline diagram**. Add steps in order, each with a short label (about 18 characters) and a colour. It draws itself when scrolled into view.
- **Stats:** a project's **Stats** show as numbers that count up on its page. Use **Suffix** for things like `%` or `k+`.
- **Social preview images** for each page are generated automatically from the title and summary. There's nothing to upload.

### Publishing

Use the CMS at the **production domain** (`https://portfolio-website-six-gilt-38.vercel.app/keystatic`, or the custom domain once added). Per-deployment and PR preview URLs change on every deploy, so GitHub sign-in is not registered for them and fails with a `redirect_uri` error.

Use the CMS at the **production domain** (`https://portfolio-website-six-gilt-38.vercel.app/keystatic`, or the custom domain once added). Per-deployment and PR preview URLs change on every deploy, so GitHub sign-in is not registered for them and fails with a `redirect_uri` error.

`main` only accepts pull requests, and that applies to CMS edits too:

1. In Keystatic, open the branch menu and create a branch. Keystatic prefixes it with `content/` (e.g. `content/new-post`).
2. Write and save on that branch. Each save is a commit to the branch.
3. Click **Create pull request** in Keystatic. Vercel builds a preview of the site with your change.
4. Check the preview, then merge the PR on GitHub. The production site redeploys with the change, and the branch is deleted automatically.
