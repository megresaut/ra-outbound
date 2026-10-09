"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RotateCcw,
  Phone,
  Mail,
  FileText,
  MessageSquare,
  Server,
  Brain,
  UserCheck,
  Calendar,
  Send,
  Flame,
} from "lucide-react";
import { demoConfig } from "@/config/demo.config";
import { verticalPacks } from "@/config/verticals";
import { generateTickets, generateTechs, type Ticket } from "@/lib/fake-data";
import { cn } from "@/lib/utils";

const SOURCE_ICONS = {
  phone: Phone,
  form: FileText,
  email: Mail,
  platform: Server,
  sms: MessageSquare,
} as const;

type StageStatus = "idle" | "running" | "complete";

interface Stage {
  key: string;
  label: string;
  detail: string;
  icon: React.ElementType;
  durationMs: number;
}

export function DispatchRunner() {
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [currentStage, setCurrentStage] = useState(-1);
  const [stageProgress, setStageProgress] = useState<Record<string, number>>({});
  const [logLines, setLogLines] = useState<
    Array<{ id: number; text: string; type: "info" | "success" | "warn" | "urgent" }>
  >([]);
  const [classifiedTickets, setClassifiedTickets] = useState<Ticket[]>([]);
  const [assignedTickets, setAssignedTickets] = useState<Ticket[]>([]);
  const [bookedCount, setBookedCount] = useState(0);
  const [smsSent, setSmsSent] = useState(0);
  const logIdRef = useRef(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  const pack = verticalPacks[demoConfig.vertical];
  const allTickets = generateTickets(13);
  const techs = generateTechs();
  const totalSourceCount = pack.ticketSources.reduce(
    (s, src) => s + src.sampleCount,
    0
  );
  const emergencyCount = allTickets.filter((t) => t.category === "emergency")
    .length;

  const stages: Stage[] = [
    {
      key: "intake",
      label: "Pulling new requests",
      detail: `${pack.ticketSources.length} sources · last 14 hours`,
      icon: FileText,
      durationMs: 2000,
    },
    {
      key: "classify",
      label: "Classifying urgency & type",
      detail: "LLM-assisted parsing of free-text requests",
      icon: Brain,
      durationMs: 1800,
    },
    {
      key: "match",
      label: `Matching to ${pack.workerNoun.plural}`,
      detail: `${techs.length} ${pack.workerNoun.plural} · skills, calendar, location`,
      icon: UserCheck,
      durationMs: 2200,
    },
    {
      key: "book",
      label: "Booking on calendars",
      detail: `Google Calendar · ${demoConfig.details.fieldServiceSystem ?? "field service platform"}`,
      icon: Calendar,
      durationMs: 1600,
    },
    {
      key: "notify",
      label: "Notifying customers & techs",
      detail: "SMS confirmations · push notifications",
      icon: Send,
      durationMs: 1400,
    },
  ];

  const totalDuration = stages.reduce((sum, s) => sum + s.durationMs, 0);

  const log = (
    text: string,
    type: "info" | "success" | "warn" | "urgent" = "info"
  ) => {
    setLogLines((prev) => [
      ...prev,
      { id: ++logIdRef.current, text, type },
    ].slice(-50));
  };

  useEffect(() => {
    const end = logEndRef.current;
    if (!end) return;
    // Scroll only the nearest scrollable ancestor (the console panel),
    // not the page. Walking up to find overflow:auto avoids scrollIntoView's
    // default behavior of scrolling every ancestor scroll container.
    let parent: HTMLElement | null = end.parentElement;
    while (parent) {
      const overflow = getComputedStyle(parent).overflowY;
      if (overflow === "auto" || overflow === "scroll") break;
      parent = parent.parentElement;
    }
    if (parent) parent.scrollTop = parent.scrollHeight;
  }, [logLines]);

  const run = async () => {
    if (running) return;
    setRunning(true);
    setCompleted(false);
    setCurrentStage(0);
    setStageProgress({});
    setLogLines([]);
    setClassifiedTickets([]);
    setAssignedTickets([]);
    setBookedCount(0);
    setSmsSent(0);

    log(`Run started · ${new Date().toLocaleTimeString()}`);
    log(`Target: ${demoConfig.company.name}`);

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      setCurrentStage(i);

      if (stage.key === "intake") {
        for (const src of pack.ticketSources) {
          await sleep(stage.durationMs / pack.ticketSources.length);
          log(`  ✓ ${src.label} · ${src.sampleCount} new`, "success");
          const cumulative = pack.ticketSources
            .slice(0, pack.ticketSources.indexOf(src) + 1)
            .reduce((s, x) => s + x.sampleCount, 0);
          setStageProgress((p) => ({
            ...p,
            [stage.key]: (cumulative / totalSourceCount) * 100,
          }));
        }
        log(`  → ${totalSourceCount} requests collected`, "info");
      } else if (stage.key === "classify") {
        const chunks = 4;
        for (let c = 0; c < chunks; c++) {
          await sleep(stage.durationMs / chunks);
          const seen = Math.min((c + 1) * Math.ceil(allTickets.length / chunks), allTickets.length);
          log(`  · Classified ${seen}/${allTickets.length}`);
          setStageProgress((p) => ({ ...p, [stage.key]: (seen / allTickets.length) * 100 }));
          setClassifiedTickets(allTickets.slice(0, seen));
        }
        // Flag the urgent ones with emphasis
        for (const t of allTickets.filter((x) => x.category === "emergency")) {
          await sleep(80);
          log(`  ⚠ URGENT: ${t.issue} · ${t.address}`, "urgent");
        }
      } else if (stage.key === "match") {
        const updated = [...allTickets];
        const techRotation = techs.filter((t) => t.status !== "off");
        for (let t = 0; t < updated.length; t++) {
          await sleep(stage.durationMs / updated.length);
          updated[t] = {
            ...updated[t],
            assignedTech: techRotation[t % techRotation.length].name,
            status: "assigned",
          };
          setAssignedTickets([...updated.slice(0, t + 1)]);
          setStageProgress((p) => ({
            ...p,
            [stage.key]: ((t + 1) / updated.length) * 100,
          }));
          if (t < 3) {
            log(
              `  ✓ ${updated[t].ticketNumber} → ${
                techRotation[t % techRotation.length].name
              }`,
              "success"
            );
          }
        }
        log(`  → All ${updated.length} ${pack.jobNoun.plural} assigned`, "success");
      } else if (stage.key === "book") {
        const chunks = 5;
        for (let c = 0; c < chunks; c++) {
          await sleep(stage.durationMs / chunks);
          const booked = Math.min((c + 1) * Math.ceil(allTickets.length / chunks), allTickets.length);
          setBookedCount(booked);
          setStageProgress((p) => ({
            ...p,
            [stage.key]: (booked / allTickets.length) * 100,
          }));
          if (c === 0) log(`  · Calendar invites sent · ${booked}`);
          if (c === chunks - 1) log(`  ✓ All bookings confirmed`, "success");
        }
      } else if (stage.key === "notify") {
        const chunks = 4;
        for (let c = 0; c < chunks; c++) {
          await sleep(stage.durationMs / chunks);
          const sent = Math.min(
            (c + 1) * Math.ceil((allTickets.length * 2) / chunks),
            allTickets.length * 2
          );
          setSmsSent(sent);
          setStageProgress((p) => ({
            ...p,
            [stage.key]: (sent / (allTickets.length * 2)) * 100,
          }));
        }
        log(`  ✓ ${allTickets.length} customer SMS sent`, "success");
        log(`  ✓ ${allTickets.length} ${pack.workerNoun.singular} notifications pushed`, "success");
      }
    }

    setCurrentStage(stages.length);
    log(`Run complete · ${allTickets.length} ${pack.jobNoun.plural} dispatched · ${emergencyCount} flagged urgent`, "success");
    setRunning(false);
    setCompleted(true);
  };

  const reset = () => {
    setRunning(false);
    setCompleted(false);
    setCurrentStage(-1);
    setStageProgress({});
    setLogLines([]);
    setClassifiedTickets([]);
    setAssignedTickets([]);
    setBookedCount(0);
    setSmsSent(0);
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
              Morning dispatch run
            </div>
            <div className="text-2xs text-text-tertiary mt-0.5">
              Last run: today, 6:00 AM · Next scheduled: tomorrow, 6:00 AM · also runs on every new urgent ticket
            </div>
          </div>
          <div className="flex gap-2">
            {completed && (
              <button
                onClick={reset}
                className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-bg-subtle hover:bg-white/[0.04] text-sm text-text-secondary transition-colors"
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
                  Run dispatch
                </>
              )}
            </button>
          </div>
        </div>

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
                      stages.length) * 100
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
                    status === "complete" && "bg-status-success/10 text-status-success",
                    status === "running" && "bg-accent-glow text-accent-bright",
                    status === "idle" && "bg-white/5 text-text-tertiary"
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

      {/* Console + summary */}
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
                Press "Run dispatch" to start.
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
                    line.type === "urgent" && "text-status-error font-semibold",
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
            <SummaryStat
              label={`${pack.jobNoun.plural} dispatched`}
              value={assignedTickets.length}
              total={allTickets.length}
              accent
            />
            <SummaryStat
              label="Urgent flagged"
              value={
                running || completed
                  ? classifiedTickets.filter((t) => t.category === "emergency").length
                  : 0
              }
              total={emergencyCount}
              warn={emergencyCount > 0}
            />
            <SummaryStat
              label="Calendar invites"
              value={bookedCount}
              total={allTickets.length}
            />
            <SummaryStat
              label="SMS notifications"
              value={smsSent}
              total={allTickets.length * 2}
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
                      Equivalent dispatcher work: ~2 hours
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
                    Manual equivalent: ~2 hours of dispatcher time, daily.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent banner */}
      {(running || completed) &&
        classifiedTickets.some((t) => t.category === "emergency") && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-status-error/40 bg-status-error/5 overflow-hidden"
          >
            <div className="px-5 py-3 flex items-center gap-2 border-b border-status-error/20">
              <Flame className="h-4 w-4 text-status-error" />
              <div className="text-sm font-medium text-text-primary">
                Urgent · dispatched ahead of routine queue
              </div>
              <span className="ml-auto text-2xs text-text-tertiary">
                Customer notified · {pack.workerNoun.singular} en route
              </span>
            </div>
            <div className="divide-y divide-border-subtle">
              {classifiedTickets
                .filter((t) => t.category === "emergency")
                .map((t) => {
                  const Icon = SOURCE_ICONS[t.source];
                  return (
                    <div
                      key={t.id}
                      className="px-5 py-2.5 flex items-center gap-4 text-sm"
                    >
                      <Icon className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
                      <span className="font-mono text-2xs text-text-tertiary tabular">
                        {t.ticketNumber}
                      </span>
                      <span className="text-text-primary font-medium">{t.issue}</span>
                      <span className="text-text-tertiary">·</span>
                      <span className="text-text-secondary truncate flex-1">
                        {t.address} · {t.customer}
                      </span>
                      {t.assignedTech && (
                        <span className="text-2xs text-status-success shrink-0">
                          → {t.assignedTech}
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          </motion.div>
        )}

      {/* Stream of dispatched tickets */}
      {assignedTickets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-border-subtle bg-bg-raised overflow-hidden"
        >
          <div className="px-5 py-3 border-b border-border-subtle flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-text-primary">
                Dispatched {pack.jobNoun.plural}
              </div>
              <div className="text-2xs text-text-tertiary">
                Live as they're assigned · click any row for the full ticket
              </div>
            </div>
            <div className="text-2xs text-text-tertiary tabular">
              {assignedTickets.length} of {allTickets.length}
            </div>
          </div>
          <div className="max-h-96 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg-subtle/50 sticky top-0 backdrop-blur-sm">
                <tr className="text-2xs uppercase tracking-wider text-text-tertiary">
                  <th className="text-left px-5 py-2 font-normal">Source</th>
                  <th className="text-left px-5 py-2 font-normal">Ticket</th>
                  <th className="text-left px-5 py-2 font-normal">Issue</th>
                  <th className="text-left px-5 py-2 font-normal">Customer</th>
                  <th className="text-left px-5 py-2 font-normal">Priority</th>
                  <th className="text-left px-5 py-2 font-normal">
                    {pack.workerNoun.singular[0].toUpperCase() + pack.workerNoun.singular.slice(1)}
                  </th>
                  <th className="text-right px-5 py-2 font-normal">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {assignedTickets.slice(0, 13).map((t, i) => {
                  const Icon = SOURCE_ICONS[t.source];
                  return (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.04, 0.5) }}
                      className="hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-2 text-text-tertiary">
                        <Icon className="h-3.5 w-3.5" />
                      </td>
                      <td className="px-5 py-2 font-mono text-2xs text-text-tertiary">
                        {t.ticketNumber}
                      </td>
                      <td className="px-5 py-2 text-text-primary">{t.issue}</td>
                      <td className="px-5 py-2 text-text-secondary truncate max-w-[180px]">
                        {t.customer}
                      </td>
                      <td className="px-5 py-2">
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td className="px-5 py-2 text-text-secondary">
                        {t.assignedTech ?? "—"}
                      </td>
                      <td className="px-5 py-2 text-right text-2xs text-text-tertiary tabular">
                        {t.estimatedMinutes}min
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: Ticket["priority"] }) {
  const styles = {
    urgent: "bg-status-error/10 text-status-error border-status-error/20",
    high: "bg-status-warning/10 text-status-warning border-status-warning/20",
    medium: "bg-accent-glow text-accent-bright border-accent-border",
    low: "bg-white/5 text-text-tertiary border-border",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-2xs uppercase tracking-wider border",
        styles[priority]
      )}
    >
      {priority}
    </span>
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
          !accent && !warn && "text-text-primary"
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
