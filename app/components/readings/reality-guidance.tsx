export function RealityGuidance({
  traditional,
  reality,
  caution,
  labels,
}: {
  traditional: string;
  reality: string;
  caution: string;
  labels?: {
    traditional: string;
    reality: string;
    caution: string;
  };
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <Block title={labels?.traditional ?? "传统视角"} text={traditional} />
      <Block title={labels?.reality ?? "现实提示"} text={reality} />
      <Block title={labels?.caution ?? "需要注意"} text={caution} />
    </section>
  );
}

function Block({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
      <p className="text-sm text-[color:var(--color-muted)]">{title}</p>
      <p className="mt-3 text-sm leading-7 text-[color:var(--color-foreground)]">{text}</p>
    </article>
  );
}
