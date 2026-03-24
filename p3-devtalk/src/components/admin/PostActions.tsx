'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pin, PinOff, Trash2, RotateCcw, FolderEdit } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { Post, Category } from '@/types/database'
import { CATEGORIES } from '@/types/database'
import { deletePost, restorePost, togglePinPost, changeCategory } from '@/app/(admin)/admin/posts/actions'

export function PostActions({ post }: { post: Post }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category>(post.category)

  async function handle(action: () => Promise<void>) {
    setLoading(true)
    try {
      await action()
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleCategoryChange() {
    setLoading(true)
    try {
      await changeCategory(post.id, selectedCategory)
      setCategoryDialogOpen(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={loading}
          className="inline-flex size-7 items-center justify-center rounded-md p-0 text-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!post.is_deleted && (
            <>
              <DropdownMenuItem onClick={() => handle(() => togglePinPost(post.id, post.is_pinned))}>
                {post.is_pinned ? (
                  <><PinOff className="size-4 mr-2" />고정 해제</>
                ) : (
                  <><Pin className="size-4 mr-2" />고정</>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSelectedCategory(post.category); setCategoryDialogOpen(true) }}>
                <FolderEdit className="size-4 mr-2" />
                카테고리 변경
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => handle(() => deletePost(post.id))}>
                <Trash2 className="size-4 mr-2" />
                삭제
              </DropdownMenuItem>
            </>
          )}
          {post.is_deleted && (
            <DropdownMenuItem onClick={() => handle(() => restorePost(post.id))}>
              <RotateCcw className="size-4 mr-2" />
              복원
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>카테고리 변경</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="cat-select">카테고리</Label>
            <select
              id="cat-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category)}
              className="h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)} disabled={loading}>
              취소
            </Button>
            <Button onClick={handleCategoryChange} disabled={loading || selectedCategory === post.category}>
              변경
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
