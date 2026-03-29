import { createClient } from '@/lib/supabase/server'
import type { PortfolioItem } from '@/types/database'
import PortfolioGrid from '@/components/public/portfolio/PortfolioGrid'

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return { title: locale === 'en' ? 'Portfolio' : '포트폴리오' }
}

export default async function PortfolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  let items: PortfolioItem[] = []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('portfolio_items')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('display_order', { ascending: true })
    items = data || []
  } catch {}

  return (
    <div>
      <section className="py-24 bg-[#00194a] text-white">
        <div className="px-8 lg:px-16">
          <h1 className="font-serif text-[48px] lg:text-[68px] font-medium mb-4">{locale === 'en' ? 'Portfolio' : '포트폴리오'}</h1>
          <p className="text-white/70 text-[18px]">{locale === 'en' ? 'Our successful project cases' : '성공적으로 완료한 프로젝트 사례'}</p>
        </div>
      </section>
      <PortfolioGrid items={items} locale={locale} />
    </div>
  )
}
