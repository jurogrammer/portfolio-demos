export const QUESTION_CATEGORIES = [
  "자기인식",
  "목표설정",
  "감정관리",
  "관계",
  "성장",
] as const;

export type QuestionCategory = (typeof QUESTION_CATEGORIES)[number];

export const TEMPLATE_CATEGORIES = [
  "리프레이밍 격려형",
  "탐색 유도형",
  "감정 수용형",
] as const;

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

export const COHORT_STATUS_MAP = {
  ACTIVE: "활성",
  CLOSED: "종료",
  ARCHIVED: "보관",
} as const;

export const MESSAGE_TYPE_MAP = {
  QUESTION: "질문",
  RESPONSE: "응답",
  REPLY: "리플라이",
  SYSTEM: "시스템",
} as const;

export const CONDITION_TYPE_MAP = {
  KEYWORD: "키워드",
  PATTERN: "패턴",
} as const;

export const PAGE_SIZE = 20;
