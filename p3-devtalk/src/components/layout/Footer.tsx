import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between text-sm text-muted-foreground">
        <span>© 2026 DevTalk. 개발자 커뮤니티</span>
        <Link
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          <span>GitHub</span>
        </Link>
      </div>
    </footer>
  )
}
