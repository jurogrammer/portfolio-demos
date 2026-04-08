import Link from "next/link";
import { getTodayQuestion } from "@/app/(user)/inbox/actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle, MessageCircleQuestion } from "lucide-react";

export default async function TodayQuestion() {
  const data = await getTodayQuestion();

  if (!data) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center gap-3 text-muted-foreground">
          <MessageCircleQuestion className="size-5 shrink-0" />
          <p className="text-sm">오늘의 질문이 아직 도착하지 않았습니다.</p>
        </CardContent>
      </Card>
    );
  }

  if (data.isAnswered) {
    return (
      <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <CardContent className="flex items-center gap-3">
          <CheckCircle className="size-5 shrink-0 text-green-600 dark:text-green-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              오늘 답변 완료 🎉
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5 line-clamp-1">
              {data.question.content}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <MessageCircleQuestion className="size-4 text-blue-600 dark:text-blue-400" />
            오늘의 질문
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {data.question.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
          {data.question.content}
        </p>
        <Link
          href={`/inbox/${data.messageId}`}
          className={cn(buttonVariants({ size: "sm" }), "self-start")}
        >
          지금 답변하기
        </Link>
      </CardContent>
    </Card>
  );
}
