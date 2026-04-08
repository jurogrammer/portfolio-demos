import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { getMessage, markAsRead } from "./actions";
import ResponseForm from "@/components/inbox/ResponseForm";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, CheckCircle2, Reply, MessageCircleQuestion } from "lucide-react";

export default async function MessageDetailPage({
  params,
}: {
  params: Promise<{ messageId: string }>;
}) {
  const { messageId } = await params;
  const message = await getMessage(messageId);

  if (!message) notFound();

  // Auto mark as read
  if (!message.isRead) {
    await markAsRead(messageId);
  }

  const isQuestion = message.type === "QUESTION";
  const isReply = message.type === "REPLY";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/inbox" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}>
          <ChevronLeft className="size-4" />
          받은함
        </Link>
      </div>

      {isQuestion && message.question && (
        <div className="space-y-6">
          {/* Question card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageCircleQuestion className="size-4 text-blue-500" />
                  오늘의 질문
                </CardTitle>
                <Badge variant="secondary">{message.question.category}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(message.createdAt), "M월 d일 (EEE) HH:mm", { locale: ko })}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">{message.question.content}</p>
            </CardContent>
          </Card>

          {/* Response form or already answered */}
          {message.isAnswered ? (
            <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
              <CardContent className="flex items-center gap-3">
                <CheckCircle2 className="size-5 text-green-600 dark:text-green-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    이미 답변한 질문입니다.
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                    히스토리에서 내 답변과 리플라이를 확인하세요.
                  </p>
                </div>
                <Link href="/history" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "ml-auto shrink-0")}>
                  히스토리 보기
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <h2 className="text-sm font-medium">내 답변</h2>
              <ResponseForm messageId={messageId} />
            </div>
          )}
        </div>
      )}

      {isReply && (
        <div className="space-y-4">
          {/* Original question (collapsible summary) */}
          {message.question && (
            <details className="group rounded-lg border">
              <summary className="flex cursor-pointer items-center justify-between p-3 text-sm font-medium select-none list-none">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <MessageCircleQuestion className="size-4" />
                  원래 질문 보기
                </span>
                <span className="text-xs text-muted-foreground group-open:hidden">펼치기</span>
                <span className="text-xs text-muted-foreground hidden group-open:inline">접기</span>
              </summary>
              <div className="border-t px-3 py-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {message.question.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {message.question.content}
                </p>
              </div>
            </details>
          )}

          {/* My response */}
          {message.response && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">내 답변</p>
              <div className="rounded-lg bg-muted border px-3 py-3">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.response.content}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {format(new Date(message.response.createdAt), "M월 d일 HH:mm", { locale: ko })}
                </p>
              </div>
            </div>
          )}

          {/* Reply */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Reply className="size-3" />
              리프레이밍 리플라이
            </p>
            <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
              <CardContent className="pt-4">
                <p className="text-sm text-purple-900 dark:text-purple-100 leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                <p className="mt-3 text-xs text-purple-600 dark:text-purple-400">
                  {format(new Date(message.createdAt), "M월 d일 HH:mm", { locale: ko })}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {!isQuestion && !isReply && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm leading-relaxed">{message.content}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
