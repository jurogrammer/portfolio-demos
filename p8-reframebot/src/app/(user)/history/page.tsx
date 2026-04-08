import Link from "next/link";
import { getHistory } from "./actions";
import Timeline from "@/components/history/Timeline";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HistoryFilter } from "./actions";

const FILTERS: { value: HistoryFilter; label: string }[] = [
  { value: "7d", label: "최근 7일" },
  { value: "30d", label: "최근 30일" },
  { value: "all", label: "전체" },
];

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter: filterParam } = await searchParams;
  const filter: HistoryFilter =
    filterParam === "7d" || filterParam === "30d" || filterParam === "all"
      ? filterParam
      : "30d";

  const entries = await getHistory(filter);
  const answeredCount = entries.filter((e) => e.response).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">히스토리</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          질문, 내 답변, 리플라이를 시간 순으로 확인하세요.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 rounded-lg border p-1 w-fit">
        {FILTERS.map(({ value, label }) => (
          <Link
            key={value}
            href={`?filter=${value}`}
            className={cn(
              buttonVariants({ variant: filter === value ? "default" : "ghost", size: "sm" }),
              "text-xs h-7",
              filter === value && "shadow-sm"
            )}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>총 {entries.length}일</span>
        <span className="text-green-600 dark:text-green-400">
          답변 {answeredCount}일
        </span>
        {entries.length > 0 && (
          <span className="text-orange-500">
            미답변 {entries.length - answeredCount}일
          </span>
        )}
      </div>

      <Timeline entries={entries} />
    </div>
  );
}
