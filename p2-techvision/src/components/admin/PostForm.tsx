'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Post } from '@/types/database'

function generateSlug(): string {
  return `post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export default function PostForm({ initialData }: { initialData?: Partial<Post> }) {
  const router = useRouter()
  const [data, setData] = useState({
    title: initialData?.title || '',
    title_en: initialData?.title_en || '',
    slug: initialData?.slug || '',
    content: initialData?.content || '',
    content_en: initialData?.content_en || '',
    excerpt: initialData?.excerpt || '',
    thumbnail_url: initialData?.thumbnail_url || '',
    category: initialData?.category || 'news',
    is_published: initialData?.is_published ?? false,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!data.title || !data.content) { setError('제목과 본문은 필수입니다'); return }
    setSaving(true)
    setError('')
    const supabase = createClient()
    const slug = data.slug || generateSlug()
    const payload = { ...data, slug, published_at: data.is_published ? new Date().toISOString() : null }
    let result
    if (initialData?.id) {
      result = await supabase.from('posts').update(payload).eq('id', initialData.id)
    } else {
      result = await supabase.from('posts').insert(payload)
    }
    if (result.error) { setError(result.error.message); setSaving(false); return }
    router.push('/admin/posts')
    router.refresh()
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>제목 (한국어) *</Label>
          <Input value={data.title} onChange={e => setData(d => ({ ...d, title: e.target.value }))} />
        </div>
        <div>
          <Label>제목 (영어)</Label>
          <Input value={data.title_en} onChange={e => setData(d => ({ ...d, title_en: e.target.value }))} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>슬러그</Label>
          <Input value={data.slug} onChange={e => setData(d => ({ ...d, slug: e.target.value }))} placeholder="자동 생성됩니다" />
        </div>
        <div>
          <Label>카테고리</Label>
          <Select value={data.category} onValueChange={v => setData(d => ({ ...d, category: v as 'news' | 'blog' }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="news">뉴스</SelectItem>
              <SelectItem value="blog">블로그</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>발췌 (목록 요약)</Label>
        <Input value={data.excerpt} onChange={e => setData(d => ({ ...d, excerpt: e.target.value }))} />
      </div>
      <div>
        <Label>썸네일 URL</Label>
        <Input value={data.thumbnail_url} onChange={e => setData(d => ({ ...d, thumbnail_url: e.target.value }))} placeholder="https://..." />
      </div>
      <div>
        <Label>본문 (한국어) *</Label>
        <Textarea rows={10} value={data.content} onChange={e => setData(d => ({ ...d, content: e.target.value }))} />
      </div>
      <div>
        <Label>본문 (영어)</Label>
        <Textarea rows={6} value={data.content_en} onChange={e => setData(d => ({ ...d, content_en: e.target.value }))} />
      </div>
      <div className="flex items-center gap-3">
        <input type="checkbox" id="published" checked={data.is_published} onChange={e => setData(d => ({ ...d, is_published: e.target.checked }))} className="w-4 h-4" />
        <Label htmlFor="published">발행하기</Label>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving}>{saving ? '저장 중...' : '저장'}</Button>
        <Button variant="outline" onClick={() => router.push('/admin/posts')}>취소</Button>
      </div>
    </div>
  )
}
