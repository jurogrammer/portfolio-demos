export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-[#f5f6fb] py-8">
      <div className="text-center">
        <p className="text-[#666666] text-sm">
          TechVision Solutions 서울특별시 강남구 테헤란로 123
        </p>
        <p className="text-[#9098aa] text-sm mt-1">
          &copy; {year} TechVision Solutions. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
