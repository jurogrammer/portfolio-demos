import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { HistoryEntry } from "@/app/(user)/history/actions";

type TimelineEntryProps = {
  entry: HistoryEntry;
};

export default function TimelineEntry({ entry }: TimelineEntryProps) {
  const hasResponse = !!entry.response;

  return (
    <div className={cn("space-y-3", !hasResponse && "opacity-50")}>
      {/* Question bubble */}
      <div className="flex items-start gap-2">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 mt-0.5">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Q</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">
              {entry.question.category}
            </Badge>
          </div>
          <div className="rounded-lg rounded-tl-none bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 px-3 py-2">
            <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
              {entry.question.content}
            </p>
          </div>
        </div>
      </div>

      {/* Response bubble */}
      {hasResponse ? (
        <div className="flex items-start gap-2 flex-row-reverse">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 mt-0.5">
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">나</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="rounded-lg rounded-tr-none bg-muted border px-3 py-2">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {entry.response!.content}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="ml-8 rounded-lg border border-dashed px-3 py-2">
          <p className="text-xs text-muted-foreground">답변하지 않은 날입니다.</p>
        </div>
      )}

      {/* Reply bubble */}
      {entry.reply && (
        <div className="flex items-start gap-2">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 mt-0.5">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">R</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="rounded-lg rounded-tl-none bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 px-3 py-2">
              <p className="text-sm text-purple-900 dark:text-purple-100 leading-relaxed whitespace-pre-wrap">
                {entry.reply.content}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
