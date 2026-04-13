'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Save, AlertTriangle, Loader2 } from 'lucide-react'
import { AI_DISCLAIMER, FREE_ESSAY_LIMIT } from '@/lib/constants'
import { saveEssay } from '@/app/(main)/my/essays/actions'
import type { Scholarship, Profile } from '@/types/database'

interface EssayGeneratorProps {
  scholarship: Scholarship
  profile: Profile | null
  generationsUsed?: number
}

function parseEssaySections(text: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const re = new RegExp(
      `\\[ESSAY_${i + 1}\\]([\\s\\S]*?)(?:\\[/ESSAY_${i + 1}\\]|(?=\\[ESSAY_${i + 2}\\])|$)`
    )
    const match = text.match(re)
    return match ? match[1].trim() : ''
  })
}

export default function EssayGenerator({
  scholarship,
  profile,
  generationsUsed = 0,
}: EssayGeneratorProps) {
  const [userKeywords, setUserKeywords] = useState('')
  const [streamedText, setStreamedText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usedCount, setUsedCount] = useState(generationsUsed)

  const prompts = scholarship.essay_prompts ?? []
  const remaining = FREE_ESSAY_LIMIT - usedCount
  const sections = useMemo(
    () => parseEssaySections(streamedText, prompts.length),
    [streamedText, prompts.length]
  )

  async function handleGenerate() {
    setError(null)
    setStreamedText('')
    setIsDone(false)
    setSaveSuccess(false)
    setIsStreaming(true)

    try {
      const res = await fetch('/api/essay/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scholarship_id: scholarship.id,
          user_keywords: userKeywords,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? '생성 중 오류가 발생했습니다.')
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setStreamedText(accumulated)
      }

      setUsedCount((c) => c + 1)
      setIsDone(true)
    } catch {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsStreaming(false)
    }
  }

  async function handleSave() {
    setIsSaving(true)
    try {
      const content: Record<string, string> = {}
      sections.forEach((text, i) => {
        content[String(i)] = text
      })
      await saveEssay(scholarship.id, content)
      setSaveSuccess(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  if (prompts.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        이 장학금에는 자소서 항목이 없습니다.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base">AI 자소서 초안 생성</h2>
          <span className="text-sm text-muted-foreground">
            이번 달 {FREE_ESSAY_LIMIT - usedCount}/{FREE_ESSAY_LIMIT}회 남음
          </span>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            추가 키워드 / 강조할 경험 <span className="text-muted-foreground">(선택)</span>
          </label>
          <textarea
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring h-20"
            placeholder="예: 해외봉사 3회, 교내 창업동아리 회장, TOEIC 950점..."
            value={userKeywords}
            onChange={(e) => setUserKeywords(e.target.value)}
            disabled={isStreaming}
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isStreaming || remaining <= 0}
          className="w-full sm:w-auto"
        >
          {isStreaming ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              생성 중...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              자소서 생성하기
            </>
          )}
        </Button>

        {remaining <= 0 && (
          <p className="text-sm text-destructive">
            이번 달 생성 횟수를 모두 사용했습니다.
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* AI Disclaimer */}
      {(isStreaming || isDone) && (
        <div className="flex gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{AI_DISCLAIMER}</span>
        </div>
      )}

      {/* Generated sections */}
      {(isStreaming || isDone) && (
        <div className="space-y-4">
          {prompts.map((prompt, i) => (
            <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    항목 {i + 1}
                  </span>
                  <p className="font-medium mt-0.5">{prompt.prompt}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    최대 {prompt.max_chars.toLocaleString()}자
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="min-h-[120px] rounded-lg border bg-muted/20 px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed">
                  {sections[i] ? (
                    sections[i]
                  ) : isStreaming ? (
                    <span className="text-muted-foreground animate-pulse">생성 중...</span>
                  ) : null}
                </div>
                {sections[i] && (
                  <p className="mt-1 text-right text-xs text-muted-foreground">
                    {sections[i].length.toLocaleString()} /{' '}
                    {prompt.max_chars.toLocaleString()}자
                    {sections[i].length > prompt.max_chars && (
                      <span className="text-destructive ml-1">(초과)</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Save button */}
          {isDone && (
            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={isSaving || saveSuccess} variant="outline">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    저장하기
                  </>
                )}
              </Button>
              {saveSuccess && (
                <span className="text-sm text-green-600 dark:text-green-400">
                  저장되었습니다. 내 자소서에서 확인하세요.
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
