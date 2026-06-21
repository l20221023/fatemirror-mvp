export function ResultSummary({
  sentence,
}: {
  sentence: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-[color:rgba(196,155,98,0.2)] bg-[rgba(196,155,98,0.08)] p-6">
      <p className="text-sm leading-7 text-[color:var(--color-foreground)]">{sentence}</p>
    </div>
  );
}
