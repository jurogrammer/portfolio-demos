"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QUESTION_CATEGORIES } from "@/lib/constants";
import type { QuestionRow, CreateQuestionInput } from "@/app/(admin)/admin/questions/actions";
import type { CohortRow } from "@/app/(admin)/admin/cohorts/actions";
import { format } from "date-fns";

const schema = z.object({
  content: z.string().min(1, "질문 내용을 입력하세요."),
  category: z.string().min(1, "카테고리를 선택하세요."),
  scheduledAt: z.string().min(1, "발송 예약 날짜를 선택하세요."),
  sendNow: z.boolean().default(false),
  cohortId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface QuestionFormProps {
  question?: QuestionRow;
  cohorts: CohortRow[];
  onSubmit: (data: CreateQuestionInput, sendNow: boolean, cohortId?: string) => Promise<void>;
  onCancel: () => void;
  isPending?: boolean;
}

export function QuestionForm({ question, cohorts, onSubmit, onCancel, isPending }: QuestionFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      content: question?.content ?? "",
      category: question?.category ?? "",
      scheduledAt: question?.scheduledAt
        ? format(question.scheduledAt, "yyyy-MM-dd'T'HH:mm")
        : "",
      sendNow: false,
      cohortId: "",
    },
  });

  const sendNow = watch("sendNow");

  const handleFormSubmit = async (values: FormValues) => {
    await onSubmit(
      {
        content: values.content,
        category: values.category,
        scheduledAt: values.scheduledAt,
      },
      values.sendNow,
      values.cohortId || undefined
    );
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="content">질문 내용 *</Label>
        <Textarea
          id="content"
          placeholder="질문을 입력하세요…"
          rows={4}
          {...register("content")}
        />
        {errors.content && (
          <p className="text-xs text-destructive">{errors.content.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>카테고리 *</Label>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  {field.value || "카테고리 선택"}
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && (
            <p className="text-xs text-destructive">{errors.category.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="scheduledAt">예약 일시 *</Label>
          <Input
            id="scheduledAt"
            type="datetime-local"
            {...register("scheduledAt")}
          />
          {errors.scheduledAt && (
            <p className="text-xs text-destructive">{errors.scheduledAt.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg border p-3">
        <Controller
          control={control}
          name="sendNow"
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              id="sendNow"
            />
          )}
        />
        <Label htmlFor="sendNow" className="cursor-pointer">
          즉시 발송
        </Label>
      </div>

      {sendNow && (
        <div className="flex flex-col gap-1.5">
          <Label>대상 기수 *</Label>
          <Controller
            control={control}
            name="cohortId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="기수 선택" />
                </SelectTrigger>
                <SelectContent>
                  {cohorts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          취소
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "저장 중…" : question ? "수정" : sendNow ? "생성 및 발송" : "생성"}
        </Button>
      </div>
    </form>
  );
}
