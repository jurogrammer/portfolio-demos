'use client'

import { useState, useOptimistic, useTransition } from 'react'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Category } from '@/types/inventory'
import {
  createCategory,
  editCategory,
  removeCategory,
} from '@/app/(dashboard)/dashboard/categories/actions'
import { useLocale } from '@/lib/i18n'

interface CategoryListProps {
  initialCategories: Category[]
}

function CategoryForm({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isPending,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  initialData?: Category
  onSubmit: (fd: FormData) => void
  isPending: boolean
}) {
  const isEdit = !!initialData
  const { t } = useLocale()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? t.form.editCategory : t.form.addCategory}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(new FormData(e.currentTarget))
          }}
          className="space-y-4"
        >
          <div className="space-y-1">
            <Label htmlFor="cat-name">{t.form.categoryNameLabel}</Label>
            <Input
              id="cat-name"
              name="name"
              required
              defaultValue={initialData?.name}
              placeholder={t.form.categoryNamePlaceholder}
              disabled={isPending || isEdit}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cat-desc">{t.form.descriptionLabel}</Label>
            <Input
              id="cat-desc"
              name="description"
              defaultValue={initialData?.description}
              placeholder={t.form.descriptionPlaceholder}
              disabled={isPending}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cat-threshold">{t.form.lowStockThresholdLabel}</Label>
            <Input
              id="cat-threshold"
              name="lowStockThreshold"
              type="number"
              min={0}
              required
              defaultValue={initialData?.lowStockThreshold ?? 0}
              placeholder="0"
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

export default function CategoryList({ initialCategories }: CategoryListProps) {
  const { t } = useLocale()
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Category | undefined>()
  const [isPending, startTransition] = useTransition()
  const [deletingName, setDeletingName] = useState<string | null>(null)

  // useOptimistic for ADD only
  const [optimisticCategories, addOptimistic] = useOptimistic(
    initialCategories,
    (state: Category[], newCat: Category) => [...state, newCat]
  )

  // Track deleted names client-side
  const [deletedNames, setDeletedNames] = useState<Set<string>>(new Set())
  const visible = optimisticCategories.filter((c) => !deletedNames.has(c.name))

  function handleAdd() {
    setEditTarget(undefined)
    setFormOpen(true)
  }

  function handleEdit(cat: Category) {
    setEditTarget(cat)
    setFormOpen(true)
  }

  function handleFormSubmit(formData: FormData) {
    startTransition(async () => {
      if (editTarget) {
        const result = await editCategory(formData)
        if (result.success) {
          toast.success(t.messages.editCategorySuccess)
          setFormOpen(false)
        } else {
          toast.error(result.error)
        }
      } else {
        const result = await createCategory(formData)
        if (result.success) {
          toast.success(t.messages.addCategorySuccess)
          addOptimistic(result.data)
          setFormOpen(false)
        } else {
          toast.error(result.error)
        }
      }
    })
  }

  function handleDelete(name: string) {
    setDeletingName(name)
    startTransition(async () => {
      const result = await removeCategory(name)
      setDeletingName(null)
      if (result.success) {
        toast.success(t.messages.deleteCategorySuccess)
        setDeletedNames((prev) => new Set([...prev, name]))
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.categories.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t.categories.subtitle}
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          {t.form.addCategory}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.categories.name}</TableHead>
              <TableHead>{t.categories.description}</TableHead>
              <TableHead>{t.categories.lowStockThreshold}</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                  {t.categories.noCategories}
                </TableCell>
              </TableRow>
            ) : (
              visible.map((cat) => {
                const isDeleting = deletingName === cat.name
                return (
                  <TableRow key={cat.name} className={isDeleting ? 'opacity-50' : undefined}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {cat.description || '-'}
                    </TableCell>
                    <TableCell>{cat.lowStockThreshold.toLocaleString('ko-KR')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(cat)}
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
                            {isDeleting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t.actions.deleteCategory}</AlertDialogTitle>
                              <AlertDialogDescription>
                                <strong>{cat.name}</strong> {t.actions.deleteCategoryDesc}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t.form.cancel}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(cat.name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {t.form.delete}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <CategoryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editTarget}
        onSubmit={handleFormSubmit}
        isPending={isPending}
      />
    </div>
  )
}
