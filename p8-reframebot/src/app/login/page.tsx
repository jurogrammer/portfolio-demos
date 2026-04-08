"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { MessageCircleQuestion, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState<"user" | "admin" | null>(null);
  const [sent, setSent] = useState(false);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      await signIn("nodemailer", { email, callbackUrl: "/inbox" });
      setSent(true);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDemoLogin(type: "user" | "admin") {
    setIsDemoLoading(type);
    const demoEmail =
      type === "admin" ? "admin@reframebot.com" : "user1@reframebot.com";
    const callbackUrl = type === "admin" ? "/admin" : "/inbox";
    try {
      await signIn("demo", { email: demoEmail, callbackUrl });
    } finally {
      setIsDemoLoading(null);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <MessageCircleQuestion className="size-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            ReframeBot
          </h1>
          <p className="text-sm text-muted-foreground">
            매일 질문, 매일 성장
          </p>
        </div>

        {/* Magic link form */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          {sent ? (
            <div className="py-4 text-center">
              <p className="mb-1 font-medium text-foreground">이메일을 확인하세요</p>
              <p className="text-sm text-muted-foreground">
                {email}로 로그인 링크를 보냈습니다.
              </p>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                이메일로 로그인
              </Button>
            </form>
          )}

          {/* Demo mode */}
          <div className="mt-5 space-y-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">
                  시연용 계정
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleDemoLogin("user")}
              disabled={isDemoLoading !== null}
            >
              {isDemoLoading === "user" && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              시연용 사용자로 로그인
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => handleDemoLogin("admin")}
              disabled={isDemoLoading !== null}
            >
              {isDemoLoading === "admin" && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              시연용 관리자로 로그인
            </Button>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          계속 진행하면{" "}
          <span className="underline underline-offset-2">이용약관</span>에
          동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}
