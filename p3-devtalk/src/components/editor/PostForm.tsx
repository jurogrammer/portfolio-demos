'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MarkdownEditor } from '@/components/editor/MarkdownEditor'
import { TagInput } from '@/components/editor/TagInput'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { CATEGORIES } from '@/types/database'
import type { Category, Post } from '@/types/database'

interface PostFormProps {
  existingPost?: Post
  tagSuggestions?: string[]
}

export function PostForm({ existingPost, tagSuggestions = [] }: PostFormProps) {
  const router = useRouter()
  const isEditing = !!existingPost

  const [title, setTitle] = useState(existingPost?.title ?? '')
  const [category, setCategory] = useState<Category | ''>(existingPost?.category ?? '')
  const [content, setContent] = useState(existingPost?.content ?? '')
  const [tags, setTags] = useState<string[]>(existingPost?.tags ?? [])
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('제목을 입력해주세요')
      return
    }
    if (!category) {
      toast.error('카테고리를 선택해주세요')
      return
    }
    if (!content.trim()) {
      toast.error('내용을 입력해주세요')
      return
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('로그인이 필요합니다')
      router.push('/auth/login')
      return
    }

    setSubmitting(true)
    try {
      if (isEditing && existingPost) {
        const { error } = await supabase
          .from('posts')
          .update({
            title: title.trim(),
            category,
            content: content.trim(),
            tags,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingPost.id)
          .eq('author_id', user.id)

        if (error) throw error
        toast.success('게시글이 수정되었습니다')
        router.push(`/post/${existingPost.id}`)
        router.refresh()
      } else {
        const { data, error } = await supabase
          .from('posts')
          .insert({
            author_id: user.id,
            title: title.trim(),
            category,
            content: content.trim(),
            tags,
          })
          .select('id')
          .single()

        if (error) throw error

        // Award points for writing a post
        await supabase.rpc('add_points', { p_user_id: user.id, p_points: 10 })

        toast.success('게시글이 작성되었습니다')
        router.push(`/post/${data.id}`)
        router.refresh()
      }
    } catch {
      toast.error('오류가 발생했습니다. 다시 시도해주세요')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">카테고리 *</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
          <SelectTrigger id="category" className="w-48">
            <SelectValue placeholder="카테고리 선택" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">제목 *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          maxLength={100}
          required
        />
        <p className="text-xs text-muted-foreground text-right">{title.length}/100</p>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label>내용 *</Label>
        <p className="text-xs text-muted-foreground">
          이미지를 드래그 앤 드롭하거나 붙여넣기하여 업로드할 수 있습니다
        </p>
        <MarkdownEditor
          value={content}
          onChange={setContent}
          placeholder="내용을 입력하세요. Markdown을 지원합니다."
          height={500}
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>태그</Label>
        <TagInput
          tags={tags}
          onChange={setTags}
          maxTags={5}
          suggestions={tagSuggestions}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={submitting}
        >
          취소
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting
            ? isEditing ? '수정 중...' : '작성 중...'
            : isEditing ? '수정하기' : '작성하기'}
        </Button>
      </div>
    </form>
  )
}
