'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Workflow, Sun, Moon, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useLocale } from "@/lib/i18n";

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { t } = useLocale();

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/inquiry", label: t.nav.inquiry },
    { href: "/dashboard", label: t.nav.dashboard },
  ];

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Workflow className="h-5 w-5 text-primary" />
          <span>{t.nav.logo}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={
                pathname === href
                  ? "text-sm font-medium text-foreground"
                  : "text-sm text-muted-foreground hover:text-foreground transition-colors"
              }
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          {/* Dark mode toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={t.nav.themeToggle}>
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" aria-label={t.nav.menuOpen}><Menu className="h-5 w-5" /></Button>} />
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 pt-8 px-4">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={
                      pathname === href
                        ? "text-base font-medium text-foreground"
                        : "text-base text-muted-foreground hover:text-foreground transition-colors"
                    }
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
