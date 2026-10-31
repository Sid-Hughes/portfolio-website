import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, getSettings } from '../lib/content';

export async function GET(context: APIContext) {
  const settings = await getSettings();
  const posts = await getPosts();
  return rss({
    title: settings.siteTitle,
    description: settings.description ?? settings.tagline ?? settings.siteTitle,
    site: context.site ?? context.url.origin,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.excerpt,
      pubDate: post.data.publishedDate,
      link: `/blog/${post.id}/`,
      categories: post.data.tags,
    })),
  });
}
