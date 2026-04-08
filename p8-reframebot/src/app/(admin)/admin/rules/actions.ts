"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { matchResponse } from "@/lib/engine/matcher";
import { renderTemplate } from "@/lib/engine/template";
import type { ActionResult } from "@/types";
import type { ConditionType } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  // @ts-expect-error — extended field
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
  return session;
}

export async function getRules() {
  await requireAdmin();
  const rules = await prisma.rule.findMany({ orderBy: { priority: "asc" } });

  const templateIds = [...new Set(rules.map((r) => r.templateId).filter(Boolean) as string[])];
  const templates =
    templateIds.length > 0
      ? await prisma.replyTemplate.findMany({ where: { id: { in: templateIds } } })
      : [];
  const templateMap = new Map(templates.map((t) => [t.id, t.name]));

  return rules.map((r) => ({
    ...r,
    templateName: r.templateId ? (templateMap.get(r.templateId) ?? null) : null,
  }));
}

export async function createRule(data: {
  name: string;
  conditionType: ConditionType;
  conditionValue: string;
  templateId?: string;
  priority: number;
  isActive?: boolean;
}): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const rule = await prisma.rule.create({
      data: {
        name: data.name,
        conditionType: data.conditionType,
        conditionValue: data.conditionValue,
        templateId: data.templateId || null,
        priority: data.priority,
        isActive: data.isActive ?? true,
      },
    });
    revalidatePath("/admin/rules");
    return { success: true, data: { id: rule.id } };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function updateRule(
  id: string,
  data: {
    name?: string;
    conditionType?: ConditionType;
    conditionValue?: string;
    templateId?: string | null;
    priority?: number;
    isActive?: boolean;
  }
): Promise<ActionResult<void>> {
  try {
    await requireAdmin();
    await prisma.rule.update({ where: { id }, data });
    revalidatePath("/admin/rules");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function deleteRule(id: string): Promise<ActionResult<void>> {
  try {
    await requireAdmin();
    await prisma.rule.delete({ where: { id } });
    revalidatePath("/admin/rules");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function toggleRule(id: string): Promise<ActionResult<void>> {
  try {
    await requireAdmin();
    const rule = await prisma.rule.findUniqueOrThrow({ where: { id } });
    await prisma.rule.update({ where: { id }, data: { isActive: !rule.isActive } });
    revalidatePath("/admin/rules");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function testRule(text: string): Promise<
  ActionResult<{
    matched: boolean;
    ruleName?: string;
    conditionType?: string;
    matchedValue?: string;
    replyPreview?: string;
  }>
> {
  try {
    await requireAdmin();
    const matchResult = await matchResponse(text);
    if (!matchResult) {
      return { success: true, data: { matched: false } };
    }

    let replyPreview: string | undefined;
    if (matchResult.templateId) {
      const template = await prisma.replyTemplate.findUnique({
        where: { id: matchResult.templateId },
      });
      if (template) {
        const today = new Date();
        replyPreview = renderTemplate(template.content, {
          닉네임: "테스트유저",
          키워드: matchResult.matchedValue,
          키워드목록: matchResult.matchedValue,
          원문발췌: text.length > 50 ? text.slice(0, 50) + "..." : text,
          질문: "",
          날짜: `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`,
        });
      }
    }

    return {
      success: true,
      data: {
        matched: true,
        ruleName: matchResult.ruleName,
        conditionType: matchResult.conditionType,
        matchedValue: matchResult.matchedValue,
        replyPreview,
      },
    };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function getTemplateOptions() {
  await requireAdmin();
  return prisma.replyTemplate.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
