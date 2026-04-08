"use client";

import { useEffect, useState, useTransition } from "react";
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
import { Switch } from "@/components/ui/switch";
import { createRule, updateRule } from "@/app/(admin)/admin/rules/actions";
import { QUESTION_CATEGORIES, CONDITION_TYPE_MAP } from "@/lib/constants";

const schema = z.object({
  name: z.string().min(1, "규칙 이름을 입력하세요"),
  conditionType: z.enum(["KEYWORD", "PATTERN", "SENTIMENT"]),
  conditionValue: z.string().min(1, "조건 값을 입력하세요"),
  templateId: z.string().optional(),
  priority: z.coerce.number().int().min(0),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface Rule {
  id: string;
  name: string;
  conditionType: "KEYWORD" | "PATTERN" | "SENTIMENT";
  conditionValue: string;
  templateId: string | null;
  priority: number;
  isActive: boolean;
}

interface TemplateOption {
  id: string;
  name: string;
}

interface Props {
  rule?: Rule;
  templates: TemplateOption[];
  onSuccess: () => void;
}

export function RuleForm({ rule, templates, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition();
  const [patternTest, setPatternTest] = useState("");
  const [patternMatch, setPatternMatch] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: rule?.name ?? "",
      conditionType: rule?.conditionType ?? "KEYWORD",
      conditionValue: rule?.conditionValue ?? "",
      templateId: rule?.templateId ?? undefined,
      priority: rule?.priority ?? 0,
      isActive: rule?.isActive ?? true,
    },
  });

  const conditionType = watch("conditionType");
  const conditionValue = watch("conditionValue");

  // Test pattern live
  useEffect(() => {
    if (conditionType !== "PATTERN" || !conditionValue || !patternTest) {
      setPatternMatch(null);
      return;
    }
    try {
      const regex = new RegExp(conditionValue, "i");
      setPatternMatch(regex.test(patternTest));
    } catch {
      setPatternMatch(null);
    }
  }, [conditionType, conditionValue, patternTest]);

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const result = rule
        ? await updateRule(rule.id, data)
        : await createRule(data);

      if (result.success) {
        toast.success(rule ? "규칙이 수정되었습니다" : "규칙이 추가되었습니다");
        onSuccess();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">규칙 이름</Label>
        <Input id="name" {...register("name")} placeholder="예: 부정 감정 키워드 감지" />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <Label>조건 유형</Label>
        <Select
          value={watch("conditionType")}
          onValueChange={(v) => {
            if (v) setValue("conditionType", v as FormData["conditionType"]);
            setValue("conditionValue", "");
          }}
        >
          <SelectTrigger>
            {CONDITION_TYPE_MAP[watch("conditionType") as keyof typeof CONDITION_TYPE_MAP] ?? "조건 유형 선택"}
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CONDITION_TYPE_MAP).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>조건 값</Label>
        {conditionType === "KEYWORD" && (
          <>
            <Input
              {...register("conditionValue")}
              placeholder="쉼표로 구분: 못하,부족,실패"
            />
            <p className="text-xs text-muted-foreground">쉼표(,)로 구분하여 여러 키워드 입력</p>
          </>
        )}
        {conditionType === "PATTERN" && (
          <div className="space-y-2">
            <Input {...register("conditionValue")} placeholder="정규식 패턴 (예: 못\w+)" />
            <Input
              value={patternTest}
              onChange={(e) => setPatternTest(e.target.value)}
              placeholder="테스트 텍스트 입력..."
            />
            {patternMatch !== null && (
              <p
                className={`text-xs font-medium ${patternMatch ? "text-green-600" : "text-destructive"}`}
              >
                {patternMatch ? "✓ 매칭됨" : "✗ 매칭 안됨"}
              </p>
            )}
          </div>
        )}
        {conditionType === "SENTIMENT" && (
          <div className="flex gap-4">
            {(["NEGATIVE", "NEUTRAL", "POSITIVE"] as const).map((val) => (
              <label key={val} className="flex items-center gap-1.5 cursor-pointer text-sm">
                <input
                  type="radio"
                  value={val}
                  checked={watch("conditionValue") === val}
                  onChange={() => setValue("conditionValue", val)}
                  className="accent-primary"
                />
                {val === "NEGATIVE" ? "부정" : val === "NEUTRAL" ? "중립" : "긍정"}
              </label>
            ))}
          </div>
        )}
        {errors.conditionValue && (
          <p className="text-xs text-destructive">{errors.conditionValue.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label>연결 템플릿</Label>
        <Select
          value={watch("templateId") ?? "none"}
          onValueChange={(v) => setValue("templateId", v == null || v === "none" ? undefined : v)}
        >
          <SelectTrigger>
            {(() => { const tid = watch("templateId"); const t = templates.find(x => x.id === tid); return t ? t.name : "템플릿 선택 (선택사항)"; })()}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">없음</SelectItem>
            {templates.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="priority">우선순위 (높을수록 먼저 매칭)</Label>
        <Input
          id="priority"
          type="number"
          min={0}
          {...register("priority")}
          className="w-24"
        />
        {errors.priority && <p className="text-xs text-destructive">{errors.priority.message}</p>}
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={watch("isActive")}
          onCheckedChange={(v) => setValue("isActive", v)}
          id="isActive"
        />
        <Label htmlFor="isActive">활성화</Label>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "저장 중..." : rule ? "수정" : "추가"}
      </Button>
    </form>
  );
}
