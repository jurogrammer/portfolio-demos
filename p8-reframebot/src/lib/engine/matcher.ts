import { prisma } from "@/lib/prisma";
import type { MatchResult } from "@/types";

/**
 * Matches a response text against active rules in priority order.
 * Returns the first matching rule's result, or null if no match.
 */
export async function matchResponse(
  responseText: string
): Promise<MatchResult | null> {
  const rules = await prisma.rule.findMany({
    where: { isActive: true },
    orderBy: { priority: "desc" },
  });

  const normalized = responseText.replace(/\s+/g, "").toLowerCase();

  for (const rule of rules) {
    switch (rule.conditionType) {
      case "KEYWORD": {
        const keywords = rule.conditionValue.split(",").map((k) => k.trim().toLowerCase());
        const matched = keywords.find((kw) => normalized.includes(kw));
        if (matched) {
          return {
            ruleId: rule.id,
            ruleName: rule.name,
            templateId: rule.templateId,
            conditionType: rule.conditionType,
            matchedValue: matched,
          };
        }
        break;
      }

      case "PATTERN": {
        try {
          const regex = new RegExp(rule.conditionValue, "i");
          if (regex.test(responseText)) {
            return {
              ruleId: rule.id,
              ruleName: rule.name,
              templateId: rule.templateId,
              conditionType: rule.conditionType,
              matchedValue: rule.conditionValue,
            };
          }
        } catch {
          // Invalid regex — skip
        }
        break;
      }

    }
  }

  return null;
}
