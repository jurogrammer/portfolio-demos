"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PAGE_SIZE } from "@/lib/constants";
import { redirect } from "next/navigation";

type SessionUser = { id: string; email: string; nickname: string; role: string };

async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user as unknown as SessionUser;
}

export async function getMessages(page = 1) {
  const user = await requireUser();

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        question: { select: { id: true, content: true, category: true } },
        reply: { select: { id: true, content: true } },
      },
    }),
    prisma.message.count({ where: { userId: user.id } }),
  ]);

  return {
    messages,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

export async function getTodayQuestion() {
  const user = await requireUser();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const message = await prisma.message.findFirst({
    where: {
      userId: user.id,
      type: "QUESTION",
      createdAt: { gte: today, lt: tomorrow },
    },
    include: {
      question: { select: { id: true, content: true, category: true } },
    },
  });

  if (!message?.question) return null;

  const response = await prisma.response.findUnique({
    where: {
      userId_questionId: { userId: user.id, questionId: message.question.id },
    },
    select: { id: true, createdAt: true },
  });

  return {
    messageId: message.id,
    question: message.question,
    isAnswered: !!response,
    answeredAt: response?.createdAt ?? null,
  };
}
