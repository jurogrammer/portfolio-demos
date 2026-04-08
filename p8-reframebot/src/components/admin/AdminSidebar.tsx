"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  UsersIcon,
  HelpCircleIcon,
  BookOpenIcon,
  FileTextIcon,
  ClipboardCheckIcon,
  DatabaseIcon,
  BotIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboardIcon, exact: true },
  { href: "/admin/cohorts", label: "기수관리", icon: UsersIcon },
  { href: "/admin/questions", label: "질문관리", icon: HelpCircleIcon },
  { href: "/admin/rules", label: "규칙관리", icon: BookOpenIcon },
  { href: "/admin/templates", label: "템플릿관리", icon: FileTextIcon },
  { href: "/admin/review", label: "검수큐", icon: ClipboardCheckIcon },
  { href: "/admin/datasets", label: "데이터", icon: DatabaseIcon },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (item: (typeof NAV_ITEMS)[number]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  const navContent = (
    <nav className="flex flex-col gap-1 p-3">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActive({ href, label, icon: Icon, exact: href === "/admin" });
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 flex size-8 items-center justify-center rounded-lg border bg-background shadow-sm md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="메뉴 열기/닫기"
      >
        {mobileOpen ? <XIcon className="size-4" /> : <MenuIcon className="size-4" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r bg-sidebar transition-transform md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <BotIcon className="size-5 text-primary" />
          <span className="font-semibold text-sm">ReframeBot Admin</span>
        </div>
        {navContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden w-56 flex-shrink-0 flex-col border-r bg-sidebar md:flex">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <BotIcon className="size-5 text-primary" />
          <span className="font-semibold text-sm">ReframeBot Admin</span>
        </div>
        {navContent}
      </aside>
    </>
  );
}
