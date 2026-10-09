import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const REFERENCE_NOW = new Date("2026-05-19T15:00:00Z").getTime();

export function formatRelativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  const diffMs = t - REFERENCE_NOW;
  const future = diffMs > 0;
  const minutes = Math.floor(Math.abs(diffMs) / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return future ? `in ${minutes} min` : `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return future ? `in ${hours}h` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 14) return future ? `in ${days}d` : `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatShortDate(iso: string): string {
  return new Date(iso + (iso.length === 10 ? "T00:00:00" : "")).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    },
  );
}

export function formatLongDate(iso: string): string {
  return new Date(iso + (iso.length === 10 ? "T00:00:00" : "")).toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );
}
