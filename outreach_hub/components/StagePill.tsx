import { cn } from "@/lib/utils";
import { Stage, STAGE_LABEL } from "@/lib/prospects";

const STYLES: Record<Stage, { dot: string; text: string; bg: string }> = {
  researched: {
    dot: "bg-zinc-400",
    text: "text-zinc-300",
    bg: "bg-white/[0.04] border-white/[0.08]",
  },
  pain_mapped: {
    dot: "bg-sky-400",
    text: "text-sky-200",
    bg: "bg-sky-500/[0.06] border-sky-400/20",
  },
  demo_built: {
    dot: "bg-violet-400",
    text: "text-violet-200",
    bg: "bg-violet-500/[0.06] border-violet-400/20",
  },
  email_drafted: {
    dot: "bg-amber-400",
    text: "text-amber-200",
    bg: "bg-amber-500/[0.06] border-amber-400/20",
  },
  email_sent: {
    dot: "bg-emerald-400",
    text: "text-emerald-200",
    bg: "bg-emerald-500/[0.06] border-emerald-400/20",
  },
  replied: {
    dot: "bg-emerald-300",
    text: "text-emerald-100",
    bg: "bg-emerald-500/[0.10] border-emerald-300/30",
  },
  meeting_booked: {
    dot: "bg-emerald-200",
    text: "text-white",
    bg: "bg-emerald-400/[0.16] border-emerald-300/40",
  },
  closed_lost: {
    dot: "bg-zinc-600",
    text: "text-zinc-500",
    bg: "bg-white/[0.02] border-white/[0.06]",
  },
};

export function StagePill({ stage, size = "sm" }: { stage: Stage; size?: "sm" | "md" }) {
  const s = STYLES[stage];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        s.bg,
        s.text,
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {STAGE_LABEL[stage]}
    </span>
  );
}
