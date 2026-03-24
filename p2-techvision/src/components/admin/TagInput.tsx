'use client'
import { useState, KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export default function TagInput({ tags, onChange, placeholder = 'Enter tag and press Enter' }: TagInputProps) {
  const [input, setInput] = useState('')

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      const newTag = input.trim()
      if (!tags.includes(newTag)) {
        onChange([...tags, newTag])
      }
      setInput('')
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  function removeTag(tag: string) {
    onChange(tags.filter(t => t !== tag))
  }

  return (
    <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-10 focus-within:ring-2 focus-within:ring-ring">
      {tags.map(tag => (
        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
          {tag}
          <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="border-0 focus-visible:ring-0 flex-1 min-w-24 h-6 p-0"
      />
    </div>
  )
}
