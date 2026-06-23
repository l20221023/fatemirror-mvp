type AdviceSubmitStateProps = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function AdviceSubmitState({
  message,
  actionLabel,
  onAction,
}: AdviceSubmitStateProps) {
  return (
    <div className="rounded-[1rem] border border-[color:rgba(196,155,98,0.28)] bg-[rgba(196,155,98,0.08)] px-4 py-4 text-sm text-[color:var(--color-foreground)]">
      <p>{message}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-3 inline-flex min-h-10 items-center rounded-full border border-white/12 px-4 text-sm text-[color:var(--color-foreground)] transition hover:border-white/24 hover:bg-white/6"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
