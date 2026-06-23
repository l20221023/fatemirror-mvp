type GenerationStatusProps = {
  title: string;
  label: string;
  description: string;
};

export function GenerationStatus({
  title,
  label,
  description,
}: GenerationStatusProps) {
  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-black/10 p-6">
      <p className="text-sm text-[color:var(--color-muted)]">{title}</p>
      <p className="mt-3 font-mono text-sm uppercase tracking-[0.16em] text-[color:var(--color-accent)]">
        {label}
      </p>
      <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted)]">
        {description}
      </p>
    </section>
  );
}
