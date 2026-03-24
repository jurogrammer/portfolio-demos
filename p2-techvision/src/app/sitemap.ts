import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://techvision-demo.vercel.app'
const locales = ['ko', 'en']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ['', '/about', '/services', '/portfolio', '/news', '/careers', '/contact']

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.flatMap(route =>
    locales.map(locale => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1.0 : 0.8,
    }))
  )

  // Dynamic entries from posts
  let dynamicEntries: MetadataRoute.Sitemap = []
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: posts } = await supabase
      .from('posts')
      .select('slug, updated_at')
      .eq('is_published', true)

    if (posts) {
      dynamicEntries = posts.flatMap(post =>
        locales.map(locale => ({
          url: `${baseUrl}/${locale}/news/${post.slug}`,
          lastModified: new Date(post.updated_at),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        }))
      )
    }
  } catch (e) { /* Supabase not configured */ }

  return [...staticEntries, ...dynamicEntries]
}
