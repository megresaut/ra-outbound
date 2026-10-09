"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  Kanban,
  Users,
  Settings,
  HelpCircle,
  Sparkles,
  Inbox,
  Receipt,
  Send,
} from "lucide-react";
import { demoConfig } from "@/config/demo.config";
import { verticalPacks } from "@/config/verticals";
import { cn } from "@/lib/utils";

function CompanyMark() {
  const { name, logo, primaryColor } = demoConfig.company;
  const pack = verticalPacks[demoConfig.vertical];

  const monogram = name
    .split(" ")
    .map((w) => w[0])
    .filter((c) => /[A-Z]/i.test(c))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (logo) {
    return (
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logo}
          alt={name}
          className="h-8 w-8 rounded-md object-contain bg-white/5 p-1"
        />
        <div className="min-w-0">
          <div className="text-sm font-medium text-text-primary truncate">
            {name}
          </div>
          <div className="text-2xs text-text-tertiary uppercase tracking-wider">
            {pack.productTagline}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div
        className="h-8 w-8 rounded-md flex items-center justify-center text-xs font-semibold border"
        style={{
          background: `${primaryColor}20`,
          borderColor: `${primaryColor}40`,
          color: primaryColor,
        }}
      >
        {monogram}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium text-text-primary truncate">
          {name}
        </div>
        <div className="text-2xs text-text-tertiary uppercase tracking-wider">
          {pack.productTagline}
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const pack = verticalPacks[demoConfig.vertical];

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Lead intake", href: "/intake", icon: Inbox },
    { label: "Dispatch", href: "/dispatch", icon: Zap, accent: true },
    { label: "Job board", href: "/board", icon: Kanban },
    {
      label: pack.workerNoun.plural[0].toUpperCase() + pack.workerNoun.plural.slice(1),
      href: "/technicians",
      icon: Users,
    },
    { label: "Billing", href: "/billing", icon: Receipt },
    { label: "Automations", href: "/automations", icon: Sparkles },
    { label: "Connect with us", href: "/connect", icon: Send },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-border-subtle bg-bg-base/50 backdrop-blur-sm flex flex-col h-screen sticky top-0">
      <div className="px-4 py-5 border-b border-border-subtle">
        <CompanyMark />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <div className="px-2 pb-2 text-2xs uppercase tracking-wider text-text-dim">
          Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-2.5 py-1.5 rounded-md text-sm transition-colors",
                active
                  ? "bg-accent-glow text-text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/[0.03]"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  item.accent && !active && "text-accent"
                )}
              />
              <span className="truncate">{item.label}</span>
              {active && (
                <span className="ml-auto h-1 w-1 rounded-full bg-accent" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border-subtle space-y-0.5">
        <Link
          href="#"
          className="flex items-center gap-3 px-2.5 py-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.03]"
        >
          <Sparkles className="h-4 w-4" />
          <span>What's new</span>
        </Link>
        <Link
          href="#"
          className="flex items-center gap-3 px-2.5 py-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.03]"
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Link>
        <Link
          href="#"
          className="flex items-center gap-3 px-2.5 py-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.03]"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Help</span>
        </Link>
      </div>

      <div className="px-4 py-3 border-t border-border-subtle">
        <div className="flex items-center gap-2 text-2xs text-text-dim">
          <span className="status-dot bg-status-success" />
          <span>Dispatch online · all techs synced</span>
        </div>
      </div>
    </aside>
  );
}
