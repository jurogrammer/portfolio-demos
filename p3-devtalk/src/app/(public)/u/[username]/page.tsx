import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { ActivityTabs } from '@/components/profile/ActivityTabs'
import type { Metadata } from 'next'

interface UserProfilePageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: UserProfilePageProps): Promise<Metadata> {
  const { username } = await params
  return { title: `${username} 프로필 — DevTalk` }
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { username } = await params
  const supabase = await createClient()

  // Get profile
  const { data: profile } = await supabase
    .from('dt_profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  // Get current user to determine ownership
  const { data: { user: authUser } } = await supabase.auth.getUser()
  const isOwner = authUser?.id === profile.id

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <ProfileCard profile={profile} />
      <ActivityTabs
        profileId={profile.id}
        profileUsername={profile.username}
        isOwner={isOwner}
      />
    </div>
  )
}
