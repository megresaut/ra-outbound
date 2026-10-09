import { ArrowRight, Sparkles } from "lucide-react";
import { demoConfig } from "@/config/demo.config";

const CALENDLY_URL = "https://calendly.com/megha-reasonableautomations/30min";

export function BottomCTA() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-bg-raised/95 backdrop-blur-md shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
      <div className="max-w-[1400px] mx-auto px-6 py-3.5 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-md bg-accent-glow border border-accent-border flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-accent-bright" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-text-primary truncate">
              Want this for {demoConfig.company.name}?
            </div>
            <div className="text-xs text-text-tertiary">
              Built in a week. Yours in three.
            </div>
          </div>
        </div>

        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-bright transition-colors shadow-sm shrink-0"
        >
          Book 30 min
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    </div>
  );
}
