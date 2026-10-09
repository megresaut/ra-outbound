import Link from "next/link";
import { Plus, Upload, Layers } from "lucide-react";

export function HomeActions() {
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.06]"
      >
        <Layers className="h-3.5 w-3.5" />
        Campaigns
      </Link>
      <Link
        href="/new-demo"
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.06]"
      >
        <Plus className="h-3.5 w-3.5" />
        New demo
      </Link>
      <Link
        href="/campaigns/new"
        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-medium text-emerald-950 transition-colors hover:bg-emerald-300"
      >
        <Upload className="h-3.5 w-3.5" />
        Upload CSV
      </Link>
    </div>
  );
}
