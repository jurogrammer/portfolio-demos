"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types";

async function requireAdmin() {
  const session = await auth();
  // @ts-expect-error — extended field
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
}

export interface DatasetFilter {
  cohortIds?: string[];
  dateFrom?: string;
  dateTo?: string;
  isAuto?: boolean;
  categories?: string[];
}

async function buildDatasetWhere(filter?: DatasetFilter) {
  const where: {
    responseId?: { in: string[] };
    ruleId?: { not: null } | null;
    createdAt?: { gte?: Date; lte?: Date };
  } = {};

  // Cohort + category filter via response lookup
  let responseIds: string[] | undefined;

  if (filter?.cohortIds?.length && filter?.categories?.length) {
    const [cohortUsers, questions] = await Promise.all([
      prisma.cohortUser.findMany({
        where: { cohortId: { in: filter.cohortIds } },
        select: { userId: true },
      }),
      prisma.question.findMany({
        where: { category: { in: filter.categories } },
        select: { id: true },
      }),
    ]);
    const userIds = [...new Set(cohortUsers.map((cu) => cu.userId))];
    const questionIds = questions.map((q) => q.id);
    const [cohortResponses, catResponses] = await Promise.all([
      prisma.response.findMany({ where: { userId: { in: userIds } }, select: { id: true } }),
      prisma.response.findMany({ where: { questionId: { in: questionIds } }, select: { id: true } }),
    ]);
    const catSet = new Set(catResponses.map((r) => r.id));
    responseIds = cohortResponses.map((r) => r.id).filter((id) => catSet.has(id));
  } else if (filter?.cohortIds?.length) {
    const cohortUsers = await prisma.cohortUser.findMany({
      where: { cohortId: { in: filter.cohortIds } },
      select: { userId: true },
    });
    const userIds = [...new Set(cohortUsers.map((cu) => cu.userId))];
    const responses = await prisma.response.findMany({
      where: { userId: { in: userIds } },
      select: { id: true },
    });
    responseIds = responses.map((r) => r.id);
  } else if (filter?.categories?.length) {
    const questions = await prisma.question.findMany({
      where: { category: { in: filter.categories } },
      select: { id: true },
    });
    const questionIds = questions.map((q) => q.id);
    const responses = await prisma.response.findMany({
      where: { questionId: { in: questionIds } },
      select: { id: true },
    });
    responseIds = responses.map((r) => r.id);
  }

  if (responseIds) where.responseId = { in: responseIds };

  if (filter?.isAuto === true) where.ruleId = { not: null };
  if (filter?.isAuto === false) where.ruleId = null;

  if (filter?.dateFrom || filter?.dateTo) {
    where.createdAt = {};
    if (filter?.dateFrom) where.createdAt.gte = new Date(filter.dateFrom);
    if (filter?.dateTo) where.createdAt.lte = new Date(filter.dateTo + "T23:59:59");
  }

  return where;
}

export async function getDatasetPreview(filter?: DatasetFilter) {
  await requireAdmin();
  const where = await buildDatasetWhere(filter);

  const datasets = await prisma.dataset.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { rule: { select: { id: true, name: true } } },
  });

  return datasets.map((d) => ({
    id: d.id,
    input: d.input,
    output: d.output,
    isAuto: d.ruleId !== null,
    ruleName: d.rule?.name ?? null,
    createdAt: d.createdAt,
  }));
}

export async function getCohortOptions() {
  await requireAdmin();
  return prisma.cohort.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
}

export async function exportDatasetCSV(filter?: DatasetFilter): Promise<ActionResult<string>> {
  try {
    await requireAdmin();
    const where = await buildDatasetWhere(filter);
    const datasets = await prisma.dataset.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { rule: { select: { id: true, name: true } } },
    });

    const header = ["id", "input", "output", "rule", "is_auto", "created_at"];
    const rows = datasets.map((d) => [
      d.id,
      `"${d.input.replace(/"/g, '""')}"`,
      `"${d.output.replace(/"/g, '""')}"`,
      d.rule?.name ?? "수동",
      d.ruleId ? "true" : "false",
      d.createdAt.toISOString(),
    ]);

    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    return { success: true, data: csv };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function exportDatasetJSON(filter?: DatasetFilter): Promise<ActionResult<string>> {
  try {
    await requireAdmin();
    const where = await buildDatasetWhere(filter);
    const datasets = await prisma.dataset.findMany({ where, orderBy: { createdAt: "desc" } });

    const lines = datasets.map((d) => {
      const meta = (d.metadata as Record<string, unknown>) ?? {};
      const category = (meta.questionCategory as string) ?? "";
      const entry = {
        messages: [
          {
            role: "system",
            content: "당신은 교육/학습 리프레이밍 전문가입니다.",
          },
          {
            role: "user",
            content: category
              ? `[카테고리: ${category}] 응답: ${d.input}`
              : `응답: ${d.input}`,
          },
          {
            role: "assistant",
            content: d.output,
          },
        ],
      };
      return JSON.stringify(entry);
    });

    return { success: true, data: lines.join("\n") };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}
