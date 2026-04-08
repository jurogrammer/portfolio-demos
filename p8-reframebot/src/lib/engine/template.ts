import type { TemplateContext } from "@/types";

/**
 * Renders a template string by substituting Korean variable placeholders.
 * Supported variables: {닉네임}, {키워드}, {키워드목록}, {원문발췌}, {질문}, {날짜}
 */
export function renderTemplate(
  template: string,
  context: Partial<TemplateContext>
): string {
  return template
    .replace(/\{닉네임\}/g, context.닉네임 ?? "")
    .replace(/\{키워드\}/g, context.키워드 ?? "")
    .replace(/\{키워드목록\}/g, context.키워드목록 ?? "")
    .replace(/\{원문발췌\}/g, context.원문발췌 ?? "")
    .replace(/\{질문\}/g, context.질문 ?? "")
    .replace(/\{날짜\}/g, context.날짜 ?? "");
}

/**
 * Extracts the first matching keyword from text for context building.
 */
export function extractKeyword(text: string, keywords: string[]): string {
  const normalized = text.replace(/\s+/g, "").toLowerCase();
  return keywords.find((kw) => normalized.includes(kw)) ?? "";
}

/**
 * Builds a TemplateContext from response data.
 */
export function buildTemplateContext(params: {
  nickname: string;
  responseContent: string;
  questionContent: string;
  matchedKeywords?: string[];
}): TemplateContext {
  const { nickname, responseContent, questionContent, matchedKeywords = [] } = params;

  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  // Excerpt: first 50 chars of response
  const excerpt =
    responseContent.length > 50
      ? responseContent.slice(0, 50) + "..."
      : responseContent;

  return {
    닉네임: nickname,
    키워드: matchedKeywords[0] ?? "",
    키워드목록: matchedKeywords.join(", "),
    원문발췌: excerpt,
    질문: questionContent,
    날짜: dateStr,
  };
}
