'use client'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { PortfolioItem } from '@/types/database'

const categoryGradients: Record<string, string> = {
  web: 'from-blue-400 to-blue-600',
  mobile: 'from-green-400 to-green-600',
  consulting: 'from-purple-400 to-purple-600',
}

const categoryLabels: Record<string, { ko: string; en: string }> = {
  web: { ko: '웹', en: 'Web' },
  mobile: { ko: '모바일', en: 'Mobile' },
  consulting: { ko: '컨설팅', en: 'Consulting' },
}

type FilterType = 'all' | 'web' | 'mobile' | 'consulting'

export default function PortfolioGrid({ items, locale }: { items: PortfolioItem[]; locale: string }) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [selected, setSelected] = useState<PortfolioItem | null>(null)
  const isEn = locale === 'en'

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: isEn ? 'All' : '전체' },
    { value: 'web', label: isEn ? 'Web' : '웹' },
    { value: 'mobile', label: isEn ? 'Mobile' : '모바일' },
    { value: 'consulting', label: isEn ? 'Consulting' : '컨설팅' },
  ]

  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter)

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Filter */}
        <div className="flex gap-2 justify-center mb-8 flex-wrap">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === f.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-12">{isEn ? 'No projects found' : '프로젝트가 없습니다'}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(item => (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                className="cursor-pointer rounded-xl overflow-hidden border hover:shadow-lg transition-shadow relative"
              >
                <div className={`h-48 bg-gradient-to-br ${categoryGradients[item.category || 'web'] || 'from-gray-400 to-gray-600'} flex items-center justify-center`}>
                  {item.is_featured && (
                    <span className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">FEATURED</span>
                  )}
                  <span className="text-white text-4xl font-bold opacity-30">{item.title[0]}</span>
                </div>
                <div className="p-4">
                  {item.category && (
                    <Badge variant="secondary" className="text-xs mb-2">
                      {isEn ? categoryLabels[item.category]?.en : categoryLabels[item.category]?.ko}
                    </Badge>
                  )}
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  {item.client_name && <p className="text-sm text-gray-500 mt-1">{item.client_name}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className={`h-48 rounded-lg bg-gradient-to-br ${categoryGradients[selected.category || 'web']}`} />
              {selected.client_name && (
                <div><span className="font-medium text-sm text-gray-700">{isEn ? 'Client: ' : '클라이언트: '}</span><span className="text-sm">{selected.client_name}</span></div>
              )}
              {selected.description && <p className="text-gray-600 text-sm">{selected.description}</p>}
              {selected.tech_stack?.length > 0 && (
                <div>
                  <p className="font-medium text-sm text-gray-700 mb-2">{isEn ? 'Tech Stack' : '기술 스택'}</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.tech_stack.map(t => <Badge key={t} variant="outline">{t}</Badge>)}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
