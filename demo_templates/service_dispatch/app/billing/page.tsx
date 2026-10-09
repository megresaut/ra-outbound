"use client";

import { useState } from "react";
import {
  Receipt,
  CreditCard,
  Send,
  FileText,
  CheckCircle2,
  AlertCircle,
  ListChecks,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowRight,
  X,
  Mail,
  MessageSquare,
  Edit3,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { WorkflowRunner } from "@/components/demo/workflow-runner";
import { demoConfig } from "@/config/demo.config";
import { verticalPacks } from "@/config/verticals";
import { cn } from "@/lib/utils";

interface InvoiceLineItem {
  label: string;
  qty: string;
  amount: number;
}

type InvoiceStatus =
  | "sent"
  | "auto-charged"
  | "card-declined"
  | "needs-approval"
  | "bounced"
  | "draft";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  address: string;
  ticketNumber: string;
  jobSummary: string;
  technician: string;
  completedAt: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  deliveryChannel: "email" | "sms";
  flagReason?: string;
}

const STATUS_META: Record<
  InvoiceStatus,
  { label: string; cls: string; needsApproval: boolean }
> = {
  sent: {
    label: "Sent",
    cls: "bg-white/5 text-text-secondary border-border",
    needsApproval: false,
  },
  "auto-charged": {
    label: "Auto-charged",
    cls: "bg-status-success/10 text-status-success border-status-success/20",
    needsApproval: false,
  },
  "card-declined": {
    label: "Card declined",
    cls: "bg-status-error/10 text-status-error border-status-error/20",
    needsApproval: true,
  },
  "needs-approval": {
    label: "Needs your approval",
    cls: "bg-status-warning/10 text-status-warning border-status-warning/20",
    needsApproval: true,
  },
  bounced: {
    label: "Email bounced",
    cls: "bg-status-warning/10 text-status-warning border-status-warning/20",
    needsApproval: true,
  },
  draft: {
    label: "Draft",
    cls: "bg-accent-glow text-accent-bright border-accent-border",
    needsApproval: false,
  },
};

