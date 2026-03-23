'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { NAV_LINKS } from '@/lib/constants';

interface MobileNavProps { open: boolean; onClose: () => void; }

export default function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();
  useEffect(() => { onClose(); }, [pathname]);
  return (
    <Sheet open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <SheetContent side="right" className="w-64">
        <SheetHeader>
          <SheetTitle>메뉴</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-6">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} onClick={onClose}
              className={`text-sm font-medium transition-colors hover:text-primary ${pathname === link.href ? 'text-primary' : 'text-muted-foreground'}`}>
              {link.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
