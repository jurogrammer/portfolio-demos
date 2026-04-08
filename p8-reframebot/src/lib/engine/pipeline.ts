import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { matchResponse } from "./matcher";
import { renderTemplate, buildTemplateContext } from "./template";

/**
 * Full pipeline: match rules → render template → create Reply + Message + Dataset.
 * Called after a user submits a response.
 */
export async function processResponseAndGenerateReply(
  responseId: string
): Promise<void> {
  const response = await prisma.response.findUnique({
    where: { id: responseId },
    include: {
      user: true,
      question: true,
    },
  });

  if (!response) return;

  // Check if reply already exists
  const existing = await prisma.reply.findUnique({
    where: { responseId },
  });
  if (existing) return;

  const matchResult = await matchResponse(response.content);

  let replyContent: string;
  let templateId: string | null = null;

  if (matchResult?.templateId) {
    const template = await prisma.replyTemplate.findUnique({
      where: { id: matchResult.templateId },
    });

    if (template) {
      templateId = template.id;
      const keywords = matchResult.conditionType === "KEYWORD"
        ? matchResult.matchedValue.split(",")
        : [];

      const ctx = buildTemplateContext({
        nickname: response.user.nickname,
        responseContent: response.content,
        questionContent: response.question.content,
        matchedKeywords: keywords,
      });

      replyContent = renderTemplate(template.content, ctx);

      // Increment usage count
      await prisma.replyTemplate.update({
        where: { id: template.id },
        data: { usageCount: { increment: 1 } },
      });
    } else {
      replyContent = `${response.user.nickname}님, 소중한 답변 감사해요. 함께 성장해 나가요!`;
    }
  } else {
    replyContent = `${response.user.nickname}님, 오늘도 진솔한 이야기를 나눠주셔서 감사해요.`;
  }

  // Create reply
  const reply = await prisma.reply.create({
    data: {
      responseId,
      templateId,
      content: replyContent,
    },
  });

  // Create message for user
  await prisma.message.create({
    data: {
      userId: response.userId,
      questionId: response.questionId,
      replyId: reply.id,
      type: "REPLY",
      content: replyContent,
    },
  });

  // Create dataset entry
  await prisma.dataset.create({
    data: {
      responseId,
      ruleId: matchResult?.ruleId ?? null,
      templateId,
      input: response.content,
      output: replyContent,
      metadata: matchResult
        ? ({
            conditionType: matchResult.conditionType,
            matchedValue: matchResult.matchedValue,
            ruleName: matchResult.ruleName,
          } satisfies Prisma.InputJsonValue)
        : Prisma.DbNull,
    },
  });
}
