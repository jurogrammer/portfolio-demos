import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getEssay } from '../actions'
import EssayEditor from '@/components/essay/EssayEditor'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import type { Essay, Scholarship } from '@/types/database'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditEssayPage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const essay = await getEssay(id)
  if (!essay) notFound()

  const scholarship = (essay as { scholarship?: Scholarship }).scholarship
  if (!scholarship) notFound()

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href="/my/essays">
            <ChevronLeft className="mr-1 h-4 w-4" />
            내 자소서
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{scholarship.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">{scholarship.organization}</p>
      </div>

      <EssayEditor essay={essay as Essay} scholarship={scholarship} />
    </div>
  )
}
