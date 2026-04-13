'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SlidersHorizontal, X } from 'lucide-react'
import { REGIONS, DEGREE_TYPES, INCOME_QUINTILES, ORG_TYPE_LABELS } from '@/lib/constants'

const ORG_TYPES = Object.entries(ORG_TYPE_LABELS).map(([value, label]) => ({ value, label }))

function FilterForm({ params, onParamChange, onReset }: {
  params: URLSearchParams
  onParamChange: (key: string, value: string) => void
  onReset: () => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">키워드</label>
        <Input
          placeholder="장학금명, 기관명 검색"
          defaultValue={params.get('keyword') ?? ''}
          onChange={(e) => onParamChange('keyword', e.target.value)}
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">학위 과정</label>
        <Select
          value={params.get('degree_type') || '전체'}
          onValueChange={(v) => onParamChange('degree_type', !v || v === '전체' ? '' : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="전체">전체</SelectItem>
            {DEGREE_TYPES.map(({ value, label }) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">지역</label>
        <Select
          value={params.get('region') || '전체'}
          onValueChange={(v) => onParamChange('region', !v || v === '전체' ? '' : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="전체">전체</SelectItem>
            {REGIONS.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">기관 유형</label>
        <Select
          value={params.get('org_type') || '전체'}
          onValueChange={(v) => onParamChange('org_type', !v || v === '전체' ? '' : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="전체">전체</SelectItem>
            {ORG_TYPES.map(({ value, label }) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">소득 분위 (이하)</label>
        <Select
          value={params.get('income_quintile') || '전체'}
          onValueChange={(v) => onParamChange('income_quintile', !v || v === '전체' ? '' : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="전체">전체</SelectItem>
            {INCOME_QUINTILES.map(({ value, label }) => (
              <SelectItem key={value} value={String(value)}>{label} 이하</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button variant="ghost" size="sm" className="w-full" onClick={onReset}>
        <X className="h-4 w-4 mr-1" />
        필터 초기화
      </Button>
    </div>
  )
}

export default function ScholarshipFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }, [router, pathname, searchParams, startTransition])

  const resetFilters = useCallback(() => {
    startTransition(() => {
      router.replace(pathname)
    })
  }, [router, pathname, startTransition])

  const activeFilterCount = ['keyword', 'degree_type', 'region', 'org_type', 'income_quintile']
    .filter((k) => searchParams.has(k)).length

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-56 shrink-0">
        <div className="sticky top-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">필터</h2>
            {activeFilterCount > 0 && (
              <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                {activeFilterCount}
              </span>
            )}
          </div>
          <FilterForm params={searchParams} onParamChange={updateParam} onReset={resetFilters} />
        </div>
      </aside>

      {/* Mobile sheet trigger */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger render={<Button variant="outline" size="sm" className="gap-2" />}>
            <SlidersHorizontal className="h-4 w-4" />
            필터
            {activeFilterCount > 0 && (
              <span className="bg-primary text-primary-foreground rounded-full text-xs px-1.5 py-0.5 leading-none">
                {activeFilterCount}
              </span>
            )}
          </SheetTrigger>
          <SheetContent side="left" className="w-72 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>필터</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterForm params={searchParams} onParamChange={updateParam} onReset={resetFilters} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
