"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
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
import { ReviewPanel } from "@/components/admin/ReviewPanel";
import { getReviewQueue } from "./actions";

type ReviewItem = Awaited<ReturnType<typeof getReviewQueue>>[number];

export default function ReviewPage() {
  const router = useRouter();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [, startTransition] = useTransition();

  const loadData = (from?: string, to?: string) => {
    startTransition(async () => {
      const data = await getReviewQueue({
        dateFrom: from || undefined,
        dateTo: to || undefined,
      });
      setItems(data);
    });
  };

  useEffect(() => { loadData(); }, []);

  const handleRowClick = (item: ReviewItem) => {
    setSelectedItem(item);
    setPanelOpen(true);
  };

  const handleReplySent = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSuggestRule = (responseContent: string) => {
    const encoded = encodeURIComponent(responseContent.slice(0, 200));
    router.push(`/admin/rules?suggest=${encoded}`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">리뷰 큐</h1>
        <Badge variant="secondary">{items.length}건 대기중</Badge>
      </div>

      {/* Filters */}
      <div className="flex items-end gap-3">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">시작일</p>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">종료일</p>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-40"
          />
        </div>
        <Button onClick={() => loadData(dateFrom, dateTo)} variant="outline">
          검색
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setDateFrom("");
            setDateTo("");
            loadData();
          }}
        >
          초기화
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>닉네임</TableHead>
              <TableHead>질문</TableHead>
              <TableHead>응답 내용</TableHead>
              <TableHead className="w-36">제출 시간</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  리뷰 대기중인 응답이 없습니다
                </TableCell>
              </TableRow>
            )}
            {items.map((item) => (
              <TableRow
                key={item.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(item)}
              >
                <TableCell className="font-medium">{item.userNickname}</TableCell>
                <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                  {item.questionContent}
                </TableCell>
                <TableCell className="max-w-[250px] truncate text-sm">
                  {item.responseContent}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleString("ko-KR")}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowClick(item);
                    }}
                  >
                    답장 작성
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ReviewPanel
        item={selectedItem}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onReplySent={handleReplySent}
        onSuggestRule={handleSuggestRule}
      />
    </div>
  );
}
