'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useLocale } from '@/lib/i18n';
import LanguageToggle from '@/components/ui/LanguageToggle';

interface MobileNavProps { open: boolean; onClose: () => void; }

export default function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { t } = useLocale();

  const navLinks = [
    { label: t.common.home, href: '/' },
    { label: t.common.about, href: '/about' },
    { label: t.common.projects, href: '/projects' },
    { label: t.common.contact, href: '/contact' },
  ];

  useEffect(() => { onClose(); }, [pathname]);
  return (
    <Sheet open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <SheetContent side="right" className="w-64">
        <SheetHeader>
          <SheetTitle>{t.common.menu}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-6">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} onClick={onClose}
              className={`text-sm font-medium transition-colors hover:text-primary ${pathname === link.href ? 'text-primary' : 'text-muted-foreground'}`}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6">
          <LanguageToggle />
        </div>
      </SheetContent>
    </Sheet>
  );
}
