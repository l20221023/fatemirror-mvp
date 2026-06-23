type KnownDetailsFieldProps = {
  label: string;
  hint: string;
  placeholder: string;
  removeLabel: string;
  addLabel: string;
  details: string[];
  canAdd: boolean;
  hasError?: boolean;
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
};

export function KnownDetailsField({
  label,
  hint,
  placeholder,
  removeLabel,
  addLabel,
  details,
  canAdd,
  hasError,
  onChange,
  onAdd,
  onRemove,
}: KnownDetailsFieldProps) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm text-[color:var(--color-muted)]">{label}</p>
        <p className="mt-2 text-xs leading-6 text-[color:var(--color-muted)]">
          {hint}
        </p>
      </div>

      <div className="space-y-3">
        {details.map((detail, index) => (
          <div key={`known-detail-${index}`} className="flex gap-3">
            <input
              value={detail}
              onChange={(event) => onChange(index, event.target.value)}
              placeholder={placeholder}
              aria-invalid={hasError || undefined}
              className={`min-h-11 flex-1 rounded-[1rem] border bg-black/15 px-4 py-3 text-sm outline-none ${
                hasError
                  ? "border-[color:rgba(196,155,98,0.48)]"
                  : "border-white/12 focus:border-[color:var(--color-accent)]"
              }`}
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="min-h-11 rounded-full border border-white/12 px-4 text-sm text-[color:var(--color-muted)] transition hover:border-white/24 hover:text-[color:var(--color-foreground)]"
            >
              {removeLabel}
            </button>
          </div>
        ))}
      </div>

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
