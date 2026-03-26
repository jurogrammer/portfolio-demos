export const dynamic = 'force-dynamic'

import { fetchCategories } from './actions'
import CategoryList from '@/components/categories/CategoryList'

export default async function CategoriesPage() {
  const categories = await fetchCategories()
  return <CategoryList initialCategories={categories} />
}
