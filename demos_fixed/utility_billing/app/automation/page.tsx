import { Clock, Zap, FileSpreadsheet, Users } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { AutomationRunner } from "@/components/demo/automation-runner";
import { ACCOUNTS, providerSet } from "@/lib/automation";

export const dynamic = "force-dynamic";

const STATS = [
  { icon: Clock, label: "Manual time before", value: "~6 hrs", sub: "per cycle, per residence" },
  { icon: Zap, label: "Run time after", value: "~11 sec", sub: "per cycle, all 6", accent: true },
  { icon: FileSpreadsheet, label: "Statements per run", value: ACCOUNTS.length.toString(), sub: `${providerSet().length} providers` },
  { icon: Users, label: "Hands freed", value: "1.5 FTE", sub: "of senior bookkeeper time" },
];

export default function AutomationPage() {
  const providers = providerSet();
  return (
    <PageShell>
      <div className="mb-8 max-w-3xl">
        <div className="text-2xs uppercase tracking-[0.18em] text-accent-bright mb-2">
          Automation · Monthly billing pull
        </div>
        <h1 className="font-display text-4xl text-text-primary mb-3">
          One run replaces the first week of every month.
        </h1>
        <p className="text-text-secondary leading-relaxed">
          Every month, the bookkeeper logged into{" "}
          <span className="text-text-primary">{providers.length} provider portals</span>
          , downloaded {ACCOUNTS.length} statements, parsed each PDF, matched them
          to the right residence, and posted everything into the owner ledger.
          We replaced that with one scheduled run that finishes before breakfast.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`rounded-lg border p-4 ${
                s.accent
                  ? "border-accent-border bg-accent-glow"
                  : "border-border-subtle bg-bg-raised"
              }`}
            >
              <Icon
                className={`h-4 w-4 mb-3 ${
                  s.accent ? "text-accent-bright" : "text-text-tertiary"
                }`}
              />
              <div
                className={`font-display text-2xl tabular ${
                  s.accent ? "text-accent-bright" : "text-text-primary"
                }`}
              >
                {s.value}
              </div>
              <div className="text-2xs text-text-tertiary mt-1">{s.label}</div>
              <div className="text-2xs text-text-dim">{s.sub}</div>
            </div>
          );
        })}
      </div>

      <AutomationRunner />

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-lg border border-border-subtle bg-bg-raised p-6">
          <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-3">
            How it works
          </div>
          <h3 className="font-display text-xl text-text-primary mb-4">
            The same workflow, but you don't run it.
          </h3>
          <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
            <p>
              The automation logs into each provider portal using stored
              credentials, pulls every new statement issued since the last run,
              parses the PDF for line items and totals, then matches each
              statement to the right residence using account number and service
              address.
            </p>
            <p>
              Statements that match cleanly are posted to the owner ledger
              automatically. Anything that deviates from the rolling 90-day
              baseline — a new vendor relationship, an unusual amount, a
              missing-period gap — gets flagged and queued. Your estate manager
              handles those exceptions in minutes instead of running the whole
              process.
            </p>
            <p>
              Everything is logged. Every action is reversible. If a portal
              changes its layout, we're alerted and patch it before your next
              cycle — your team doesn't notice.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border-subtle bg-bg-raised p-6">
          <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-3">
            The math
          </div>
          <div className="space-y-4">
            <MathRow label="Residences" value="6" />
            <MathRow label="Provider accounts" value={ACCOUNTS.length.toString()} />
            <MathRow label="Statements / month" value={`~${ACCOUNTS.length}`} />
            <MathRow label="Hours / month before" value="~36 hrs" />
            <MathRow label="Hours / month after" value="~2 hrs" accent />
            <div className="pt-3 border-t border-border-subtle">
              <MathRow
                label="Net hours returned"
                value="~34 hrs / mo"
                large
                accent
              />
            </div>
            <p className="text-2xs text-text-tertiary leading-relaxed pt-2">
              Numbers based on a comparable estate-management firm. Yours will
              vary with portfolio mix and provider count.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
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
        className={`${large ? "text-sm" : "text-xs"} text-text-secondary`}
      >
        {label}
      </span>
      <span
        className={`tabular ${
          large ? "text-2xl font-display" : "text-sm"
        } ${accent ? "text-accent-bright" : "text-text-primary"}`}
      >
        {value}
      </span>
    </div>
  );
}
