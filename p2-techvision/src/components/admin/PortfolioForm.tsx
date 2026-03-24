'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import TagInput from '@/components/admin/TagInput'
import type { PortfolioItem } from '@/types/database'

export default function PortfolioForm({ initialData }: { initialData?: Partial<PortfolioItem> }) {
  const router = useRouter()
  const [data, setData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    client_name: initialData?.client_name || '',
    tech_stack: initialData?.tech_stack || [],
    thumbnail_url: initialData?.thumbnail_url || '',
    category: initialData?.category || 'web',
    is_featured: initialData?.is_featured ?? false,
    display_order: initialData?.display_order ?? 0,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!data.title) { setError('제목은 필수입니다'); return }
    setSaving(true)
    setError('')
    const supabase = createClient()
    let result
    if (initialData?.id) {
      result = await supabase.from('portfolio_items').update(data).eq('id', initialData.id)
    } else {
      result = await supabase.from('portfolio_items').insert({ ...data, images: [] })
    }
    if (result.error) { setError(result.error.message); setSaving(false); return }
    router.push('/admin/portfolio')
    router.refresh()
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>프로젝트명 *</Label>
          <Input value={data.title} onChange={e => setData(d => ({ ...d, title: e.target.value }))} />
        </div>
        <div>
          <Label>클라이언트명</Label>
          <Input value={data.client_name} onChange={e => setData(d => ({ ...d, client_name: e.target.value }))} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>카테고리</Label>
          <Select value={data.category || 'web'} onValueChange={v => setData(d => ({ ...d, category: v as 'web' | 'mobile' | 'consulting' }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="web">웹</SelectItem>
              <SelectItem value="mobile">모바일</SelectItem>
              <SelectItem value="consulting">컨설팅</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>표시 순서</Label>
          <Input type="number" value={data.display_order} onChange={e => setData(d => ({ ...d, display_order: Number(e.target.value) }))} />
        </div>
      </div>
      <div>
        <Label>설명</Label>
        <Textarea rows={4} value={data.description} onChange={e => setData(d => ({ ...d, description: e.target.value }))} />
      </div>
      <div>
        <Label>썸네일 URL</Label>
        <Input value={data.thumbnail_url} onChange={e => setData(d => ({ ...d, thumbnail_url: e.target.value }))} placeholder="https://..." />
      </div>
      <div>
        <Label>기술 스택</Label>
        <TagInput tags={data.tech_stack} onChange={tags => setData(d => ({ ...d, tech_stack: tags }))} placeholder="기술명 입력 후 Enter" />
      </div>
      <div className="flex items-center gap-3">
        <input type="checkbox" id="featured" checked={data.is_featured} onChange={e => setData(d => ({ ...d, is_featured: e.target.checked }))} className="w-4 h-4" />
        <Label htmlFor="featured">주요 프로젝트 (Featured)</Label>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving}>{saving ? '저장 중...' : '저장'}</Button>
        <Button variant="outline" onClick={() => router.push('/admin/portfolio')}>취소</Button>
      </div>
    </div>
  )
}
