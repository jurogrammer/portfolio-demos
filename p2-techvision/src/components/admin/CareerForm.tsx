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
import type { JobPosting } from '@/types/database'

export default function CareerForm({ initialData }: { initialData?: Partial<JobPosting> }) {
  const router = useRouter()
  const [data, setData] = useState({
    title: initialData?.title || '',
    department: initialData?.department || '',
    location: initialData?.location || '서울',
    employment_type: initialData?.employment_type || 'full-time',
    description: initialData?.description || '',
    requirements: initialData?.requirements || [],
    is_active: initialData?.is_active ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!data.title || !data.description) { setError('제목과 설명은 필수입니다'); return }
    setSaving(true)
    setError('')
    const supabase = createClient()
    let result
    if (initialData?.id) {
      result = await supabase.from('job_postings').update(data).eq('id', initialData.id)
    } else {
      result = await supabase.from('job_postings').insert(data)
    }
    if (result.error) { setError(result.error.message); setSaving(false); return }
    router.push('/admin/careers')
    router.refresh()
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>직책명 *</Label>
          <Input value={data.title} onChange={e => setData(d => ({ ...d, title: e.target.value }))} />
        </div>
        <div>
          <Label>부서</Label>
          <Input value={data.department} onChange={e => setData(d => ({ ...d, department: e.target.value }))} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>근무지</Label>
          <Input value={data.location} onChange={e => setData(d => ({ ...d, location: e.target.value }))} />
        </div>
        <div>
          <Label>고용 형태</Label>
          <Select value={data.employment_type} onValueChange={v => setData(d => ({ ...d, employment_type: v as 'full-time' | 'contract' | 'part-time' }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="full-time">정규직</SelectItem>
              <SelectItem value="contract">계약직</SelectItem>
              <SelectItem value="part-time">파트타임</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>직무 설명 *</Label>
        <Textarea rows={5} value={data.description} onChange={e => setData(d => ({ ...d, description: e.target.value }))} />
      </div>
      <div>
        <Label>자격 요건</Label>
        <TagInput tags={data.requirements} onChange={tags => setData(d => ({ ...d, requirements: tags }))} placeholder="요건 입력 후 Enter" />
      </div>
      <div className="flex items-center gap-3">
        <input type="checkbox" id="active" checked={data.is_active} onChange={e => setData(d => ({ ...d, is_active: e.target.checked }))} className="w-4 h-4" />
        <Label htmlFor="active">공고 활성화</Label>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving}>{saving ? '저장 중...' : '저장'}</Button>
        <Button variant="outline" onClick={() => router.push('/admin/careers')}>취소</Button>
      </div>
    </div>
  )
}
