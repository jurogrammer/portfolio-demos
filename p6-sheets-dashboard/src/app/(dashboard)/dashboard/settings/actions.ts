'use server'

import { revalidatePath } from 'next/cache'

export async function refreshAllDashboard() {
  revalidatePath('/dashboard', 'layout')
}
