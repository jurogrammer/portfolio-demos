"use client";

import { Input } from "@/components/ui/input";
import { QUESTION_CATEGORIES } from "@/lib/constants";
import type { DatasetFilter } from "@/app/(admin)/admin/datasets/actions";

interface CohortOption {
  id: string;
  name: string;
}

interface Props {
  filter: DatasetFilter;
  cohorts: CohortOption[];
  onChange: (filter: DatasetFilter) => void;
}

export function DatasetFilters({ filter, cohorts, onChange }: Props) {
  const toggleCohort = (id: string) => {
    const current = filter.cohortIds ?? [];
    const next = current.includes(id) ? current.filter((c) => c !== id) : [...current, id];
    onChange({ ...filter, cohortIds: next.length ? next : undefined });
  };

  const toggleCategory = (cat: string) => {
    const current = filter.categories ?? [];
    const next = current.includes(cat) ? current.filter((c) => c !== cat) : [...current, cat];
    onChange({ ...filter, categories: next.length ? next : undefined });
  };

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <h3 className="text-sm font-semibold">필터</h3>

      {cohorts.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">코호트</p>
          <div className="flex flex-wrap gap-2">
            {cohorts.map((c) => (
              <label key={c.id} className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={(filter.cohortIds ?? []).includes(c.id)}
                  onChange={() => toggleCohort(c.id)}
                  className="accent-primary"
                />
                {c.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">시작일</p>
          <Input
            type="date"
            value={filter.dateFrom ?? ""}
            onChange={(e) => onChange({ ...filter, dateFrom: e.target.value || undefined })}
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">종료일</p>
          <Input
            type="date"
            value={filter.dateTo ?? ""}
            onChange={(e) => onChange({ ...filter, dateTo: e.target.value || undefined })}
          />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">유형</p>
        <div className="flex gap-4">
          {(
            [
              { label: "전체", value: undefined },
              { label: "자동", value: true },
              { label: "수동", value: false },
            ] as const
          ).map(({ label, value }) => (
            <label key={label} className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="radio"
                checked={filter.isAuto === value}
                onChange={() => onChange({ ...filter, isAuto: value })}
                className="accent-primary"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">카테고리</p>
        <div className="flex flex-wrap gap-2">
          {QUESTION_CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={(filter.categories ?? []).includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="accent-primary"
              />
              {cat}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
