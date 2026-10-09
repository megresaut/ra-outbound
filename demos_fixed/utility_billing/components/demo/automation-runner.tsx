"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RotateCcw,
  Globe,
  FileText,
  Link2,
  Calculator,
  Database,
} from "lucide-react";
import {
  ACCOUNTS,
  projectedStatements,
  PROVIDER_TOTAL,
  FLAGGED_COUNT,
  MATCHED_COUNT,
  type PulledStatement,
} from "@/lib/automation";
import { cn, formatUSDPrecise } from "@/lib/utils";

type StageStatus = "idle" | "running" | "complete";

type Stage = {
  key: "connect" | "scrape" | "parse" | "match" | "compute" | "post";
  label: string;
  detail: string;
  icon: React.ElementType;
  durationMs: number;
};

const STAGES: Stage[] = [
  {
    key: "connect",
    label: "Connecting to provider portals",
    detail: "",
    icon: Globe,
    durationMs: 2200,
  },
  {
    key: "scrape",
    label: "Pulling May statements",
    detail: "",
    icon: FileText,
    durationMs: 2600,
  },
  {
    key: "parse",
    label: "Parsing PDFs · line items, dates, totals",
    detail: "Each statement reduced to structured rows",
    icon: FileText,
    durationMs: 1600,
  },
  {
    key: "match",
    label: "Matching statements to residences",
    detail: "By account number, service address, and rolling baseline",
    icon: Link2,
    durationMs: 1800,
  },
  {
    key: "compute",
    label: "Computing pass-through totals + 7.5% management fee",
    detail: "Per residence · ready for owner statement draft",
    icon: Calculator,
    durationMs: 1200,
  },
  {
    key: "post",
    label: "Posting to the owner ledger",
    detail: "Atomic write · audit trail captured",
    icon: Database,
    durationMs: 1400,
  },
];

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function AutomationRunner() {
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [currentStage, setCurrentStage] = useState(-1);
  const [stageProgress, setStageProgress] = useState<Record<string, number>>({});
  const [logLines, setLogLines] = useState<
    Array<{ id: number; text: string; type: "info" | "success" | "warn" }>
  >([]);
  const [posted, setPosted] = useState<PulledStatement[]>([]);
  const logIdRef = useRef(0);
  const consoleScrollRef = useRef<HTMLDivElement>(null);

  const allStmts = projectedStatements();
  const matched = allStmts.filter((s) => s.status === "matched");
  const flagged = allStmts.filter((s) => s.status === "flagged");
  const totalDurationMs = STAGES.reduce((s, x) => s + x.durationMs, 0);

  const providers = Array.from(new Set(ACCOUNTS.map((a) => a.provider)));

  const log = (text: string, type: "info" | "success" | "warn" = "info") => {
    setLogLines((prev) =>
      [...prev, { id: ++logIdRef.current, text, type }].slice(-60),
    );
  };

  useEffect(() => {
    const el = consoleScrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logLines]);

  const run = async () => {
    if (running) return;
    setRunning(true);
    setCompleted(false);
    setCurrentStage(0);
    setStageProgress({});
    setLogLines([]);
    setPosted([]);

    log(`Run started · ${new Date().toLocaleTimeString()}`);
    log(`Portfolio · 6 residences · ${PROVIDER_TOTAL} provider accounts`);

    for (let i = 0; i < STAGES.length; i++) {
      const stage = STAGES[i];
      setCurrentStage(i);

      if (stage.key === "connect") {
        for (let p = 0; p < providers.length; p++) {
          await sleep(stage.durationMs / providers.length);
          log(`  ✓ Authenticated · ${providers[p]}`, "success");
          setStageProgress((sp) => ({
            ...sp,
            [stage.key]: ((p + 1) / providers.length) * 100,
          }));
        }
      } else if (stage.key === "scrape") {
        const batches = 5;
        for (let b = 0; b < batches; b++) {
          await sleep(stage.durationMs / batches);
          const seen = Math.min(
            Math.ceil(((b + 1) / batches) * PROVIDER_TOTAL),
            PROVIDER_TOTAL,
          );
          log(`  · Pulled ${seen}/${PROVIDER_TOTAL} statements`);
          setStageProgress((sp) => ({
            ...sp,
            [stage.key]: (seen / PROVIDER_TOTAL) * 100,
          }));
        }
      } else if (stage.key === "parse") {
        for (const m of [25, 55, 85, 100]) {
          await sleep(stage.durationMs / 4);
          log(
            `  · Parsed ${m}% (${Math.floor((PROVIDER_TOTAL * m) / 100)} statements)`,
          );
          setStageProgress((sp) => ({ ...sp, [stage.key]: m }));
        }
      } else if (stage.key === "match") {
        await sleep(stage.durationMs * 0.55);
        log(`  ✓ ${MATCHED_COUNT} statements matched to residences`, "success");
        setStageProgress((sp) => ({ ...sp, [stage.key]: 70 }));
        await sleep(stage.durationMs * 0.45);
        for (const f of flagged) {
          log(
            `  ! Flagged · ${f.provider} (${f.residenceName}) — ${f.flagReason ?? "anomaly"}`,
            "warn",
          );
        }
        setStageProgress((sp) => ({ ...sp, [stage.key]: 100 }));
      } else if (stage.key === "compute") {
        for (const m of [40, 80, 100]) {
          await sleep(stage.durationMs / 3);
          log(`  · Rolled up ${Math.round((m / 100) * 6)} residences`);
          setStageProgress((sp) => ({ ...sp, [stage.key]: m }));
        }
        log(`  ✓ Management fee computed at 7.5%`, "success");
      } else if (stage.key === "post") {
        const chunks = 5;
        for (let c = 0; c < chunks; c++) {
          await sleep(stage.durationMs / chunks);
          const cap = Math.min(
            Math.ceil(((c + 1) / chunks) * matched.length),
            matched.length,
          );
          log(`  · Posted ${cap}/${matched.length} to owner ledger`);
          setStageProgress((sp) => ({
            ...sp,
            [stage.key]: (cap / matched.length) * 100,
          }));
          setPosted(matched.slice(0, cap));
        }
      }
    }

    setCurrentStage(STAGES.length);
    log(
      `Run complete · ${MATCHED_COUNT} posted · ${FLAGGED_COUNT} flagged`,
      "success",
    );
    setRunning(false);
    setCompleted(true);
  };

  const reset = () => {
    setRunning(false);
    setCompleted(false);
    setCurrentStage(-1);
    setStageProgress({});
    setLogLines([]);
    setPosted([]);
  };

  const stageStatus = (i: number): StageStatus => {
    if (currentStage === -1) return "idle";
    if (i < currentStage) return "complete";
    if (i === currentStage && running) return "running";
    if (i === currentStage && !running && completed) return "complete";
    return "idle";
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border-subtle bg-bg-raised overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between gap-4 border-b border-border-subtle">
          <div className="min-w-0">
            <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-0.5">
              Automation · Monthly billing pull
            </div>
            <div className="text-sm font-medium text-text-primary">
              Pull statements · match · post to owner ledger
            </div>
            <div className="text-xs text-text-tertiary mt-0.5">
              Last run: May 9, 7:02 AM PT · Next scheduled: Jun 9, 7:00 AM PT
            </div>
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
                  : "bg-accent text-white hover:bg-accent-bright shadow-lg shadow-accent/20",
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
                        (stageProgress[STAGES[currentStage]?.key] ?? 0) / 100) /
                        STAGES.length) *
                      100
              }%`,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>

        {/* Stage list */}
        <div className="divide-y divide-border-subtle">
          {STAGES.map((stage, i) => {
            const status = stageStatus(i);
            const Icon = stage.icon;
            const progress = stageProgress[stage.key] ?? 0;
            const detail =
              stage.key === "connect"
                ? `${providers.length} providers · ${providers.slice(0, 5).join(", ")}…`
                : stage.key === "scrape"
                  ? `${PROVIDER_TOTAL} statements expected`
                  : stage.detail;
            return (
              <div key={stage.key} className="px-5 py-3 flex items-center gap-3">
                <div
                  className={cn(
                    "h-7 w-7 rounded-md flex items-center justify-center shrink-0 transition-colors",
                    status === "complete" &&
                      "bg-status-success/10 text-status-success",
                    status === "running" && "bg-accent-glow text-accent-bright",
                    status === "idle" && "bg-bg-subtle text-text-tertiary",
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
                      status === "idle" ? "text-text-tertiary" : "text-text-primary",
                    )}
                  >
                    {stage.label}
                  </div>
                  <div className="text-2xs text-text-tertiary truncate">
                    {detail}
                  </div>
                </div>
                {status === "running" && (
                  <div className="text-2xs tabular text-accent-bright shrink-0">
                    {Math.round(progress)}%
                  </div>
                )}
                {status === "complete" && (
                  <div className="text-2xs text-status-success shrink-0">done</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Console + summary split */}
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
                      : "bg-text-dim",
                )}
              />
              <span className="text-2xs text-text-tertiary">
                {running ? "live" : completed ? "completed" : "idle"}
              </span>
            </div>
          </div>
          <div
            ref={consoleScrollRef}
            className="p-4 font-mono text-xs h-80 overflow-y-auto overscroll-contain leading-relaxed"
          >
            {logLines.length === 0 ? (
              <div className="text-text-dim italic">
                Press "Run automation" to start. The run hits 20 provider
                portals across 6 residences and finishes in about 11 seconds.
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
                    line.type === "info" && "text-text-secondary",
                  )}
                >
                  {line.text}
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border-subtle bg-bg-raised overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border-subtle">
            <div className="text-2xs uppercase tracking-wider text-text-tertiary">
              Run summary
            </div>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4 h-80 content-start">
            <SummaryStat
              label="Providers hit"
              value={
                running || completed
                  ? Math.min(
                      Math.round(
                        ((stageProgress["connect"] ?? 0) / 100) * providers.length,
                      ),
                      providers.length,
                    )
                  : 0
              }
              total={providers.length}
            />
            <SummaryStat
              label="Statements pulled"
              value={
                running || completed
                  ? Math.min(
                      Math.round(
                        ((stageProgress["scrape"] ?? 0) / 100) * PROVIDER_TOTAL,
                      ),
                      PROVIDER_TOTAL,
                    )
                  : 0
              }
              total={PROVIDER_TOTAL}
            />
            <SummaryStat
              label="Posted to ledger"
              value={posted.length}
              total={MATCHED_COUNT}
              accent
            />
            <SummaryStat
              label="Flagged for review"
              value={completed ? FLAGGED_COUNT : 0}
              total={FLAGGED_COUNT}
              warn
            />
            <div className="col-span-2 mt-1 pt-4 border-t border-border-subtle">
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
                      {(totalDurationMs / 1000).toFixed(1)}s
                    </div>
                    <div className="text-2xs text-text-tertiary">
                      Equivalent manual work: roughly 6 hours of senior
                      bookkeeper time
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="pending"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-text-tertiary"
                  >
                    Run completes in about {Math.round(totalDurationMs / 1000)}{" "}
                    seconds. Manual equivalent: ~6 hours of senior bookkeeper
                    time.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Streamed statements table */}
      {(running || completed) && posted.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-border-subtle bg-bg-raised overflow-hidden"
        >
          <div className="px-5 py-3 border-b border-border-subtle flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-text-primary">
                Posted statements
              </div>
              <div className="text-2xs text-text-tertiary">
                Streaming live · each row written atomically to the ledger
              </div>
            </div>
            <div className="text-2xs text-text-tertiary tabular">
              {posted.length} of {MATCHED_COUNT}
            </div>
          </div>
          <div className="max-h-96 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg-subtle/60 sticky top-0 backdrop-blur-sm">
                <tr className="text-2xs uppercase tracking-wider text-text-tertiary">
                  <th className="text-left px-5 py-2 font-normal">Provider</th>
                  <th className="text-left px-3 py-2 font-normal w-24">
                    Category
                  </th>
                  <th className="text-left px-3 py-2 font-normal">Residence</th>
                  <th className="text-right px-5 py-2 font-normal w-28">
                    Amount
                  </th>
                  <th className="text-right px-5 py-2 font-normal w-24">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {posted.map((s, i) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.02, 0.5) }}
                    className="hover:bg-black/[0.025]"
                  >
                    <td className="px-5 py-2 text-text-primary">{s.provider}</td>
                    <td className="px-3 py-2 text-text-tertiary text-xs">
                      {s.category}
                    </td>
                    <td className="px-3 py-2 text-text-secondary">
                      {s.residenceName}
                    </td>
                    <td className="px-5 py-2 text-right text-text-primary tabular">
                      {formatUSDPrecise(s.amountCents)}
                    </td>
                    <td className="px-5 py-2 text-right">
                      <span className="inline-flex items-center gap-1.5 text-2xs text-status-success">
                        <CheckCircle2 className="h-3 w-3" />
                        Posted
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Flagged */}
      {completed && flagged.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-status-warning/30 bg-status-warning/5 overflow-hidden"
        >
          <div className="px-5 py-3 border-b border-status-warning/20 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-status-warning" />
            <div className="text-sm font-medium text-text-primary">
              {flagged.length} statements flagged for review
            </div>
            <span className="ml-auto text-2xs text-text-tertiary">
              Queued for the estate manager · not posted automatically
            </span>
          </div>
          <div className="divide-y divide-border-subtle">
            {flagged.map((s) => (
              <div
                key={s.id}
                className="px-5 py-2.5 flex items-center gap-4 text-sm"
              >
                <span className="text-text-secondary tabular">
                  {s.provider}
                </span>
                <span className="text-text-primary flex-1">
                  {s.residenceName}{" "}
                  <span className="text-text-tertiary">· {s.category}</span>
                </span>
                <span className="text-text-secondary tabular">
                  {formatUSDPrecise(s.amountCents)}
                </span>
                <span className="text-2xs text-text-tertiary italic max-w-[260px] truncate">
                  {s.flagReason}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function SummaryStat({
  label,
  value,
  total,
  accent,
  warn,
}: {
  label: string;
  value: number;
  total?: number;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div>
      <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-1">
        {label}
      </div>
      <div
        className={cn(
          "font-display text-3xl tabular",
          accent && "text-accent-bright",
          warn && "text-status-warning",
          !accent && !warn && "text-text-primary",
        )}
      >
        {value}
        {total !== undefined && (
          <span className="text-text-dim text-lg"> / {total}</span>
        )}
      </div>
    </div>
  );
}
