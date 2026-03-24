import type { Locale } from '@/lib/i18n'
import HeroSlider from '@/components/public/home/HeroSlider'
import ServicesHighlight from '@/components/public/home/ServicesHighlight'
import ClientLogos from '@/components/public/home/ClientLogos'
import StatsCounter from '@/components/public/home/StatsCounter'
import CTABanner from '@/components/public/home/CTABanner'

export async function generateStaticParams() {
  return [{ locale: 'ko' }, { locale: 'en' }]
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return (
    <>
      <HeroSlider locale={locale} />
      <ServicesHighlight locale={locale} />
      <StatsCounter locale={locale} />
      <ClientLogos locale={locale} />
      <CTABanner locale={locale} />
    </>
  )
}
