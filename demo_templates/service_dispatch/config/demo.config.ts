/**
 * Demo personalization config.
 *
 * This is the ONLY file the per-prospect agent edits.
 * Set `vertical` to one of "hvac" | "plumbing" | "electrical"
 * and the rest of the demo personalizes from the corresponding
 * vertical pack in config/verticals/.
 */

import type { VerticalKey } from "./verticals";

export interface DemoConfig {
  vertical: VerticalKey;
  company: {
    name: string;
    /** Path under /public/logos/, or remote URL. Falls back to monogram. */
    logo: string | null;
    /** Hex color. Theme is generated from this. */
    primaryColor: string;
    location: string;
  };
  scale: {
    /** Number of field workers. Drives capacity calcs and roster. */
    workers: number;
    /** Tickets received per week (drives the headline number). */
    weeklyTickets: number;
    /** Manual hours/week BEFORE automation, on dispatch + intake alone. */
    weeklyDispatchHoursBefore: number;
  };
  /**
   * Optional deeper personalization. Agent fills these from research
   * when available; if null, demo uses sensible defaults.
   */
  details: {
    /** Real software in their stack (ServiceTitan, Housecall Pro, etc.). */
    fieldServiceSystem?: string;
    /** Phone provider, if known. */
    phoneSystem?: string;
    /** A specific quoted phrase from a job post or website. */
    quotedPainPoint?: string;
    /** Override default service area; defaults to company.location. */
    serviceArea?: string;
  };
}

export const demoConfig: DemoConfig = {
  vertical: "hvac",
  company: {
    name: "Atlas HVAC Services",
    logo: null,
    primaryColor: "#dc2626",
    location: "Phoenix, AZ",
  },
  scale: {
    workers: 14,
    weeklyTickets: 180,
    weeklyDispatchHoursBefore: 22,
  },
  details: {
    fieldServiceSystem: "ServiceTitan",
    phoneSystem: "RingCentral",
  },
};
