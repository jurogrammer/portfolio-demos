import Link from 'next/link'
import { Home, HelpCircle, Coffee, Cpu, Briefcase } from 'lucide-react'
import { CATEGORIES } from '@/types/database'
import type { Category } from '@/types/database'

const CATEGORY_ICONS: Record<Category | 'all', React.ReactNode> = {
  all: <Home className="h-4 w-4" />,
  qna: <HelpCircle className="h-4 w-4" />,
  free: <Coffee className="h-4 w-4" />,
  tech: <Cpu className="h-4 w-4" />,
  career: <Briefcase className="h-4 w-4" />,
}

const CATEGORY_COLORS: Record<Category, string> = {
  qna: 'text-blue-400',
  free: 'text-green-400',
  tech: 'text-purple-400',
  career: 'text-orange-400',
}

interface CategoryNavProps {
  active?: Category | 'all'
}

export default function CategoryNav({ active = 'all' }: CategoryNavProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-semibold text-foreground mb-3">카테고리</h2>
      <nav className="space-y-1">
        <Link
          href="/"
          className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors ${
            active === 'all'
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          {CATEGORY_ICONS.all}
          전체
        </Link>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.value}
            href={`/c/${cat.value}`}
            className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors ${
              active === cat.value
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <span className={active === cat.value ? 'text-primary' : CATEGORY_COLORS[cat.value]}>
              {CATEGORY_ICONS[cat.value]}
            </span>
            {cat.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
