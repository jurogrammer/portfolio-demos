import TimelineEntry from "./TimelineEntry";
import { CalendarDays } from "lucide-react";
import type { HistoryEntry } from "@/app/(user)/history/actions";

type TimelineProps = {
  entries: HistoryEntry[];
};

export default function Timeline({ entries }: TimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
        <CalendarDays className="size-10 opacity-40" />
        <p className="text-sm">해당 기간의 기록이 없습니다.</p>
      </div>
    );
  }

  // Group by date
  const grouped = new Map<string, { label: string; entries: HistoryEntry[] }>();
  for (const entry of entries) {
    const existing = grouped.get(entry.date);
    if (existing) {
      existing.entries.push(entry);
    } else {
      grouped.set(entry.date, { label: entry.dateLabel, entries: [entry] });
    }
  }

  return (
    <div className="space-y-8">
      {Array.from(grouped.entries()).map(([date, group]) => (
        <div key={date} className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground px-2 shrink-0">
              {group.label}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-6 pl-1">
            {group.entries.map((entry) => (
              <TimelineEntry key={entry.questionMessageId} entry={entry} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
