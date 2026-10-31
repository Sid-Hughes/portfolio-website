import { config, fields, collection } from '@keystatic/core';

// Local storage in dev, GitHub storage in production.
// Set PUBLIC_KEYSTATIC_STORAGE=github to use GitHub mode in dev (needed once, to create the GitHub App).
// See README.md for the GitHub App setup and the env vars it needs.
// main only accepts pull requests, so CMS edits are made on content/* branches and merged via PR.
const useGithub =
  import.meta.env.PUBLIC_KEYSTATIC_STORAGE === 'github' || import.meta.env.PROD;
const storage = useGithub
  ? ({ kind: 'github', repo: 'Sid-Hughes/portfolio-website', branchPrefix: 'content/' } as const)
  : ({ kind: 'local' } as const);

export default config({
  storage,
  collections: {
    posts: collection({
      label: 'Posts',
      slugField: 'title',
      path: 'src/content/posts/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        content: fields.markdoc({ label: 'Content' }),
      },
    }),
  },
});
