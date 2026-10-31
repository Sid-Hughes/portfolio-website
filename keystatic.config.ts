import { config, fields, collection, singleton } from '@keystatic/core';
import { block } from '@keystatic/core/content-components';
import { pipelineColourOptions } from './src/lib/pipeline';

// Local storage in dev, GitHub storage in production.
// Set PUBLIC_KEYSTATIC_STORAGE=github to use GitHub mode in dev (needed once, to create the GitHub App).
// See README.md for the GitHub App setup and the env vars it needs.
// main only accepts pull requests, so CMS edits are made on content/* branches and merged via PR.
const useGithub =
  import.meta.env.PUBLIC_KEYSTATIC_STORAGE === 'github' || import.meta.env.PROD;
const storage = useGithub
  ? ({ kind: 'github', repo: 'Sid-Hughes/portfolio-website', branchPrefix: 'content/' } as const)
  : ({ kind: 'local' } as const);

// Every schema here is mirrored in src/content.config.ts. Keep the two in sync.

// Images live under src/assets so Astro's <Image /> can optimise them.
// publicPath is relative to the content file (src/content/<collection>/<entry>.mdoc).
const imageField = (label: string, dir: string, required: boolean) =>
  fields.image({
    label,
    directory: `src/assets/${dir}`,
    publicPath: `../../assets/${dir}/`,
    validation: { isRequired: required },
  });

const altField = (label = 'Image description (alt text)') =>
  fields.text({
    label,
    description: 'Describe the image for people using screen readers.',
  });

// Content components insertable in rich text. Each one mirrors a tag in markdoc.config.mjs.
const contentComponents = {
  pipeline: block({
    label: 'Pipeline diagram',
    description: 'A self-drawing diagram of steps connected in order.',
    schema: {
      nodes: fields.array(
        fields.object({
          label: fields.text({
            label: 'Label',
            description: 'Keep it short: about 18 characters fits.',
            validation: { length: { min: 1, max: 24 } },
          }),
          color: fields.select({ label: 'Colour', options: pipelineColourOptions, defaultValue: 'accent' }),
        }),
        {
          label: 'Steps',
          description: 'In order, left to right.',
          itemLabel: (props) => props.fields.label.value,
          validation: { length: { min: 2 } },
        },
      ),
      caption: fields.text({ label: 'Caption', description: 'Optional.' }),
    },
  }),
};

const richText = (dir: string) =>
  fields.markdoc({
    label: 'Content',
    options: {
      image: { directory: `src/assets/${dir}`, publicPath: `../../assets/${dir}/` },
    },
    components: contentComponents,
  });

const tagsField = fields.array(fields.text({ label: 'Tag' }), {
  label: 'Tags',
  itemLabel: (props) => props.value,
});

