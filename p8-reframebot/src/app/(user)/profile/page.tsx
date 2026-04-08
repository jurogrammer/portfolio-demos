"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  getProfile,
  updateNickname,
  logout,
  type ProfileData,
} from "./actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  CalendarDays,
  MessageSquareText,
  Flame,
  Percent,
  LogOut,
  Pencil,
  Check,
  X,
} from "lucide-react";

const nicknameSchema = z.object({
  nickname: z
    .string()
    .min(2, "최소 2자 이상 입력해 주세요.")
    .max(20, "최대 20자까지 가능합니다."),
});
type NicknameForm = z.infer<typeof nicknameSchema>;

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<NicknameForm>({
    resolver: zodResolver(nicknameSchema),
  });

  useEffect(() => {
    getProfile().then((data) => {
      setProfile(data);
      if (data) reset({ nickname: data.nickname });
      setLoading(false);
    });
  }, [reset]);

  function onNicknameSubmit(values: NicknameForm) {
    startTransition(async () => {
      const result = await updateNickname(values);
      if (result.success) {
        toast.success("닉네임이 변경되었습니다.");
        setProfile((prev) => prev ? { ...prev, nickname: values.nickname } : prev);
        setEditing(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  function cancelEdit() {
    if (profile) reset({ nickname: profile.nickname });
    setEditing(false);
  }

  if (loading) return <ProfileSkeleton />;
  if (!profile) return null;

  const topCategory = Object.entries(profile.stats.categoryBreakdown).sort(
    ([, a], [, b]) => b - a
  )[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">프로필</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{profile.email}</p>
      </div>

      {/* Nickname edit */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">닉네임</CardTitle>
        </CardHeader>
        <CardContent>
          {editing ? (
            <form onSubmit={handleSubmit(onNicknameSubmit)} className="flex items-start gap-2">
              <div className="flex-1">
                <Input
                  {...register("nickname")}
                  autoFocus
                  disabled={isPending}
                  className="h-8"
                />
                {errors.nickname && (
                  <p className="text-xs text-destructive mt-1">{errors.nickname.message}</p>
                )}
              </div>
              <Button type="submit" size="icon-sm" disabled={isPending}>
                <Check className="size-3.5" />
              </Button>
              <Button type="button" variant="outline" size="icon-sm" onClick={cancelEdit}>
                <X className="size-3.5" />
              </Button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-base font-medium">{profile.nickname}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setEditing(true)}
                className="text-muted-foreground"
              >
                <Pencil className="size-3.5" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cohort info */}
      {profile.cohort && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">코호트 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">코호트</span>
              <Badge variant="secondary">{profile.cohort.name}</Badge>
            </div>
            {profile.cohort.startDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" />
                  시작일
                </span>
                <span className="text-sm">
                  {format(new Date(profile.cohort.startDate), "yyyy년 M월 d일", { locale: ko })}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Users className="size-3.5" />
                참여자
              </span>
              <span className="text-sm">{profile.cohort.memberCount}명</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">활동 통계</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <StatItem
            icon={MessageSquareText}
            label="총 답변"
            value={`${profile.stats.totalResponses}회`}
          />
          <StatItem
            icon={Percent}
            label="응답률"
            value={`${profile.stats.responseRate}%`}
          />
          <StatItem
            icon={Flame}
            label="현재 연속"
            value={`${profile.stats.currentStreak}일`}
            highlight={profile.stats.currentStreak > 0}
          />
          <StatItem
            icon={Flame}
            label="최장 연속"
            value={`${profile.stats.longestStreak}일`}
          />
        </CardContent>
      </Card>

      {/* Category breakdown */}
      {topCategory && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">카테고리별 답변</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(profile.stats.categoryBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-20 shrink-0">{cat}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${Math.round((count / profile.stats.totalResponses) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Logout */}
      <form action={logout}>
        <Button
          type="submit"
          variant="outline"
          className="w-full text-destructive border-destructive/30 hover:bg-destructive/5"
        >
          <LogOut className="size-4 mr-2" />
          로그아웃
        </Button>
      </form>
    </div>
  );
}

function StatItem({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg bg-muted/50 p-3 space-y-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className={`size-3.5 ${highlight ? "text-orange-500" : ""}`} />
        <span className="text-xs">{label}</span>
      </div>
      <p className={`text-lg font-semibold ${highlight ? "text-orange-500" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-4 w-40" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border p-4 space-y-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
    </div>
  );
}
