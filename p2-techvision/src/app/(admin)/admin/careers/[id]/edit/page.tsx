import { createAdminClient } from '@/lib/supabase/admin'
import CareerForm from '@/components/admin/CareerForm'
import { notFound } from 'next/navigation'

export default async function EditCareerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let job = null
  try {
    const supabase = createAdminClient()
    const { data } = await supabase.from('job_postings').select('*').eq('id', id).single()
    job = data
  } catch {}
  if (!job) notFound()
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">채용공고 수정</h1>
      <CareerForm initialData={job} />
    </div>
  )
}
