import { Badge } from "@/components/ui/badge";

const techItems = [
  "n8n",
  "Next.js",
  "OpenAI",
  "Slack",
  "Google Sheets",
  "Resend",
  "Docker",
];

export function TechStack() {
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold tracking-tight mb-8">기술 스택</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {techItems.map((tech) => (
            <Badge key={tech} variant="secondary" className="text-sm px-4 py-1.5">
              {tech}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}
