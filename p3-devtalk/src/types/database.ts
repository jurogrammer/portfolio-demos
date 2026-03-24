export type Category = 'qna' | 'free' | 'tech' | 'career'

export type VoteValue = 1 | -1

export type NotificationType = 'comment' | 'reply' | 'vote' | 'mention'

export type ReportStatus = 'pending' | 'resolved' | 'dismissed'

export type UserRole = 'user' | 'admin'

export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  bio: string | null
  points: number
  level: number
  role: UserRole
  is_banned: boolean
  ban_reason: string | null
  ban_until: string | null
  notify_comments: boolean
  notify_votes: boolean
  notify_email: boolean
  created_at: string
}

export interface Post {
  id: string
  author_id: string
  category: Category
  title: string
  content: string
  tags: string[]
  view_count: number
  upvote_count: number
  downvote_count: number
  comment_count: number
  is_pinned: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
  // Joined fields
  author?: Profile
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  parent_id: string | null
  content: string
  upvote_count: number
  is_deleted: boolean
  created_at: string
  // Joined fields
  author?: Profile
  replies?: Comment[]
}

export interface Vote {
  id: string
  user_id: string
  target_type: 'post' | 'comment'
  target_id: string
  value: VoteValue
  created_at: string
}

export interface Bookmark {
  id: string
  user_id: string
  post_id: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  message: string
  link: string | null
  is_read: boolean
  created_at: string
}

export interface Report {
  id: string
  reporter_id: string
  target_type: 'post' | 'comment'
  target_id: string
  reason: string
  status: ReportStatus
  admin_note: string | null
  created_at: string
  // Joined fields
  reporter?: Profile
}

export interface Tag {
  id: string
  name: string
  post_count: number
  created_at: string
}

// Level thresholds
export const LEVEL_THRESHOLDS = [
  { level: 1, points: 0, name: '뉴비' },
  { level: 2, points: 100, name: '주니어' },
  { level: 3, points: 500, name: '미들' },
  { level: 4, points: 1500, name: '시니어' },
  { level: 5, points: 5000, name: '마스터' },
] as const

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'qna', label: 'Q&A' },
  { value: 'free', label: '자유' },
  { value: 'tech', label: '기술' },
  { value: 'career', label: '커리어' },
]

export function getLevelName(level: number): string {
  return LEVEL_THRESHOLDS.find((t) => t.level === level)?.name ?? '뉴비'
}

export function calculateLevel(points: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i].points) return LEVEL_THRESHOLDS[i].level
  }
  return 1
}
