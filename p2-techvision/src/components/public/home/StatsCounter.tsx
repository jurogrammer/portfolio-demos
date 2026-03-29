'use client'
import { useEffect, useRef, useState } from 'react'

const stats = [
  { value: 150, suffix: '+', label: { ko: '완료 프로젝트', en: 'Projects Completed' } },
  { value: 80, suffix: '+', label: { ko: '고객사', en: 'Clients' } },
  { value: 25, suffix: '+', label: { ko: '팀 인원', en: 'Team Members' } },
  { value: 8, suffix: '년+', label: { ko: '업력', en: 'Years' } },
]

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const animated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !animated.current) {
        animated.current = true
        const duration = 1500
        const steps = 60
        const increment = target / steps
        let current = 0
        const timer = setInterval(() => {
          current = Math.min(current + increment, target)
          setCount(Math.floor(current))
          if (current >= target) clearInterval(timer)
        }, duration / steps)
      }
    })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{count}{suffix}</span>
}

export default function StatsCounter({ locale }: { locale: string }) {
  return (
    <section className="py-20 bg-[#00194a]">
      <div className="px-8 lg:px-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(stat => (
            <div key={stat.label.ko}>
              <div className="text-[42px] font-bold text-white mb-2">
                <Counter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-white/80 text-[15px]">{locale === 'en' ? stat.label.en : stat.label.ko}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
