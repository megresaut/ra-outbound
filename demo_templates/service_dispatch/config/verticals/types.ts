/**
 * Vertical packs encode everything that differs between
 * HVAC, plumbing, and electrical services.
 *
 * Adding a new vertical (e.g., "garage_door"):
 *   1. Create config/verticals/garage_door.ts conforming to this type
 *   2. Register it in config/verticals/index.ts
 *   3. Set `vertical: "garage_door"` in demo.config.ts
 */

export type VerticalKey = "hvac" | "plumbing" | "electrical";

export interface UrgencyExample {
  label: string;        // e.g. "No heat"
  description: string;  // e.g. "Furnace failure, residential"
}

export interface IssueType {
  label: string;        // e.g. "AC not cooling"
  category: "emergency" | "service" | "maintenance" | "install";
}

export interface Skill {
  label: string;        // e.g. "Refrigerant cert (608)"
  short: string;        // e.g. "608"
}

export interface VerticalPack {
  key: VerticalKey;
  /** What you call the workers — used everywhere in copy. */
  workerNoun: { singular: string; plural: string }; // technician/technicians
  /** What you call the work artifacts. */
  jobNoun: { singular: string; plural: string }; // service call/service calls
  /** Short noun for the trade itself, used in copy. */
  tradeNoun: string; // "HVAC", "plumbing", "electrical"
  /** Common ticket sources for this trade (intake animation). */
  ticketSources: Array<{
    label: string;     // e.g. "Voicemail (Twilio)"
    icon: "phone" | "form" | "email" | "platform" | "sms";
    sampleCount: number; // how many to show coming in per run
  }>;
  /** Urgency examples shown when classifier flags emergencies. */
  urgencyExamples: UrgencyExample[];
  /** Issue types used for fake ticket data and the dispatch board. */
  issueTypes: IssueType[];
  /** Skill / certification tags shown on technician profiles. */
  skills: Skill[];
  /** Common job duration in minutes, for calendar slot examples. */
  typicalJobMinutes: number;
  /** Software they typically use (referenced in copy when known). */
  commonStack: string[]; // e.g. ["ServiceTitan", "Housecall Pro"]
  /** Hero copy that varies per trade. */
  heroCopy: {
    /** "Dispatch, on autopilot." style headline */
    headline: string;
    /** Subhead — explains the workflow being automated */
    subhead: string;
  };
  /** Tagline shown under the company name in the sidebar */
  productTagline: string;
}
