'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, Globe } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useDictionary } from '@/lib/i18n/DictionaryContext'
import { cn } from '@/lib/utils'

function getCurrentLocale(pathname: string): string {
  if (pathname.startsWith('/ko')) return 'ko'
  if (pathname.startsWith('/en')) return 'en'
  return 'ko'
}

function switchLocale(pathname: string, newLocale: string): string {
  const currentLocale = getCurrentLocale(pathname)
  if (pathname.startsWith(`/${currentLocale}`)) {
    return `/${newLocale}${pathname.slice(currentLocale.length + 1)}`
  }
  return `/${newLocale}${pathname}`
}

export default function Header() {
  const dict = useDictionary()
  const pathname = usePathname()
  const locale = getCurrentLocale(pathname)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { href: `/${locale}`, label: dict.nav?.home || '홈' },
    { href: `/${locale}/about`, label: dict.nav?.about || '회사소개' },
    { href: `/${locale}/services`, label: dict.nav?.services || '서비스' },
    { href: `/${locale}/portfolio`, label: dict.nav?.portfolio || '포트폴리오' },
{ href: `/${locale}/news`, label: dict.nav?.news || '뉴스' },
    { href: `/${locale}/careers`, label: dict.nav?.careers || '채용' },
    { href: `/${locale}/contact`, label: dict.nav?.contact || '문의' },
  ]

  const otherLocale = locale === 'ko' ? 'en' : 'ko'
  const localeSwitchPath = switchLocale(pathname, otherLocale)

  return (
    <header className={cn(
      'sticky top-0 z-50 w-full border-b transition-all duration-200',
      scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-white'
    )}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={`/${locale}`} className="text-xl font-bold text-gray-900">
          TechVision Solutions
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-blue-600',
                pathname === item.href || (item.href !== `/${locale}` && pathname.startsWith(item.href))
                  ? 'text-blue-600' : 'text-gray-600'
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link href={localeSwitchPath}>
            <Button variant="outline" size="sm" className="gap-1">
              <Globe className="h-3 w-3" />
              {otherLocale.toUpperCase()}
            </Button>
          </Link>
        </nav>

        {/* Mobile Nav */}
        <div className="flex md:hidden items-center gap-2">
          <Link href={localeSwitchPath}>
            <Button variant="ghost" size="sm">{otherLocale.toUpperCase()}</Button>
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" />}>
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col gap-4 mt-8">
                {navItems.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'text-base font-medium transition-colors hover:text-blue-600 py-2',
                      pathname === item.href ? 'text-blue-600' : 'text-gray-700'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
