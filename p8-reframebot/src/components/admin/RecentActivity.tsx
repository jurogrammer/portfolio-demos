import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { RecentActivityItem } from "@/app/(admin)/admin/actions";

interface RecentActivityProps {
  items: RecentActivityItem[];
}

export function RecentActivity({ items }: RecentActivityProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
        최근 응답이 없습니다.
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">닉네임</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">질문</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">응답</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">자동 답장</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">시간</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{item.userNickname}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  <span className="mr-1.5 inline-flex items-center rounded bg-secondary px-1.5 py-0.5 text-xs">
                    {item.questionCategory}
                  </span>
                  {item.questionContent.slice(0, 40)}
                  {item.questionContent.length > 40 && "…"}
                </td>
                <td className="max-w-[200px] px-4 py-3 text-muted-foreground">
                  {item.responseContent.slice(0, 50)}
                  {item.responseContent.length > 50 && "…"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={item.isAutoReply ? "default" : "secondary"}>
                    {item.isAutoReply ? "자동" : "미생성"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(item.createdAt, { addSuffix: true, locale: ko })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
