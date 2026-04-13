"use client";

import { useState, useTransition, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, X, ImagePlus } from "lucide-react";
import type { AutofillResult } from "@/app/api/profile/autofill/route";

const textareaClass =
  "flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 resize-y";

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB

interface Props {
  onResult: (data: AutofillResult) => void;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AutofillDialog({ onResult }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImages = useCallback(async (files: File[]) => {
    const validFiles = files.filter((f) => f.type.startsWith("image/"));
    if (validFiles.length === 0) return;

    const oversized = validFiles.find((f) => f.size > MAX_IMAGE_SIZE);
    if (oversized) {
      setError(`이미지 크기는 4MB 이하만 가능합니다. (${oversized.name})`);
      return;
    }

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setError(`이미지는 최대 ${MAX_IMAGES}장까지 첨부할 수 있습니다.`);
      return;
    }

    setError(null);
    const toAdd = validFiles.slice(0, remaining);
    const dataUrls = await Promise.all(toAdd.map(fileToDataUrl));
    setImages((prev) => [...prev, ...dataUrls]);
  }, [images.length]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const files = Array.from(e.clipboardData.files);
    if (files.length > 0) {
      e.preventDefault();
      addImages(files);
    }
  }, [addImages]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    addImages(files);
  }, [addImages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addImages(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/profile/autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text || undefined,
          images: images.length > 0 ? images : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "자동입력에 실패했습니다.");
        return;
      }

      const data: AutofillResult = await res.json();
      onResult(data);
      setOpen(false);
      setText("");
      setImages([]);
    });
  };

  const canSubmit = !isPending && (text.trim().length >= 20 || images.length > 0);

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Sparkles className="h-4 w-4" />
        AI 자동입력
      </Button>
    );
  }

  return (
    <div
      className="rounded-xl border bg-card shadow-sm p-6 space-y-4"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">AI 프로필 자동입력</h3>
        </div>
        <button
          type="button"
          onClick={() => { setOpen(false); setError(null); setImages([]); }}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        이력서, 자기소개서 텍스트를 붙여넣거나, 이력서 이미지(캡처/사진)를 첨부하면 AI가 분석하여 프로필을 자동으로 채워줍니다.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onPaste={handlePaste}
        placeholder={"텍스트를 붙여넣거나, 이미지를 Ctrl+V로 붙여넣으세요.\n\n예시:\n저는 경희대학교 산업경영공학과 3학년에 재학 중인 홍길동입니다. 서울에 거주하고 있으며..."}
        className={textareaClass}
        rows={6}
        disabled={isPending}
      />

      {/* Image previews */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((src, i) => (
            <div key={i} className="relative group">
              <img
                src={src}
                alt={`첨부 이미지 ${i + 1}`}
                className="h-20 w-20 object-cover rounded-md border"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending || images.length >= MAX_IMAGES}
            className="gap-1.5 text-xs text-muted-foreground"
          >
            <ImagePlus className="h-4 w-4" />
            이미지 첨부 ({images.length}/{MAX_IMAGES})
          </Button>
          {text.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {text.length.toLocaleString()}자
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => { setOpen(false); setError(null); setImages([]); }}
            disabled={isPending}
          >
            취소
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="gap-2"
          >
            {isPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                분석 중...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                자동입력
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
