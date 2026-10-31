// Open Graph images, generated at build time: /og/site.png, /og/projects/<slug>.png, /og/blog/<slug>.png
import type { APIRoute, GetStaticPaths } from 'astro';
import { getAbout, getPosts, getProjects, getSettings } from '../../lib/content';
import { clamp, renderOgImage } from '../../lib/og';

type Card = { eyebrow: string; title: string; subtitle?: string | null };

export const getStaticPaths = (async () => {
  const [settings, about, projects, posts] = await Promise.all([getSettings(), getAbout(), getProjects(), getPosts()]);
  const site = { siteTitle: settings.siteTitle };
  return [
    {
      params: { path: 'site' },
      props: { ...site, eyebrow: about.data.role ?? 'Portfolio', title: settings.siteTitle, subtitle: clamp(settings.tagline) },
    },
    ...projects.map((project) => ({
      params: { path: `projects/${project.id}` },
      props: { ...site, eyebrow: 'Project', title: project.data.title, subtitle: clamp(project.data.summary) },
    })),
    ...posts.map((post) => ({
      params: { path: `blog/${post.id}` },
      props: { ...site, eyebrow: 'Blog', title: post.data.title, subtitle: clamp(post.data.excerpt) },
    })),
  ];
}) satisfies GetStaticPaths;

export const GET: APIRoute<Card & { siteTitle: string }> = async ({ props }) => {
  const png = await renderOgImage(props);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
