import { createAdminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { Profile } from '@/types/database'
import { UserActions } from '@/components/admin/UserActions'

async function getUsers(searchParams: { q?: string; role?: string; banned?: string }) {
  const supabase = createAdminClient()
  let query = supabase
    .from('dt_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (searchParams.q) {
    query = query.ilike('username', `%${searchParams.q}%`)
  }
  if (searchParams.role) {
    query = query.eq('role', searchParams.role)
  }
  if (searchParams.banned === 'true') {
    query = query.eq('is_banned', true)
  }

  const { data, error } = await query.limit(100)
  if (error) throw error
  return data as Profile[]
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; banned?: string }>
}) {
  const params = await searchParams
  const users = await getUsers(params)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">사용자 관리</h1>

      <form className="flex gap-2 mb-4 flex-wrap">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="사용자명 검색..."
          className="h-8 rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        />
        <select
          name="role"
          defaultValue={params.role ?? ''}
          className="h-8 rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <option value="">전체 권한</option>
          <option value="user">일반</option>
          <option value="admin">관리자</option>
        </select>
        <select
          name="banned"
          defaultValue={params.banned ?? ''}
          className="h-8 rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <option value="">전체</option>
          <option value="true">정지됨</option>
        </select>
        <button
          type="submit"
          className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
        >
          검색
        </button>
      </form>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>사용자명</TableHead>
              <TableHead>권한</TableHead>
              <TableHead>포인트</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>가입일</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  사용자가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? '관리자' : '일반'}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.points.toLocaleString()}</TableCell>
                  <TableCell>
                    {user.is_banned ? (
                      <Badge variant="destructive">정지</Badge>
                    ) : (
                      <Badge variant="outline">정상</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(user.created_at), { addSuffix: true, locale: ko })}
                  </TableCell>
                  <TableCell className="text-right">
                    <UserActions user={user} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
