import { Suspense } from "react";
import { getMessages } from "./actions";
import TodayQuestion from "@/components/inbox/TodayQuestion";
import MessageList from "@/components/inbox/MessageList";
import { Skeleton } from "@/components/ui/skeleton";

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const { messages, totalPages } = await getMessages(page);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">받은함</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          질문과 리플라이를 확인하세요.
        </p>
      </div>

      <Suspense
        fallback={<Skeleton className="h-24 w-full rounded-xl" />}
      >
        <TodayQuestion />
      </Suspense>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          전체 메시지
        </h2>
        <MessageList messages={messages} page={page} totalPages={totalPages} />
      </section>
    </div>
  );
}
