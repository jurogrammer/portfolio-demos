import Link from "next/link";
import { MessageCircleQuestion } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="flex items-center gap-2 text-foreground hover:opacity-80">
            <MessageCircleQuestion className="size-5 text-primary" />
            <span className="font-semibold">ReframeBot</span>
          </Link>

          <p className="text-sm text-muted-foreground">
            매일 질문, 매일 성장 — 포트폴리오 데모 프로젝트
          </p>

          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">
              로그인
            </Link>
            <Link href="/inbox" className="hover:text-foreground transition-colors">
              메시지함
            </Link>
            <Link href="/admin" className="hover:text-foreground transition-colors">
              관리자
            </Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © 2024 ReframeBot. Built with Next.js 16, Supabase, Prisma, NextAuth.js.
        </div>
      </div>
    </footer>
  );
}
