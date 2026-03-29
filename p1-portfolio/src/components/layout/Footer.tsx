'use client';
import { useLocale } from '@/lib/i18n';

export default function Footer() {
  const { t } = useLocale();
  const year = new Date().getFullYear();
  const copyright = t.footer.copyright.replace('{year}', String(year));

  return (
    <footer className="border-t py-8">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{copyright}</p>
      </div>
    </footer>
  );
}
