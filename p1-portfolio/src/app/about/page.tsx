import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: '소개',
  description: '5년+ 풀스택 엔지니어. 커리어와 기술 스택을 소개합니다.',
};

export default function AboutPage() {
  return <AboutClient />;
}
