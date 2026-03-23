import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import type { Project, ProjectMeta, BlogPost, BlogMeta } from '@/types/content';

const projectsDir = path.join(process.cwd(), 'src/content/projects');
const blogDir = path.join(process.cwd(), 'src/content/blog');

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

export function getProjects(): ProjectMeta[] {
  if (!fs.existsSync(projectsDir)) return [];
  return fs.readdirSync(projectsDir).filter(f => f.endsWith('.mdx')).map(file => {
    const slug = file.replace(/\.mdx$/, '');
    const { data } = matter(fs.readFileSync(path.join(projectsDir, file), 'utf-8'));
    return { slug, ...data } as ProjectMeta;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getProjectBySlug(slug: string): Project {
  const raw = fs.readFileSync(path.join(projectsDir, `${slug}.mdx`), 'utf-8');
  const { data, content } = matter(raw);
  return { slug, ...data, content } as Project;
}

export function getFeaturedProjects(): ProjectMeta[] {
  return getProjects().filter(p => p.featured).slice(0, 3);
}

export function getProjectSlugs(): string[] {
  if (!fs.existsSync(projectsDir)) return [];
  return fs.readdirSync(projectsDir).filter(f => f.endsWith('.mdx')).map(f => f.replace(/\.mdx$/, ''));
}

export function getAdjacentProjects(slug: string): { prev: ProjectMeta | null; next: ProjectMeta | null } {
  const all = getProjects();
  const idx = all.findIndex(p => p.slug === slug);
  return { prev: idx > 0 ? all[idx - 1] : null, next: idx < all.length - 1 ? all[idx + 1] : null };
}

export function getBlogPosts(): BlogMeta[] {
  if (!fs.existsSync(blogDir)) return [];
  return fs.readdirSync(blogDir).filter(f => f.endsWith('.mdx')).map(file => {
    const slug = file.replace(/\.mdx$/, '');
    const raw = fs.readFileSync(path.join(blogDir, file), 'utf-8');
    const { data, content } = matter(raw);
    return { slug, ...data, readingTime: readingTime(content).text } as BlogMeta;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogPostBySlug(slug: string): BlogPost {
  const raw = fs.readFileSync(path.join(blogDir, `${slug}.mdx`), 'utf-8');
  const { data, content } = matter(raw);
  return { slug, ...data, readingTime: readingTime(content).text, content } as BlogPost;
}

export function getBlogSlugs(): string[] {
  if (!fs.existsSync(blogDir)) return [];
  return fs.readdirSync(blogDir).filter(f => f.endsWith('.mdx')).map(f => f.replace(/\.mdx$/, ''));
}

export function getAdjacentBlogPosts(slug: string): { prev: BlogMeta | null; next: BlogMeta | null } {
  const all = getBlogPosts();
  const idx = all.findIndex(p => p.slug === slug);
  return { prev: idx > 0 ? all[idx - 1] : null, next: idx < all.length - 1 ? all[idx + 1] : null };
}

export function getHeadings(rawContent: string): { id: string; text: string; level: number }[] {
  const regex = /^(#{2,3})\s+(.+)$/gm;
  const headings: { id: string; text: string; level: number }[] = [];
  let match;
  while ((match = regex.exec(rawContent)) !== null) {
    headings.push({ id: slugify(match[2].trim()), text: match[2].trim(), level: match[1].length });
  }
  return headings;
}
