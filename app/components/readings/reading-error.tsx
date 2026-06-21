export function ReadingError({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-[color:rgba(196,155,98,0.28)] bg-[rgba(196,155,98,0.08)] p-5">
      <p className="text-sm text-[color:var(--color-foreground)]">{title}</p>
      <p className="mt-2 text-sm leading-7 text-[color:var(--color-muted)]">{message}</p>
    </div>
  );
}
