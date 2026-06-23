type FactBoundariesProps = {
  title: string;
  observedTitle: string;
  assumptionsTitle: string;
  unknownTitle: string;
  emptyLabel: string;
  observedFacts: string[];
  userAssumptions: string[];
  unknownFacts: string[];
};

export function FactBoundaries({
  title,
  observedTitle,
  assumptionsTitle,
  unknownTitle,
  emptyLabel,
  observedFacts,
  userAssumptions,
  unknownFacts,
}: FactBoundariesProps) {
  const sections = [
    { title: observedTitle, items: observedFacts },
    { title: assumptionsTitle, items: userAssumptions },
    { title: unknownTitle, items: unknownFacts },
  ];

  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-black/10 p-6">
      <p className="text-sm text-[color:var(--color-muted)]">{title}</p>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {sections.map((section) => (
          <article
            key={section.title}
            className="rounded-[1.25rem] border border-white/8 bg-white/4 p-4"
          >
            <h3 className="text-sm text-[color:var(--color-foreground)]">
              {section.title}
            </h3>
            {section.items.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm leading-7 text-[color:var(--color-muted)]">
                {section.items.map((item) => (
                  <li key={`${section.title}-${item}`}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted)]">
                {emptyLabel}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
