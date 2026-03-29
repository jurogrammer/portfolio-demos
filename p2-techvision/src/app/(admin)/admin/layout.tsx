import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const url = headersList.get('x-url') || headersList.get('referer') || ''
  const pathname = headersList.get('x-pathname') || new URL(url || 'http://localhost').pathname

  // Skip auth check for login page to avoid redirect loop
  if (pathname.endsWith('/admin/login')) {
    return <>{children}</>
  }

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/admin/login')

  let unreadCount = 0
  try {
    const adminClient = createAdminClient()
    const { count } = await adminClient
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
    unreadCount = count || 0
  } catch {}

  return (
    <div className="flex min-h-screen">
      <AdminSidebar unreadCount={unreadCount} />
      <main className="flex-1 bg-gray-50 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
