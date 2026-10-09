"use client";

import { useState, useRef, useEffect } from "react";
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
  Database,
} from "lucide-react";
import { demoConfig } from "@/config/demo.config";
import {
  generateUtilityStatements,
  type UtilityStatement,
} from "@/lib/fake-data";
import { cn } from "@/lib/utils";

type StageStatus = "idle" | "running" | "complete" | "error";

interface Stage {
  key: string;
  label: string;
  detail: string;
  icon: React.ElementType;
  durationMs: number;
}

export function AutomationRunner() {
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [currentStage, setCurrentStage] = useState(-1);
  const [stageProgress, setStageProgress] = useState<Record<string, number>>({});
  const [logLines, setLogLines] = useState<
    Array<{ id: number; text: string; type: "info" | "success" | "warn" }>
  >([]);
  const [processedStmts, setProcessedStmts] = useState<UtilityStatement[]>([]);
  const logIdRef = useRef(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  const utilities = demoConfig.details.utilities ?? [
    "City Water",
    "Electric Co",
    "Gas Service",
  ];
  const pms = demoConfig.details.propertyManagementSystem ?? "your existing systems";
  const labelOverrides = demoConfig.workflow.runnerLabels ?? {};
  const allStmts = generateUtilityStatements();

  const stageDefaults = {
    connect: {
      label: "Connecting to utility portals",
      detail: `${utilities.length} providers · ${utilities.join(", ")}`,
    },
    scrape: {
      label: "Pulling latest statements",
      detail: `${allStmts.length} statements available`,
    },
    parse: {
      label: "Parsing statement PDFs",
      detail: "Extracting line items, dates, amounts",
    },
    match: {
      label: "Matching to units",
      detail: `${demoConfig.scale.units} units · ${demoConfig.scale.properties} properties`,
    },
    post: {
      label: `Posting to ${pms}`,
      detail: "Atomic with rollback on failure",
    },
  } as const;

  const merge = (key: keyof typeof stageDefaults) => ({
    label: labelOverrides[key]?.label ?? stageDefaults[key].label,
    detail: labelOverrides[key]?.detail ?? stageDefaults[key].detail,
  });

  const stages: Stage[] = [
    { key: "connect", ...merge("connect"), icon: Globe, durationMs: 1800 },
    { key: "scrape", ...merge("scrape"), icon: FileText, durationMs: 2400 },
    { key: "parse", ...merge("parse"), icon: FileText, durationMs: 1600 },
    { key: "match", ...merge("match"), icon: Link2, durationMs: 2000 },
    { key: "post", ...merge("post"), icon: Database, durationMs: 1400 },
  ];

  const manualEquivalentHours =
    demoConfig.details.mathBreakdown?.manualEquivalentHours ?? 6.5;

  const totalDuration = stages.reduce((sum, s) => sum + s.durationMs, 0);

  const log = (text: string, type: "info" | "success" | "warn" = "info") => {
    setLogLines((prev) => [
      ...prev,
      { id: ++logIdRef.current, text, type },
    ].slice(-40));
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
    setProcessedStmts([]);

    log(`Run started · ${new Date().toLocaleTimeString()}`);
    log(`Target: ${demoConfig.company.name}`);

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      setCurrentStage(i);

      // Stage-specific log messages
      if (stage.key === "connect") {
        for (const u of utilities) {
          await sleep(stage.durationMs / utilities.length);
          log(`  ✓ Authenticated · ${u}`, "success");
          setStageProgress((p) => ({
            ...p,
            [stage.key]: ((utilities.indexOf(u) + 1) / utilities.length) * 100,
          }));
        }
      } else if (stage.key === "scrape") {
        const total = allStmts.length;
        const batches = 6;
        const perBatch = Math.ceil(total / batches);
        for (let b = 0; b < batches; b++) {
          await sleep(stage.durationMs / batches);
          const seen = Math.min((b + 1) * perBatch, total);
          log(`  · Pulled ${seen}/${total} statements`);
          setStageProgress((p) => ({ ...p, [stage.key]: (seen / total) * 100 }));
        }
      } else if (stage.key === "parse") {
        const milestones = [25, 50, 75, 100];
        for (const m of milestones) {
          await sleep(stage.durationMs / milestones.length);
          log(`  · Parsed ${m}% (${Math.floor((allStmts.length * m) / 100)} statements)`);
          setStageProgress((p) => ({ ...p, [stage.key]: m }));
        }
      } else if (stage.key === "match") {
        const matched = allStmts.length - 3;
        await sleep(stage.durationMs * 0.6);
        log(`  ✓ ${matched} statements matched to units`, "success");
        setStageProgress((p) => ({ ...p, [stage.key]: 80 }));
        await sleep(stage.durationMs * 0.4);
        log(`  ! 3 statements flagged — address mismatch, queued for review`, "warn");
        setStageProgress((p) => ({ ...p, [stage.key]: 100 }));
      } else if (stage.key === "post") {
        const matched = allStmts.length - 3;
        const chunks = 4;
        for (let c = 0; c < chunks; c++) {
          await sleep(stage.durationMs / chunks);
          const posted = Math.min((c + 1) * Math.ceil(matched / chunks), matched);
          log(`  · Posted ${posted}/${matched} · ${pms}`);
          setStageProgress((p) => ({ ...p, [stage.key]: (posted / matched) * 100 }));
          // Stream statements into the table
          setProcessedStmts(allStmts.slice(0, posted));
        }
      }
    }

    setCurrentStage(stages.length);
    log(`Run complete · ${allStmts.length - 3} posted · 3 flagged`, "success");
    setRunning(false);
    setCompleted(true);
  };

  const reset = () => {
    setRunning(false);
    setCompleted(false);
    setCurrentStage(-1);
    setStageProgress({});
    setLogLines([]);
    setProcessedStmts([]);
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
      {/* Run button + meta */}
      <div className="rounded-lg border border-border-subtle bg-bg-raised overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between gap-4 border-b border-border-subtle">
          <div className="min-w-0">
            <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-0.5">
              Automation
            </div>
            <div className="text-sm font-medium text-text-primary">
              Monthly utility billing run
            </div>
            <div className="text-xs text-text-tertiary mt-0.5">
              Last run: today, 2:14 AM · Next scheduled: May 1, 2:00 AM
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
                  : ((currentStage + (stageProgress[stages[currentStage]?.key] ?? 0) / 100) /
                      stages.length) * 100
              }%`,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>

        {/* Stage list */}
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
                    status === "complete" && "bg-status-success/10 text-status-success",
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
                  <div className="text-2xs text-status-success shrink-0">done</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Log + results split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Console */}
        <div className="rounded-lg border border-border-subtle bg-bg-base overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border-subtle bg-bg-raised flex items-center justify-between">
            <div className="text-2xs uppercase tracking-wider text-text-tertiary">
              Console
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "status-dot",
                  running ? "bg-accent" : completed ? "bg-status-success" : "bg-text-dim"
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

        {/* Counter / outcome */}
        <div className="rounded-lg border border-border-subtle bg-bg-raised overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border-subtle">
            <div className="text-2xs uppercase tracking-wider text-text-tertiary">
              Run summary
            </div>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4 h-72 content-start">
            <SummaryStat
              label="Statements"
              value={running || completed ? processedStmts.length : 0}
              total={allStmts.length - 3}
            />
            <SummaryStat
              label="Posted to ledger"
              value={running || completed ? processedStmts.length : 0}
              total={allStmts.length - 3}
              accent
            />
            <SummaryStat
              label="Flagged for review"
              value={completed ? 3 : 0}
              total={3}
              warn
            />
            <SummaryStat
              label="Manual touches"
              value={completed ? 3 : 0}
              suffix={completed ? " of 47" : ""}
            />
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
                      Equivalent manual work: ~{manualEquivalentHours} hours
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
                    Manual equivalent: ~{manualEquivalentHours} hours of ops time.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Streamed statements table */}
      {(running || completed) && processedStmts.length > 0 && (
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
                Live as they post · click any row for full statement detail
              </div>
            </div>
            <div className="text-2xs text-text-tertiary tabular">
              {processedStmts.length} of {allStmts.length - 3}
            </div>
          </div>
          <div className="max-h-96 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg-subtle/50 sticky top-0 backdrop-blur-sm">
                <tr className="text-2xs uppercase tracking-wider text-text-tertiary">
                  <th className="text-left px-5 py-2 font-normal">Provider</th>
                  <th className="text-left px-5 py-2 font-normal">Property</th>
                  <th className="text-left px-5 py-2 font-normal">Tenant</th>
                  <th className="text-right px-5 py-2 font-normal">Amount</th>
                  <th className="text-right px-5 py-2 font-normal">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {processedStmts.slice(0, 20).map((s, i) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.02, 0.5) }}
                    className="hover:bg-black/[0.025]"
                  >
                    <td className="px-5 py-2 text-text-secondary">{s.provider}</td>
                    <td className="px-5 py-2 text-text-primary">
                      {s.property}{" "}
                      <span className="text-text-tertiary">· {s.unitNumber}</span>
                    </td>
                    <td className="px-5 py-2 text-text-secondary">{s.tenant}</td>
                    <td className="px-5 py-2 text-right text-text-primary tabular">
                      ${s.amount.toFixed(2)}
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

      {/* Error/flagged statements (only show when complete) */}
      {completed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-status-warning/30 bg-status-warning/5 overflow-hidden"
        >
          <div className="px-5 py-3 border-b border-status-warning/20 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-status-warning" />
            <div className="text-sm font-medium text-text-primary">
              3 statements flagged for review
            </div>
            <span className="ml-auto text-2xs text-text-tertiary">
              Address mismatch · queued for ops team
            </span>
          </div>
          <div className="divide-y divide-border-subtle">
            {allStmts.slice(allStmts.length - 3).map((s) => (
              <div key={s.id} className="px-5 py-2.5 flex items-center gap-4 text-sm">
                <span className="text-text-secondary tabular">{s.provider}</span>
                <span className="text-text-primary flex-1">
                  {s.property}{" "}
                  <span className="text-text-tertiary">· {s.unitNumber}</span>
                </span>
                <span className="text-text-secondary tabular">${s.amount.toFixed(2)}</span>
                <button
                  onClick={() =>
                    alert(
                      `Review · ${s.provider}\n\nProperty: ${s.property} ${s.unitNumber}\nTenant: ${s.tenant}\nAmount: $${s.amount.toFixed(2)}\nFlagged: address mismatch\n\nIn production: opens the original PDF + match candidates side-by-side.`
                    )
                  }
                  className="text-2xs text-accent hover:text-accent-bright"
                >
                  Review →
                </button>
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
  suffix = "",
  accent,
  warn,
}: {
  label: string;
  value: number;
  total?: number;
  suffix?: string;
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
          !accent && !warn && "text-text-primary"
        )}
      >
        {value}
        {total !== undefined && (
          <span className="text-text-dim text-lg"> / {total}</span>
        )}
        {suffix && <span className="text-text-dim text-lg">{suffix}</span>}
      </div>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
