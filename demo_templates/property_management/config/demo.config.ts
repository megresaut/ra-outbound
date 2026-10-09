/**
 * Demo personalization config.
 *
 * This is the ONLY file the per-prospect agent edits.
 * Everything downstream reads from this.
 *
 * Keep this file deterministic — given the same config, the demo
 * should render identically. Fake data is seeded by company.name.
 */

export type WorkflowKey =
  | "utility_billing"
  | "maintenance"
  | "vendors"
  | "ap_processing";

export type RunnerStageKey = "connect" | "scrape" | "parse" | "match" | "post";

export interface RunnerStageLabel {
  /** What the stage card title shows. Falls back to template default if omitted. */
  label?: string;
  /** Subtitle line under the title. Falls back to template default. */
  detail?: string;
}

export interface WhyForYou {
  /** The observation lifted from prospect notes (e.g. "You mentioned PGE + NWN portals"). */
  observation: string;
  /** The matching automation we built (e.g. "We built connectors for both."). */
  automation: string;
}

export interface DemoConfig {
  company: {
    name: string;
    /** Path under /public/logos/, or remote URL. Falls back to monogram. */
    logo: string | null;
    /** Hex color. Theme is generated from this. */
    primaryColor: string;
    location: string;
  };
  workflow: {
    /** The hero workflow shown on /utility-billing (or other primary page). */
    primary: WorkflowKey;
    /** Which pages are enabled in the nav. */
    enabled: WorkflowKey[];
    /**
     * Per-stage label overrides for the automation runner. The 5 canonical stages
     * (connect/scrape/parse/match/post) keep their animations; only the strings change.
     */
    runnerLabels?: Partial<Record<RunnerStageKey, RunnerStageLabel>>;
  };
  scale: {
    units: number;
    properties: number;
    /** Manual hours/month BEFORE automation. Drives the headline number. */
    monthlyHoursBefore: number;
  };
  /**
   * Optional deeper personalization. Agent fills these from research
   * when available; if null/undefined, demo uses sensible defaults.
   */
  details: {
    /** Real utility providers in their service area. */
    utilities?: string[];
    /** Real software in their stack (Buildium, AppFolio, etc.). */
    propertyManagementSystem?: string;
    /** A specific workflow phrase from a job post or website. */
    quotedPainPoint?: string;
    /**
     * 2-3 sentence narrative for the hero, grounded in their stack + providers + pain.
     * Replaces the generic "Every month, your team logs into N utility portals..." copy.
     */
    painNarrative?: string;
    /** 2-3 prose paragraphs for the "How it works" section. References their stack. */
    howItWorks?: string[];
    /** Numbers for the math table + automation-runner stat row. */
    mathBreakdown?: {
      /** Estimated statements processed per month. */
      statementsPerMonth?: number;
      /** Hours of ops time per month AFTER automation (typically ~3). */
      hoursAfter?: number;
      /** Manual-equivalent hours for one run (displayed in the runner summary). */
      manualEquivalentHours?: number;
    };
  };
}

export const demoConfig: DemoConfig = {
  company: {
    name: "Sunrise Property Management",
    logo: null,
    primaryColor: "#3b82f6",
    location: "Austin, TX",
  },
  workflow: {
    primary: "utility_billing",
    enabled: ["utility_billing", "maintenance", "vendors"],
  },
  scale: {
    units: 800,
    properties: 47,
    monthlyHoursBefore: 200,
  },
  details: {
    utilities: ["Austin Energy", "Texas Gas Service", "Austin Water"],
    propertyManagementSystem: "Buildium",
  },
};
