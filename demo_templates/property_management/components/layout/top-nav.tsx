"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Receipt,
  Wrench,
  Sparkles,
  ChevronDown,
  CalendarDays,
  Building2,
  Users,
  MessageSquare,
  CreditCard,
  Send,
  X,
  Mail,
  BookOpen,
  HelpCircle,
  Settings,
  Bell,
} from "lucide-react";
import { demoConfig } from "@/config/demo.config";
import { cn } from "@/lib/utils";

type NavLink = { label: string; href: string; icon: typeof Receipt };

const PRIMARY_TABS: NavLink[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Utility Billing", href: "/utility-billing", icon: Receipt },
  { label: "Maintenance", href: "/maintenance", icon: Wrench },
  { label: "Automations", href: "/automations", icon: Sparkles },
];

const MORE_LINKS: NavLink[] = [
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Properties", href: "/properties", icon: Building2 },
  { label: "Vendors", href: "/vendors", icon: Users },
  { label: "Vendor outreach", href: "/vendor-outreach", icon: MessageSquare },
  { label: "Rent collection", href: "/rent-collection", icon: CreditCard },
  { label: "Connect with us", href: "/connect", icon: Send },
];

function CompanyMark() {
  const { name, logo } = demoConfig.company;
  const monogram = name
    .split(" ")
    .map((w) => w[0])
    .filter((c) => /[A-Z]/i.test(c))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Link href="/dashboard" className="flex items-center gap-3 shrink-0">
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt={name}
          className="h-8 w-8 rounded-md object-contain bg-bg-subtle p-1 border border-border-subtle"
        />
      ) : (
        <div className="h-8 w-8 rounded-md flex items-center justify-center text-xs font-semibold border bg-accent-glow border-accent-border text-accent-bright">
          {monogram}
        </div>
      )}
      <div className="min-w-0 hidden md:block">
        <div className="text-sm font-medium text-text-primary truncate">
          {name}
        </div>
        <div className="text-2xs text-text-tertiary uppercase tracking-wider">
          Operations
        </div>
      </div>
    </Link>
  );
}

