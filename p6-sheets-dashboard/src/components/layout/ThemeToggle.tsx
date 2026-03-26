'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Theme = 'light' | 'dark' | 'system'

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
  } else {
    root.classList.toggle('dark', theme === 'dark')
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system')

  useEffect(() => {
    const stored = (localStorage.getItem('theme') as Theme) || 'system'
    setTheme(stored)
    applyTheme(stored)
  }, [])

  function handleSelect(value: Theme) {
    setTheme(value)
    localStorage.setItem('theme', value)
    applyTheme(value)
  }

  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="테마 변경" />
        }
      >
        <Icon className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleSelect('light')}>
          <Sun className="h-4 w-4 mr-2" />
          라이트
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelect('dark')}>
          <Moon className="h-4 w-4 mr-2" />
          다크
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelect('system')}>
          <Monitor className="h-4 w-4 mr-2" />
          시스템
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
