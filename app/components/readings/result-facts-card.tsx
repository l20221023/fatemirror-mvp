export function ResultFactsCard({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-black/10 p-6">
      <p className="text-sm text-[color:var(--color-muted)]">{title}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <div key={`${item.label}-${item.value}`} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-[color:var(--color-muted)]">{item.label}</p>
            <p className="mt-2 text-lg text-[color:var(--color-foreground)]">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
