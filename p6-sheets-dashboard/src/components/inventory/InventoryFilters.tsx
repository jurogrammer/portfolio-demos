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
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="flex-1 min-w-0">
        <Input
          placeholder="SKU 또는 상품명 검색..."
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
          <SelectValue placeholder="카테고리" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">전체 카테고리</SelectItem>
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
          재고부족만
        </Label>
      </div>
    </div>
  )
}