export default function BillingPage() {
  const pack = verticalPacks[demoConfig.vertical];
  const fss = demoConfig.details.fieldServiceSystem ?? "your field service system";
  const invoices = buildInvoices();

  return (
    <PageShell>
      <div className="mb-8 max-w-3xl">
        <div className="text-xs uppercase tracking-wider text-accent mb-2">
          Automation · Billing
        </div>
        <h1 className="font-display text-4xl text-text-primary mb-3">
          The job's done. The invoice writes itself.
        </h1>
        <p className="text-text-secondary leading-relaxed">
          Every evening we pull completed {pack.jobNoun.plural} from {fss},
          generate invoices with the right line items and tax, send them to
          customers, run cards on file for autopay accounts, and reconcile
          payments to your accounting. Anything that needs a human — disputes,
          adjustments, refunds — gets queued for your approval.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <ContextStat
          icon={Clock}
          label="Avg time to invoice"
          value="< 1 hr"
          sub="vs. 3-5 days manual"
          accent
        />
        <ContextStat
          icon={DollarSign}
          label="Days sales outstanding"
          value="-12 days"
          sub="vs. quarter-on-quarter"
        />
        <ContextStat
          icon={CreditCard}
          label="Auto-pay capture rate"
          value="89%"
          sub="of cards on file"
        />
        <ContextStat
          icon={TrendingUp}
          label="Collection rate"
          value="+6.4%"
          sub="last 90 days"
        />
      </div>

      <WorkflowRunner
        title="Daily billing & collections sweep"
        schedule="Scheduled daily at 7:00 PM · or run on demand"
        runLabel="Run billing"
        stages={[
          {
            key: "pull",
            label: `Pulling completed ${pack.jobNoun.plural}`,
            detail: `${fss} · ${pack.workerNoun.plural} marked jobs done today`,
            icon: ListChecks,
            durationMs: 1200,
            log: [
              { text: `  · Loaded 32 completed ${pack.jobNoun.plural} from ${fss}` },
              { text: `  · 4 still missing parts cost · queued for ${pack.workerNoun.singular} confirmation`, type: "warn" },
              { text: "  · 28 ready to invoice" },
            ],
          },
          {
            key: "draft",
            label: "Drafting invoices",
            detail: "Labor + parts + travel + tax, per service agreement terms",
            icon: FileText,
            durationMs: 1800,
            log: [
              { text: "  · Pulled labor minutes from time-on-site GPS" },
              { text: "  · Pulled parts from technician scan-out" },
              { text: "  · Applied flat-rate codes where applicable" },
              { text: "  · Calculated state + city tax (AZ + Phoenix)" },
              { text: "  ✓ 28 invoices drafted · totaling $14,720", type: "success" },
            ],
          },
          {
            key: "send",
            label: "Sending invoices",
            detail: "Email + SMS link · customer portal payment options",
            icon: Send,
            durationMs: 1400,
            log: [
              { text: "  · 24 sent by email (preferred)" },
              { text: "  · 4 sent by SMS (no email on file)" },
              { text: "  ✓ 28 invoices delivered · 2 bounced emails flagged for ops", type: "warn" },
            ],
          },
          {
            key: "charge",
            label: "Auto-charging cards on file",
            detail: "Stripe · only accounts opted into autopay",
            icon: CreditCard,
            durationMs: 1800,
            log: [
              { text: "  · 19 customers opted into autopay" },
              { text: "  ✓ 17 charges succeeded · $9,840 captured", type: "success" },
              { text: "  ⚠ 1 card declined (Visa ending 4421) · customer notified", type: "warn" },
              { text: "  ⚠ 1 charge held for review · amount > $2k threshold (your rule)", type: "warn" },
            ],
          },
          {
            key: "reconcile",
            label: "Reconciling to accounting",
            detail: "QuickBooks / Xero · matched invoices, payments, refunds",
            icon: Receipt,
            durationMs: 1200,
            log: [
              { text: "  · Posted invoices to AR" },
              { text: "  · Posted captured payments to deposits" },
              { text: "  · Matched 100% of activity (no manual entries)" },
              { text: "  ✓ Books up to date · 1 charge & 4 invoices need your review", type: "success" },
            ],
          },
        ]}
        summary={[
          { label: "Invoices drafted", value: 28, total: 32, accent: true },
          { label: "Auto-charged", value: 17, total: 19 },
          { label: "Revenue captured", value: 9840, suffix: " $", accent: true },
          { label: "Awaiting your review", value: 5, warn: true },
        ]}
        completionFootnote="Equivalent manual work: ~4 hours of bookkeeping"
        reviewCallout={
          <>
            <span className="text-text-primary font-medium">
              5 items need your call.
            </span>{" "}
            Scroll down to see today's invoices · click any one to see the
            line items, drafted email, and payment status. Anything flagged
            needs your approval before we proceed.
          </>
        }
        resultPanel={<InvoicesQueue invoices={invoices} />}
      />

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-lg border border-border-subtle bg-bg-raised p-6">
          <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-3">
            How it works
          </div>
          <h3 className="font-display text-xl text-text-primary mb-4">
            From job complete to cash in the bank.
          </h3>
          <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
            <p>
              When a {pack.workerNoun.singular} marks a {pack.jobNoun.singular}{" "}
              complete in {fss}, we pull labor minutes from time-on-site GPS,
              parts from the technician's scan-out, and any flat-rate codes
              from your price book. Tax is applied per the customer's billing
              jurisdiction.
            </p>
            <p>
              Invoices go out within an hour by email or SMS — whichever the
              customer set as preferred. Customers on autopay get charged the
              same evening. Everything posts to your accounting (QuickBooks,
              Xero, etc.) without manual entry.
            </p>
            <p>
              Disputes, large charges over your threshold, declined cards, and
              refund requests always wait for your team. We do the prep so the
              decision is one click — but the decision is always yours.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-accent-border bg-accent-glow/30 p-6 flex flex-col">
          <ArrowRight className="h-5 w-5 text-accent mb-3" />
          <div className="font-display text-lg text-text-primary mb-2">
            Approval-gated by default
          </div>
          <p className="text-sm text-text-secondary leading-relaxed mb-4 flex-1">
            Routine invoices and small autopay charges run automatically. Any
            invoice over your set dollar threshold, any refund, and any
            customer dispute waits for a real human signature on your team.
          </p>
          <div className="text-2xs text-text-tertiary flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-status-success" />
            Audit log of every charge, refund, and approver
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function InvoicesQueue({ invoices }: { invoices: Invoice[] }) {
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [filter, setFilter] = useState<"all" | "needs-approval" | "auto">("all");

  const filtered = invoices.filter((inv) => {
    if (filter === "all") return true;
    if (filter === "needs-approval") return STATUS_META[inv.status].needsApproval;
    return !STATUS_META[inv.status].needsApproval;
  });

  const totalApproval = invoices.filter(
    (i) => STATUS_META[i.status].needsApproval
  ).length;
  const totalAuto = invoices.filter(
    (i) => !STATUS_META[i.status].needsApproval
  ).length;

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-raised overflow-hidden">
      <div className="px-5 py-3 border-b border-border-subtle flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm font-medium text-text-primary">
            Today's invoices · {invoices.length}
          </div>
          <div className="text-2xs text-text-tertiary">
            Click any invoice to see line items, drafted email, and payment status
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
            All ({invoices.length})
          </FilterPill>
          <FilterPill active={filter === "auto"} onClick={() => setFilter("auto")}>
            <span className="h-1.5 w-1.5 rounded-full bg-status-success" />
            Auto-handled ({totalAuto})
          </FilterPill>
          <FilterPill
            active={filter === "needs-approval"}
            onClick={() => setFilter("needs-approval")}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-status-warning" />
            Needs approval ({totalApproval})
          </FilterPill>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bg-subtle/50">
            <tr className="text-2xs uppercase tracking-wider text-text-tertiary">
              <th className="text-left px-5 py-2.5 font-normal">Invoice</th>
              <th className="text-left px-5 py-2.5 font-normal">Customer</th>
              <th className="text-left px-5 py-2.5 font-normal">Job</th>
              <th className="text-right px-5 py-2.5 font-normal">Amount</th>
              <th className="text-left px-5 py-2.5 font-normal">Status</th>
              <th className="text-right px-5 py-2.5 font-normal">Channel</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {filtered.map((inv) => {
              const status = STATUS_META[inv.status];
              return (
                <tr
                  key={inv.id}
                  onClick={() => setSelected(inv)}
                  className={cn(
                    "hover:bg-white/[0.02] cursor-pointer",
                    status.needsApproval && "bg-status-warning/[0.03]"
                  )}
                >
                  <td className="px-5 py-2.5 font-mono text-2xs text-text-tertiary tabular">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-5 py-2.5 text-text-primary">{inv.customer}</td>
                  <td className="px-5 py-2.5 text-text-secondary truncate max-w-[280px]">
                    {inv.jobSummary}
                  </td>
                  <td className="px-5 py-2.5 text-right text-text-primary tabular">
                    ${inv.total.toFixed(2)}
                  </td>
                  <td className="px-5 py-2.5">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-md text-2xs uppercase tracking-wider border",
                        status.cls
                      )}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-right text-2xs text-text-tertiary uppercase tracking-wider">
                    {inv.deliveryChannel}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {selected && (
        <InvoiceDetail invoice={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function InvoiceDetail({
  invoice,
  onClose,
}: {
  invoice: Invoice;
  onClose: () => void;
}) {
  const status = STATUS_META[invoice.status];
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg h-full bg-bg-raised border-l border-border overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-border-subtle flex items-start justify-between">
          <div>
            <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-1 font-mono">
              {invoice.invoiceNumber}
            </div>
            <div className="font-display text-xl text-text-primary leading-tight">
              {invoice.customer}
            </div>
            <div className="text-2xs text-text-tertiary mt-1">
              {invoice.address} · completed {invoice.completedAt}
            </div>
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-md text-2xs uppercase tracking-wider border mt-2",
                status.cls
              )}
            >
              {status.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {invoice.flagReason && (
            <div className="rounded-md border border-status-warning/30 bg-status-warning/5 p-3 flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-status-warning shrink-0 mt-0.5" />
              <div className="text-xs text-text-secondary leading-relaxed">
                <span className="text-status-warning font-medium">
                  Awaiting your approval:
                </span>{" "}
                {invoice.flagReason}
              </div>
            </div>
          )}

          <div>
            <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-2">
              Job
            </div>
            <div className="text-sm text-text-primary">{invoice.jobSummary}</div>
            <div className="text-2xs text-text-tertiary mt-0.5">
              {invoice.ticketNumber} · completed by {invoice.technician}
            </div>
          </div>

          <div>
            <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-2">
              Line items
            </div>
            <div className="rounded-md border border-border-subtle bg-bg-base overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border-subtle">
                  {invoice.lineItems.map((li, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 text-text-secondary">{li.label}</td>
                      <td className="px-3 py-2 text-2xs text-text-tertiary tabular text-right">
                        {li.qty}
                      </td>
                      <td className="px-3 py-2 text-text-primary tabular text-right">
                        ${li.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-bg-raised">
                  <tr>
                    <td colSpan={2} className="px-3 py-1.5 text-2xs text-text-tertiary text-right">
                      Subtotal
                    </td>
                    <td className="px-3 py-1.5 text-right text-text-secondary tabular">
                      ${invoice.subtotal.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="px-3 py-1.5 text-2xs text-text-tertiary text-right">
                      Tax (Phoenix, AZ)
                    </td>
                    <td className="px-3 py-1.5 text-right text-text-secondary tabular">
                      ${invoice.tax.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="border-t border-border">
                    <td colSpan={2} className="px-3 py-2 text-xs text-text-primary text-right font-medium">
                      Total
                    </td>
                    <td className="px-3 py-2 text-right font-display text-lg tabular text-text-primary">
                      ${invoice.total.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div>
            <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-2 flex items-center gap-1.5">
              <Edit3 className="h-3 w-3" />
              Customer email (auto-generated)
            </div>
            <div className="rounded-md border border-border-subtle bg-bg-base p-3">
              <div className="text-2xs text-text-tertiary mb-2 flex items-center gap-1.5">
                {invoice.deliveryChannel === "email" ? (
                  <>
                    <Mail className="h-3 w-3" /> To {invoice.customer.toLowerCase().split(" ")[0]}@example.com
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-3 w-3" /> SMS to customer's number
                  </>
                )}
              </div>
              <div className="text-sm text-text-primary leading-relaxed whitespace-pre-line">
                {`Hi ${invoice.customer.split(" ")[0]},\n\nYour invoice for today's ${invoice.jobSummary.toLowerCase()} is ready. Total: $${invoice.total.toFixed(2)}.\n\nView and pay: atlashvac.example/invoice/${invoice.invoiceNumber}\n\nThanks for choosing us — ${invoice.technician.split(" ")[0]} appreciated working with you today.\n\n— Atlas HVAC Services`}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border-subtle flex gap-2">
            {status.needsApproval ? (
              <>
                <button
                  onClick={() =>
                    alert(
                      `Approved: ${invoice.invoiceNumber}\n\nProceeding with the suggested action.`
                    )
                  }
                  className="flex-1 px-3 py-2 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-bright"
                >
                  Approve
                </button>
                <button
                  onClick={() =>
                    alert("Edit invoice — opens the composer in production.")
                  }
                  className="px-3 py-2 rounded-md border border-border bg-bg-subtle text-sm text-text-secondary hover:bg-white/[0.04]"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    alert(`Skipped: ${invoice.invoiceNumber}`);
                    onClose();
                  }}
                  className="px-3 py-2 rounded-md border border-border bg-bg-subtle text-sm text-text-secondary hover:bg-white/[0.04]"
                >
                  Skip
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() =>
                    alert(
                      `Resending invoice ${invoice.invoiceNumber} to ${invoice.customer}`
                    )
                  }
                  className="flex-1 px-3 py-2 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-bright flex items-center justify-center gap-2"
                >
                  <Send className="h-3.5 w-3.5" />
                  Resend
                </button>
                <button
                  onClick={() => alert(`Opening payment record for ${invoice.invoiceNumber}`)}
                  className="px-3 py-2 rounded-md border border-border bg-bg-subtle text-sm text-text-secondary hover:bg-white/[0.04]"
                >
                  View payment
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-2xs border transition-colors",
        active
          ? "border-accent-border bg-accent-glow text-text-primary"
          : "border-border bg-bg-raised text-text-secondary hover:text-text-primary"
      )}
    >
      {children}
    </button>
  );
}

function buildInvoices(): Invoice[] {
  return [
    {
      id: "i1",
      invoiceNumber: "INV-10428",
      customer: "Sarah Thomas",
      address: "2561 Elm Ave",
      ticketNumber: "WO-10240",
      jobSummary: "Emergency: gas smell · diagnose & seal",
      technician: "Mark Singh",
      completedAt: "today, 2:14 PM",
      lineItems: [
        { label: "Emergency dispatch fee", qty: "1", amount: 175 },
        { label: "Labor (1.5h @ $145)", qty: "1.5h", amount: 217.5 },
        { label: "Replacement gas valve fitting", qty: "1", amount: 64.0 },
      ],
      subtotal: 456.5,
      tax: 38.8,
      total: 495.3,
      status: "auto-charged",
      deliveryChannel: "email",
    },
    {
      id: "i2",
      invoiceNumber: "INV-10429",
      customer: "David Scott",
      address: "9985 Maple Ave",
      ticketNumber: "WO-10241",
      jobSummary: "Emergency: no heat (winter) · igniter replacement",
      technician: "Amanda Patel",
      completedAt: "today, 1:42 PM",
      lineItems: [
        { label: "Emergency dispatch fee", qty: "1", amount: 175 },
        { label: "Labor (2h @ $145)", qty: "2h", amount: 290 },
        { label: "Furnace igniter (Honeywell)", qty: "1", amount: 142.0 },
      ],
      subtotal: 607,
      tax: 51.6,
      total: 658.6,
      status: "needs-approval",
      flagReason:
        "Total exceeds your $500 emergency-job auto-send threshold. Review the breakdown and approve to send.",
      deliveryChannel: "email",
    },
    {
      id: "i3",
      invoiceNumber: "INV-10430",
      customer: "Daniel Nelson",
      address: "4421 Oak St",
      ticketNumber: "WO-10242",
      jobSummary: "Furnace not heating · circuit board diagnostic",
      technician: "Karen Nguyen",
      completedAt: "today, 12:30 PM",
      lineItems: [
        { label: "Service call", qty: "1", amount: 89 },
        { label: "Labor (1h @ $135)", qty: "1h", amount: 135 },
        { label: "Diagnostic only — no parts", qty: "—", amount: 0 },
      ],
      subtotal: 224,
      tax: 19.04,
      total: 243.04,
      status: "auto-charged",
      deliveryChannel: "email",
    },
    {
      id: "i4",
      invoiceNumber: "INV-10431",
      customer: "Jennifer White",
      address: "1827 Cedar Blvd",
      ticketNumber: "WO-10243",
      jobSummary: "Refrigerant recharge · 2lb R-410A",
      technician: "Brian Rodriguez",
      completedAt: "today, 11:48 AM",
      lineItems: [
        { label: "Service call", qty: "1", amount: 89 },
        { label: "Labor (1h @ $135)", qty: "1h", amount: 135 },
        { label: "R-410A refrigerant", qty: "2 lbs", amount: 198 },
        { label: "Leak inspection", qty: "1", amount: 45 },
      ],
      subtotal: 467,
      tax: 39.7,
      total: 506.7,
      status: "card-declined",
      flagReason:
        "Card on file (Visa ending 4421) was declined. Customer notified by SMS. Approve to retry, or wait for them to update payment.",
      deliveryChannel: "email",
    },
    {
      id: "i5",
      invoiceNumber: "INV-10432",
      customer: "James Jackson",
      address: "9034 Pine Way",
      ticketNumber: "WO-10244",
      jobSummary: "AC not cooling · fan motor replacement",
      technician: "Nicole Williams",
      completedAt: "today, 10:55 AM",
      lineItems: [
        { label: "Service call", qty: "1", amount: 89 },
        { label: "Labor (2.5h @ $135)", qty: "2.5h", amount: 337.5 },
        { label: "Condenser fan motor (1/4 HP)", qty: "1", amount: 285 },
        { label: "Capacitor (45/5 mfd)", qty: "1", amount: 38 },
      ],
      subtotal: 749.5,
      tax: 63.71,
      total: 813.21,
      status: "sent",
      deliveryChannel: "email",
    },
    {
      id: "i6",
      invoiceNumber: "INV-10433",
      customer: "Sarah Lewis",
      address: "1140 Birch Pl",
      ticketNumber: "WO-10245",
      jobSummary: "Thermostat replacement · Ecobee Smart",
      technician: "Rachel Patel",
      completedAt: "today, 10:12 AM",
      lineItems: [
        { label: "Service call", qty: "1", amount: 89 },
        { label: "Labor (1h @ $135)", qty: "1h", amount: 135 },
        { label: "Ecobee Smart Thermostat", qty: "1", amount: 249 },
      ],
      subtotal: 473,
      tax: 40.21,
      total: 513.21,
      status: "auto-charged",
      deliveryChannel: "email",
    },
    {
      id: "i7",
      invoiceNumber: "INV-10434",
      customer: "Jennifer Adams",
      address: "5567 Magnolia Dr",
      ticketNumber: "WO-10246",
      jobSummary: "Annual maintenance — fall tune-up",
      technician: "Daniel Singh",
      completedAt: "today, 9:30 AM",
      lineItems: [
        { label: "Annual tune-up (flat rate)", qty: "1", amount: 189 },
      ],
      subtotal: 189,
      tax: 16.07,
      total: 205.07,
      status: "auto-charged",
      deliveryChannel: "sms",
    },
    {
      id: "i8",
      invoiceNumber: "INV-10435",
      customer: "Lisa Martin",
      address: "3340 Sycamore Ave",
      ticketNumber: "WO-10247",
      jobSummary: "Refrigerant recharge · suspected slow leak",
      technician: "Nicole Patel",
      completedAt: "today, 8:55 AM",
      lineItems: [
        { label: "Service call", qty: "1", amount: 89 },
        { label: "Labor (1.5h @ $135)", qty: "1.5h", amount: 202.5 },
        { label: "R-410A refrigerant", qty: "1.5 lbs", amount: 148.5 },
      ],
      subtotal: 440,
      tax: 37.4,
      total: 477.4,
      status: "bounced",
      flagReason:
        "Email to lmartin@oldhost.example bounced. We have an alternate phone number — approve to send by SMS instead.",
      deliveryChannel: "email",
    },
    {
      id: "i9",
      invoiceNumber: "INV-10436",
      customer: "James Thomas",
      address: "8821 Linden Ct",
      ticketNumber: "WO-10248",
      jobSummary: "Strange noise from condenser · loose mount + fan blade",
      technician: "Lisa Garcia",
      completedAt: "yesterday, 5:14 PM",
      lineItems: [
        { label: "Service call", qty: "1", amount: 89 },
        { label: "Labor (2h @ $135)", qty: "2h", amount: 270 },
        { label: "Replacement fan blade", qty: "1", amount: 84 },
        { label: "Mounting hardware", qty: "—", amount: 22 },
      ],
      subtotal: 465,
      tax: 39.53,
      total: 504.53,
      status: "auto-charged",
      deliveryChannel: "email",
    },
    {
      id: "i10",
      invoiceNumber: "INV-10437",
      customer: "Atlas Commercial Properties LLC",
      address: "11 commercial sites",
      ticketNumber: "WO-10249",
      jobSummary: "Quarterly maintenance · 11 commercial RTUs",
      technician: "Multiple techs",
      completedAt: "this week",
      lineItems: [
        { label: "Quarterly RTU maintenance (flat rate)", qty: "11 units", amount: 2079 },
        { label: "Belt replacements", qty: "3", amount: 145 },
        { label: "Filter changes", qty: "11", amount: 220 },
        { label: "Refrigerant top-off", qty: "2 lbs", amount: 198 },
      ],
      subtotal: 2642,
      tax: 224.57,
      total: 2866.57,
      status: "needs-approval",
      flagReason:
        "Total exceeds your $2,000 large-charge threshold. Approve to charge the card on file or send for ACH.",
      deliveryChannel: "email",
    },
  ];
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
