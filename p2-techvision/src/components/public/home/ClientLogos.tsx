const clients = ['Samsung SDS', 'LG CNS', 'SK C&C', 'KT', 'Naver', 'Kakao']

export default function ClientLogos({ locale }: { locale: string }) {
  return (
    <section className="py-20 bg-[#111111] overflow-hidden">
      <div className="px-8 lg:px-16 mb-10">
        <h2 className="font-serif text-[40px] lg:text-[55px] font-medium text-white">
          {locale === 'en' ? 'Our Partners' : '신뢰하는 고객사'}
        </h2>
        <p className="text-[#9098aa] text-[18px] mt-2">
          {locale === 'en' ? 'Trusted by leading companies' : '함께 성장하는 파트너사'}
        </p>
      </div>
      <div className="relative">
        <div className="flex gap-8 animate-[marquee_20s_linear_infinite]">
          {[...clients, ...clients].map((client, i) => (
            <div
              key={i}
              className="flex-shrink-0 px-10 py-5 border border-white/10 rounded-none text-[#9098aa] font-semibold text-[18px] hover:text-white transition-colors whitespace-nowrap"
            >
              {client}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
