'use client'

import { useTransition, useRef } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { InventoryItem, Category } from '@/types/inventory'
import { createItem, editItem } from '@/app/(dashboard)/dashboard/inventory/actions'
import { useLocale } from '@/lib/i18n'

interface InventoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  initialData?: InventoryItem
  onCreated?: (item: InventoryItem) => void
}

export default function InventoryForm({
  open,
  onOpenChange,
  categories,
  initialData,
  onCreated,
}: InventoryFormProps) {
  const isEdit = !!initialData
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const { t } = useLocale()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      if (isEdit) {
        const result = await editItem(formData)
        if (result.success) {
          toast.success(t.messages.editItemSuccess)
          onOpenChange(false)
        } else {
          toast.error(result.error)
        }
      } else {
        const result = await createItem(formData)
        if (result.success) {
          toast.success(t.messages.addItemSuccess)
          onCreated?.(result.data)
          onOpenChange(false)
          formRef.current?.reset()
        } else {
          toast.error(result.error)
        }
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? t.form.editItem : t.form.addItem}</DialogTitle>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          {isEdit && (
            <input type="hidden" name="sku" value={initialData.sku} />
          )}

          <div className="space-y-1">
            <Label>SKU</Label>
            <Input
              value={isEdit ? initialData.sku : t.form.skuAutoGen}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="inv-name">{t.form.productName}</Label>
            <Input
              id="inv-name"
              name="name"
              required
              defaultValue={initialData?.name}
              placeholder={t.form.productNamePlaceholder}
              disabled={isPending}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="inv-category">{t.form.categoryLabel}</Label>
            <Select name="category" defaultValue={initialData?.category} required>
              <SelectTrigger id="inv-category" disabled={isPending}>
                <SelectValue placeholder={t.form.categoryPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.name} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="inv-quantity">{t.form.quantityLabel}</Label>
              <Input
                id="inv-quantity"
                name="quantity"
                type="number"
                min={0}
                required
                defaultValue={initialData?.quantity}
                placeholder="0"
                disabled={isPending}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="inv-unitPrice">{t.form.unitPriceLabel}</Label>
              <Input
                id="inv-unitPrice"
                name="unitPrice"
                type="number"
                min={1}
                required
                defaultValue={initialData?.unitPrice}
                placeholder="0"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="inv-supplier">{t.form.supplierLabel}</Label>
            <Input
              id="inv-supplier"
              name="supplier"
              defaultValue={initialData?.supplier}
              placeholder={t.form.supplierPlaceholder}
              disabled={isPending}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="inv-notes">{t.form.notesLabel}</Label>
            <Input
              id="inv-notes"
              name="notes"
              defaultValue={initialData?.notes}
              placeholder={t.form.notesPlaceholder}
              disabled={isPending}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {t.form.cancel}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? t.form.edit : t.form.add}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
