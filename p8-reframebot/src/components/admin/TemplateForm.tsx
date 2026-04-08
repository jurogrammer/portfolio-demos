"use client";

import { useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TemplatePreview } from "./TemplatePreview";
import { createTemplate, updateTemplate } from "@/app/(admin)/admin/templates/actions";
import { TEMPLATE_CATEGORIES } from "@/lib/constants";

const schema = z.object({
  name: z.string().min(1, "템플릿 이름을 입력하세요"),
  category: z.string().min(1, "카테고리를 선택하세요"),
  content: z.string().min(1, "내용을 입력하세요"),
});

type FormData = z.infer<typeof schema>;

interface Template {
  id: string;
  name: string;
  category: string;
  content: string;
}

interface Props {
  template?: Template;
  onSuccess: () => void;
}

const VARIABLES = ["{닉네임}", "{키워드}", "{키워드목록}", "{원문발췌}", "{질문}", "{날짜}"];

export function TemplateForm({ template, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: template?.name ?? "",
      category: template?.category ?? "",
      content: template?.content ?? "",
    },
  });

  const { ref: formRef, ...contentProps } = register("content");

  const insertVariable = (variable: string) => {
    const el = textareaRef.current;
    if (!el) {
      setValue("content", watch("content") + variable);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const current = watch("content");
    const next = current.slice(0, start) + variable + current.slice(end);
    setValue("content", next);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const result = template
        ? await updateTemplate(template.id, data)
        : await createTemplate(data);

      if (result.success) {
        toast.success(template ? "템플릿이 수정되었습니다" : "템플릿이 추가되었습니다");
        onSuccess();
      } else {
        toast.error(result.error);
      }
    });
  };

  const content = watch("content");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">템플릿 이름</Label>
        <Input id="name" {...register("name")} placeholder="예: 부정 감정 리프레이밍" />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <Label>카테고리</Label>
        <Select
          value={watch("category")}
          onValueChange={(v) => setValue("category", v ?? "")}
        >
          <SelectTrigger>
            {watch("category") || "카테고리 선택"}
          </SelectTrigger>
          <SelectContent>
            {TEMPLATE_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
      </div>

      <div className="space-y-1">
        <Label>내용</Label>
        <div className="flex flex-wrap gap-1 mb-1">
          {VARIABLES.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => insertVariable(v)}
              className="rounded border bg-secondary px-2 py-0.5 text-xs hover:bg-accent transition-colors"
            >
              {v}
            </button>
          ))}
        </div>
        <Textarea
          {...contentProps}
          ref={(el) => {
            formRef(el);
            textareaRef.current = el;
          }}
          rows={5}
          placeholder="답장 내용을 입력하세요. 변수 버튼을 클릭하여 삽입할 수 있습니다."
        />
        {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
      </div>

      <TemplatePreview content={content} />

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "저장 중..." : template ? "수정" : "추가"}
      </Button>
    </form>
  );
}
