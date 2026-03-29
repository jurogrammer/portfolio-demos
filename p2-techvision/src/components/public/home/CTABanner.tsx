import Link from 'next/link'

export default function CTABanner({ locale }: { locale: string }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2">
      <Link
        href={`/${locale}/services`}
        className="group flex items-center justify-between bg-[#0080fb] text-white px-10 lg:px-16 py-10 hover:opacity-90 transition-opacity"
      >
        <div>
          <p className="text-white/70 text-[14px] mb-1">
            {locale === 'en' ? '"Innovation for your business"' : '"비즈니스를 위한 혁신"'}
          </p>
          <span className="text-[24px] font-extrabold">
            {locale === 'en' ? 'Our Services' : '서비스 소개'}
          </span>
        </div>
        <span className="text-2xl group-hover:translate-x-1 transition-transform">&rarr;</span>
      </Link>
      <Link
        href={`/${locale}/contact`}
        className="group flex items-center justify-between bg-[#00205c] text-white px-10 lg:px-16 py-10 hover:opacity-90 transition-opacity"
      >
        <div>
          <p className="text-white/70 text-[14px] mb-1">
            {locale === 'en' ? '"Let\'s build together"' : '"함께 만들어갑니다"'}
          </p>
          <span className="text-[24px] font-extrabold">
            {locale === 'en' ? 'Contact Us' : '개발 문의하기'}
          </span>
        </div>
        <span className="text-2xl group-hover:translate-x-1 transition-transform">&rarr;</span>
      </Link>
    </section>
  )
}
