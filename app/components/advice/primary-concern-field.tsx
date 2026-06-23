type PrimaryConcernFieldProps = {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  hasError?: boolean;
};

export function PrimaryConcernField({
  label,
  value,
  options,
  onChange,
  hasError,
}: PrimaryConcernFieldProps) {
  return (
    <label className="block">
      <span className="mb-3 block text-sm text-[color:var(--color-muted)]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={hasError || undefined}
        className={`min-h-11 w-full rounded-[1rem] border bg-black/15 px-4 py-3 text-sm outline-none ${
          hasError
            ? "border-[color:rgba(196,155,98,0.48)]"
            : "border-white/12 focus:border-[color:var(--color-accent)]"
        }`}
      >
        <option value="" disabled>
          -
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
