import { createClient } from '@/lib/supabase/server'
import type { JobPosting } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { MapPin, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return { title: locale === 'en' ? 'Careers' : '채용' }
}

export default async function CareersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isEn = locale === 'en'
  let jobs: JobPosting[] = []
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('job_postings').select('*').eq('is_active', true).order('created_at', { ascending: false })
    jobs = data || []
  } catch {}

  const typeLabel = (type: string) => {
    const map: Record<string, { ko: string; en: string }> = {
      'full-time': { ko: '정규직', en: 'Full-time' },
      'contract': { ko: '계약직', en: 'Contract' },
      'part-time': { ko: '파트타임', en: 'Part-time' },
    }
    return isEn ? map[type]?.en : map[type]?.ko
  }

  return (
    <div>
      <section className="py-16 bg-gradient-to-br from-violet-600 to-purple-700 text-white text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-3">{isEn ? 'Careers' : '채용'}</h1>
          <p className="text-white/90">{isEn ? 'Grow with TechVision' : 'TechVision과 함께 성장하세요'}</p>
        </div>
      </section>
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {jobs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">{isEn ? 'No open positions at this time.' : '현재 채용 공고가 없습니다.'}</p>
            </div>
          ) : (
            <Accordion className="space-y-4">
              {jobs.map(job => (
                <AccordionItem key={job.id} value={job.id} className="border rounded-xl px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex flex-wrap items-start gap-3 text-left">
                      <div>
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          {job.department && (
                            <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{job.department}</span>
                          )}
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                          <Badge variant="outline" className="text-xs">{typeLabel(job.employment_type)}</Badge>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">{job.description}</p>
                    {job.requirements?.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-800 mb-2 text-sm">{isEn ? 'Requirements' : '자격 요건'}</h4>
                        <ul className="space-y-1">
                          {job.requirements.map((req, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-blue-600 mt-0.5">•</span>{req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <Button size="sm" render={<a href={`mailto:careers@techvision.co.kr?subject=지원: ${job.title}`} />}>
                      {isEn ? 'Apply Now' : '지원하기'}
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </section>
    </div>
  )
}
