"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COHORT_STATUS_MAP } from "@/lib/constants";
import type { CohortRow, CreateCohortInput } from "@/app/(admin)/admin/cohorts/actions";
import { format } from "date-fns";

const schema = z.object({
  name: z.string().min(1, "기수명을 입력하세요."),
  description: z.string().optional(),
  capacity: z.coerce.number().min(1, "최소 1명 이상이어야 합니다."),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["ACTIVE", "CLOSED", "ARCHIVED"]),
});

type FormValues = z.infer<typeof schema>;

interface CohortFormProps {
  cohort?: CohortRow;
  onSubmit: (data: CreateCohortInput) => Promise<void>;
  onCancel: () => void;
  isPending?: boolean;
}

export function CohortForm({ cohort, onSubmit, onCancel, isPending }: CohortFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: cohort?.name ?? "",
      description: cohort?.description ?? "",
      capacity: cohort?.capacity ?? 30,
      startDate: cohort?.startDate ? format(cohort.startDate, "yyyy-MM-dd") : "",
      endDate: cohort?.endDate ? format(cohort.endDate, "yyyy-MM-dd") : "",
      status: cohort?.status ?? "ACTIVE",
    },
  });

  const handleFormSubmit = async (values: FormValues) => {
    await onSubmit({
      name: values.name,
      description: values.description,
      capacity: values.capacity,
      startDate: values.startDate || undefined,
      endDate: values.endDate || undefined,
      status: values.status,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">기수명 *</Label>
        <Input id="name" placeholder="예: 1기" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">설명</Label>
        <Input id="description" placeholder="기수 설명 (선택)" {...register("description")} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="capacity">정원 *</Label>
          <Input id="capacity" type="number" min={1} {...register("capacity")} />
          {errors.capacity && <p className="text-xs text-destructive">{errors.capacity.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>상태 *</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  {COHORT_STATUS_MAP[field.value as keyof typeof COHORT_STATUS_MAP] ?? "상태 선택"}
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COHORT_STATUS_MAP).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="startDate">시작일</Label>
          <Input id="startDate" type="date" {...register("startDate")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="endDate">종료일</Label>
          <Input id="endDate" type="date" {...register("endDate")} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          취소
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "저장 중…" : cohort ? "수정" : "생성"}
        </Button>
      </div>
    </form>
  );
}
