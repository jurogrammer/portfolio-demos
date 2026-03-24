import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { getLevelName } from '@/types/database'
import type { Profile } from '@/types/database'

interface ProfileCardProps {
  profile: Profile
}

const LEVEL_COLORS: Record<number, string> = {
  1: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  2: 'bg-green-500/10 text-green-400 border-green-500/20',
  3: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  4: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  5: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const levelColor = LEVEL_COLORS[profile.level] ?? LEVEL_COLORS[1]

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.username} />
            <AvatarFallback className="text-xl">
              {profile.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold">{profile.username}</h1>
              <Badge variant="outline" className={levelColor}>
                Lv.{profile.level} {getLevelName(profile.level)}
              </Badge>
            </div>
            {profile.bio && (
              <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>
                포인트{' '}
                <span className="font-semibold text-foreground">
                  {profile.points.toLocaleString()}
                </span>
              </span>
              <span>
                가입{' '}
                <span className="font-semibold text-foreground">
                  {formatDistanceToNow(new Date(profile.created_at), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </span>
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
