import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mark sent questions older than today as "historical" for display
  // This is a no-op placeholder — questions are already queryable by scheduledAt
  // In future: could set an `isExpired` flag or archive responses

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(23, 59, 59, 999);

  const oldQuestions = await prisma.question.findMany({
    where: {
      isSent: true,
      scheduledAt: { lte: yesterday },
    },
    select: { id: true },
  });

  return NextResponse.json({
    message: "Expire check complete",
    historicalQuestions: oldQuestions.length,
  });
}
