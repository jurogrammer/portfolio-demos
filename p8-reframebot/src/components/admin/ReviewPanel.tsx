"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { submitManualReply } from "@/app/(admin)/admin/review/actions";

interface ReviewItem {
  id: string;
  userNickname: string;
  questionContent: string;
  questionCategory: string;
  responseContent: string;
  createdAt: Date;
}

interface Props {
  item: ReviewItem | null;
  open: boolean;
  onClose: () => void;
  onReplySent: (id: string) => void;
  onSuggestRule: (responseContent: string) => void;
}

export function ReviewPanel({ item, open, onClose, onReplySent, onSuggestRule }: Props) {
  const [replyBody, setReplyBody] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!item || !replyBody.trim()) return;
    startTransition(async () => {
      const result = await submitManualReply(item.id, replyBody);
      if (result.success) {
        toast.success("수동 답장이 전송되었습니다");
        setReplyBody("");
        onReplySent(item.id);
        onClose();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>응답 검토</SheetTitle>
        </SheetHeader>

        {item && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{item.userNickname}</span>
              <Badge variant="outline">{item.questionCategory}</Badge>
              <span className="text-xs text-muted-foreground ml-auto">
                {new Date(item.createdAt).toLocaleString("ko-KR")}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">질문</p>
              <div className="rounded-md bg-muted/30 p-3 text-sm">{item.questionContent}</div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">사용자 응답</p>
              <div className="rounded-md bg-muted/30 p-3 text-sm whitespace-pre-wrap">
                {item.responseContent}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">수동 답장 작성</p>
              <Textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="답장 내용을 입력하세요..."
                rows={4}
              />
              <Button
                onClick={handleSubmit}
                disabled={isPending || !replyBody.trim()}
                className="w-full"
              >
                {isPending ? "전송 중..." : "답장 전송"}
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                onSuggestRule(item.responseContent);
                onClose();
              }}
            >
              이 응답으로 새 규칙 제안
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
