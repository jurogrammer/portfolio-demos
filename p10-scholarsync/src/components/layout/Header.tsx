"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Menu, X, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const NAV_ITEMS = [
  { href: "/scholarships", label: "장학금 검색" },
  { href: "/my/essays", label: "내 자소서" },
];

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [open, setOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg mr-8">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span>ScholarSync</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 flex-1">
          {NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname.startsWith(href) ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2 ml-auto">
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/my/profile">
                  <User className="h-4 w-4 mr-1" />
                  프로필
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" />
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">로그인</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/signup">회원가입</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile nav */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="md:hidden ml-auto"
            render={<Button variant="ghost" size="icon" />}
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="sr-only">메뉴</SheetTitle>
            <nav className="flex flex-col gap-4 mt-8">
              {NAV_ITEMS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`text-base font-medium px-2 py-1 rounded-md transition-colors ${
                    pathname.startsWith(href) ? "bg-accent text-primary" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </Link>
              ))}
              <hr className="my-2" />
              {user ? (
                <>
                  <Link href="/my/profile" onClick={() => setOpen(false)} className="text-base px-2 py-1">
                    프로필
                  </Link>
                  <button onClick={handleLogout} className="text-base px-2 py-1 text-left text-muted-foreground">
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setOpen(false)} className="text-base px-2 py-1">
                    로그인
                  </Link>
                  <Link href="/auth/signup" onClick={() => setOpen(false)} className="text-base px-2 py-1 font-bold">
                    회원가입
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