export default config({
  storage,
  ui: {
    brand: { name: 'Portfolio' },
    navigation: {
      Content: ['projects', 'posts'],
      Site: ['about', 'settings'],
    },
  },
  collections: {
    projects: collection({
      label: 'Projects',
      slugField: 'title',
      path: 'src/content/projects/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'status'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'In progress', value: 'in-progress' },
            { label: 'Completed', value: 'completed' },
            { label: 'Archived', value: 'archived' },
          ],
          defaultValue: 'in-progress',
        }),
        summary: fields.text({
          label: 'Summary',
          description: 'One or two sentences, shown on project cards.',
          multiline: true,
          validation: { length: { min: 1 } },
        }),
        tags: tagsField,
        cover: imageField('Cover image', 'projects', true),
        coverAlt: fields.text({
          label: 'Cover image description (alt text)',
          description: 'Describe the image for people using screen readers.',
          validation: { length: { min: 1 } },
        }),
        links: fields.object(
          {
            github: fields.url({ label: 'GitHub' }),
            demo: fields.url({ label: 'Live demo' }),
            other: fields.url({ label: 'Other link' }),
          },
          { label: 'Links' },
        ),
        featured: fields.checkbox({
          label: 'Featured',
          description: 'Show this project on the homepage.',
        }),
        startDate: fields.date({ label: 'Start date' }),
        endDate: fields.date({ label: 'End date' }),
        order: fields.integer({
          label: 'Sort order',
          description: 'Optional. Lower numbers appear first; projects without one sort by start date.',
        }),
        stats: fields.array(
          fields.object({
            label: fields.text({ label: 'Label', validation: { length: { min: 1 } } }),
            value: fields.number({ label: 'Value', validation: { isRequired: true } }),
            suffix: fields.text({ label: 'Suffix', description: 'Optional, e.g. "%" or "k+".' }),
          }),
          {
            label: 'Stats',
            description: 'Optional numbers shown on the project page.',
            itemLabel: (props) => `${props.fields.label.value}: ${props.fields.value.value ?? ''}${props.fields.suffix.value}`,
          },
        ),
        content: richText('projects'),
      },
    }),
    posts: collection({
      label: 'Posts',
      slugField: 'title',
      path: 'src/content/posts/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'publishedDate'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        publishedDate: fields.date({
          label: 'Published date',
          defaultValue: { kind: 'today' },
          validation: { isRequired: true },
        }),
        draft: fields.checkbox({
          label: 'Draft',
          description: 'Drafts are hidden on the live site.',
        }),
        excerpt: fields.text({
          label: 'Excerpt',
          description: 'A sentence or two, shown in post lists and the RSS feed.',
          multiline: true,
          validation: { length: { min: 1 } },
        }),
        tags: tagsField,
        cover: imageField('Cover image', 'posts', false),
        coverAlt: altField('Cover image description (alt text)'),
        relatedProjects: fields.multiRelationship({
          label: 'Related projects',
          collection: 'projects',
        }),
        content: richText('posts'),
      },
    }),
  },
  singletons: {
    about: singleton({
      label: 'About',
      path: 'src/content/about/',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        name: fields.text({ label: 'Name', validation: { length: { min: 1 } } }),
        role: fields.text({ label: 'Role', description: 'e.g. "Software engineer".' }),
        shortBio: fields.text({
          label: 'Short bio',
          description: 'One or two sentences for the homepage.',
          multiline: true,
          validation: { length: { min: 1 } },
        }),
        headshot: imageField('Headshot', 'about', false),
        headshotAlt: altField('Headshot description (alt text)'),
        cvLink: fields.url({ label: 'CV link' }),
        skills: fields.array(fields.text({ label: 'Skill' }), {
          label: 'Skills',
          itemLabel: (props) => props.value,
        }),
        socials: fields.array(
          fields.object({
            label: fields.text({ label: 'Label', description: 'e.g. "GitHub".', validation: { length: { min: 1 } } }),
            url: fields.url({ label: 'URL', validation: { isRequired: true } }),
          }),
          { label: 'Social links', itemLabel: (props) => props.fields.label.value },
        ),
        content: fields.markdoc({
          label: 'Bio',
          options: { image: { directory: 'src/assets/about', publicPath: '../../assets/about/' } },
        }),
      },
    }),
    settings: singleton({
      label: 'Site settings',
      path: 'src/content/settings/',
      format: 'yaml',
      schema: {
        siteTitle: fields.text({ label: 'Site title', validation: { length: { min: 1 } } }),
        tagline: fields.text({ label: 'Tagline', multiline: true }),
        description: fields.text({
          label: 'Site description',
          description: 'Used for search engines and the RSS feed.',
          multiline: true,
        }),
        navLinks: fields.array(
          fields.object({
            label: fields.text({ label: 'Label', validation: { length: { min: 1 } } }),
            href: fields.text({ label: 'Link', description: 'e.g. "/projects".', validation: { length: { min: 1 } } }),
          }),
          { label: 'Navigation links', itemLabel: (props) => props.fields.label.value },
        ),
        projectsIntro: fields.text({
          label: 'Projects page intro',
          description: 'Optional line under the Projects heading.',
          multiline: true,
        }),
        blogIntro: fields.text({
          label: 'Blog page intro',
          description: 'Optional line under the Blog heading.',
          multiline: true,
        }),
        footerText: fields.text({ label: 'Footer text' }),
      },
    }),
  },
});
