export interface Post {
  id: string
  title: string
  title_en: string | null
  slug: string
  content: string
  content_en: string | null
  excerpt: string | null
  thumbnail_url: string | null
  category: 'news' | 'blog'
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface PortfolioItem {
  id: string
  title: string
  description: string | null
  client_name: string | null
  tech_stack: string[]
  thumbnail_url: string | null
  images: string[]
  category: 'web' | 'mobile' | 'consulting' | null
  is_featured: boolean
  display_order: number
  created_at: string
}

export interface JobPosting {
  id: string
  title: string
  department: string | null
  location: string
  employment_type: 'full-time' | 'contract' | 'part-time'
  description: string
  requirements: string[]
  is_active: boolean
  created_at: string
}

export interface Inquiry {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  message: string
  is_read: boolean
  created_at: string
}
