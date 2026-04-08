import { getCohorts } from "./actions";
import { CohortTable } from "@/components/admin/CohortTable";

export default async function CohortsPage() {
  const cohorts = await getCohorts();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">기수 관리</h1>
        <p className="text-sm text-muted-foreground">코호트를 생성·수정·삭제하고 참여자를 관리합니다.</p>
      </div>
      <CohortTable initialCohorts={cohorts} />
    </div>
  );
}
