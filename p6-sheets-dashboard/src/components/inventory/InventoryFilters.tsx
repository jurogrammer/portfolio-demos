'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { Category, InventoryFilters } from '@/types/inventory'
import { useLocale } from '@/lib/i18n'

interface InventoryFiltersProps {
  filters: InventoryFilters
  categories: Category[]
  onChange: (filters: InventoryFilters) => void
}

export default function InventoryFiltersBar({
  filters,
  categories,
  onChange,
}: InventoryFiltersProps) {
  const { t } = useLocale()

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="flex-1 min-w-0">
        <Input
          placeholder={t.filter.searchPlaceholder}
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full"
        />
      </div>

      <Select
        value={filters.category || '__all__'}
        onValueChange={(val) =>
          onChange({ ...filters, category: !val || val === '__all__' ? '' : val })
        }
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder={t.filter.allCategories} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">{t.filter.allCategories}</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.name} value={cat.name}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Switch
          id="low-stock-filter"
          checked={filters.lowStockOnly}
          onCheckedChange={(checked) =>
            onChange({ ...filters, lowStockOnly: checked })
          }
        />
        <Label htmlFor="low-stock-filter" className="text-sm cursor-pointer whitespace-nowrap">
          {t.filter.lowStockOnly}
        </Label>
      </div>
    </div>
  )
}
