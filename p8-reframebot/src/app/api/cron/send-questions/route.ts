import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find today's unsent questions (scheduledAt <= now, isSent=false)
  const questions = await prisma.question.findMany({
    where: {
      scheduledAt: { lte: now },
      isSent: false,
    },
  });

  if (questions.length === 0) {
    return NextResponse.json({ message: "No questions to send", sent: 0 });
  }

  // Get all active cohort participants (userId only)
  const cohortUsers = await prisma.cohortUser.findMany({
    select: { userId: true },
    where: {
      cohort: { status: "ACTIVE" },
    },
  });

  // Build all messages at once
  const allMessageData = questions.flatMap((question) =>
    cohortUsers.map((cu) => ({
      userId: cu.userId,
      questionId: question.id,
      type: "QUESTION" as const,
      content: question.content,
    }))
  );

  if (allMessageData.length > 0) {
    await prisma.message.createMany({
      data: allMessageData,
      skipDuplicates: true,
    });
  }

  // Batch update all questions as sent
  await prisma.$transaction(
    questions.map((q) =>
      prisma.question.update({
        where: { id: q.id },
        data: { isSent: true, sentAt: now },
      })
    )
  );

  const totalMessages = allMessageData.length;

  return NextResponse.json({
    message: "Questions sent successfully",
    questionsProcessed: questions.length,
    messagesSent: totalMessages,
  });
}
