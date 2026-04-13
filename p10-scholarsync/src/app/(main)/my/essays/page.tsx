import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyEssays } from './actions'
import { Button } from '@/components/ui/button'
import { FileText, ChevronRight, Search } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

export const metadata = { title: '내 자소서 — ScholarSync KR' }

export default async function MyEssaysPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const essays = await getMyEssays()

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">내 자소서</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/scholarships">
            <Search className="mr-1.5 h-4 w-4" />
            장학금 찾기
          </Link>
        </Button>
      </div>

      {essays.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">저장된 자소서가 없습니다</p>
            <p className="text-sm text-muted-foreground mt-1">
              장학금 상세 페이지에서 AI 자소서를 생성하고 저장해보세요.
            </p>
          </div>
          <Button asChild>
            <Link href="/scholarships">장학금 검색하기</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {essays.map((essay) => {
            const scholarship = (essay as { scholarship?: { id: string; name: string; organization: string } }).scholarship
            return (
              <Link
                key={essay.id}
                href={`/my/essays/${essay.id}`}
                className="flex items-center gap-4 rounded-xl border bg-card p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{scholarship?.name ?? '(삭제된 장학금)'}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {scholarship?.organization}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(essay.updated_at), {
                      addSuffix: true,
                      locale: ko,
                    })}{' '}
                    수정
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
