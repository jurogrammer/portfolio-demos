'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n";

export function Hero() {
  const { t } = useLocale();
  const [titleLine1, titleLine2] = t.hero.title.split('\n');

  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-muted/50 to-background">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
          {titleLine1}<br className="hidden sm:block" /> {titleLine2}
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          {t.hero.description}
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" render={<Link href="/inquiry" />}>
            {t.hero.inquiryBtn}
          </Button>
          <Button variant="outline" size="lg" render={<Link href="/dashboard" />}>
            {t.hero.dashboardBtn}
          </Button>
        </div>
      </div>
    </section>
  );
}
