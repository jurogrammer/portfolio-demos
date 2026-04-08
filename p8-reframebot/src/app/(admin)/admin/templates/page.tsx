"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TemplateForm } from "@/components/admin/TemplateForm";
import { getTemplates, deleteTemplate } from "./actions";

type Template = Awaited<ReturnType<typeof getTemplates>>[number];

const CATEGORY_BADGE_VARIANT: Record<string, string> = {
  "리프레이밍 격려형": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  "탐색 유도형": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "감정 수용형": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [, startTransition] = useTransition();

  const loadData = () => {
    startTransition(async () => {
      setTemplates(await getTemplates());
    });
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 템플릿을 삭제하시겠습니까?`)) return;
    const result = await deleteTemplate(id);
    if (result.success) {
      toast.success("템플릿이 삭제되었습니다");
      loadData();
    } else {
      toast.error(result.error);
    }
  };

  const openCreate = () => {
    setEditingTemplate(null);
    setDialogOpen(true);
  };

  const openEdit = (template: Template) => {
    setEditingTemplate(template);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">템플릿 관리</h1>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          새 템플릿 추가
        </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "템플릿 수정" : "새 템플릿 추가"}
              </DialogTitle>
            </DialogHeader>
            <TemplateForm
              template={editingTemplate ?? undefined}
              onSuccess={() => {
                setDialogOpen(false);
                loadData();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {templates.length === 0 && (
        <p className="text-center text-muted-foreground py-12">등록된 템플릿이 없습니다</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{template.name}</CardTitle>
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => openEdit(template)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(template.id, template.name)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <span
                className={`inline-flex w-fit items-center rounded px-2 py-0.5 text-xs font-medium ${
                  CATEGORY_BADGE_VARIANT[template.category] ?? "bg-secondary text-secondary-foreground"
                }`}
              >
                {template.category}
              </span>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {template.content.length > 100
                  ? template.content.slice(0, 100) + "..."
                  : template.content}
              </p>
              <p className="text-xs text-muted-foreground">
                연결된 규칙: {template.ruleCount}개
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
