import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-white text-lg font-bold mb-3">TechVision Solutions</h3>
            <p className="text-sm leading-relaxed">혁신적인 기술로 비즈니스를 변화시키는 IT 솔루션 전문 기업</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">회사</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/ko/about" className="hover:text-white transition-colors">회사소개</Link></li>
              <li><Link href="/ko/services" className="hover:text-white transition-colors">서비스</Link></li>
              <li><Link href="/ko/portfolio" className="hover:text-white transition-colors">포트폴리오</Link></li>
<li><Link href="/ko/careers" className="hover:text-white transition-colors">채용</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">서비스</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-white transition-colors cursor-default">웹 개발</span></li>
              <li><span className="hover:text-white transition-colors cursor-default">모바일 앱</span></li>
              <li><span className="hover:text-white transition-colors cursor-default">디지털 컨설팅</span></li>
              <li><span className="hover:text-white transition-colors cursor-default">클라우드 솔루션</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">문의</h4>
            <ul className="space-y-2 text-sm">
              <li>서울특별시 강남구 테헤란로 123</li>
              <li>02-1234-5678</li>
              <li>info@techvision.co.kr</li>
              <li className="pt-2">
                <Link href="/ko/contact" className="text-blue-400 hover:text-blue-300 transition-colors">문의하기 →</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-sm text-center text-gray-500">
          © {year} TechVision Solutions. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
