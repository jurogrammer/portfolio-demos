'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const slides = [
  {
    id: 1,
    title: { ko: '혁신적인 기술로\n비즈니스를 변화시킵니다', en: 'We Transform Business\nwith Innovative Technology' },
    subtitle: { ko: 'TechVision Solutions는 최신 기술로 고객사의 디지털 혁신을 이끕니다', en: 'TechVision Solutions leads digital innovation with cutting-edge technology' },
    gradient: 'from-blue-600 to-indigo-700',
  },
  {
    id: 2,
    title: { ko: '검증된 전문가 팀과\n함께 성장하세요', en: 'Grow with Our\nProven Expert Team' },
    subtitle: { ko: '8년간의 경험, 150개 이상의 성공 프로젝트로 신뢰를 쌓아왔습니다', en: '8 years of experience, 150+ successful projects build our trust' },
    gradient: 'from-purple-600 to-pink-600',
  },
  {
    id: 3,
    title: { ko: '디지털 전환의 파트너\nTechVision Solutions', en: 'Your Digital Transformation Partner\nTechVision Solutions' },
    subtitle: { ko: '웹, 모바일, 클라우드 — 모든 디지털 솔루션을 한곳에서', en: 'Web, Mobile, Cloud — All digital solutions in one place' },
    gradient: 'from-teal-500 to-cyan-600',
  },
]

export default function HeroSlider({ locale }: { locale: string }) {
  const [current, setCurrent] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const touchStartX = useRef<number>(0)

  const next = useCallback(() => setCurrent(c => (c + 1) % slides.length), [])
  const prev = useCallback(() => setCurrent(c => (c - 1 + slides.length) % slides.length), [])

  useEffect(() => {
    if (isHovered) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [isHovered, next])

  return (
    <section
      className="relative h-[600px] md:h-[700px] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
      onTouchEnd={e => {
        const diff = touchStartX.current - e.changedTouches[0].clientX
        if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
      }}
    >
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={cn(
            'absolute inset-0 flex items-center justify-center transition-opacity duration-700 bg-gradient-to-br',
            slide.gradient,
            idx === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        >
          <div className="text-center text-white px-4 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 whitespace-pre-line leading-tight">
              {locale === 'en' ? slide.title.en : slide.title.ko}
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              {locale === 'en' ? slide.subtitle.en : slide.subtitle.ko}
            </p>
            <Button size="lg" variant="secondary" render={<a href={`/${locale}/contact`} />}>
              {locale === 'en' ? 'Get Free Consultation' : '무료 상담 신청'}
            </Button>
          </div>
        </div>
      ))}

      {/* Arrows */}
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors">
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors">
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={cn('w-2 h-2 rounded-full transition-all', idx === current ? 'bg-white w-6' : 'bg-white/50')}
          />
        ))}
      </div>
    </section>
  )
}
