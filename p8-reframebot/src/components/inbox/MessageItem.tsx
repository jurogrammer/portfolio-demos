import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, MessageCircleQuestion, Reply } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MessageType } from "@prisma/client";

type MessageItemProps = {
  id: string;
  type: MessageType;
  content: string;
  isRead: boolean;
  createdAt: Date;
  question?: { category: string } | null;
};

const TYPE_CONFIG = {
  QUESTION: {
    icon: MessageCircleQuestion,
    label: "질문",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  REPLY: {
    icon: Reply,
    label: "리플라이",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-900/30",
  },
  RESPONSE: {
    icon: MessageCircle,
    label: "응답",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
  SYSTEM: {
    icon: MessageCircle,
    label: "시스템",
    color: "text-gray-600 dark:text-gray-400",
    bg: "bg-gray-100 dark:bg-gray-900/30",
  },
} as const;

export default function MessageItem({
  id,
  type,
  content,
  isRead,
  createdAt,
  question,
}: MessageItemProps) {
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.SYSTEM;
  const Icon = config.icon;

  return (
    <Link
      href={`/inbox/${id}`}
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50",
        !isRead && "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
      )}
    >
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          config.bg
        )}
      >
        <Icon className={cn("size-4", config.color)} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground">
            {config.label}
          </span>
          {question?.category && (
            <Badge variant="outline" className="text-xs h-4 px-1.5">
              {question.category}
            </Badge>
          )}
          {!isRead && (
            <span className="size-2 rounded-full bg-blue-500 ml-auto shrink-0" />
          )}
        </div>
        <p className="mt-0.5 text-sm line-clamp-2 text-foreground">
          {content}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(createdAt), {
            addSuffix: true,
            locale: ko,
          })}
        </p>
      </div>
    </Link>
  );
}
