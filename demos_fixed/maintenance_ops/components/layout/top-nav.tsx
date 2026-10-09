"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutGrid,
  Hammer,
  Users,
  Home,
  Settings,
  Bell,
  HelpCircle,
} from "lucide-react";
import { BrandMark } from "@/components/layout/brand-mark";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Overview", href: "/", icon: LayoutGrid, exact: true },
  { label: "Work orders", href: "/work-orders", icon: Hammer },
  { label: "Vendors", href: "/vendors", icon: Users },
  { label: "Residences", href: "/residences", icon: Home },
];

export function TopNav() {
  const pathname = usePathname();
  const params = useSearchParams();
  const qs = params.toString();
  const suffix = qs ? `?${qs}` : "";

  const isActive = (tab: (typeof TABS)[number]) => {
    if (tab.exact) return pathname === tab.href;
    return pathname === tab.href || pathname?.startsWith(tab.href + "/");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-bg-raised/85 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center gap-8">
        <BrandMark tagline="Maintenance & Concierge" />

        <nav className="flex items-center gap-1 flex-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab);
            return (
              <Link
                key={tab.href}
                href={tab.href + suffix}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors",
                  active
                    ? "bg-accent-glow text-accent-bright"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-subtle",
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 shrink-0">
          <IconButton label="Notifications" badge>
            <Bell className="h-4 w-4" />
          </IconButton>
          <IconButton label="Settings">
            <Settings className="h-4 w-4" />
          </IconButton>
          <IconButton label="Help">
            <HelpCircle className="h-4 w-4" />
          </IconButton>
        </div>
      </div>
    </header>
  );
}

function IconButton({
  label,
  badge,
  children,
}: {
  label: string;
  badge?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
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
