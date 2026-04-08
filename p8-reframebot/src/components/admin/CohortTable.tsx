"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon, PencilIcon, TrashIcon, UsersIcon, UserPlusIcon, UserMinusIcon } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { COHORT_STATUS_MAP } from "@/lib/constants";
import { CohortForm } from "./CohortForm";
import type { CohortRow, CreateCohortInput, ParticipantRow } from "@/app/(admin)/admin/cohorts/actions";
import {
  createCohort,
  updateCohort,
  deleteCohort,
  getCohortParticipants,
  addParticipant,
  removeParticipant,
} from "@/app/(admin)/admin/cohorts/actions";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  ACTIVE: "default",
  CLOSED: "secondary",
  ARCHIVED: "outline",
};

interface CohortTableProps {
  initialCohorts: CohortRow[];
}

export function CohortTable({ initialCohorts }: CohortTableProps) {
  const [cohorts, setCohorts] = useState(initialCohorts);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CohortRow | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [addEmail, setAddEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCreate = async (data: CreateCohortInput) => {
    startTransition(async () => {
      const res = await createCohort(data);
      if (res.success) {
        setCohorts((prev) => [res.data, ...prev]);
        setCreateOpen(false);
        toast.success("기수가 생성되었습니다.");
      } else {
        toast.error(res.error);
      }
    });
  };

  const handleUpdate = async (data: CreateCohortInput) => {
    if (!editTarget) return;
    startTransition(async () => {
      const res = await updateCohort(editTarget.id, data);
      if (res.success) {
        setCohorts((prev) =>
          prev.map((c) =>
            c.id === editTarget.id
              ? { ...c, ...data, startDate: data.startDate ? new Date(data.startDate) : null, endDate: data.endDate ? new Date(data.endDate) : null }
              : c
          )
        );
        setEditTarget(null);
        toast.success("기수가 수정되었습니다.");
      } else {
        toast.error(res.error);
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteCohort(id);
      if (res.success) {
        setCohorts((prev) => prev.filter((c) => c.id !== id));
        if (expandedId === id) setExpandedId(null);
        toast.success("기수가 삭제되었습니다.");
      } else {
        toast.error(res.error);
      }
    });
  };

  const handleExpand = async (cohortId: string) => {
    if (expandedId === cohortId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(cohortId);
    const data = await getCohortParticipants(cohortId);
    setParticipants(data);
  };

  const handleAddParticipant = (cohortId: string) => {
    if (!addEmail.trim()) return;
    startTransition(async () => {
      const res = await addParticipant(cohortId, addEmail.trim());
      if (res.success) {
        setAddEmail("");
        const data = await getCohortParticipants(cohortId);
        setParticipants(data);
        setCohorts((prev) =>
          prev.map((c) =>
            c.id === cohortId ? { ...c, memberCount: c.memberCount + 1 } : c
          )
        );
        toast.success("참여자가 추가되었습니다.");
      } else {
        toast.error(res.error);
      }
    });
  };

  const handleRemoveParticipant = (cohortUserId: string, cohortId: string) => {
    startTransition(async () => {
      const res = await removeParticipant(cohortUserId);
      if (res.success) {
        setParticipants((prev) => prev.filter((p) => p.id !== cohortUserId));
        setCohorts((prev) =>
          prev.map((c) =>
            c.id === cohortId ? { ...c, memberCount: Math.max(0, c.memberCount - 1) } : c
          )
        );
        toast.success("참여자가 제거되었습니다.");
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger render={<Button />}>
            <PlusIcon />
            기수 생성
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>기수 생성</DialogTitle>
            </DialogHeader>
            <CohortForm
              onSubmit={handleCreate}
              onCancel={() => setCreateOpen(false)}
              isPending={isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {cohorts.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
          등록된 기수가 없습니다.
        </div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">기수명</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">상태</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">참여자/정원</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">기간</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">작업</th>
              </tr>
            </thead>
            <tbody>
              {cohorts.map((cohort) => (
                <>
                  <tr key={cohort.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{cohort.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[cohort.status] ?? "secondary"}>
                        {COHORT_STATUS_MAP[cohort.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {cohort.memberCount} / {cohort.capacity}명
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {cohort.startDate
                        ? format(cohort.startDate, "yy.MM.dd", { locale: ko })
                        : "-"}{" "}
                      ~{" "}
                      {cohort.endDate
                        ? format(cohort.endDate, "yy.MM.dd", { locale: ko })
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleExpand(cohort.id)}
                          title="참여자 보기"
                        >
                          <UsersIcon />
                        </Button>
                        <Dialog
                          open={editTarget?.id === cohort.id}
                          onOpenChange={(open) => !open && setEditTarget(null)}
                        >
                          <DialogTrigger
                            render={<Button variant="ghost" size="icon-sm" />}
                            onClick={() => setEditTarget(cohort)}
                          >
                            <PencilIcon />
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>기수 수정</DialogTitle>
                            </DialogHeader>
                            {editTarget?.id === cohort.id && (
                              <CohortForm
                                cohort={editTarget}
                                onSubmit={handleUpdate}
                                onCancel={() => setEditTarget(null)}
                                isPending={isPending}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(cohort.id)}
                          disabled={isPending}
                          title="삭제"
                        >
                          <TrashIcon className="text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>

                  {expandedId === cohort.id && (
                    <tr key={`${cohort.id}-participants`}>
                      <td colSpan={5} className="bg-muted/20 px-4 py-4">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`email-${cohort.id}`} className="shrink-0">
                              참여자 추가
                            </Label>
                            <Input
                              id={`email-${cohort.id}`}
                              type="email"
                              placeholder="이메일로 검색"
                              value={addEmail}
                              onChange={(e) => setAddEmail(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddParticipant(cohort.id);
                                }
                              }}
                              className="max-w-xs"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddParticipant(cohort.id)}
                              disabled={isPending}
                            >
                              <UserPlusIcon />
                              추가
                            </Button>
                          </div>

                          {participants.length === 0 ? (
                            <p className="text-xs text-muted-foreground">참여자가 없습니다.</p>
                          ) : (
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b">
                                  <th className="pb-2 text-left font-medium text-muted-foreground">닉네임</th>
                                  <th className="pb-2 text-left font-medium text-muted-foreground">이메일</th>
                                  <th className="pb-2 text-left font-medium text-muted-foreground">가입일</th>
                                  <th className="pb-2 text-left font-medium text-muted-foreground">응답 수</th>
                                  <th className="pb-2 text-right font-medium text-muted-foreground"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {participants.map((p) => (
                                  <tr key={p.id} className="border-b last:border-0">
                                    <td className="py-1.5 font-medium">{p.nickname}</td>
                                    <td className="py-1.5 text-muted-foreground">{p.email}</td>
                                    <td className="py-1.5 text-muted-foreground">
                                      {format(p.joinedAt, "yy.MM.dd", { locale: ko })}
                                    </td>
                                    <td className="py-1.5 text-muted-foreground">{p.responseCount}회</td>
                                    <td className="py-1.5 text-right">
                                      <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={() => handleRemoveParticipant(p.id, cohort.id)}
                                        disabled={isPending}
                                        title="제거"
                                      >
                                        <UserMinusIcon className="text-destructive" />
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
