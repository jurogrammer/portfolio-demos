"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

type SessionUser = { id: string; email: string; nickname: string; role: string };

export type HistoryEntry = {
  date: string;
  dateLabel: string;
  questionMessageId: string;
  question: { id: string; content: string; category: string };
  response: { id: string; content: string; createdAt: Date } | null;
  reply: { id: string; content: string; createdAt: Date } | null;
};

export type HistoryFilter = "7d" | "30d" | "all";

export async function getHistory(
  filter: HistoryFilter = "30d"
): Promise<HistoryEntry[]> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as unknown as SessionUser).id;

  let dateFrom: Date | undefined;
  if (filter === "7d") {
    dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 7);
    dateFrom.setHours(0, 0, 0, 0);
  } else if (filter === "30d") {
    dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 30);
    dateFrom.setHours(0, 0, 0, 0);
  }

  const [questionMessages, responses] = await Promise.all([
    prisma.message.findMany({
      where: {
        userId,
        type: "QUESTION",
        ...(dateFrom ? { createdAt: { gte: dateFrom } } : {}),
      },
      include: {
        question: { select: { id: true, content: true, category: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.response.findMany({
      where: { userId, ...(dateFrom ? { createdAt: { gte: dateFrom } } : {}) },
      include: {
        reply: { select: { id: true, content: true, createdAt: true } },
      },
    }),
  ]);

  const responseMap = new Map(
    responses.map((r) => [r.questionId, r])
  );

  return questionMessages
    .filter((m) => m.question !== null)
    .map((m) => {
      const response = responseMap.get(m.question!.id) ?? null;
      return {
        date: format(m.createdAt, "yyyy-MM-dd"),
        dateLabel: format(m.createdAt, "M월 d일 (EEE)", { locale: ko }),
        questionMessageId: m.id,
        question: m.question!,
        response: response
          ? { id: response.id, content: response.content, createdAt: response.createdAt }
          : null,
        reply: response?.reply
          ? { id: response.reply.id, content: response.reply.content, createdAt: response.reply.createdAt }
          : null,
      };
    });
}
