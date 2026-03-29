'use client'

import { MessageSquare, BarChart3, AlertTriangle, ArrowRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { useLocale } from "@/lib/i18n";

const icons = [MessageSquare, BarChart3, AlertTriangle];

export function WorkflowCards() {
  const { t } = useLocale();

  return (
    <section className="py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold tracking-tight text-center mb-10">
          {t.workflow.sectionTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.workflow.items.map((item, idx) => {
            const Icon = icons[idx];
            return (
              <Card key={item.title}>
                <CardHeader>
                  <div className="mb-2">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <div className="flex flex-wrap items-center gap-1">
                    {item.steps.map((step, i) => (
                      <span key={step} className="flex items-center gap-1">
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{step}</span>
                        {i < item.steps.length - 1 && (
                          <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        )}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
