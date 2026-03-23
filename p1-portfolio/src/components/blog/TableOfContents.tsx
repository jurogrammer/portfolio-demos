'use client';
import { useState, useEffect } from 'react';

interface Heading { id: string; text: string; level: number; }

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState('');
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id); }),
      { rootMargin: '-80px 0px -80% 0px' }
    );
    headings.forEach(h => { const el = document.getElementById(h.id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [headings]);
  if (headings.length === 0) return null;
  return (
    <nav className="space-y-1 text-sm">
      <p className="font-semibold mb-3 text-xs uppercase tracking-wider text-muted-foreground">목차</p>
      {headings.map(h => (
        <a key={h.id} href={`#${h.id}`}
          className={`block py-1 transition-colors hover:text-primary ${h.level === 3 ? 'pl-4 text-xs' : 'text-sm'} ${activeId === h.id ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
          {h.text}
        </a>
      ))}
    </nav>
  );
}
