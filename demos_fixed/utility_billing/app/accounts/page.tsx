import Link from "next/link";
import {
  Zap,
  Flame,
  Droplets,
  Wifi,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Pause,
  Lock,
  RefreshCw,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { RESIDENCES, residenceById } from "@/lib/data";
import {
  ACCOUNTS,
  accountsByResidence,
  providerSet,
  type ProviderAccount,
  type ProviderCategory,
  type AccountStatus,
} from "@/lib/automation";
import { formatUSD, formatRelativeTime, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CATEGORY_ICON: Record<ProviderCategory, React.ElementType> = {
  Electric: Zap,
  Gas: Flame,
  Water: Droplets,
  Internet: Wifi,
  Waste: Trash2,
};

const STATUS_LABEL: Record<AccountStatus, string> = {
  connected: "Connected",
  auth_refresh: "Auth refresh",
  rate_limited: "Rate limited",
  stale: "Stale",
};

export default function AccountsPage() {
  const total = ACCOUNTS.length;
  const connected = ACCOUNTS.filter((a) => a.status === "connected").length;
  const needsAttention = ACCOUNTS.filter((a) => a.status !== "connected").length;
  const monthlyTotalCents = ACCOUNTS.reduce(
    (acc, a) => acc + a.lastAmountCents,
    0,
  );

  return (
    <PageShell>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="text-2xs uppercase tracking-[0.18em] text-text-tertiary mb-2">
            Connected accounts
          </div>
          <h1 className="font-display text-3xl tracking-tight text-text-primary">
            {total} provider accounts across {RESIDENCES.length} residences
          </h1>
          <p className="text-text-secondary mt-2 max-w-2xl">
            Every utility and service portal we pull from each month. Click
            into any account to see pull history, last invoice PDF, and the
            credentials vault.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-8">
        <Summary
          icon={CheckCircle2}
          label="Connected"
          value={connected.toString()}
          sub={`of ${total} accounts`}
          tone="success"
        />
        <Summary
          icon={AlertCircle}
          label="Needs attention"
          value={needsAttention.toString()}
          sub="auth, rate limit, or stale"
          tone={needsAttention > 0 ? "warning" : "neutral"}
        />
        <Summary
          icon={RefreshCw}
          label="Pulls this month"
          value={total.toString()}
          sub="one per account"
        />
        <Summary
          icon={Lock}
          label="May spend"
          value={formatUSD(monthlyTotalCents)}
          sub="pass-through total"
        />
      </div>

      <div className="space-y-5">
        {RESIDENCES.map((r) => {
          const accts = accountsByResidence(r.id);
          if (accts.length === 0) return null;
          const totalCents = accts.reduce(
            (acc, a) => acc + a.lastAmountCents,
            0,
          );
          return (
            <section
              key={r.id}
              id={r.id}
              className="rounded-lg border border-border-subtle bg-bg-raised overflow-hidden"
            >
              <header className="px-5 py-4 border-b border-border-subtle flex items-center gap-4">
                <div
                  className="h-10 w-10 rounded-md shrink-0 ring-1 ring-black/5 flex items-center justify-center text-white text-2xs font-medium font-display"
                  style={{ backgroundImage: r.hero }}
                >
                  {r.ownerInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-lg text-text-primary truncate">
                    {r.name}
                  </div>
                  <div className="text-2xs text-text-tertiary mt-0.5">
                    {r.shortLocation} · {accts.length} provider accounts
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xs uppercase tracking-wider text-text-tertiary">
                    May spend
                  </div>
                  <div className="text-sm tabular text-text-primary mt-0.5">
                    {formatUSD(totalCents)}
                  </div>
                </div>
              </header>

              <ul className="divide-y divide-border-subtle">
                {accts.map((a) => (
                  <AccountRow key={a.id} account={a} />
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <div className="mt-10 rounded-lg border border-border-subtle bg-bg-raised p-6 max-w-3xl">
        <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-2">
          About these connections
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">
          Credentials live in an encrypted vault — RA never sees them in
          plaintext after enrollment. The automation logs into each portal
          using stored sessions where available and 2FA-handled flows
          otherwise. When a portal layout changes, an alert fires before the
          next scheduled run.{" "}
          <Link
            href="/automation"
            className="text-accent-bright hover:text-accent"
          >
            See the runner →
          </Link>
        </p>
      </div>
    </PageShell>
  );
}

function AccountRow({ account }: { account: ProviderAccount }) {
  const Icon = CATEGORY_ICON[account.category];
  const r = residenceById(account.residenceId);
  const variance =
    account.averageAmountCents > 0
      ? (account.lastAmountCents - account.averageAmountCents) /
        account.averageAmountCents
      : 0;
  const variancePct = Math.round(variance * 100);

  return (
    <li className="px-5 py-3 grid grid-cols-[1.6fr_1fr_1fr_1fr_auto] gap-3 items-center">
      <div className="flex items-start gap-3 min-w-0">
        <div className="h-8 w-8 rounded-md bg-bg-subtle border border-border-subtle flex items-center justify-center shrink-0">
          <Icon className="h-3.5 w-3.5 text-text-secondary" />
        </div>
        <div className="min-w-0">
          <div className="text-sm text-text-primary truncate">
            {account.provider}
          </div>
          <div className="text-2xs text-text-tertiary mt-0.5 font-mono truncate">
            {account.portal} · acct {account.accountNumberMasked}
          </div>
          {account.notes && (
            <div className="text-2xs text-status-warning mt-1">
              {account.notes}
            </div>
          )}
        </div>
      </div>
      <div>
        <div className="text-2xs uppercase tracking-wider text-text-tertiary">
          Category
        </div>
        <div className="text-xs text-text-secondary mt-0.5">
          {account.category} · {account.cadence}
        </div>
      </div>
      <div>
        <div className="text-2xs uppercase tracking-wider text-text-tertiary">
          Last pull
        </div>
        <div className="text-xs text-text-secondary tabular mt-0.5">
          {formatRelativeTime(account.lastPullISO)}
        </div>
        <div className="text-2xs text-text-tertiary mt-0.5">
          {r?.shortLocation}
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xs uppercase tracking-wider text-text-tertiary">
          Last invoice
        </div>
        <div className="text-sm text-text-primary tabular mt-0.5">
          {formatUSD(account.lastAmountCents)}
        </div>
        <div
          className={cn(
            "text-2xs mt-0.5 tabular",
            Math.abs(variancePct) <= 5
              ? "text-text-tertiary"
              : variancePct > 20
                ? "text-status-warning"
                : "text-text-secondary",
          )}
        >
          {variancePct > 0 ? "+" : ""}
          {variancePct}% vs. avg
        </div>
      </div>
      <StatusPill status={account.status} />
    </li>
  );
}

function StatusPill({ status }: { status: AccountStatus }) {
  if (status === "connected")
    return (
      <span className="inline-flex items-center gap-1 text-2xs uppercase tracking-wider px-1.5 py-0.5 rounded border border-status-success/30 bg-status-success/10 text-status-success shrink-0">
        <span className="status-dot bg-status-success" />
        {STATUS_LABEL[status]}
      </span>
    );
  if (status === "auth_refresh")
    return (
      <span className="inline-flex items-center gap-1 text-2xs uppercase tracking-wider px-1.5 py-0.5 rounded border border-status-warning/30 bg-status-warning/10 text-status-warning shrink-0">
        <Lock className="h-2.5 w-2.5" />
        {STATUS_LABEL[status]}
      </span>
    );
  if (status === "rate_limited")
    return (
      <span className="inline-flex items-center gap-1 text-2xs uppercase tracking-wider px-1.5 py-0.5 rounded border border-status-warning/30 bg-status-warning/10 text-status-warning shrink-0">
        <Pause className="h-2.5 w-2.5" />
        {STATUS_LABEL[status]}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-2xs uppercase tracking-wider px-1.5 py-0.5 rounded border border-border-subtle bg-bg-subtle text-text-tertiary shrink-0">
      <AlertCircle className="h-2.5 w-2.5" />
      {STATUS_LABEL[status]}
    </span>
  );
}

function Summary({
  icon: Icon,
  label,
  value,
  sub,
  tone = "neutral",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  tone?: "success" | "warning" | "neutral";
}) {
  const valueCls =
    tone === "success"
      ? "text-status-success"
      : tone === "warning"
        ? "text-status-warning"
        : "text-text-primary";
  return (
    <div className="rounded-lg border border-border-subtle bg-bg-raised p-5">
      <div className="flex items-center justify-between">
        <div className="text-2xs uppercase tracking-wider text-text-tertiary">
          {label}
        </div>
        <Icon className="h-3.5 w-3.5 text-text-tertiary" />
      </div>
      <div className={cn("font-display text-3xl mt-2 tabular", valueCls)}>
        {value}
      </div>
      <div className="text-2xs text-text-tertiary mt-1">{sub}</div>
    </div>
  );
}
