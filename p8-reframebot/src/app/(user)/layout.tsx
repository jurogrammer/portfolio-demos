import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "@/app/(user)/profile/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Inbox, History, User, LogOut, BotMessageSquare } from "lucide-react";

type SessionUser = { id: string; email: string; nickname: string; role: string };

const NAV_LINKS = [
  { href: "/inbox", label: "받은함", icon: Inbox },
  { href: "/history", label: "히스토리", icon: History },
  { href: "/profile", label: "프로필", icon: User },
];

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as unknown as SessionUser;
  if (user.role === "ADMIN") redirect("/admin");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link
            href="/inbox"
            className="flex items-center gap-2 font-semibold text-sm"
          >
            <BotMessageSquare className="size-5 text-primary" />
            <span className="hidden sm:inline">ReframeBot</span>
          </Link>

          <nav className="flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "flex items-center gap-1.5")}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline text-xs">{label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user.nickname}
            </span>
            <form action={logout}>
              <Button type="submit" variant="ghost" size="icon-sm" title="로그아웃">
                <LogOut className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}
