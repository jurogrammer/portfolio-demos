import Link from "next/link";
import { auth } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { MessageCircleQuestion } from "lucide-react";
import UserNav from "./UserNav";

export default async function Header() {
  const session = await auth();
  const user = session?.user as
    | { id?: string; email?: string | null; name?: string | null; nickname?: string | null; role?: string }
    | undefined;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-foreground hover:opacity-80 transition-opacity"
        >
          <MessageCircleQuestion className="size-5 text-primary" />
          ReframeBot
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
          {user && (
            <>
              <Link href="/inbox" className="hover:text-foreground transition-colors">
                메시지함
              </Link>
              <Link href="/history" className="hover:text-foreground transition-colors">
                히스토리
              </Link>
              {user.role === "ADMIN" && (
                <Link href="/admin" className="hover:text-foreground transition-colors">
                  관리자
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <UserNav email={user.email ?? ""} nickname={user.nickname} />
          ) : (
            <Link href="/login" className={buttonVariants({ size: "sm" })}>
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
