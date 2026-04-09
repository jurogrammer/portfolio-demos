"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RuleForm } from "@/components/admin/RuleForm";
import { RuleTestPanel } from "@/components/admin/RuleTestPanel";
import {
  getRules,
  deleteRule,
  toggleRule,
  getTemplateOptions,
} from "./actions";
import { CONDITION_TYPE_MAP } from "@/lib/constants";

type Rule = Awaited<ReturnType<typeof getRules>>[number];
type TemplateOption = { id: string; name: string };

const CONDITION_BADGE_COLORS: Record<string, string> = {
  KEYWORD: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  PATTERN: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [, startTransition] = useTransition();

  const loadData = () => {
    startTransition(async () => {
      const [r, t] = await Promise.all([getRules(), getTemplateOptions()]);
      setRules(r);
      setTemplates(t);
    });
  };

  useEffect(() => { loadData(); }, []);

  const handleToggle = async (id: string) => {
    const result = await toggleRule(id);
    if (result.success) loadData();
    else toast.error(result.error);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 규칙을 삭제하시겠습니까?`)) return;
    const result = await deleteRule(id);
    if (result.success) {
      toast.success("규칙이 삭제되었습니다");
      loadData();
    } else {
      toast.error(result.error);
    }
  };

  const openCreate = () => {
    setEditingRule(null);
    setDialogOpen(true);
  };

  const openEdit = (rule: Rule) => {
    setEditingRule(rule);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">규칙 관리</h1>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          새 규칙 추가
        </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRule ? "규칙 수정" : "새 규칙 추가"}</DialogTitle>
            </DialogHeader>
            <RuleForm
              rule={editingRule ?? undefined}
              templates={templates}
              onSuccess={() => {
                setDialogOpen(false);
                loadData();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">우선순위</TableHead>
              <TableHead>규칙 이름</TableHead>
              <TableHead>조건 유형</TableHead>
              <TableHead>조건 값</TableHead>
              <TableHead>연결 템플릿</TableHead>
              <TableHead className="w-16">활성</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  등록된 규칙이 없습니다
                </TableCell>
              </TableRow>
            )}
            {rules.map((rule) => (
              <TableRow key={rule.id} className={!rule.isActive ? "opacity-50" : ""}>
                <TableCell className="text-center font-mono text-sm">{rule.priority}</TableCell>
                <TableCell className="font-medium">{rule.name}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                      CONDITION_BADGE_COLORS[rule.conditionType] ?? ""
                    }`}
                  >
                    {CONDITION_TYPE_MAP[rule.conditionType]}
                  </span>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                  {rule.conditionValue}
                </TableCell>
                <TableCell className="text-sm">{rule.templateName ?? "—"}</TableCell>
                <TableCell>
                  <Switch
                    checked={rule.isActive}
                    onCheckedChange={() => handleToggle(rule.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => openEdit(rule)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(rule.id, rule.name)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <RuleTestPanel />
    </div>
  );
}
