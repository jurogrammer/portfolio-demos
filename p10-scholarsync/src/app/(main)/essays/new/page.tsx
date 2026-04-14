import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import EssayGenerator from '@/components/essay/EssayGenerator'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { FREE_ESSAY_LIMIT } from '@/lib/constants'
import type { Scholarship, Profile } from '@/types/database'

export const metadata = { title: '자소서 생성 — ScholarSync KR' }

export default async function NewEssayPage(props: {
  searchParams: Promise<{ scholarship_id?: string }>
}) {
  const { scholarship_id } = await props.searchParams
  if (!scholarship_id) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login`)

  const [{ data: scholarship }, { data: profile }, { count }] = await Promise.all([
    supabase
      .from('ss_scholarships')
      .select('*')
      .eq('id', scholarship_id)
      .eq('is_active', true)
      .single(),
    supabase
      .from('ss_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single(),
    (() => {
      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      return supabase
        .from('ss_essay_generations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('generated_at', monthStart.toISOString())
    })(),
  ])

  if (!scholarship) notFound()

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href={`/scholarships/${scholarship_id}`}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            장학금 상세
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{(scholarship as Scholarship).name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {(scholarship as Scholarship).organization}
        </p>
      </div>

      <EssayGenerator
        scholarship={scholarship as Scholarship}
        profile={profile as Profile | null}
        generationsUsed={count ?? 0}
      />
    </div>
  )
}
