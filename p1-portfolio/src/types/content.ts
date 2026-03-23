export interface ProjectMeta {
  slug: string;
  title: string;
  description: string;
  tech: string[];
  liveUrl?: string;
  githubUrl?: string;
  thumbnail: string;
  category: 'Enterprise' | 'Community' | 'SaaS' | 'AI';
  duration: string;
  date: string;
  featured?: boolean;
}
export interface Project extends ProjectMeta { content: string; }
export interface BlogMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  readingTime: string;
}
export interface BlogPost extends BlogMeta { content: string; }
