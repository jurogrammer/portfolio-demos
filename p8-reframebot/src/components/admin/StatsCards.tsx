import { Card } from "@/components/ui/card";
import { UsersIcon, LayersIcon, MessageSquareIcon, BotIcon, ClipboardListIcon } from "lucide-react";
import type { AdminStats } from "@/app/(admin)/admin/actions";

interface StatsCardsProps {
  stats: AdminStats;
}

const CARD_CONFIG = [
  {
    key: "totalParticipants" as const,
    label: "전체 참여자",
    icon: UsersIcon,
    format: (v: number) => `${v}명`,
  },
  {
    key: "activeCohorts" as const,
    label: "활성 기수",
    icon: LayersIcon,
    format: (v: number) => `${v}개`,
  },
  {
    key: "todayResponseRate" as const,
    label: "오늘 응답률",
    icon: MessageSquareIcon,
    format: (v: number) => `${v}%`,
  },
  {
    key: "autoReplyRate" as const,
    label: "자동 답장 비율",
    icon: BotIcon,
    format: (v: number) => `${v}%`,
  },
  {
    key: "pendingReview" as const,
    label: "검수 대기",
    icon: ClipboardListIcon,
    format: (v: number) => `${v}건`,
  },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {CARD_CONFIG.map(({ key, label, icon: Icon, format }) => (
        <Card key={key} className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{label}</span>
            <Icon className="size-4 text-muted-foreground" />
          </div>
          <span className="text-2xl font-bold">{format(stats[key])}</span>
        </Card>
      ))}
    </div>
  );
}
