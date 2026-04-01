"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Camera,
  ChevronRight,
  Menu,
  MessageCircleMore,
  Play,
} from "lucide-react";
import {
  CHURCH_NAME,
  CHURCH_NAME_EN,
  NAV_ITEMS,
  SOCIAL_LINKS,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

function SocialIcon({ icon }: { icon: (typeof SOCIAL_LINKS)[number]["icon"] }) {
  if (icon === "youtube") {
    return <Play className="h-4 w-4 fill-current" />;
  }

  if (icon === "instagram") {
    return <Camera className="h-4 w-4" />;
  }

  return <MessageCircleMore className="h-4 w-4" />;
}

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-50 text-white">
      <div className="hidden border-b border-white/10 bg-black/25 backdrop-blur-sm md:block">
        <div className="mx-auto flex h-10 max-w-[1200px] items-center justify-end gap-3 px-4 md:px-6">
          {SOCIAL_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              aria-label={link.name}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white hover:text-black"
            >
              <SocialIcon icon={link.icon} />
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-5 md:px-6 md:py-7">
        <Link href="/" className="flex items-center gap-4">
          <Image
            src="/hyesung/logos/hyesung-logo.png"
            alt={CHURCH_NAME}
            width={210}
            height={70}
            className="h-auto w-[110px] brightness-0 invert md:w-[132px]"
            priority
          />
          <div className="hidden border-l border-white/20 pl-4 text-white/80 lg:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em]">
              {CHURCH_NAME_EN}
            </p>
            <p className="mt-1 text-xs text-white/60">혜화동의 예배 공동체</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[12px] font-semibold uppercase tracking-[0.24em] text-white/82 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm transition hover:bg-white hover:text-black md:inline-flex"
          >
            예배 안내
            <ChevronRight className="h-4 w-4" />
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="md:hidden"
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="메뉴 열기"
                  className="border border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white"
                />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-[#0d0d0d] text-white">
              <SheetTitle className="mb-6">
                <Image
                  src="/hyesung/logos/hyesung-logo.png"
                  alt={CHURCH_NAME}
                  width={220}
                  height={74}
                  className="h-auto w-[120px] brightness-0 invert"
                />
              </SheetTitle>
              <nav className="flex flex-col gap-2">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base font-semibold text-white/90 transition hover:bg-white hover:text-black"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-8 grid gap-3">
                {SOCIAL_LINKS.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/78 transition hover:bg-white/10 hover:text-white"
                  >
                    <SocialIcon icon={link.icon} />
                    <span>{link.name}</span>
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
