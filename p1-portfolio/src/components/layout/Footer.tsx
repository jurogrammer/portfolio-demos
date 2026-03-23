import { ExternalLink } from 'lucide-react';
import { SOCIAL_LINKS } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} 주인재 (Injae Ju). All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-muted-foreground hover:text-primary transition-colors">
            <ExternalLink className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </a>
          <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors">
            <ExternalLink className="h-5 w-5" />
            <span className="sr-only">LinkedIn</span>
          </a>
          <a href={SOCIAL_LINKS.blog} target="_blank" rel="noopener noreferrer" aria-label="Blog" className="text-muted-foreground hover:text-primary transition-colors">
            <ExternalLink className="h-5 w-5" />
            <span className="sr-only">Blog</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