export function TopNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [openModal, setOpenModal] = useState<"whats-new" | "settings" | "help" | null>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close the More dropdown on outside click / ESC
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMoreOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname?.startsWith(href));

  const moreActive = MORE_LINKS.some((l) => isActive(l.href));

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-bg-raised/85 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center gap-6">
        <CompanyMark />

        <nav className="flex items-center gap-1 flex-1">
          {PRIMARY_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors",
                  active
                    ? "bg-accent-glow text-accent-bright"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-subtle"
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{tab.label}</span>
              </Link>
            );
          })}

          <div ref={moreRef} className="relative">
            <button
              onClick={() => setMoreOpen((o) => !o)}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors",
                moreActive || moreOpen
                  ? "bg-accent-glow text-accent-bright"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-subtle"
              )}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
            >
              <span>More</span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  moreOpen && "rotate-180"
                )}
              />
            </button>

            {moreOpen && (
              <div
                role="menu"
                className="absolute left-0 mt-2 w-56 rounded-lg border border-border bg-bg-raised shadow-lg py-1.5 z-40"
              >
                {MORE_LINKS.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      onClick={() => setMoreOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-accent-glow text-accent-bright"
                          : "text-text-secondary hover:text-text-primary hover:bg-bg-subtle"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-1 shrink-0">
          <IconButton
            label="What's new"
            badge
            onClick={() => setOpenModal("whats-new")}
          >
            <Bell className="h-4 w-4" />
          </IconButton>
          <IconButton label="Settings" onClick={() => setOpenModal("settings")}>
            <Settings className="h-4 w-4" />
          </IconButton>
          <IconButton label="Help" onClick={() => setOpenModal("help")}>
            <HelpCircle className="h-4 w-4" />
          </IconButton>
        </div>
        </div>
      </header>

      {/* Modals render as siblings of <header> so they escape its backdrop-filter
          containing block — otherwise `fixed inset-0` positions relative to the
          header (a thin sliver) instead of the viewport. */}
      {openModal === "whats-new" && (
        <WhatsNewModal onClose={() => setOpenModal(null)} />
      )}
      {openModal === "settings" && (
        <SettingsModal onClose={() => setOpenModal(null)} />
      )}
      {openModal === "help" && <HelpModal onClose={() => setOpenModal(null)} />}
    </>
  );
}

function IconButton({
  label,
  badge,
  onClick,
  children,
}: {
  label: string;
  badge?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="relative h-8 w-8 flex items-center justify-center rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-subtle transition-colors"
    >
      {children}
      {badge && (
        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Modals — kept inline so we can swap nav without losing them.
// ─────────────────────────────────────────────────────────────

function WhatsNewModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell onClose={onClose} title="What's new" eyebrow="Release notes">
      <div className="space-y-5">
        <ReleaseEntry
          version="v3.4"
          date="Apr 2026"
          highlights={[
            { label: "Calendar view", body: "See billing runs, maintenance, vendor visits, and inspections on one month grid." },
            { label: "Properties module", body: "Portfolio table with occupancy, monthly revenue, and per-property details." },
            { label: "Vendor outreach", body: "Parallel SMS dispatch, first-to-accept wins. Tenant gets confirmation automatically." },
          ]}
          fresh
        />
        <ReleaseEntry
          version="v3.3"
          date="Mar 2026"
          highlights={[
            { label: "Maintenance auto-routing", body: "Tickets routed to the right vendor by trade, location, and current load." },
            { label: "Exception queue", body: "Flagged statements grouped by reason for faster review." },
          ]}
        />
        <ReleaseEntry
          version="v3.2"
          date="Feb 2026"
          highlights={[
            { label: "Utility billing v2", body: "Parallel portal scraping. Run time down from 28s to 9s." },
          ]}
        />
      </div>
    </ModalShell>
  );
}

function ReleaseEntry({
  version,
  date,
  highlights,
  fresh,
}: {
  version: string;
  date: string;
  highlights: Array<{ label: string; body: string }>;
  fresh?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="font-display text-base text-text-primary">{version}</span>
        <span className="text-2xs text-text-tertiary">{date}</span>
        {fresh && (
          <span className="ml-auto text-2xs uppercase tracking-wider text-accent-bright bg-accent-glow border border-accent-border rounded px-1.5 py-0.5">
            New
          </span>
        )}
      </div>
      <ul className="space-y-2 border-l border-border-subtle pl-3">
        {highlights.map((h) => (
          <li key={h.label} className="text-xs">
            <div className="text-text-primary font-medium">{h.label}</div>
            <div className="text-text-tertiary mt-0.5 leading-relaxed">{h.body}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell onClose={onClose} title="Settings" eyebrow="Workspace">
      <div className="space-y-2">
        <SettingsRow label="Workspace" value={demoConfig.company.name} />
        <SettingsRow label="Region" value={demoConfig.company.location} />
        <SettingsRow
          label="Connected PMS"
          value={demoConfig.details.propertyManagementSystem ?? "—"}
        />
        <SettingsRow
          label="Active automations"
          value={`${demoConfig.workflow.enabled.length}`}
        />
        <SettingsRow label="Plan" value="Pro · billed monthly" />
      </div>
      <div className="mt-5 pt-4 border-t border-border-subtle">
        <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-2">
          Manage in production
        </div>
        <div className="text-xs text-text-secondary leading-relaxed">
          Full settings — users, integrations, billing, audit log, and webhook
          subscriptions — are available in your live environment.
        </div>
      </div>
    </ModalShell>
  );
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border-subtle/60 last:border-0">
      <span className="text-xs text-text-tertiary">{label}</span>
      <span className="text-xs text-text-primary tabular">{value}</span>
    </div>
  );
}

function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell onClose={onClose} title="Get help" eyebrow="Support">
      <div className="space-y-3">
        <HelpRow
          icon={Mail}
          label="Email Megha"
          detail="megha@reasonableautomations.com · median response under 30 min"
          href="mailto:megha@reasonableautomations.com?subject=Help%20request"
        />
        <HelpRow
          icon={MessageSquare}
          label="Open a chat"
          detail="In-app chat with the team that built your automations"
        />
        <HelpRow
          icon={BookOpen}
          label="Documentation"
          detail="API reference, integrations, troubleshooting"
        />
      </div>
      <div className="mt-5 pt-4 rounded-md border border-accent-border bg-accent-glow/30 p-4">
        <div className="text-2xs uppercase tracking-wider text-accent mb-1">
          Status
        </div>
        <div className="flex items-center gap-2 text-xs text-text-primary">
          <span className="status-dot bg-status-success" />
          All systems operational · 99.98% uptime this quarter
        </div>
      </div>
    </ModalShell>
  );
}

function HelpRow({
  icon: Icon,
  label,
  detail,
  href,
}: {
  icon: React.ElementType;
  label: string;
  detail: string;
  href?: string;
}) {
  const content = (
    <>
      <Icon className="h-4 w-4 text-text-tertiary shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="text-sm text-text-primary">{label}</div>
        <div className="text-2xs text-text-tertiary mt-0.5">{detail}</div>
      </div>
    </>
  );
  const className =
    "w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-md border border-border-subtle bg-bg-base hover:border-accent-border transition-colors";

  if (href) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }
  return (
    <button onClick={() => {}} className={className}>
      {content}
    </button>
  );
}

function ModalShell({
  title,
  eyebrow,
  onClose,
  children,
}: {
  title: string;
  eyebrow: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[80vh] bg-bg-raised border border-border rounded-lg overflow-hidden flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-border-subtle flex items-start justify-between shrink-0">
          <div>
            <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-0.5">
              {eyebrow}
            </div>
            <div className="font-display text-lg text-text-primary">{title}</div>
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
