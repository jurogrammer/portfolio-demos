"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";
import type { AutofillResult } from "@/app/api/profile/autofill/route";

const textareaClass =
  "flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 resize-y";

interface Props {
  onResult: (data: AutofillResult) => void;
}

export default function AutofillDialog({ onResult }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/profile/autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "자동입력에 실패했습니다.");
        return;
      }

      const data: AutofillResult = await res.json();
      onResult(data);
      setOpen(false);
      setText("");
    });
  };

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Sparkles className="h-4 w-4" />
        AI 자동입력
      </Button>
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">AI 프로필 자동입력</h3>
        </div>
        <button
          type="button"
          onClick={() => { setOpen(false); setError(null); }}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        이력서, 자기소개서, 또는 본인 소개 텍스트를 붙여넣으면 AI가 분석하여 프로필 항목을 자동으로 채워줍니다.
        기존에 입력된 내용은 덮어씌워집니다.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={"여기에 이력서나 자기소개서를 붙여넣으세요.\n\n예시:\n저는 경희대학교 산업경영공학과 3학년에 재학 중인 홍길동입니다. 서울에 거주하고 있으며, 인공지능과 데이터 분석에 관심이 많습니다. 2024년 교내 해커톤에서 대상을 수상했고, AI 스타트업에서 6개월간 인턴으로 근무했습니다..."}
        className={textareaClass}
        rows={8}
        disabled={isPending}
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {text.length.toLocaleString()} / 10,000자
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => { setOpen(false); setError(null); }}
            disabled={isPending}
          >
            취소
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={isPending || text.trim().length < 20}
            className="gap-2"
          >
            {isPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                분석 중...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                자동입력
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
