'use client'

import dynamic from 'next/dynamic'
import { useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// Dynamic import to avoid SSR issues with MDEditor
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: number
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = '내용을 입력하세요...',
  height = 400,
}: MarkdownEditorProps) {
  const handleImageUpload = useCallback(async (file: File): Promise<string | null> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('로그인이 필요합니다')
      return null
    }

    const ext = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('post-images')
      .upload(fileName, file, { upsert: false })

    if (error) {
      toast.error('이미지 업로드에 실패했습니다')
      return null
    }

    const { data } = supabase.storage.from('post-images').getPublicUrl(fileName)
    return data.publicUrl
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith('image/')
      )
      for (const file of files) {
        const url = await handleImageUpload(file)
        if (url) {
          const imageMarkdown = `![${file.name}](${url})`
          onChange(value ? `${value}\n${imageMarkdown}` : imageMarkdown)
        }
      }
    },
    [handleImageUpload, onChange, value]
  )

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent<HTMLDivElement>) => {
      const items = Array.from(e.clipboardData.items).filter(
        (item) => item.type.startsWith('image/')
      )
      for (const item of items) {
        const file = item.getAsFile()
        if (!file) continue
        e.preventDefault()
        const url = await handleImageUpload(file)
        if (url) {
          const imageMarkdown = `![image](${url})`
          onChange(value ? `${value}\n${imageMarkdown}` : imageMarkdown)
        }
      }
    },
    [handleImageUpload, onChange, value]
  )

  return (
    <div
      className="rounded-md overflow-hidden border border-input"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onPaste={handlePaste}
      data-color-mode="dark"
    >
      <MDEditor
        value={value}
        onChange={(v) => onChange(v ?? '')}
        height={height}
        preview="live"
        textareaProps={{ placeholder }}
        style={{ background: 'transparent' }}
      />
    </div>
  )
}
