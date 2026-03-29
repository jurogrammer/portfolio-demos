import Link from 'next/link';
import { getFeaturedProjects } from '@/lib/content';
import ProjectCard from '@/components/projects/ProjectCard';
import FeaturedProjectsClient from './FeaturedProjectsClient';

export default function FeaturedProjects() {
  const projects = getFeaturedProjects();
  if (projects.length === 0) return null;
  return (
    <FeaturedProjectsClient projects={projects} />
  );
}
