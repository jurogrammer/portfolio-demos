"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types";

async function requireAdmin() {
  const session = await auth();
  // @ts-expect-error — extended field
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
  return session;
}

export async function getReviewQueue(filter?: { dateFrom?: string; dateTo?: string }) {
  await requireAdmin();

  const where: {
    reply?: { is: null };
    createdAt?: { gte?: Date; lte?: Date };
  } = {
    reply: { is: null },
  };

  if (filter?.dateFrom || filter?.dateTo) {
    where.createdAt = {};
    if (filter?.dateFrom) where.createdAt.gte = new Date(filter.dateFrom);
    if (filter?.dateTo) where.createdAt.lte = new Date(filter.dateTo + "T23:59:59");
  }

  const responses = await prisma.response.findMany({
    where,
    include: {
      user: { select: { nickname: true } },
      question: { select: { content: true, category: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return responses.map((r) => ({
    id: r.id,
    userNickname: r.user.nickname,
    questionContent: r.question.content,
    questionCategory: r.question.category,
    responseContent: r.content,
    createdAt: r.createdAt,
  }));
}

export async function submitManualReply(
  responseId: string,
  body: string
): Promise<ActionResult<void>> {
  try {
    const session = await requireAdmin();
    const adminId = session!.user!.id!;

    const response = await prisma.response.findUniqueOrThrow({
      where: { id: responseId },
      include: { question: true },
    });

    await prisma.$transaction(async (tx) => {
      const reply = await tx.reply.create({
        data: {
          responseId,
          content: body,
          isReviewed: true,
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      });

      await tx.message.create({
        data: {
          userId: response.userId,
          questionId: response.questionId,
          responseId,
          replyId: reply.id,
          type: "REPLY",
          content: body,
        },
      });

      await tx.dataset.create({
        data: {
          responseId,
          input: response.content,
          output: body,
          metadata: {
            questionCategory: response.question.category,
            isAuto: false,
          },
        },
      });
    });

    revalidatePath("/admin/review");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}
