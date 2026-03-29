'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CATEGORIES } from '@/lib/constants'
import { InquiryFormData, InquiryCategory } from '@/types/inquiry'
import { submitInquiry } from '@/app/inquiry/actions'
import { useLocale } from '@/lib/i18n'

export function InquiryForm() {
  const router = useRouter()
  const { t } = useLocale()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<InquiryFormData>({
    name: '',
    email: '',
    category: '일반문의',
    message: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof InquiryFormData, string>>>({})

  function validate(): boolean {
    const newErrors: Partial<Record<keyof InquiryFormData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = t.validation.nameRequired
    }
    if (!formData.email.trim()) {
      newErrors.email = t.validation.emailRequired
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.validation.emailInvalid
    }
    if (!formData.message.trim()) {
      newErrors.message = t.validation.messageRequired
    } else if (formData.message.trim().length < 10) {
      newErrors.message = t.validation.messageTooShort
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      const result = await submitInquiry(formData)
      if (result.success) {
        router.push(`/inquiry/status/${result.data.ticketId}`)
      } else {
        toast.error(result.error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.inquiry.formTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name">{t.inquiry.name} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder={t.inquiry.namePlaceholder}
              disabled={isLoading}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">{t.inquiry.email} *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="example@email.com"
              disabled={isLoading}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">{t.inquiry.type} *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, category: value as InquiryCategory }))
              }
              disabled={isLoading}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder={t.inquiry.typePlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {t.categories[cat as keyof typeof t.categories] ?? cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="message">{t.inquiry.content} *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
              placeholder={t.inquiry.contentPlaceholder}
              rows={5}
              disabled={isLoading}
            />
            {errors.message && <p className="text-sm text-red-500">{errors.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                {t.inquiry.submitting}
              </span>
            ) : (
              t.inquiry.submit
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
