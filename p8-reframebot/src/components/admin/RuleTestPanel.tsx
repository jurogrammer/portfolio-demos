"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { testRule } from "@/app/(admin)/admin/rules/actions";
import { CONDITION_TYPE_MAP } from "@/lib/constants";

type TestResult = {
  matched: boolean;
  ruleName?: string;
  conditionType?: string;
  matchedValue?: string;
  replyPreview?: string;
};

export function RuleTestPanel() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleTest = () => {
    if (!text.trim()) return;
    startTransition(async () => {
      setError(null);
      const res = await testRule(text);
      if (res.success) {
        setResult(res.data);
      } else {
        setError(res.error);
        setResult(null);
      }
    });
  };

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <h3 className="font-semibold text-sm">규칙 테스트</h3>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="테스트할 응답 텍스트를 입력하세요..."
        rows={3}
      />
      <Button
        onClick={handleTest}
        disabled={isPending || !text.trim()}
        size="sm"
        className="w-full"
      >
        {isPending ? "테스트 중..." : "매칭 테스트"}
      </Button>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {result !== null && (
        <div
          className={`rounded-md border p-3 text-sm space-y-2 ${
            result.matched
              ? "border-green-200 bg-green-50 dark:bg-green-950/20"
              : "border-muted bg-muted/30"
          }`}
        >
          {result.matched ? (
            <>
              <div className="flex items-center gap-2">
                <span className="font-medium text-green-700 dark:text-green-400">✓ 매칭됨</span>
                <Badge variant="secondary">{result.ruleName}</Badge>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>
                  유형:{" "}
                  {result.conditionType
                    ? CONDITION_TYPE_MAP[result.conditionType as keyof typeof CONDITION_TYPE_MAP]
                    : result.conditionType}
                </span>
                <span>매칭값: {result.matchedValue}</span>
              </div>
              {result.replyPreview && (
                <div className="mt-2 rounded border bg-background p-2 text-xs whitespace-pre-wrap">
                  <p className="text-muted-foreground mb-1 font-medium">답장 미리보기</p>
                  {result.replyPreview}
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">✗ 매칭된 규칙 없음</p>
          )}
        </div>
      )}
    </div>
  );
}
