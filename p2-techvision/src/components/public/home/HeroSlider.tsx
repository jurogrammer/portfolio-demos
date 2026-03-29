'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

const slides = [
  {
    id: 1,
    title: { ko: '혁신적인 기술로\n비즈니스를\n변화시킵니다', en: 'We Transform\nBusiness with\nInnovative Technology' },
    subtitle: { ko: '어떤 상황에서도 고객의 비즈니스가 흔들리지 않도록 최적의 IT 솔루션을 제공합니다.', en: 'We provide optimal IT solutions to keep your business steady in any situation.' },
    image: '/images/hero-1.jpg',
  },
  {
    id: 2,
    title: { ko: '검증된 전문가\n팀과 함께\n성장하세요', en: 'Grow with Our\nProven Expert\nTeam' },
    subtitle: { ko: '포트폴리오 데모 사이트입니다. 어드민 CMS와 다국어 지원을 직접 체험해보세요.', en: 'This is a portfolio demo. Try the admin CMS and multilingual support.' },
    image: '/images/hero-2.jpg',
  },
  {
    id: 3,
    title: { ko: '디지털 전환의\n파트너\nTechVision', en: 'Your Digital\nTransformation\nPartner' },
    subtitle: { ko: '이런 기업 홈페이지가 필요하신가요? 개발 문의를 남겨보세요.', en: 'Need a corporate site like this? Leave a development inquiry.' },
    image: '/images/hero-3.jpg',
  },
]

export default function HeroSlider({ locale }: { locale: string }) {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef<number>(0)

  const next = useCallback(() => setCurrent(c => (c + 1) % slides.length), [])
  const prev = useCallback(() => setCurrent(c => (c - 1 + slides.length) % slides.length), [])

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [isPaused, next])

  return (
    <section
      className="relative bg-white overflow-hidden"
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
            'transition-opacity duration-700',
            idx === current ? 'opacity-100 relative' : 'opacity-0 absolute inset-0 pointer-events-none'
          )}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px] lg:min-h-[700px]">
            {/* Left: Text */}
            <div className="flex flex-col justify-center px-8 lg:px-16 py-16">
              {/* Slide counter */}
              <div className="flex items-center gap-3 mb-10 text-sm text-[#666666]">
                <span className="font-semibold text-[#111111]">{String(current + 1).padStart(2, '0')}</span>
                <div className="relative w-24 h-[2px] bg-[#d4d4d4]">
                  <div
                    className="absolute top-0 left-0 h-full bg-[#111111] transition-all duration-500"
                    style={{ width: `${((current + 1) / slides.length) * 100}%` }}
                  />
                </div>
                <span>{String(slides.length).padStart(2, '0')}</span>
                <div className="flex items-center gap-1 ml-1">
                  <button onClick={prev} className="hover:opacity-75 transition-opacity text-[#111111]">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={() => setIsPaused(p => !p)} className="hover:opacity-75 transition-opacity text-[#111111]">
                    {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                  </button>
                  <button onClick={next} className="hover:opacity-75 transition-opacity text-[#111111]">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h1 className="text-[42px] lg:text-[68px] font-bold text-[#111111] leading-[1.1] whitespace-pre-line mb-8">
                {locale === 'en' ? slide.title.en : slide.title.ko}
              </h1>
              <p className="text-[16px] lg:text-[18px] text-[#666666] font-light leading-relaxed mb-10 max-w-lg">
                {locale === 'en' ? slide.subtitle.en : slide.subtitle.ko}
              </p>
              <div>
                <a
                  href={`/${locale}/contact`}
                  className="inline-flex items-center gap-2 bg-[#00205c] text-white text-[15px] font-semibold px-8 py-3.5 rounded-full hover:opacity-75 transition-opacity"
                >
                  {locale === 'en' ? 'Learn more' : '자세히보기'}
                  <span className="ml-1">&rarr;</span>
                </a>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="hidden lg:flex items-center justify-center bg-[#00194a] relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id={`grid-${slide.id}`} width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill={`url(#grid-${slide.id})`} />
                </svg>
              </div>
              <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-[#0080fb]/20 blur-3xl" />
              <div className="absolute bottom-1/3 left-1/3 w-48 h-48 rounded-full bg-[#4a6cf7]/15 blur-2xl" />
              <div className="relative z-10 text-center">
                <div className="text-[120px] font-bold text-white/10 leading-none">{String(current + 1).padStart(2, '0')}</div>
                <div className="mt-4 w-16 h-[2px] bg-[#0080fb] mx-auto" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}
