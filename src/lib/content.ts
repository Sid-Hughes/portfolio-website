import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;
export type Post = CollectionEntry<'posts'>;

export async function getSettings() {
  const entry = await getEntry('settings', 'index');
  if (!entry) throw new Error('Missing site settings: create them in Keystatic under Site settings.');
  return entry.data;
}

export async function getAbout() {
  const entry = await getEntry('about', 'index');
  if (!entry) throw new Error('Missing About page: create it in Keystatic under About.');
  return entry;
}

/** Projects sorted by manual order (lowest first), then newest start date. */
export async function getProjects(): Promise<Project[]> {
  const projects = await getCollection('projects');
  return projects.sort((a, b) => {
    const orderA = a.data.order ?? Number.POSITIVE_INFINITY;
    const orderB = b.data.order ?? Number.POSITIVE_INFINITY;
    if (orderA !== orderB) return orderA - orderB;
    return (b.data.startDate?.getTime() ?? 0) - (a.data.startDate?.getTime() ?? 0);
  });
}

/** Posts newest first. Drafts are included in dev and excluded from production builds. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.publishedDate.getTime() - a.data.publishedDate.getTime());
}

/** Published posts whose relatedProjects include the given project. */
export async function getPostsForProject(projectId: string): Promise<Post[]> {
  const posts = await getPosts();
  return posts.filter((post) => post.data.relatedProjects.some((ref) => ref.id === projectId));
}

const WORDS_PER_MINUTE = 200;

export function readingTime(body: string | undefined): string {
  const words = (body ?? '').trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / WORDS_PER_MINUTE))} min read`;
}

export function uniqueTags(entries: { data: { tags: string[] } }[]): string[] {
  return [...new Set(entries.flatMap((entry) => entry.data.tags))].sort((a, b) =>
    a.localeCompare(b),
  );
}

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const monthFormat = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' });

export const formatDate = (date: Date) => dateFormat.format(date);
export const formatMonth = (date: Date) => monthFormat.format(date);

export const statusLabels: Record<Project['data']['status'], string> = {
  'in-progress': 'In progress',
  completed: 'Completed',
  archived: 'Archived',
};
