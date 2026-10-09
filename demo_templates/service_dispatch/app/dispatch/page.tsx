import { Clock, Users, Inbox, Zap } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { DispatchRunner } from "@/components/demo/dispatch-runner";
import { demoConfig } from "@/config/demo.config";
import { verticalPacks } from "@/config/verticals";

export default function DispatchPage() {
  const { scale, details, company } = demoConfig;
  const pack = verticalPacks[demoConfig.vertical];
  const sourceCount = pack.ticketSources.length;
  const totalSourceCount = pack.ticketSources.reduce(
    (s, src) => s + src.sampleCount,
    0
  );

  return (
    <PageShell>
      <div className="mb-8 max-w-3xl">
        <div className="text-xs uppercase tracking-wider text-accent mb-2">
          Automation · Multi-source dispatch
        </div>
        <h1 className="font-display text-4xl text-text-primary mb-3">
          {pack.heroCopy.headline}
        </h1>
        <p className="text-text-secondary leading-relaxed">
          {pack.heroCopy.subhead}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <ContextStat
          icon={Inbox}
          label="Intake sources"
          value={sourceCount.toString()}
          sub={pack.ticketSources.map((s) => s.label.split(" ")[0]).join(" · ")}
        />
        <ContextStat
          icon={Clock}
          label="Manual time before"
          value={`${scale.weeklyDispatchHoursBefore}h`}
          sub="per week"
        />
        <ContextStat
          icon={Zap}
          label="Run time after"
          value="~9s"
          sub="per cycle"
          accent
        />
        <ContextStat
          icon={Users}
          label={`${pack.workerNoun.plural[0].toUpperCase() + pack.workerNoun.plural.slice(1)} on roster`}
          value={scale.workers.toString()}
          sub="auto-matched by skill + availability"
        />
      </div>

      <DispatchRunner />

      {/* Below the fold context */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-lg border border-border-subtle bg-bg-raised p-6">
          <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-3">
            How it works
          </div>
          <h3 className="font-display text-xl text-text-primary mb-4">
            From a dozen places, into one queue, out to the right{" "}
            {pack.workerNoun.singular}.
          </h3>
          <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
            <p>
              The automation pulls new requests from{" "}
              <span className="text-text-primary">
                {pack.ticketSources.map((s) => s.label).join(", ")}
              </span>{" "}
              every morning and on demand when something urgent comes in.
              An LLM-assisted classifier reads each request, identifies the issue,
              and assigns priority — flagging anything that looks like an emergency.
            </p>
            <p>
              Each {pack.jobNoun.singular} is matched to the right{" "}
              {pack.workerNoun.singular} based on certifications,
              current location, and remaining calendar capacity. Optimal routing
              groups jobs geographically when possible to cut drive time.
            </p>
            <p>
              Calendar invites land in{" "}
              {details.fieldServiceSystem ?? "your field service platform"} and
              Google Calendar at the same time. Customers get an SMS confirmation
              with the time window and the {pack.workerNoun.singular}'s name.
              Techs get a push notification with the address and job details.
            </p>
            <p>
              You watch it run, or you don't. Exceptions — a customer who didn't
              leave a clear address, a request that doesn't classify cleanly —
              get flagged and queued for your dispatcher to handle in minutes
              instead of hours.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border-subtle bg-bg-raised p-6">
          <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-3">
            The math, for {company.name}
          </div>
          <div className="space-y-4">
            <MathRow
              label={`Weekly ${pack.jobNoun.plural}`}
              value={`~${scale.weeklyTickets}`}
            />
            <MathRow
              label="Intake sources"
              value={`${sourceCount}`}
            />
            <MathRow
              label="Hours / week before"
              value={`${scale.weeklyDispatchHoursBefore}h`}
            />
            <MathRow
              label="Hours / week after"
              value="~2h"
              accent
            />
            <div className="pt-3 border-t border-border-subtle">
              <MathRow
                label="Net hours returned"
                value={`${scale.weeklyDispatchHoursBefore - 2}h / wk`}
                large
                accent
              />
            </div>
            <p className="text-2xs text-text-tertiary leading-relaxed pt-2">
              Numbers based on a comparable Reasonable Automations customer.
              Yours will vary with intake volume and team size.
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
      <div className="text-2xs text-text-dim truncate">{sub}</div>
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
