import { demoConfig } from "@/config/demo.config";
import { Sparkles } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="border-b border-border-subtle bg-gradient-to-r from-accent-glow via-transparent to-transparent">
      <div className="px-6 py-2.5 flex items-center gap-3 text-xs">
        <Sparkles className="h-3.5 w-3.5 text-accent shrink-0" />
        <span className="text-text-secondary">
          Tailored demo for{" "}
          <span className="text-text-primary font-medium">
            {demoConfig.company.name}
          </span>{" "}
          · prepared by{" "}
          <span className="text-text-primary font-medium">
            Reasonable Automations
          </span>
        </span>
        <span className="text-text-dim ml-auto hidden sm:inline">
          Interactive — try the "Run automation" button
        </span>
      </div>
    </div>
  );
}
