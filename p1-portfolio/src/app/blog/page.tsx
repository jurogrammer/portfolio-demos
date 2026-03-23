import type { Metadata } from 'next';
import { getBlogPosts } from '@/lib/content';
import BlogClient from './BlogClient';

export const metadata: Metadata = {
  title: '블로그',
  description: '기술 의사결정, 아키텍처, 개발 경험을 기록합니다.',
};

export default function BlogPage() {
  const posts = getBlogPosts();
  return <BlogClient posts={posts} />;
}
