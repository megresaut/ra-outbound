"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, CheckCircle2, Loader2, RotateCcw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WorkflowStage {
  key: string;
  label: string;
  detail: string;
  icon: React.ElementType;
  durationMs: number;
  /** Lines to log while this stage runs. Each emits at evenly spaced intervals. */
  log: Array<{ text: string; type?: "info" | "success" | "warn" }>;
  /** Progress milestones to drive the per-stage % indicator (0-100). Inferred from log count if omitted. */
  milestones?: number[];
}

export interface SummaryStat {
  label: string;
  value: number;
  total?: number;
  suffix?: string;
  accent?: boolean;
  warn?: boolean;
}

interface Props {
  /** Title above the run button (e.g. "Quarterly vendor pool refresh"). */
  title: string;
  /** Sub-text under the title (e.g. "Last run: Jan 14 · Next scheduled: Apr 15"). */
  schedule: string;
  stages: WorkflowStage[];
  /** Stats to show in the summary panel. `value` is the FINAL value after run completes; the panel animates from 0. */
  summary: SummaryStat[];
  /** Footer line shown when complete (e.g. "Run time: 7.4s · Equivalent manual: ~4 hours"). */
  completionFootnote: string;
  /** Optional callout to render between summary and any extra UI when phase === "review". */
  reviewCallout?: React.ReactNode;
  /** Renders below the runner once the run completes. Pass anything you want to show as the result. */
  resultPanel?: React.ReactNode;
}

