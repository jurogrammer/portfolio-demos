import { getAdminStats, getRecentActivity } from "./actions";
import { StatsCards } from "@/components/admin/StatsCards";
import { RecentActivity } from "@/components/admin/RecentActivity";

export default async function AdminDashboardPage() {
  const [stats, activity] = await Promise.all([
    getAdminStats(),
    getRecentActivity(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">대시보드</h1>
        <p className="text-sm text-muted-foreground">ReframeBot 운영 현황</p>
      </div>

      <StatsCards stats={stats} />

      <div className="flex flex-col gap-3">
        <h2 className="text-base font-medium">최근 응답</h2>
        <RecentActivity items={activity} />
      </div>
    </div>
  );
}
