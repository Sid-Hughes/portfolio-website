import { config, fields, collection } from '@keystatic/core';

// Local storage in dev, GitHub storage in production.
// See README.md for the GitHub App setup and the env vars it needs.
const storage = import.meta.env.PROD
  ? ({ kind: 'github', repo: 'Sid-Hughes/portfolio-website' } as const)
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
