export const dynamic = 'force-dynamic'

import { fetchInventory } from './actions'
import InventoryPageClient from './InventoryPageClient'

export default async function InventoryPage() {
  const { items, categories } = await fetchInventory()
  return <InventoryPageClient initialItems={items} categories={categories} />
}
