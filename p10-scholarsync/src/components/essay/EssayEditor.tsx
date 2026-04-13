'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Download, Loader2, Check } from 'lucide-react'
import { saveEssay } from '@/app/(main)/my/essays/actions'
import type { Essay, Scholarship } from '@/types/database'

interface EssayEditorProps {
  essay: Essay
  scholarship: Scholarship
}

export default function EssayEditor({ essay, scholarship }: EssayEditorProps) {
  const prompts = scholarship.essay_prompts ?? []
  const [contents, setContents] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    prompts.forEach((_, i) => {
      initial[String(i)] = essay.content?.[String(i)] ?? ''
    })
    return initial
  })
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [copyStates, setCopyStates] = useState<Record<number, boolean>>({})
  const isDirtyRef = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(index: number, value: string) {
    setContents((prev) => ({ ...prev, [String(index)]: value }))
    isDirtyRef.current = true
    setSaveStatus('idle')

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (!isDirtyRef.current) return
      setSaveStatus('saving')
      try {
        await saveEssay(essay.scholarship_id, {
          ...contents,
          [String(index)]: value,
        })
        isDirtyRef.current = false
        setSaveStatus('saved')
      } catch {
        setSaveStatus('error')
      }
    }, 5000)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  async function handleCopy(index: number) {
    const text = contents[String(index)] ?? ''
    try {
      await navigator.clipboard.writeText(text)
      setCopyStates((prev) => ({ ...prev, [index]: true }))
      setTimeout(() => setCopyStates((prev) => ({ ...prev, [index]: false })), 2000)
    } catch {
      // clipboard not available
    }
  }

  function handleDownload() {
    const lines: string[] = [`${scholarship.name} 자기소개서\n`]
    prompts.forEach((p, i) => {
      lines.push(`[항목 ${i + 1}] ${p.prompt}`)
      lines.push(contents[String(i)] ?? '')
      lines.push('')
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${scholarship.name}_자소서.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> 저장 중...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
              <Check className="h-3.5 w-3.5" /> 저장됨
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-destructive">저장 실패</span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="mr-1.5 h-4 w-4" />
          텍스트 파일 다운로드
        </Button>
      </div>

      {/* Essay sections */}
      {prompts.map((prompt, i) => {
        const value = contents[String(i)] ?? ''
        const isOver = value.length > prompt.max_chars

        return (
          <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  항목 {i + 1}
                </span>
                <p className="font-medium mt-0.5 text-sm">{prompt.prompt}</p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleCopy(i)}
                title="클립보드 복사"
              >
                {copyStates[i] ? (
                  <Check className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>

            <textarea
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring min-h-[160px] leading-relaxed"
              value={value}
              onChange={(e) => handleChange(i, e.target.value)}
              placeholder={`${prompt.prompt}에 대해 작성해주세요.`}
            />

            <p className={`text-right text-xs ${isOver ? 'text-destructive' : 'text-muted-foreground'}`}>
              {value.length.toLocaleString()} / {prompt.max_chars.toLocaleString()}자
              {isOver && <span className="ml-1">({(value.length - prompt.max_chars).toLocaleString()}자 초과)</span>}
            </p>
          </div>
        )
      })}
    </div>
  )
}
