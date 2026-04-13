"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (!agreed) {
      setError("개인정보 처리방침에 동의해주세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "회원가입에 실패했습니다.");
        setLoading(false);
        return;
      }

      // Auto-login after signup
      const supabase = createClient();
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);

      if (loginError) {
        setError("가입은 완료되었으나 자동 로그인에 실패했습니다. 로그인 페이지에서 다시 시도해주세요.");
      } else {
        window.location.href = "/scholarships";
      }
    } catch {
      setLoading(false);
      setError("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 text-primary">
            <GraduationCap className="h-8 w-8" />
            <span className="text-xl font-bold">ScholarSync</span>
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-sm p-6 md:p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">📬</div>
              <h2 className="text-xl font-semibold mb-2">이메일을 확인해주세요</h2>
              <p className="text-sm text-muted-foreground mb-6">
                <strong>{email}</strong>으로 인증 메일을 보냈습니다.
                메일함을 확인하고 링크를 클릭해 가입을 완료해주세요.
              </p>
              <Link href="/auth/login" className="text-sm text-primary underline-offset-4 hover:underline">
                로그인으로 이동
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold">회원가입</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  이미 계정이 있으신가요?{" "}
                  <Link href="/auth/login" className="text-primary underline-offset-4 hover:underline">
                    로그인
                  </Link>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium">
                    이메일
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.ac.kr"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-medium">
                    비밀번호
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="8자 이상"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="confirm" className="text-sm font-medium">
                    비밀번호 확인
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="비밀번호를 다시 입력하세요"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                  />
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input
                    id="agree"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-input accent-primary cursor-pointer"
                  />
                  <label htmlFor="agree" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                    <span className="text-foreground font-medium">개인정보 처리방침</span>에 동의합니다.
                    ScholarSync는 장학금 매칭을 위해 학적 정보를 처리합니다.
                  </label>
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "처리 중..." : "회원가입"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
