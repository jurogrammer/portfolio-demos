import type { MessageType, ConditionType, CohortStatus, Role } from "@prisma/client";

// ─── Generic ─────────────────────────────────────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Engine ──────────────────────────────────────────────────────────────────

export interface MatchResult {
  ruleId: string;
  ruleName: string;
  templateId: string | null;
  conditionType: ConditionType;
  matchedValue: string;
}

export interface TemplateContext {
  닉네임: string;
  키워드: string;
  키워드목록: string;
  원문발췌: string;
  질문: string;
  날짜: string;
}

// ─── Message / Inbox ─────────────────────────────────────────────────────────

export interface MessageDetail {
  id: string;
  type: MessageType;
  content: string;
  isRead: boolean;
  createdAt: Date;
  question?: {
    id: string;
    content: string;
    category: string;
  };
  reply?: {
    id: string;
    content: string;
  };
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalQuestions: number;
  sentQuestions: number;
  totalResponses: number;
  pendingReplies: number;
  totalRules: number;
  totalTemplates: number;
}

export interface ProfileStats {
  totalResponses: number;
  totalReplies: number;
  currentStreak: number;
  longestStreak: number;
  categoryBreakdown: Record<string, number>;
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface HistoryFilter {
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
}

export interface InquiryFilter {
  status?: "pending" | "reviewed" | "all";
  page?: number;
}

// ─── User / Auth ──────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  role: Role;
  cohortName?: string;
  stats: ProfileStats;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface ReviewQueueItem {
  id: string;
  responseId: string;
  userNickname: string;
  questionContent: string;
  questionCategory: string;
  responseContent: string;
  replyContent: string;
  templateName?: string;
  createdAt: Date;
}

export interface CohortWithCount {
  id: string;
  name: string;
  status: CohortStatus;
  capacity: number;
  memberCount: number;
  createdAt: Date;
}
