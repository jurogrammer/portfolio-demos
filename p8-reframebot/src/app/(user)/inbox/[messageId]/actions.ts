"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { processResponseAndGenerateReply } from "@/lib/engine/pipeline";
import { z } from "zod";
import type { ActionResult } from "@/types";

type SessionUser = { id: string; email: string; nickname: string; role: string };

async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user as unknown as SessionUser;
}

export type MessageDetailData = {
  id: string;
  type: "QUESTION" | "REPLY" | "RESPONSE" | "SYSTEM";
  content: string;
  isRead: boolean;
  createdAt: Date;
  question: { id: string; content: string; category: string } | null;
  reply: { id: string; content: string } | null;
  response: { id: string; content: string; createdAt: Date } | null;
  isAnswered: boolean;
};

export async function getMessage(
  messageId: string
): Promise<MessageDetailData | null> {
  const user = await requireUser();

  const message = await prisma.message.findFirst({
    where: { id: messageId, userId: user.id },
    include: {
      question: { select: { id: true, content: true, category: true } },
      reply: {
        include: {
          response: { select: { id: true, content: true, createdAt: true } },
        },
      },
    },
  });

  if (!message) return null;

  let isAnswered = false;
  if (message.type === "QUESTION" && message.question) {
    const existing = await prisma.response.findUnique({
      where: {
        userId_questionId: {
          userId: user.id,
          questionId: message.question.id,
        },
      },
      select: { id: true },
    });
    isAnswered = !!existing;
  }

  return {
    id: message.id,
    type: message.type,
    content: message.content,
    isRead: message.isRead,
    createdAt: message.createdAt,
    question: message.question,
    reply: message.reply
      ? { id: message.reply.id, content: message.reply.content }
      : null,
    response: message.reply?.response ?? null,
    isAnswered,
  };
}

export async function markAsRead(messageId: string): Promise<void> {
  const session = await auth();
  if (!session?.user) return;
  const userId = (session.user as unknown as SessionUser).id;

  await prisma.message.updateMany({
    where: { id: messageId, userId },
    data: { isRead: true },
  });
}

const responseSchema = z.object({
  messageId: z.string(),
  content: z
    .string()
    .min(20, "최소 20자 이상 입력해 주세요.")
    .max(2000, "최대 2000자까지 입력 가능합니다."),
});

export async function submitResponse(formData: {
  messageId: string;
  content: string;
}): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "로그인이 필요합니다." };
  const userId = (session.user as unknown as SessionUser).id;

  const parsed = responseSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "입력값이 올바르지 않습니다.",
    };
  }

  const { messageId, content } = parsed.data;

  const message = await prisma.message.findFirst({
    where: { id: messageId, userId, type: "QUESTION" },
    select: { questionId: true },
  });
  if (!message?.questionId) {
    return { success: false, error: "질문을 찾을 수 없습니다." };
  }

  const existing = await prisma.response.findUnique({
    where: {
      userId_questionId: { userId, questionId: message.questionId },
    },
    select: { id: true },
  });
  if (existing) {
    return { success: false, error: "이미 답변한 질문입니다." };
  }

  try {
    const response = await prisma.response.create({
      data: { userId, questionId: message.questionId, content },
    });

    await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });

    await processResponseAndGenerateReply(response.id);

    revalidatePath("/inbox");
    revalidatePath(`/inbox/${messageId}`);

    return { success: true, data: undefined };
  } catch (err) {
    console.error("submitResponse error:", err);
    return { success: false, error: "답변 제출 중 오류가 발생했습니다." };
  }
}
