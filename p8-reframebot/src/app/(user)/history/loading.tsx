import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-4 w-52" />
      </div>

      <Skeleton className="h-9 w-48 rounded-lg" />

      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <Skeleton className="h-4 w-24" />
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="space-y-2 pl-1">
              <div className="flex gap-2">
                <Skeleton className="size-6 rounded-full shrink-0" />
                <Skeleton className="h-16 flex-1 rounded-lg" />
              </div>
              <div className="flex gap-2 flex-row-reverse">
                <Skeleton className="size-6 rounded-full shrink-0" />
                <Skeleton className="h-12 flex-1 rounded-lg" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="size-6 rounded-full shrink-0" />
                <Skeleton className="h-14 flex-1 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