export function WorkflowRunner({
  title,
  schedule,
  stages,
  summary,
  completionFootnote,
  reviewCallout,
  resultPanel,
}: Props) {
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [currentStage, setCurrentStage] = useState(-1);
  const [stageProgress, setStageProgress] = useState<Record<string, number>>({});
  const [logLines, setLogLines] = useState<
    Array<{ id: number; text: string; type: "info" | "success" | "warn" }>
  >([]);
  const [summaryProgress, setSummaryProgress] = useState(0); // 0..1
  const logIdRef = useRef(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  const totalDuration = stages.reduce((s, st) => s + st.durationMs, 0);

  const log = (text: string, type: "info" | "success" | "warn" = "info") => {
    setLogLines((prev) =>
      [...prev, { id: ++logIdRef.current, text, type }].slice(-40)
    );
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [logLines]);

  const run = async () => {
    if (running) return;
    setRunning(true);
    setCompleted(false);
    setCurrentStage(0);
    setStageProgress({});
    setLogLines([]);
    setSummaryProgress(0);

    log(`Run started · ${new Date().toLocaleTimeString()}`);

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      setCurrentStage(i);

      const lines = stage.log;
      const milestones =
        stage.milestones ??
        lines.map((_, idx) => Math.round(((idx + 1) / lines.length) * 100));
      const interval = stage.durationMs / Math.max(lines.length, 1);

      for (let k = 0; k < lines.length; k++) {
        await sleep(interval);
        log(lines[k].text, lines[k].type ?? "info");
        setStageProgress((p) => ({ ...p, [stage.key]: milestones[k] ?? 100 }));
        // Animate summary stats from 0 to final value as the run progresses
        const overall =
          (i + (k + 1) / lines.length) / stages.length;
        setSummaryProgress(overall);
      }
    }

    setCurrentStage(stages.length);
    setSummaryProgress(1);
    setRunning(false);
    setCompleted(true);
    log(`Run complete`, "success");
  };

  const reset = () => {
    setRunning(false);
    setCompleted(false);
    setCurrentStage(-1);
    setStageProgress({});
    setLogLines([]);
    setSummaryProgress(0);
  };

  const stageStatus = (i: number) => {
    if (currentStage === -1) return "idle" as const;
    if (i < currentStage) return "complete" as const;
    if (i === currentStage && running) return "running" as const;
    if (i === currentStage && !running && completed) return "complete" as const;
    return "idle" as const;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border-subtle bg-bg-raised overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between gap-4 border-b border-border-subtle">
          <div className="min-w-0">
            <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-0.5">
              Automation
            </div>
            <div className="text-sm font-medium text-text-primary">{title}</div>
            <div className="text-xs text-text-tertiary mt-0.5">{schedule}</div>
          </div>
          <div className="flex gap-2">
            {completed && (
              <button
                onClick={reset}
                className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-bg-subtle hover:bg-black/[0.04] text-sm text-text-secondary transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            )}
            <button
              onClick={run}
              disabled={running}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                running
                  ? "bg-bg-subtle text-text-tertiary cursor-not-allowed"
                  : "bg-accent text-white hover:bg-accent-bright shadow-lg shadow-accent/20"
              )}
            >
              {running ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running…
                </>
              ) : completed ? (
                <>
                  <Play className="h-4 w-4" />
                  Run again
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run automation
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-bg-subtle relative overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-accent"
            animate={{
              width: `${
                currentStage === -1
                  ? 0
                  : completed
                  ? 100
                  : ((currentStage +
                      (stageProgress[stages[currentStage]?.key] ?? 0) / 100) /
                      stages.length) *
                    100
              }%`,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>

        <div className="divide-y divide-border-subtle">
          {stages.map((stage, i) => {
            const status = stageStatus(i);
            const Icon = stage.icon;
            const progress = stageProgress[stage.key] ?? 0;
            return (
              <div key={stage.key} className="px-5 py-3 flex items-center gap-3">
                <div
                  className={cn(
                    "h-7 w-7 rounded-md flex items-center justify-center shrink-0 transition-colors",
                    status === "complete" &&
                      "bg-status-success/10 text-status-success",
                    status === "running" && "bg-accent-glow text-accent-bright",
                    status === "idle" && "bg-bg-subtle text-text-tertiary"
                  )}
                >
                  {status === "complete" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : status === "running" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      "text-sm transition-colors",
                      status === "idle"
                        ? "text-text-tertiary"
                        : "text-text-primary"
                    )}
                  >
                    {stage.label}
                  </div>
                  <div className="text-2xs text-text-tertiary truncate">
                    {stage.detail}
                  </div>
                </div>
                {status === "running" && (
                  <div className="text-2xs tabular text-accent shrink-0">
                    {Math.round(progress)}%
                  </div>
                )}
                {status === "complete" && (
                  <div className="text-2xs text-status-success shrink-0">
                    done
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border-subtle bg-bg-base overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border-subtle bg-bg-raised flex items-center justify-between">
            <div className="text-2xs uppercase tracking-wider text-text-tertiary">
              Console
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "status-dot",
                  running
                    ? "bg-accent"
                    : completed
                    ? "bg-status-success"
                    : "bg-text-dim"
                )}
              />
              <span className="text-2xs text-text-tertiary">
                {running ? "live" : completed ? "completed" : "idle"}
              </span>
            </div>
          </div>
          <div className="p-4 font-mono text-xs h-72 overflow-auto leading-relaxed">
            {logLines.length === 0 ? (
              <div className="text-text-dim italic">
                Press "Run automation" to start.
              </div>
            ) : (
              logLines.map((line) => (
                <motion.div
                  key={line.id}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "tabular",
                    line.type === "success" && "text-status-success",
                    line.type === "warn" && "text-status-warning",
                    line.type === "info" && "text-text-secondary"
                  )}
                >
                  {line.text}
                </motion.div>
              ))
            )}
            <div ref={logEndRef} />
          </div>
        </div>

        <div className="rounded-lg border border-border-subtle bg-bg-raised overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border-subtle">
            <div className="text-2xs uppercase tracking-wider text-text-tertiary">
              Run summary
            </div>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4 h-72 content-start">
            {summary.map((s) => (
              <SummaryStatCell
                key={s.label}
                stat={s}
                progress={summaryProgress}
              />
            ))}
            <div className="col-span-2 mt-2 pt-4 border-t border-border-subtle">
              <AnimatePresence mode="wait">
                {completed ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-1"
                  >
                    <div className="text-xs text-text-tertiary">Run time</div>
                    <div className="font-display text-2xl text-accent-bright tabular">
                      {(totalDuration / 1000).toFixed(1)}s
                    </div>
                    <div className="text-2xs text-text-tertiary">
                      {completionFootnote}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="pending"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-text-tertiary"
                  >
                    Run completes in {(totalDuration / 1000).toFixed(0)}s.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {completed && reviewCallout && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-accent-border bg-accent-glow/30 p-4 flex items-start gap-3"
        >
          <AlertCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
          <div className="text-sm text-text-secondary leading-relaxed flex-1">
            {reviewCallout}
          </div>
        </motion.div>
      )}

      {completed && resultPanel}
    </div>
  );
}

function SummaryStatCell({
  stat,
  progress,
}: {
  stat: SummaryStat;
  progress: number;
}) {
  const animated = Math.round(stat.value * progress);
  return (
    <div>
      <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-1">
        {stat.label}
      </div>
      <div
        className={cn(
          "font-display text-3xl tabular",
          stat.accent && "text-accent-bright",
          stat.warn && "text-status-warning",
          !stat.accent && !stat.warn && "text-text-primary"
        )}
      >
        {animated}
        {stat.total !== undefined && (
          <span className="text-text-dim text-lg"> / {stat.total}</span>
        )}
        {stat.suffix && <span className="text-text-dim text-lg">{stat.suffix}</span>}
      </div>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
