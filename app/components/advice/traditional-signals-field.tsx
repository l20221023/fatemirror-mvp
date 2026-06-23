type TraditionalSignalRow = {
  source: string;
  summary: string;
};

type TraditionalSignalsFieldProps = {
  title: string;
  hint: string;
  sourceLabel: string;
  summaryLabel: string;
  summaryPlaceholder: string;
  addLabel: string;
  removeLabel: string;
  sourceOptions: Array<{ value: string; label: string }>;
  items: TraditionalSignalRow[];
  canAdd: boolean;
  hasError?: boolean;
  onAdd: () => void;
  onChange: (index: number, value: TraditionalSignalRow) => void;
  onRemove: (index: number) => void;
};

export function TraditionalSignalsField({
  title,
  hint,
  sourceLabel,
  summaryLabel,
  summaryPlaceholder,
  addLabel,
  removeLabel,
  sourceOptions,
  items,
  canAdd,
  hasError,
  onAdd,
  onChange,
  onRemove,
}: TraditionalSignalsFieldProps) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm text-[color:var(--color-muted)]">{title}</p>
        <p className="mt-2 text-xs leading-6 text-[color:var(--color-muted)]">
          {hint}
        </p>
      </div>

      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={`traditional-signal-${index}`}
              className="rounded-[1.25rem] border border-white/10 bg-black/10 p-4"
            >
              <div className="grid gap-4 sm:grid-cols-[0.38fr_0.62fr]">
                <label className="block">
                  <span className="mb-2 block text-xs text-[color:var(--color-muted)]">
                    {sourceLabel}
                  </span>
                  <select
                    value={item.source}
                    onChange={(event) =>
                      onChange(index, {
                        ...item,
                        source: event.target.value,
                      })
                    }
                    className="min-h-11 w-full rounded-[1rem] border border-white/12 bg-black/15 px-4 py-3 text-sm outline-none focus:border-[color:var(--color-accent)]"
                  >
                    {sourceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs text-[color:var(--color-muted)]">
                    {summaryLabel}
                  </span>
                  <input
                    value={item.summary}
                    onChange={(event) =>
                      onChange(index, {
                        ...item,
                        summary: event.target.value,
                      })
                    }
                    placeholder={summaryPlaceholder}
                    aria-invalid={hasError || undefined}
                    className={`min-h-11 w-full rounded-[1rem] border bg-black/15 px-4 py-3 text-sm outline-none ${
                      hasError
                        ? "border-[color:rgba(196,155,98,0.48)]"
                        : "border-white/12 focus:border-[color:var(--color-accent)]"
                    }`}
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={() => onRemove(index)}
                className="mt-4 inline-flex min-h-11 items-center rounded-full border border-white/12 px-4 text-sm text-[color:var(--color-muted)] transition hover:border-white/24 hover:text-[color:var(--color-foreground)]"
              >
                {removeLabel}
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={onAdd}
        disabled={!canAdd}
        className="inline-flex min-h-11 items-center rounded-full border border-white/12 px-5 py-2.5 text-sm text-[color:var(--color-foreground)] transition hover:border-white/24 hover:bg-white/6 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {addLabel}
      </button>
    </section>
  );
}
