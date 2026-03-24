const clients = ['Samsung SDS', 'LG CNS', 'SK C&C', 'KT', 'Naver', 'Kakao']

export default function ClientLogos({ locale }: { locale: string }) {
  return (
    <section className="py-16 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">{locale === 'en' ? 'Trusted by Leading Companies' : '신뢰하는 고객사'}</h2>
      </div>
      <div className="relative">
        <div className="flex gap-12 animate-[marquee_20s_linear_infinite]">
          {[...clients, ...clients].map((client, i) => (
            <div
              key={i}
              className="flex-shrink-0 px-8 py-4 bg-white rounded-xl shadow-sm border text-gray-400 font-semibold hover:text-gray-700 transition-colors whitespace-nowrap"
            >
              {client}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
