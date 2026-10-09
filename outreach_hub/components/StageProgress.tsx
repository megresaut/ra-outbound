import { cn } from "@/lib/utils";
import { Stage, STAGE_ORDER, STAGE_LABEL } from "@/lib/prospects";

export function StageProgress({ current }: { current: Stage }) {
  const isLost = current === "closed_lost";
  const currentIdx = STAGE_ORDER.indexOf(current);

  return (
    <div className="flex items-center gap-1">
      {STAGE_ORDER.map((s, i) => {
        const reached = !isLost && i <= currentIdx;
        const isCurrent = !isLost && i === currentIdx;
        return (
          <div key={s} className="flex flex-1 flex-col items-stretch gap-1.5">
            <div
              className={cn(
                "h-[3px] rounded-full transition-colors",
                reached
                  ? "bg-emerald-400/80"
                  : "bg-white/[0.06]",
                isCurrent && "bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.4)]"
              )}
            />
            <span
              className={cn(
                "truncate text-[10px] uppercase tracking-wider",
                reached ? "text-emerald-200/80" : "text-white/30",
                isCurrent && "text-emerald-100"
              )}
            >
              {STAGE_LABEL[s]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
