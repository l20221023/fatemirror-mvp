type TraditionalPerspectiveProps = {
  title: string;
  hint: string;
  items: string[];
};

export function TraditionalPerspective({
  title,
  hint,
  items,
}: TraditionalPerspectiveProps) {
  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-black/10 p-6">
      <p className="text-sm text-[color:var(--color-muted)]">{title}</p>
      <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted)]">{hint}</p>
      <ul className="mt-4 space-y-2 text-sm leading-7 text-[color:var(--color-foreground)]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
