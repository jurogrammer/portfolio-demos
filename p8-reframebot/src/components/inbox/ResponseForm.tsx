"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { submitResponse } from "@/app/(user)/inbox/[messageId]/actions";
import { Send } from "lucide-react";

const schema = z.object({
  content: z
    .string()
    .min(20, "최소 20자 이상 입력해 주세요.")
    .max(2000, "최대 2000자까지 입력 가능합니다."),
});

type FormValues = z.infer<typeof schema>;

type ResponseFormProps = {
  messageId: string;
};

export default function ResponseForm({ messageId }: ResponseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingContent, setPendingContent] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { content: "" },
  });

  const content = watch("content");
  const charCount = content.length;

  function onSubmit(values: FormValues) {
    setPendingContent(values.content);
    setConfirmOpen(true);
  }

  function handleConfirm() {
    setConfirmOpen(false);
    startTransition(async () => {
      const result = await submitResponse({
        messageId,
        content: pendingContent,
      });
      if (result.success) {
        toast.success("답변이 제출되었습니다. 곧 리플라이가 도착합니다! 🎉");
        router.push("/inbox");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="relative">
          <Textarea
            {...register("content")}
            placeholder="오늘의 질문에 솔직하게 답해보세요. (20자 이상)"
            className="min-h-36 resize-none pr-16"
            disabled={isPending}
          />
          <span
            className={`absolute bottom-2 right-3 text-xs ${
              charCount > 2000
                ? "text-destructive"
                : charCount >= 1800
                  ? "text-yellow-500"
                  : "text-muted-foreground"
            }`}
          >
            {charCount} / 2000
          </span>
        </div>
        {errors.content && (
          <p className="text-xs text-destructive">{errors.content.message}</p>
        )}
        <Button
          type="submit"
          disabled={isPending || charCount < 20}
          className="w-full sm:w-auto"
        >
          <Send className="size-4 mr-1" />
          {isPending ? "제출 중..." : "답변 제출하기"}
        </Button>
      </form>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>답변을 제출할까요?</DialogTitle>
            <DialogDescription>
              제출 후에는 수정할 수 없습니다. 답변을 제출하면 AI 리프레이밍 답변이 생성됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-muted p-3 text-sm max-h-32 overflow-y-auto">
            {pendingContent}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              취소
            </Button>
            <Button onClick={handleConfirm} disabled={isPending}>
              {isPending ? "제출 중..." : "제출하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
