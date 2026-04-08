"use client";

import { useEffect, useState, useTransition } from "react";
import { previewTemplate } from "@/app/(admin)/admin/templates/actions";

interface Props {
  content: string;
}

export function TemplatePreview({ content }: Props) {
  const [preview, setPreview] = useState("");
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!content.trim()) {
      setPreview("");
      return;
    }
    const timer = setTimeout(() => {
      startTransition(async () => {
        const result = await previewTemplate(content);
        if (result.success) setPreview(result.data);
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [content]);

  if (!content.trim()) return null;

  return (
    <div className="rounded-md border bg-muted/30 p-3 space-y-1">
      <p className="text-xs font-medium text-muted-foreground">미리보기 (샘플 데이터)</p>
      <p className="text-sm whitespace-pre-wrap">{preview || content}</p>
    </div>
  );
}
