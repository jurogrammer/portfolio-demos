"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

async function requireAdmin() {
  const session = await auth();
  // @ts-expect-error — extended field
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export interface QuestionRow {
  id: string;
  content: string;
  category: string;
  scheduledAt: Date;
  isSent: boolean;
  sentAt: Date | null;
  createdAt: Date;
}

export interface QuestionFilters {
  category?: string;
  isSent?: boolean;
}

export async function getQuestions(
  filters?: QuestionFilters
): Promise<QuestionRow[]> {
  await requireAdmin();

  const questions = await prisma.question.findMany({
    where: {
      ...(filters?.category ? { category: filters.category } : {}),
      ...(filters?.isSent !== undefined ? { isSent: filters.isSent } : {}),
    },
    orderBy: { scheduledAt: "desc" },
  });

  return questions.map((q) => ({
    id: q.id,
    content: q.content,
    category: q.category,
    scheduledAt: q.scheduledAt,
    isSent: q.isSent,
    sentAt: q.sentAt,
    createdAt: q.createdAt,
  }));
}

export interface CreateQuestionInput {
  content: string;
  category: string;
  scheduledAt: string;
}

export async function createQuestion(
  input: CreateQuestionInput
): Promise<ActionResult<QuestionRow>> {
  try {
    await requireAdmin();

    const question = await prisma.question.create({
      data: {
        content: input.content,
        category: input.category,
        scheduledAt: new Date(input.scheduledAt),
      },
    });

    revalidatePath("/admin/questions");
    return {
      success: true,
      data: {
        id: question.id,
        content: question.content,
        category: question.category,
        scheduledAt: question.scheduledAt,
        isSent: question.isSent,
        sentAt: question.sentAt,
        createdAt: question.createdAt,
      },
    };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function updateQuestion(
  id: string,
  input: CreateQuestionInput
): Promise<ActionResult<void>> {
  try {
    await requireAdmin();

    await prisma.question.update({
      where: { id },
      data: {
        content: input.content,
        category: input.category,
        scheduledAt: new Date(input.scheduledAt),
      },
    });

    revalidatePath("/admin/questions");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function deleteQuestion(id: string): Promise<ActionResult<void>> {
  try {
    await requireAdmin();
    await prisma.question.delete({ where: { id } });
    revalidatePath("/admin/questions");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function sendQuestionNow(
  questionId: string,
  cohortId: string
): Promise<ActionResult<{ sent: number }>> {
  try {
    await requireAdmin();

    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });
    if (!question) {
      return { success: false, error: "질문을 찾을 수 없습니다." };
    }

    const cohortUsers = await prisma.cohortUser.findMany({
      where: { cohortId },
      select: { userId: true },
    });

    if (cohortUsers.length === 0) {
      return { success: false, error: "해당 기수에 참여자가 없습니다." };
    }

    const messageData = cohortUsers.map((cu) => ({
      userId: cu.userId,
      questionId: question.id,
      type: "QUESTION" as const,
      content: question.content,
    }));

    await prisma.message.createMany({
      data: messageData,
      skipDuplicates: true,
    });

    await prisma.question.update({
      where: { id: questionId },
      data: { isSent: true, sentAt: new Date() },
    });

    revalidatePath("/admin/questions");
    return { success: true, data: { sent: messageData.length } };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
