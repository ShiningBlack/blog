import type { CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

export function isPublished(post: BlogPost): boolean {
  if (import.meta.env.DEV) return true;
  return !post.data.draft;
}

export function sortPosts(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => {
    if (Boolean(a.data.pinned) !== Boolean(b.data.pinned)) {
      return a.data.pinned ? -1 : 1;
    }
    return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
  });
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getReadingStats(rawBody: string | undefined): {
  words: number;
  minutes: number;
} {
  if (!rawBody) return { words: 0, minutes: 1 };
  const stripped = rawBody
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[.*?\]\(.*?\)/g, ' ')
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
    .replace(/[#>*_~\-|]/g, ' ');

  const cjkChars = (stripped.match(/[\u4e00-\u9fa5]/g) || []).length;
  const latinWords = (stripped.replace(/[\u4e00-\u9fa5]/g, ' ').match(/[a-zA-Z0-9]+/g) || []).length;
  const totalUnits = cjkChars + latinWords;
  const minutes = Math.max(1, Math.ceil(cjkChars / 380 + latinWords / 220));
  return { words: totalUnits, minutes };
}

export function collectTags(posts: BlogPost[]): Array<{ tag: string; count: number }> {
  const map = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags ?? []) {
      map.set(tag, (map.get(tag) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh-CN'));
}

export function groupPostsByYear(posts: BlogPost[]): Array<{ year: number; posts: BlogPost[] }> {
  const map = new Map<number, BlogPost[]>();
  for (const post of posts) {
    const year = post.data.pubDate.getFullYear();
    const list = map.get(year) ?? [];
    list.push(post);
    map.set(year, list);
  }
  return [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, yearPosts]) => ({ year, posts: sortPosts(yearPosts) }));
}
