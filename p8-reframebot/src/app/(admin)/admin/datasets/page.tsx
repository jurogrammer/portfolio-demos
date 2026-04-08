"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatasetFilters } from "@/components/admin/DatasetFilters";
import { DatasetExport } from "@/components/admin/DatasetExport";
import { getDatasetPreview, getCohortOptions } from "./actions";
import type { DatasetFilter } from "./actions";

type PreviewRow = Awaited<ReturnType<typeof getDatasetPreview>>[number];
type CohortOption = { id: string; name: string };

export default function DatasetsPage() {
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [cohorts, setCohorts] = useState<CohortOption[]>([]);
  const [filter, setFilter] = useState<DatasetFilter>({});
  const [, startTransition] = useTransition();

  const loadPreview = (f: DatasetFilter) => {
    startTransition(async () => {
      setRows(await getDatasetPreview(f));
    });
  };

  useEffect(() => {
    startTransition(async () => {
      const [c] = await Promise.all([getCohortOptions()]);
      setCohorts(c);
      setRows(await getDatasetPreview({}));
    });
  }, []);

  const handleFilterChange = (f: DatasetFilter) => {
    setFilter(f);
    loadPreview(f);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">데이터셋</h1>
        <DatasetExport filter={filter} />
      </div>

      <DatasetFilters filter={filter} cohorts={cohorts} onChange={handleFilterChange} />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">미리보기 (최근 10건)</p>
          <Button variant="ghost" size="sm" onClick={() => loadPreview(filter)}>
            새로고침
          </Button>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>응답 (입력)</TableHead>
                <TableHead>답장 (출력)</TableHead>
                <TableHead className="w-28">규칙</TableHead>
                <TableHead className="w-16">유형</TableHead>
                <TableHead className="w-36">생성일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    데이터가 없습니다
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="max-w-[220px] truncate text-sm">{row.input}</TableCell>
                  <TableCell className="max-w-[220px] truncate text-sm">{row.output}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {row.ruleName ?? "수동"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.isAuto ? "default" : "secondary"}>
                      {row.isAuto ? "자동" : "수동"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(row.createdAt).toLocaleString("ko-KR")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
