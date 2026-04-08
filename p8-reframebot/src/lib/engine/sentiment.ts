import { NEGATIVE_WORDS, POSITIVE_WORDS } from "@/lib/constants";
import type { SentimentResult } from "@/types";

export function analyzeSentiment(text: string): SentimentResult {
  const normalized = text.replace(/\s+/g, "").toLowerCase();

  const matchedNegative = NEGATIVE_WORDS.filter((word) =>
    normalized.includes(word)
  );
  const matchedPositive = POSITIVE_WORDS.filter((word) =>
    normalized.includes(word)
  );

  const negCount = matchedNegative.length;
  const posCount = matchedPositive.length;
  const total = negCount + posCount;

  let score = 0;
  if (total > 0) {
    score = (posCount - negCount) / total;
  }

  let label: SentimentResult["label"] = "NEUTRAL";
  if (score < -0.2) label = "NEGATIVE";
  else if (score > 0.2) label = "POSITIVE";

  return {
    score,
    label,
    matchedWords: [...matchedNegative, ...matchedPositive],
  };
}
