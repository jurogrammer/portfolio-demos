"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";
import type { CohortStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  // @ts-expect-error — extended field
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export interface CohortRow {
  id: string;
  name: string;
  description: string | null;
  status: CohortStatus;
  capacity: number;
  memberCount: number;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
}

export async function getCohorts(): Promise<CohortRow[]> {
  await requireAdmin();

  const cohorts = await prisma.cohort.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { cohortUsers: true } } },
  });

  return cohorts.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    status: c.status,
    capacity: c.capacity,
    memberCount: c._count.cohortUsers,
    startDate: c.startDate,
    endDate: c.endDate,
    createdAt: c.createdAt,
  }));
}

export interface CreateCohortInput {
  name: string;
  description?: string;
  capacity: number;
  startDate?: string;
  endDate?: string;
  status: CohortStatus;
}

export async function createCohort(
  input: CreateCohortInput
): Promise<ActionResult<CohortRow>> {
  try {
    await requireAdmin();

    const cohort = await prisma.cohort.create({
      data: {
        name: input.name,
        description: input.description || null,
        capacity: input.capacity,
        status: input.status,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
      },
      include: { _count: { select: { cohortUsers: true } } },
    });

    revalidatePath("/admin/cohorts");
    return {
      success: true,
      data: {
        id: cohort.id,
        name: cohort.name,
        description: cohort.description,
        status: cohort.status,
        capacity: cohort.capacity,
        memberCount: cohort._count.cohortUsers,
        startDate: cohort.startDate,
        endDate: cohort.endDate,
        createdAt: cohort.createdAt,
      },
    };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function updateCohort(
  id: string,
  input: CreateCohortInput
): Promise<ActionResult<void>> {
  try {
    await requireAdmin();

    await prisma.cohort.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description || null,
        capacity: input.capacity,
        status: input.status,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
      },
    });

    revalidatePath("/admin/cohorts");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function deleteCohort(id: string): Promise<ActionResult<void>> {
  try {
    await requireAdmin();
    await prisma.cohort.delete({ where: { id } });
    revalidatePath("/admin/cohorts");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export interface ParticipantRow {
  id: string;
  userId: string;
  nickname: string;
  email: string;
  joinedAt: Date;
  responseCount: number;
}

export async function getCohortParticipants(
  cohortId: string
): Promise<ParticipantRow[]> {
  await requireAdmin();

  const members = await prisma.cohortUser.findMany({
    where: { cohortId },
    orderBy: { joinedAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          nickname: true,
          email: true,
          _count: { select: { responses: true } },
        },
      },
    },
  });

  return members.map((m) => ({
    id: m.id,
    userId: m.userId,
    nickname: m.user.nickname,
    email: m.user.email,
    joinedAt: m.joinedAt,
    responseCount: m.user._count.responses,
  }));
}

export async function addParticipant(
  cohortId: string,
  email: string
): Promise<ActionResult<void>> {
  try {
    await requireAdmin();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { success: false, error: "해당 이메일의 사용자를 찾을 수 없습니다." };
    }

    await prisma.cohortUser.create({
      data: { cohortId, userId: user.id },
    });

    revalidatePath("/admin/cohorts");
    return { success: true, data: undefined };
  } catch (e) {
    const msg = (e as Error).message;
    if (msg.includes("Unique constraint")) {
      return { success: false, error: "이미 해당 기수에 속한 사용자입니다." };
    }
    return { success: false, error: msg };
  }
}

export async function removeParticipant(
  cohortUserId: string
): Promise<ActionResult<void>> {
  try {
    await requireAdmin();
    await prisma.cohortUser.delete({ where: { id: cohortUserId } });
    revalidatePath("/admin/cohorts");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
