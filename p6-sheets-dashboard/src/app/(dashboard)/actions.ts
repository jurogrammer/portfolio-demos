'use server'

import { revalidatePath } from 'next/cache'

export async function refreshDashboardLayout() {
  revalidatePath('/dashboard', 'layout')
}
