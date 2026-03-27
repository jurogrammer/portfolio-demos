'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { deleteAccount } from '@/app/(protected)/settings/actions'
import type { Profile } from '@/types/database'

interface SettingsFormProps {
  profile: Profile
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const router = useRouter()
  const { setUser } = useAuthStore()

  const [username, setUsername] = useState(profile.username)
  const [bio, setBio] = useState(profile.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '')
  const [notifyComments, setNotifyComments] = useState(profile.notify_comments)
  const [notifyVotes, setNotifyVotes] = useState(profile.notify_votes)
  const [notifyEmail, setNotifyEmail] = useState(profile.notify_email)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('파일 크기는 2MB 이하여야 합니다.')
      return
    }

    setIsUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `avatars/${profile.id}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      setAvatarUrl(data.publicUrl)
      toast.success('아바타가 업로드되었습니다.')
    } catch {
      toast.error('아바타 업로드에 실패했습니다.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    const trimmedUsername = username.trim()
    if (!trimmedUsername) {
      toast.error('사용자명을 입력해주세요.')
      return
    }
    if (trimmedUsername.length < 2 || trimmedUsername.length > 20) {
      toast.error('사용자명은 2~20자여야 합니다.')
      return
    }

    setIsSaving(true)
    try {
      const supabase = createClient()
      const updates = {
        username: trimmedUsername,
        bio: bio.trim() || null,
        avatar_url: avatarUrl || null,
        notify_comments: notifyComments,
        notify_votes: notifyVotes,
        notify_email: notifyEmail,
      }

      const { data, error } = await supabase
        .from('dt_profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          toast.error('이미 사용 중인 사용자명입니다.')
        } else {
          throw error
        }
        return
      }

      setUser(data as Profile)
      toast.success('설정이 저장되었습니다.')
      router.refresh()
    } catch {
      toast.error('저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteAccount()
      if (result?.error) {
        toast.error(result.error)
      }
    } catch {
      toast.error('계정 삭제에 실패했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">프로필 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="text-xl">
                {username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <Label
                htmlFor="avatar-upload"
                className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 transition-colors"
              >
                {isUploading ? '업로드 중...' : '아바타 변경'}
              </Label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={isUploading}
              />
              <p className="text-xs text-muted-foreground mt-1">최대 2MB, JPG/PNG/GIF</p>
            </div>
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <Label htmlFor="username">사용자명</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="사용자명 (2~20자)"
              maxLength={20}
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <Label htmlFor="bio">소개</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="자기소개를 입력하세요..."
              rows={3}
              maxLength={200}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">{bio.length}/200</p>
          </div>
        </CardContent>
      </Card>

      {/* Notification settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">알림 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">댓글 알림</p>
              <p className="text-xs text-muted-foreground">내 글에 댓글이 달릴 때</p>
            </div>
            <Switch checked={notifyComments} onCheckedChange={setNotifyComments} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">추천 알림</p>
              <p className="text-xs text-muted-foreground">내 글/댓글이 추천받을 때</p>
            </div>
            <Switch checked={notifyVotes} onCheckedChange={setNotifyVotes} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">이메일 알림</p>
              <p className="text-xs text-muted-foreground">중요 알림을 이메일로 받기</p>
            </div>
            <Switch checked={notifyEmail} onCheckedChange={setNotifyEmail} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? '저장 중...' : '저장하기'}
        </Button>
      </div>

      {/* Danger zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-base text-destructive">위험 구역</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">회원 탈퇴</p>
              <p className="text-xs text-muted-foreground">계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger
                disabled={isDeleting}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 h-8 px-3 disabled:pointer-events-none disabled:opacity-50"
              >
                {isDeleting ? '탈퇴 중...' : '회원 탈퇴'}
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>정말 탈퇴하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>
                    모든 데이터가 삭제됩니다. 작성한 글, 댓글, 북마크 등 모든 정보가 영구적으로 삭제되며 복구할 수 없습니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    탈퇴하기
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
