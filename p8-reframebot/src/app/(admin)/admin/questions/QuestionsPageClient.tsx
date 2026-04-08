"use client";

import { useState, useTransition, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon, PencilIcon, TrashIcon, SendIcon } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { QUESTION_CATEGORIES } from "@/lib/constants";
import { QuestionForm } from "@/components/admin/QuestionForm";
import type { QuestionRow, CreateQuestionInput } from "./actions";
import type { CohortRow } from "../cohorts/actions";
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  sendQuestionNow,
} from "./actions";

interface QuestionsPageClientProps {
  initialQuestions: QuestionRow[];
  cohorts: CohortRow[];
}

export function QuestionsPageClient({ initialQuestions, cohorts }: QuestionsPageClientProps) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<QuestionRow | null>(null);
  const [sendTarget, setSendTarget] = useState<QuestionRow | null>(null);
  const [sendCohortId, setSendCohortId] = useState("");
  const [filterCategory, setFilterCategory] = useState("__all__");
  const [filterSent, setFilterSent] = useState("__all__");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      if (filterCategory !== "__all__" && q.category !== filterCategory) return false;
      if (filterSent === "sent" && !q.isSent) return false;
      if (filterSent === "unsent" && q.isSent) return false;
      return true;
    });
  }, [questions, filterCategory, filterSent]);

  const handleCreate = async (
    data: CreateQuestionInput,
    sendNow: boolean,
    cohortId?: string
  ) => {
    startTransition(async () => {
      const res = await createQuestion(data);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      const created = res.data;
      if (sendNow && cohortId) {
        const sendRes = await sendQuestionNow(created.id, cohortId);
        if (sendRes.success) {
          toast.success(`질문이 생성되고 ${sendRes.data.sent}명에게 발송되었습니다.`);
          setQuestions((prev) => [{ ...created, isSent: true, sentAt: new Date() }, ...prev]);
        } else {
          toast.error(`생성 완료, 발송 실패: ${sendRes.error}`);
          setQuestions((prev) => [created, ...prev]);
        }
      } else {
        toast.success("질문이 생성되었습니다.");
        setQuestions((prev) => [created, ...prev]);
      }
      setCreateOpen(false);
    });
  };

  const handleUpdate = async (data: CreateQuestionInput) => {
    if (!editTarget) return;
    startTransition(async () => {
      const res = await updateQuestion(editTarget.id, data);
      if (res.success) {
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === editTarget.id
              ? { ...q, ...data, scheduledAt: new Date(data.scheduledAt) }
              : q
          )
        );
        setEditTarget(null);
        toast.success("질문이 수정되었습니다.");
      } else {
        toast.error(res.error);
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteQuestion(id);
      if (res.success) {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        toast.success("질문이 삭제되었습니다.");
      } else {
        toast.error(res.error);
      }
    });
  };

  const handleSendNow = () => {
    if (!sendTarget || !sendCohortId) {
      toast.error("기수를 선택하세요.");
      return;
    }
    startTransition(async () => {
      const res = await sendQuestionNow(sendTarget.id, sendCohortId);
      if (res.success) {
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === sendTarget.id ? { ...q, isSent: true, sentAt: new Date() } : q
          )
        );
        setSendTarget(null);
        setSendCohortId("");
        toast.success(`${res.data.sent}명에게 발송되었습니다.`);
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filters + Create */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v ?? "__all__")}>
          <SelectTrigger className="w-36">
            {filterCategory === "__all__" ? "전체 카테고리" : filterCategory}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">전체 카테고리</SelectItem>
            {QUESTION_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterSent} onValueChange={(v) => setFilterSent(v ?? "__all__")}>
          <SelectTrigger className="w-32">
            {filterSent === "__all__" ? "전체" : filterSent === "sent" ? "발송됨" : "미발송"}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">전체</SelectItem>
            <SelectItem value="sent">발송됨</SelectItem>
            <SelectItem value="unsent">미발송</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto">
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger render={<Button />}>
              <PlusIcon />
              질문 생성
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>질문 생성</DialogTitle>
              </DialogHeader>
              <QuestionForm
                cohorts={cohorts}
                onSubmit={handleCreate}
                onCancel={() => setCreateOpen(false)}
                isPending={isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
          질문이 없습니다.
        </div>
      ) : (
        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">질문 (미리보기)</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">카테고리</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">예약 일시</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">발송 상태</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">작업</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((question) => (
                  <tr key={question.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="max-w-[280px] px-4 py-3 text-muted-foreground">
                      {question.content.slice(0, 50)}
                      {question.content.length > 50 && "…"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded bg-secondary px-1.5 py-0.5 text-xs">
                        {question.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {format(question.scheduledAt, "yy.MM.dd HH:mm", { locale: ko })}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={question.isSent ? "default" : "outline"}>
                        {question.isSent ? "발송됨" : "미발송"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {!question.isSent && (
                          <Dialog
                            open={sendTarget?.id === question.id}
                            onOpenChange={(open) => {
                              if (!open) { setSendTarget(null); setSendCohortId(""); }
                            }}
                          >
                            <DialogTrigger
                              render={<Button variant="ghost" size="icon-sm" title="즉시 발송" />}
                              onClick={() => setSendTarget(question)}
                            >
                              <SendIcon />
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-sm">
                              <DialogHeader>
                                <DialogTitle>즉시 발송</DialogTitle>
                              </DialogHeader>
                              <div className="flex flex-col gap-4">
                                <p className="text-sm text-muted-foreground">
                                  선택한 기수의 모든 참여자에게 질문을 즉시 발송합니다.
                                </p>
                                <Select value={sendCohortId} onValueChange={(v) => setSendCohortId(v ?? "")}>
                                  <SelectTrigger className="w-full">
                                    {cohorts.find(c => c.id === sendCohortId)?.name || "기수 선택"}
                                  </SelectTrigger>
                                  <SelectContent>
                                    {cohorts.map((c) => (
                                      <SelectItem key={c.id} value={c.id}>
                                        {c.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => { setSendTarget(null); setSendCohortId(""); }}
                                    disabled={isPending}
                                  >
                                    취소
                                  </Button>
                                  <Button onClick={handleSendNow} disabled={isPending || !sendCohortId}>
                                    {isPending ? "발송 중…" : "발송"}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        <Dialog
                          open={editTarget?.id === question.id}
                          onOpenChange={(open) => !open && setEditTarget(null)}
                        >
                          <DialogTrigger
                            render={<Button variant="ghost" size="icon-sm" />}
                            onClick={() => setEditTarget(question)}
                          >
                            <PencilIcon />
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                              <DialogTitle>질문 수정</DialogTitle>
                            </DialogHeader>
                            {editTarget?.id === question.id && (
                              <QuestionForm
                                question={editTarget}
                                cohorts={cohorts}
                                onSubmit={(data) => handleUpdate(data)}
                                onCancel={() => setEditTarget(null)}
                                isPending={isPending}
                              />
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(question.id)}
                          disabled={isPending}
                          title="삭제"
                        >
                          <TrashIcon className="text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit dialog (controlled separately) */}
    </div>
  );
}
