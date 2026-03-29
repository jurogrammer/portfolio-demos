'use client'

import { useTransition } from 'react'
import { Pencil, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import type { InventoryItem } from '@/types/inventory'
import { removeItem } from '@/app/(dashboard)/dashboard/inventory/actions'
import { useLocale } from '@/lib/i18n'

interface InventoryActionsProps {
  item: InventoryItem
  onEdit: (item: InventoryItem) => void
  onDeleted: (sku: string) => void
}

export default function InventoryActions({
  item,
  onEdit,
  onDeleted,
}: InventoryActionsProps) {
  const [isPending, startTransition] = useTransition()
  const { t } = useLocale()

  function handleDelete() {
    startTransition(async () => {
      const result = await removeItem(item.sku)
      if (result.success) {
        toast.success(t.messages.deleteItemSuccess)
        onDeleted(item.sku)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="flex items-center gap-1 justify-end">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onEdit(item)}
        disabled={isPending}
        aria-label={t.actions.edit}
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <AlertDialog>
        <AlertDialogTrigger
          className="inline-flex items-center justify-center h-8 w-8 rounded-md text-destructive hover:text-destructive hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
          disabled={isPending}
          aria-label={t.actions.delete}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.actions.deleteItem}</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{item.name}</strong> ({item.sku}) {t.actions.deleteItemDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.form.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t.form.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
