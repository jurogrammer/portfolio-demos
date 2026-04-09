import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding p8-reframebot...");

  // ─── Admin user ────────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@reframebot.com" },
    update: {},
    create: {
      email: "admin@reframebot.com",
      nickname: "관리자",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin:", admin.email);

  // ─── Demo users ────────────────────────────────────────────────────────────
  const demoUsers = [
    { email: "user1@reframebot.com", nickname: "성장하는나무" },
    { email: "user2@reframebot.com", nickname: "빛나는별" },
    { email: "user3@reframebot.com", nickname: "따뜻한바람" },
  ];

  const users = [];
  for (const u of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, role: "USER" },
    });
    users.push(user);
    console.log("✅ User:", user.email);
  }

  // ─── Cohort ────────────────────────────────────────────────────────────────
  const cohort = await prisma.cohort.upsert({
    where: { id: "cohort-batch-1" },
    update: {},
    create: {
      id: "cohort-batch-1",
      name: "1기",
      description: "리프레임봇 첫 번째 코호트",
      status: "ACTIVE",
      capacity: 30,
    },
  });
  console.log("✅ Cohort:", cohort.name);

  // Add all demo users to cohort
  for (const user of users) {
    await prisma.cohortUser.upsert({
      where: { cohortId_userId: { cohortId: cohort.id, userId: user.id } },
      update: {},
      create: { cohortId: cohort.id, userId: user.id },
    });
  }

  // ─── Questions (one per category, scheduled today) ─────────────────────────
  const today = new Date();
  today.setHours(9, 0, 0, 0);

  const questionData = [
    {
      id: "q-self-awareness",
      content: "오늘 나 자신에 대해 새롭게 발견한 점이 있다면 무엇인가요?",
      category: "자기인식",
    },
    {
      id: "q-goal-setting",
      content: "이번 주에 이루고 싶은 작은 목표 하나를 적어보세요.",
      category: "목표설정",
    },
    {
      id: "q-emotion-mgmt",
      content: "오늘 느낀 감정 중 가장 강렬했던 것은 무엇이었나요?",
      category: "감정관리",
    },
    {
      id: "q-relationship",
      content: "최근 누군가에게 감사함을 느낀 순간을 떠올려보세요.",
      category: "관계",
    },
    {
      id: "q-growth",
      content: "지난 한 달 동안 내가 성장한 부분은 어디인가요?",
      category: "성장",
    },
  ];

  const questions = [];
  for (const q of questionData) {
    const question = await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: {
        id: q.id,
        content: q.content,
        category: q.category,
        scheduledAt: today,
        isSent: false,
      },
    });
    questions.push(question);
    console.log("✅ Question:", q.category);
  }

  // ─── Reply Templates ────────────────────────────────────────────────────────
  const templates = [
    {
      id: "tpl-encourage",
      name: "리프레이밍 격려형",
      category: "리프레이밍 격려형",
      content:
        "{닉네임}님, 오늘 '{원문발췌}'라고 하셨군요. 그 안에는 분명 성장의 씨앗이 담겨 있어요. 조금 다른 시각으로 바라보면 어떨까요? 지금 이 순간도 충분히 잘 하고 계세요.",
      variables: ["닉네임", "원문발췌"],
    },
    {
      id: "tpl-explore",
      name: "탐색 유도형",
      category: "탐색 유도형",
      content:
        "{닉네임}님이 '{키워드}'에 대해 이야기해 주셨네요. 그 감정이나 생각이 어디서 비롯되었는지 조금 더 탐색해볼 수 있을까요? 내면을 들여다보는 것 자체가 이미 용기 있는 행동이에요.",
      variables: ["닉네임", "키워드"],
    },
    {
      id: "tpl-accept",
      name: "감정 수용형",
      category: "감정 수용형",
      content:
        "{닉네임}님, 오늘 느낀 감정들을 솔직하게 나눠주셔서 감사해요. {원문발췌} — 이런 감정을 느끼는 건 자연스러운 일이에요. 지금 이 감정도 {닉네임}님의 일부이고, 그것을 인정하는 것에서 변화가 시작돼요.",
      variables: ["닉네임", "원문발췌"],
    },
  ];

  for (const t of templates) {
    await prisma.replyTemplate.upsert({
      where: { id: t.id },
      update: {},
      create: t,
    });
    console.log("✅ Template:", t.name);
  }

  // ─── Rules ──────────────────────────────────────────────────────────────────
  const rules = [
    {
      id: "rule-negative-self",
      name: "부정적 자기인식",
      description: "자기 비하나 부정적 자아 인식 키워드 탐지",
      conditionType: "KEYWORD" as const,
      conditionValue: "못해,못하겠다,자신없다,부족해,형편없어,쓸모없어",
      templateId: "tpl-encourage",
      priority: 10,
      isActive: true,
    },
    {
      id: "rule-goal-doubt",
      name: "목표 회의감",
      description: "목표나 방향에 대한 의심 패턴 탐지",
      conditionType: "PATTERN" as const,
      conditionValue: "(포기|그만|의미없|모르겠|왜하는지)",
      templateId: "tpl-explore",
      priority: 8,
      isActive: true,
    },
  ];

  for (const r of rules) {
    await prisma.rule.upsert({
      where: { id: r.id },
      update: {},
      create: r,
    });
    console.log("✅ Rule:", r.name);
  }

  // ─── Demo messages for users (today's questions) ────────────────────────────
  // Pre-generate QUESTION messages for demo users to show today's questions
  const firstQuestion = questions[0];
  for (const user of users) {
    await prisma.message.upsert({
      where: { id: `msg-${user.id}-${firstQuestion.id}` },
      update: {},
      create: {
        id: `msg-${user.id}-${firstQuestion.id}`,
        userId: user.id,
        questionId: firstQuestion.id,
        type: "QUESTION",
        content: firstQuestion.content,
      },
    });
  }
  console.log("✅ Demo messages created");

  console.log("\n🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
