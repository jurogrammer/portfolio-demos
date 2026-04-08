import Link from "next/link";
import MessageItem from "./MessageItem";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import type { MessageType } from "@prisma/client";

type Message = {
  id: string;
  type: MessageType;
  content: string;
  isRead: boolean;
  createdAt: Date;
  question: { id: string; content: string; category: string } | null;
  reply: { id: string; content: string } | null;
};

type MessageListProps = {
  messages: Message[];
  page: number;
  totalPages: number;
};

export default function MessageList({
  messages,
  page,
  totalPages,
}: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
        <Inbox className="size-10 opacity-40" />
        <p className="text-sm">받은 메시지가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {messages.map((msg) => (
        <MessageItem
          key={msg.id}
          id={msg.id}
          type={msg.type}
          content={msg.content}
          isRead={msg.isRead}
          createdAt={msg.createdAt}
          question={msg.question}
        />
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          {page > 1 ? (
            <Link href={`?page=${page - 1}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              <ChevronLeft className="size-4" />
              이전
            </Link>
          ) : (
            <span className={cn(buttonVariants({ variant: "outline", size: "sm" }), "opacity-50 pointer-events-none")}>
              <ChevronLeft className="size-4" />
              이전
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={`?page=${page + 1}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              다음
              <ChevronRight className="size-4" />
            </Link>
          ) : (
            <span className={cn(buttonVariants({ variant: "outline", size: "sm" }), "opacity-50 pointer-events-none")}>
              다음
              <ChevronRight className="size-4" />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
