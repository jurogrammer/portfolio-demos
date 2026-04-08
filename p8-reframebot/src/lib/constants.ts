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
  SENTIMENT: "감정",
} as const;

// Korean negative sentiment words
export const NEGATIVE_WORDS = [
  "싫다",
  "싫어",
  "짜증",
  "화나",
  "화남",
  "힘들다",
  "힘들어",
  "지쳤다",
  "지쳐",
  "포기",
  "못하겠다",
  "못할것같다",
  "모르겠다",
  "실망",
  "절망",
  "우울",
  "슬프다",
  "슬퍼",
  "외롭다",
  "외로워",
  "두렵다",
  "두려워",
  "무섭다",
  "무서워",
  "걱정",
  "불안",
  "스트레스",
  "답답",
  "막막",
  "자신없다",
  "자신없어",
  "못해",
  "못한다",
  "안된다",
  "안돼",
  "최악",
  "망했다",
  "망해",
  "실패",
  "창피",
  "부끄럽다",
  "부끄러워",
  "형편없다",
  "형편없어",
  "쓸모없다",
  "쓸모없어",
  "부족하다",
  "부족해",
] as const;

// Korean positive sentiment words
export const POSITIVE_WORDS = [
  "좋다",
  "좋아",
  "행복",
  "기쁘다",
  "기뻐",
  "즐겁다",
  "즐거워",
  "감사",
  "고맙다",
  "고마워",
  "설레다",
  "설레",
  "뿌듯하다",
  "뿌듯해",
  "자랑스럽다",
  "자랑스러워",
  "할수있다",
  "할수있어",
  "잘했다",
  "잘해",
  "성장",
  "발전",
  "희망",
  "기대",
  "열정",
  "도전",
  "극복",
  "해냈다",
  "해냈어",
  "성공",
  "최고",
  "멋지다",
  "멋져",
  "자신있다",
  "자신있어",
] as const;

export const PAGE_SIZE = 20;
