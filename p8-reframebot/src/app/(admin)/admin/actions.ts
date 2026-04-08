"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "date-fns";

async function requireAdmin() {
  const session = await auth();
  // @ts-expect-error — extended field
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export interface AdminStats {
  totalParticipants: number;
  activeCohorts: number;
  todayResponseRate: number;
  autoReplyRate: number;
  pendingReview: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  await requireAdmin();

  const today = startOfDay(new Date());

  const [totalParticipants, activeCohorts, todayMessages, todayResponses, totalReplies, autoReplies, pendingReview] =
    await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.cohort.count({ where: { status: "ACTIVE" } }),
      prisma.message.count({ where: { type: "QUESTION", createdAt: { gte: today } } }),
      prisma.response.count({ where: { createdAt: { gte: today } } }),
      prisma.reply.count(),
      prisma.reply.count({ where: { templateId: { not: null } } }),
      prisma.reply.count({ where: { isReviewed: false } }),
    ]);

  const todayResponseRate =
    todayMessages > 0 ? Math.round((todayResponses / todayMessages) * 100) : 0;
  const autoReplyRate =
    totalReplies > 0 ? Math.round((autoReplies / totalReplies) * 100) : 0;

  return {
    totalParticipants,
    activeCohorts,
    todayResponseRate,
    autoReplyRate,
    pendingReview,
  };
}

export interface RecentActivityItem {
  id: string;
  userNickname: string;
  questionContent: string;
  questionCategory: string;
  responseContent: string;
  isAutoReply: boolean;
  createdAt: Date;
}

export async function getRecentActivity(): Promise<RecentActivityItem[]> {
  await requireAdmin();

  const responses = await prisma.response.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { nickname: true } },
      question: { select: { content: true, category: true } },
      reply: { select: { templateId: true } },
    },
  });

  return responses.map((r) => ({
    id: r.id,
    userNickname: r.user.nickname,
    questionContent: r.question.content,
    questionCategory: r.question.category,
    responseContent: r.content,
    isAutoReply: r.reply !== null,
    createdAt: r.createdAt,
  }));
}
