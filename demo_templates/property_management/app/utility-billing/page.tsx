import { Clock, FileSpreadsheet, Users, Zap } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { AutomationRunner } from "@/components/demo/automation-runner";
import { demoConfig } from "@/config/demo.config";

export default function UtilityBillingPage() {
  const { scale, details, company } = demoConfig;
  const utilities = details.utilities ?? ["City Water", "Electric Co", "Gas Service"];
  const pms = details.propertyManagementSystem ?? "your accounting / existing systems";

  const heroParagraph = details.painNarrative ?? (
    <>
      Every month, your team logs into{" "}
      <span className="text-text-primary">{utilities.length} utility portals</span>,
      downloads {scale.units.toLocaleString()} statements, parses each PDF, matches them
      to units, and posts the charges into{" "}
      <span className="text-text-primary">{pms}</span>. We replaced that with one
      scheduled job.
    </>
  );

  const statementsPerMonth = details.mathBreakdown?.statementsPerMonth ?? 312;
  const hoursAfter = details.mathBreakdown?.hoursAfter ?? 3;
  const netHoursReturned = Math.max(scale.monthlyHoursBefore - hoursAfter, 0);

  const howItWorks = details.howItWorks ?? [
    "The automation logs into each utility portal using stored credentials, pulls every new statement issued since the last run, parses the PDF for line items and amounts, then matches each statement to the right unit and posts to your accounting / existing systems.",
    "Statements that match cleanly are posted automatically. The rare statement with an address mismatch or unrecognized format is flagged and queued — typically 2-4 per cycle. Your ops team handles those exceptions in minutes instead of running the whole process.",
    "Everything is logged. Every action is reversible. If a portal changes its layout, we get alerted and patch it before your next cycle.",
  ];

  return (
    <PageShell>
      <div className="mb-8 max-w-3xl">
        <div className="text-xs uppercase tracking-wider text-accent mb-2">
          Automation · Utility billing
        </div>
        <h1 className="font-display text-4xl text-text-primary mb-3">
          One run replaces the first week of every month.
        </h1>
        <p className="text-text-secondary leading-relaxed">{heroParagraph}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <ContextStat
          icon={Clock}
          label="Manual time before"
          value={`${scale.monthlyHoursBefore}h`}
          sub="per month"
        />
        <ContextStat
          icon={Zap}
          label="Run time after"
          value="~9s"
          sub="per cycle"
          accent
        />
        <ContextStat
          icon={FileSpreadsheet}
          label="Statements per run"
          value={String(statementsPerMonth)}
          sub={`${utilities.length} providers`}
        />
        <ContextStat
          icon={Users}
          label="Team members freed"
          value="3"
          sub="for higher-leverage work"
        />
      </div>

      <AutomationRunner />

      {/* Context drawer below the fold */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-lg border border-border-subtle bg-bg-raised p-6">
          <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-3">
            How it works
          </div>
          <h3 className="font-display text-xl text-text-primary mb-4">
            The same workflow, but you don't run it.
          </h3>
          <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
            {howItWorks.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border-subtle bg-bg-raised p-6">
          <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-3">
            The math, for {company.name}
          </div>
          <div className="space-y-4">
            <MathRow label="Units" value={scale.units.toLocaleString()} />
            <MathRow
              label="Statements / month"
              value={`~${statementsPerMonth}`}
            />
            <MathRow
              label="Hours / month before"
              value={`${scale.monthlyHoursBefore}h`}
            />
            <MathRow label="Hours / month after" value={`~${hoursAfter}h`} accent />
            <div className="pt-3 border-t border-border-subtle">
              <MathRow
                label="Net hours returned"
                value={`${netHoursReturned}h / mo`}
                large
                accent
              />
            </div>
            <p className="text-2xs text-text-tertiary leading-relaxed pt-2">
              Numbers based on a comparable Reasonable Automations customer with
              ~800 units. Yours will vary with portfolio mix and utility provider count.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function ContextStat({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        accent
          ? "border-accent-border bg-accent-glow"
          : "border-border-subtle bg-bg-raised"
      }`}
    >
      <Icon
        className={`h-4 w-4 mb-3 ${
          accent ? "text-accent-bright" : "text-text-tertiary"
        }`}
      />
      <div
        className={`font-display text-2xl tabular ${
          accent ? "text-accent-bright" : "text-text-primary"
        }`}
      >
        {value}
      </div>
      <div className="text-2xs text-text-tertiary mt-1">{label}</div>
      <div className="text-2xs text-text-dim">{sub}</div>
    </div>
  );
}

function MathRow({
  label,
  value,
  accent,
  large,
}: {
  label: string;
  value: string;
  accent?: boolean;
  large?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span
        className={`${
          large ? "text-sm" : "text-xs"
        } text-text-secondary`}
      >
        {label}
      </span>
      <span
        className={`tabular ${
          large
            ? "text-2xl font-display"
            : "text-sm"
        } ${
          accent ? "text-accent-bright" : "text-text-primary"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
