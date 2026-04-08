"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderTemplate } from "@/lib/engine/template";
import type { ActionResult } from "@/types";

async function requireAdmin() {
  const session = await auth();
  // @ts-expect-error — extended field
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
}

export async function getTemplates() {
  await requireAdmin();
  const templates = await prisma.replyTemplate.findMany({ orderBy: { createdAt: "asc" } });

  const ids = templates.map((t) => t.id);
  const ruleCounts =
    ids.length > 0
      ? await prisma.rule.groupBy({
          by: ["templateId"],
          where: { templateId: { in: ids } },
          _count: true,
        })
      : [];
  const countMap = new Map(ruleCounts.map((r) => [r.templateId, r._count]));

  return templates.map((t) => ({ ...t, ruleCount: countMap.get(t.id) ?? 0 }));
}

export async function createTemplate(data: {
  name: string;
  category: string;
  content: string;
  variables?: string[];
}): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const template = await prisma.replyTemplate.create({
      data: {
        name: data.name,
        category: data.category,
        content: data.content,
        variables: data.variables ?? [],
      },
    });
    revalidatePath("/admin/templates");
    return { success: true, data: { id: template.id } };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function updateTemplate(
  id: string,
  data: {
    name?: string;
    category?: string;
    content?: string;
    variables?: string[];
  }
): Promise<ActionResult<void>> {
  try {
    await requireAdmin();
    await prisma.replyTemplate.update({ where: { id }, data });
    revalidatePath("/admin/templates");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function deleteTemplate(id: string): Promise<ActionResult<void>> {
  try {
    await requireAdmin();
    const ruleCount = await prisma.rule.count({ where: { templateId: id } });
    if (ruleCount > 0) {
      return { success: false, error: `연결된 규칙이 ${ruleCount}개 있어 삭제할 수 없습니다.` };
    }
    await prisma.replyTemplate.delete({ where: { id } });
    revalidatePath("/admin/templates");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function previewTemplate(
  content: string,
  sampleData?: Record<string, string>
): Promise<ActionResult<string>> {
  try {
    await requireAdmin();
    const rendered = renderTemplate(content, {
      닉네임: sampleData?.["닉네임"] ?? "성장하는나무",
      키워드: sampleData?.["키워드"] ?? "못하",
      키워드목록: sampleData?.["키워드목록"] ?? "못하, 부족",
      원문발췌: sampleData?.["원문발췌"] ?? "오늘도 뭔가 부족한 느낌이...",
      질문: sampleData?.["질문"] ?? "오늘 하루를 돌아보면 어떤가요?",
      날짜: sampleData?.["날짜"] ?? new Date().toLocaleDateString("ko-KR"),
    });
    return { success: true, data: rendered };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}
