export function ActionSuggestion({
  observation,
  action,
  labels,
}: {
  observation: string;
  action: string;
  labels?: {
    observation: string;
    action: string;
  };
}) {
  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-black/10 p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <p className="text-sm text-[color:var(--color-muted)]">
            {labels?.observation ?? "今天的观察"}
          </p>
          <p className="mt-3 text-sm leading-7 text-[color:var(--color-foreground)]">{observation}</p>
        </div>
        <div>
          <p className="text-sm text-[color:var(--color-muted)]">
            {labels?.action ?? "今天的行动"}
          </p>
          <p className="mt-3 text-sm leading-7 text-[color:var(--color-foreground)]">{action}</p>
        </div>
      </div>
    </section>
  );
}
