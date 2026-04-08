"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { exportDatasetCSV, exportDatasetJSON } from "@/app/(admin)/admin/datasets/actions";
import type { DatasetFilter } from "@/app/(admin)/admin/datasets/actions";

interface Props {
  filter: DatasetFilter;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function DatasetExport({ filter }: Props) {
  const [csvPending, startCSV] = useTransition();
  const [jsonPending, startJSON] = useTransition();

  const handleCSV = () => {
    startCSV(async () => {
      const result = await exportDatasetCSV(filter);
      if (result.success) {
        const date = new Date().toISOString().slice(0, 10);
        downloadFile(result.data, `dataset-${date}.csv`, "text/csv;charset=utf-8");
        toast.success("CSV 다운로드 완료");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleJSON = () => {
    startJSON(async () => {
      const result = await exportDatasetJSON(filter);
      if (result.success) {
        const date = new Date().toISOString().slice(0, 10);
        downloadFile(result.data, `dataset-${date}.jsonl`, "application/jsonl");
        toast.success("JSON 다운로드 완료");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleCSV} disabled={csvPending}>
        {csvPending ? "생성 중..." : "CSV 다운로드"}
      </Button>
      <Button variant="outline" onClick={handleJSON} disabled={jsonPending}>
        {jsonPending ? "생성 중..." : "JSON 다운로드"}
      </Button>
    </div>
  );
}
