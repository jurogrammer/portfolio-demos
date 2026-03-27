import { GitFork } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const techBadges = ["n8n", "Next.js", "OpenAI", "Slack", "Sheets", "Resend"];

export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">Powered by n8n</p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="GitHub"
          >
            <GitFork className="h-5 w-5" />
          </a>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {techBadges.map((tech) => (
            <Badge key={tech} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
        </div>
      </div>
    </footer>
  );
}
