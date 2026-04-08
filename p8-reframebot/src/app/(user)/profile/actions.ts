"use server";

import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult } from "@/types";

type SessionUser = { id: string; email: string; nickname: string; role: string };

async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user as unknown as SessionUser;
}

export type ProfileData = {
  id: string;
  email: string;
  nickname: string;
  role: string;
  cohort: {
    name: string;
    startDate: Date | null;
    memberCount: number;
  } | null;
  stats: {
    totalResponses: number;
    responseRate: number;
    currentStreak: number;
    longestStreak: number;
    categoryBreakdown: Record<string, number>;
  };
};

export async function getProfile(): Promise<ProfileData | null> {
  const user = await requireUser();

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      cohortUsers: {
        include: {
          cohort: {
            select: { id: true, name: true, startDate: true },
          },
        },
        take: 1,
        orderBy: { joinedAt: "desc" },
      },
    },
  });

  if (!dbUser) return null;

  const responses = await prisma.response.findMany({
    where: { userId: user.id },
    include: {
      question: { select: { category: true } },
      reply: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalSentQuestions = await prisma.message.count({
    where: { userId: user.id, type: "QUESTION" },
  });

  const totalResponses = responses.length;
  const responseRate =
    totalSentQuestions > 0
      ? Math.round((totalResponses / totalSentQuestions) * 100)
      : 0;

  const categoryBreakdown: Record<string, number> = {};
  responses.forEach((r) => {
    const cat = r.question.category;
    categoryBreakdown[cat] = (categoryBreakdown[cat] ?? 0) + 1;
  });

  const { currentStreak, longestStreak } = calculateStreak(
    responses.map((r) => r.createdAt)
  );

  const cohortUser = dbUser.cohortUsers[0];
  let cohort: ProfileData["cohort"] = null;
  if (cohortUser) {
    const memberCount = await prisma.cohortUser.count({
      where: { cohortId: cohortUser.cohortId },
    });
    cohort = {
      name: cohortUser.cohort.name,
      startDate: cohortUser.cohort.startDate,
      memberCount,
    };
  }

  return {
    id: dbUser.id,
    email: dbUser.email,
    nickname: dbUser.nickname,
    role: dbUser.role,
    cohort,
    stats: {
      totalResponses,
      responseRate,
      currentStreak,
      longestStreak,
      categoryBreakdown,
    },
  };
}

function calculateStreak(dates: Date[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (dates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const dateSet = new Set(dates.map((d) => d.toISOString().split("T")[0]));
  const sortedDates = Array.from(dateSet).sort().reverse();

  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - 86400000)
    .toISOString()
    .split("T")[0];

  let currentStreak = 0;
  if (sortedDates[0] === todayStr || sortedDates[0] === yesterdayStr) {
    let checkDate = sortedDates[0];
    for (const d of sortedDates) {
      if (d === checkDate) {
        currentStreak++;
        const prev = new Date(checkDate);
        prev.setDate(prev.getDate() - 1);
        checkDate = prev.toISOString().split("T")[0];
      } else {
        break;
      }
    }
  }

  let longestStreak = 1;
  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const curr = new Date(sortedDates[i - 1]);
    const prev = new Date(sortedDates[i]);
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) {
      streak++;
      if (streak > longestStreak) longestStreak = streak;
    } else {
      streak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return { currentStreak, longestStreak };
}

const nicknameSchema = z.object({
  nickname: z
    .string()
    .min(2, "닉네임은 최소 2자 이상이어야 합니다.")
    .max(20, "닉네임은 최대 20자까지 가능합니다."),
});

export async function updateNickname(data: {
  nickname: string;
}): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = nicknameSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "입력값이 올바르지 않습니다.",
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { nickname: parsed.data.nickname },
  });

  revalidatePath("/profile");
  return { success: true, data: undefined };
}

export async function logout(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
