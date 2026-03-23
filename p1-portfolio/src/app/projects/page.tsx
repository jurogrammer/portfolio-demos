import type { Metadata } from 'next';
import { getProjects } from '@/lib/content';
import ProjectsClient from './ProjectsClient';

export const metadata: Metadata = {
  title: '프로젝트',
  description: '엔터프라이즈 B2B, 커뮤니티, SaaS 케이스 스터디 모음.',
};

export default function ProjectsPage() {
  const projects = getProjects();
  return <ProjectsClient projects={projects} />;
}
