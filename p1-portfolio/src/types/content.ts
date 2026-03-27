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
