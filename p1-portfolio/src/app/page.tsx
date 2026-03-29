import type { Metadata } from 'next';
import Hero from '@/components/home/Hero';
import Highlights from '@/components/home/Highlights';
import FeaturedProjects from '@/components/home/FeaturedProjects';
import CTABanner from '@/components/home/CTABanner';

export const metadata: Metadata = {
  title: 'Dev. | 풀스택 엔지니어',
  description: '5년+ 풀스택 엔지니어. Kotlin, Spring Boot, React, Next.js.',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Dev.',
  jobTitle: '풀스택 엔지니어',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero />
      <Highlights />
      <FeaturedProjects />
      <CTABanner />
    </>
  );
}
