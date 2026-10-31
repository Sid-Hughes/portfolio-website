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
6. In the GitHub App's settings (GitHub → Settings → Developer settings → GitHub Apps), add a callback URL: `https://<your-vercel-domain>/api/keystatic/github/oauth/callback`.
7. Remove `PUBLIC_KEYSTATIC_STORAGE` from your local `.env` to go back to local mode. Never commit `.env`.

### 3. Let the CMS write to `main`

`main` only accepts pull requests, so Keystatic's saves will be rejected until it is allowed through. In GitHub → Settings → Rules → `protect-main` → **Bypass list**, add the Keystatic GitHub App created above.
