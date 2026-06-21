export function InterpretationStatus({
  status,
}: {
  status: "idle" | "loading" | "success" | "error";
}) {
  if (status === "success" || status === "idle") {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4 text-sm text-[color:var(--color-muted)]"
    >
      {status === "loading"
        ? "扩展解读生成中，基础计算结果已先显示。"
        : "扩展解读暂时不可用，基础计算结果不受影响。"}
    </div>
  );
}
