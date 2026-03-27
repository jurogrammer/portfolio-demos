'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import PostCard from '@/components/post/PostCard'
import type { Post, Comment, Bookmark } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import Link from 'next/link'

interface ActivityTabsProps {
  profileId: string
  profileUsername: string
  isOwner: boolean
}

export function ActivityTabs({ profileId, profileUsername, isOwner }: ActivityTabsProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [bookmarks, setBookmarks] = useState<(Bookmark & { post: Post })[]>([])
  const [activeTab, setActiveTab] = useState('posts')
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set(['posts']))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTabData('posts')
  }, [profileId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadTabData = async (tab: string) => {
    if (loadedTabs.has(tab) && tab !== 'posts') return
    setIsLoading(true)
    const supabase = createClient()

    try {
      if (tab === 'posts') {
        const { data } = await supabase
          .from('dt_posts')
          .select('*, author:dt_profiles(*)')
          .eq('author_id', profileId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(20)
        setPosts((data ?? []) as Post[])
      } else if (tab === 'comments') {
        const { data } = await supabase
          .from('dt_comments')
          .select('*, author:dt_profiles(*)')
          .eq('author_id', profileId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(20)
        setComments((data ?? []) as Comment[])
      } else if (tab === 'bookmarks' && isOwner) {
        const { data } = await supabase
          .from('dt_bookmarks')
          .select('*, post:dt_posts(*, author:dt_profiles(*))')
          .eq('user_id', profileId)
          .order('created_at', { ascending: false })
          .limit(20)
        setBookmarks((data ?? []) as (Bookmark & { post: Post })[])
      }
      setLoadedTabs((prev) => new Set([...prev, tab]))
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    loadTabData(tab)
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="w-full">
        <TabsTrigger value="posts" className="flex-1">작성글</TabsTrigger>
        <TabsTrigger value="comments" className="flex-1">댓글</TabsTrigger>
        {isOwner && (
          <TabsTrigger value="bookmarks" className="flex-1">북마크</TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="posts" className="mt-4">
        {isLoading && activeTab === 'posts' ? (
          <LoadingSkeleton />
        ) : posts.length === 0 ? (
          <EmptyState message="작성한 글이 없습니다." />
        ) : (
          <div className="divide-y divide-border">
            {posts.map((post) => <PostCard key={post.id} post={post} />)}
          </div>
        )}
      </TabsContent>

      <TabsContent value="comments" className="mt-4">
        {isLoading && activeTab === 'comments' ? (
          <LoadingSkeleton />
        ) : comments.length === 0 ? (
          <EmptyState message="작성한 댓글이 없습니다." />
        ) : (
          <div className="divide-y divide-border space-y-0">
            {comments.map((comment) => (
              <div key={comment.id} className="py-3 px-2">
                <Link
                  href={`/post/${comment.post_id}`}
                  className="block group"
                >
                  <p className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-3">
                    {comment.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      {isOwner && (
        <TabsContent value="bookmarks" className="mt-4">
          {isLoading && activeTab === 'bookmarks' ? (
            <LoadingSkeleton />
          ) : bookmarks.length === 0 ? (
            <EmptyState message="북마크한 글이 없습니다." />
          ) : (
            <div className="divide-y divide-border">
              {bookmarks.map((bm) => (
                <PostCard key={bm.id} post={bm.post} />
              ))}
            </div>
          )}
        </TabsContent>
      )}
    </Tabs>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-center text-sm text-muted-foreground py-10">{message}</p>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 py-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse space-y-2 py-3 border-b border-border">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      ))}
    </div>
  )
}
