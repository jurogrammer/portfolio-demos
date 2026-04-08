const badges = [
  { label: "Next.js 16", color: "bg-black text-white dark:bg-white dark:text-black" },
  { label: "TypeScript", color: "bg-blue-600 text-white" },
  { label: "Supabase", color: "bg-emerald-600 text-white" },
  { label: "Prisma", color: "bg-indigo-600 text-white" },
  { label: "Tailwind CSS", color: "bg-cyan-500 text-white" },
  { label: "NextAuth.js", color: "bg-violet-600 text-white" },
  { label: "Vercel", color: "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" },
];

export default function StackBadges() {
  return (
    <section className="border-t border-border bg-muted/20 py-16">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <p className="mb-8 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          기술 스택
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {badges.map(({ label, color }) => (
            <span
              key={label}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${color}`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
