/**
 * Provider accounts + pulled-statement generator for the automation runner.
 * Models real utility/service portals that the demo would scrape monthly.
 */

import { RESIDENCES } from "./data";

export type ProviderCategory =
  | "Electric"
  | "Gas"
  | "Water"
  | "Internet"
  | "Waste";

export type AccountStatus =
  | "connected"
  | "auth_refresh"
  | "rate_limited"
  | "stale";

export type ProviderAccount = {
  id: string;
  residenceId: string;
  provider: string;
  category: ProviderCategory;
  portal: string;
  accountNumberMasked: string;
  status: AccountStatus;
  cadence: "monthly" | "bi-monthly" | "quarterly";
  lastPullISO: string;
  lastAmountCents: number;
  averageAmountCents: number;
  notes?: string;
};

export const ACCOUNTS: ProviderAccount[] = [
  // ─── The Glade · Bel Air ────────────────────────────────────────────────
  {
    id: "acct-1",
    residenceId: "the-glade",
    provider: "LADWP",
    category: "Electric",
    portal: "ladwp.com/customer",
    accountNumberMasked: "•••• 7710",
    status: "connected",
    cadence: "monthly",
    lastPullISO: "2026-05-09T07:02:00Z",
    lastAmountCents: 484200,
    averageAmountCents: 472000,
  },
  {
    id: "acct-2",
    residenceId: "the-glade",
    provider: "LADWP Water",
    category: "Water",
    portal: "ladwp.com/customer",
    accountNumberMasked: "•••• W221",
    status: "connected",
    cadence: "bi-monthly",
    lastPullISO: "2026-05-09T07:03:00Z",
    lastAmountCents: 312700,
    averageAmountCents: 298000,
  },
  {
    id: "acct-3",
    residenceId: "the-glade",
    provider: "SoCalGas",
    category: "Gas",
    portal: "myaccount.socalgas.com",
    accountNumberMasked: "•••• 2204",
    status: "connected",
    cadence: "monthly",
    lastPullISO: "2026-05-09T07:04:00Z",
    lastAmountCents: 218400,
    averageAmountCents: 226000,
  },
  {
    id: "acct-4",
    residenceId: "the-glade",
    provider: "Spectrum Business",
    category: "Internet",
    portal: "spectrumbusiness.net",
    accountNumberMasked: "•••• 1188",
    status: "connected",
    cadence: "monthly",
    lastPullISO: "2026-05-09T07:05:00Z",
    lastAmountCents: 78900,
    averageAmountCents: 78900,
  },
  {
    id: "acct-5",
    residenceId: "the-glade",
    provider: "Athens Services",
    category: "Waste",
    portal: "athensservices.com/portal",
    accountNumberMasked: "•••• 4423",
    status: "auth_refresh",
    cadence: "monthly",
    lastPullISO: "2026-04-09T07:02:00Z",
    lastAmountCents: 41200,
    averageAmountCents: 41200,
    notes: "Portal requested a 2FA refresh on May 6. Re-auth pending.",
  },

  // ─── Aspen Compound ─────────────────────────────────────────────────────
  {
    id: "acct-6",
    residenceId: "aspen-compound",
    provider: "Holy Cross Energy",
    category: "Electric",
    portal: "myaccount.holycross.com",
    accountNumberMasked: "•••• 9012",
    status: "connected",
    cadence: "monthly",
    lastPullISO: "2026-05-09T07:08:00Z",
    lastAmountCents: 282400,
    averageAmountCents: 268000,
  },
  {
    id: "acct-7",
    residenceId: "aspen-compound",
    provider: "Black Hills Energy",
    category: "Gas",
    portal: "blackhillsenergy.com",
    accountNumberMasked: "•••• 3318",
    status: "connected",
    cadence: "monthly",
    lastPullISO: "2026-05-09T07:09:00Z",
    lastAmountCents: 318600,
    averageAmountCents: 340000,
  },
  {
    id: "acct-8",
    residenceId: "aspen-compound",
    provider: "Comcast",
    category: "Internet",
    portal: "customer.xfinity.com",
    accountNumberMasked: "•••• 7754",
    status: "connected",
    cadence: "monthly",
    lastPullISO: "2026-05-09T07:10:00Z",
    lastAmountCents: 41900,
    averageAmountCents: 41900,
  },

  // ─── Meadow House · East Hampton ────────────────────────────────────────
  {
    id: "acct-9",
    residenceId: "meadow-house",
    provider: "PSEG Long Island",
    category: "Electric",
    portal: "psegliny.com",
    accountNumberMasked: "•••• 8821",
    status: "connected",
    cadence: "monthly",
    lastPullISO: "2026-05-09T07:12:00Z",
    lastAmountCents: 192400,
    averageAmountCents: 184000,
  },
  {
    id: "acct-10",
    residenceId: "meadow-house",
    provider: "National Grid",
    category: "Gas",
    portal: "nationalgridus.com",
    accountNumberMasked: "•••• 4407",
    status: "connected",
    cadence: "monthly",
    lastPullISO: "2026-05-09T07:13:00Z",
    lastAmountCents: 112400,
    averageAmountCents: 124000,
  },
  {
    id: "acct-11",
    residenceId: "meadow-house",
    provider: "Optimum",
    category: "Internet",
    portal: "optimum.net/account",
    accountNumberMasked: "•••• 0412",
    status: "connected",
    cadence: "monthly",
    lastPullISO: "2026-05-09T07:14:00Z",
    lastAmountCents: 71200,
    averageAmountCents: 51400,
    notes: "+38% vs. 90-day median — flagged on May statement.",
  },

  // ─── Snake River Ranch ──────────────────────────────────────────────────
  {
    id: "acct-12",
    residenceId: "snake-river-ranch",
    provider: "Lower Valley Energy",
    category: "Electric",
    portal: "lvenergy.com",
    accountNumberMasked: "•••• 6628",
    status: "connected",
    cadence: "monthly",
    lastPullISO: "2026-05-09T07:16:00Z",
    lastAmountCents: 521800,
    averageAmountCents: 488000,
  },
  {
    id: "acct-13",
    residenceId: "snake-river-ranch",
    provider: "Silver Star Communications",
    category: "Internet",
    portal: "silverstar.com/customer",
    accountNumberMasked: "•••• 2240",
    status: "connected",
    cadence: "monthly",
    lastPullISO: "2026-05-09T07:17:00Z",
    lastAmountCents: 38900,
    averageAmountCents: 38900,
  },
  {
    id: "acct-14",
    residenceId: "snake-river-ranch",
    provider: "Starlink Business",
    category: "Internet",
    portal: "starlink.com/billing",
    accountNumberMasked: "•••• 8801",
    status: "connected",
    cadence: "monthly",
    lastPullISO: "2026-05-09T07:18:00Z",
    lastAmountCents: 25000,
    averageAmountCents: 25000,
    notes: "Backup link for the main lodge.",
  },

  // ─── Pacific Heights · SF ──────────────────────────────────────────────
  {
    id: "acct-15",
    residenceId: "pacific-heights",
    provider: "PG&E",
    category: "Electric",
    portal: "pge.com/myaccount",
    accountNumberMasked: "•••• 5519",
    status: "connected",
    cadence: "monthly",
    lastPullISO: "2026-05-09T07:21:00Z",
    lastAmountCents: 348200,
    averageAmountCents: 336000,
  },
  {
    id: "acct-16",
    residenceId: "pacific-heights",
    provider: "Recology",
    category: "Waste",
    portal: "recology.com/sf",
    accountNumberMasked: "•••• 3380",
    status: "connected",
    cadence: "monthly",
    lastPullISO: "2026-05-09T07:22:00Z",
    lastAmountCents: 28400,
    averageAmountCents: 28400,
  },
  {
    id: "acct-17",
    residenceId: "pacific-heights",
    provider: "Sonic Fiber",
    category: "Internet",
    portal: "sonic.com/account",
    accountNumberMasked: "•••• 9912",
    status: "rate_limited",
    cadence: "monthly",
    lastPullISO: "2026-05-09T07:23:00Z",
    lastAmountCents: 12000,
    averageAmountCents: 12000,
    notes: "Portal rate-limited the pull at 09:23 — retry scheduled in 6h.",
  },

  // ─── Casa Mariposa · Palm Beach ─────────────────────────────────────────
  {
    id: "acct-18",
    residenceId: "casa-mariposa",
    provider: "FPL",
    category: "Electric",
    portal: "fpl.com/my-account",
    accountNumberMasked: "•••• 2210",
    status: "connected",
    cadence: "monthly",
    lastPullISO: "2026-05-09T07:25:00Z",
    lastAmountCents: 348200,
    averageAmountCents: 268000,
    notes: "+30% seasonal cooling load — flagged for owner note.",
  },
  {
    id: "acct-19",
    residenceId: "casa-mariposa",
    provider: "Comcast Business",
    category: "Internet",
    portal: "business.comcast.com",
    accountNumberMasked: "•••• 7708",
    status: "connected",
    cadence: "monthly",
    lastPullISO: "2026-05-09T07:26:00Z",
    lastAmountCents: 62400,
    averageAmountCents: 62400,
  },
  {
    id: "acct-20",
    residenceId: "casa-mariposa",
    provider: "Town of Palm Beach Water",
    category: "Water",
    portal: "townofpalmbeach.com/water",
    accountNumberMasked: "•••• 4801",
    status: "connected",
    cadence: "monthly",
    lastPullISO: "2026-05-09T07:27:00Z",
    lastAmountCents: 122400,
    averageAmountCents: 118000,
  },
];

export function accountsByResidence(residenceId: string): ProviderAccount[] {
  return ACCOUNTS.filter((a) => a.residenceId === residenceId);
}

export function accountById(id: string): ProviderAccount | undefined {
  return ACCOUNTS.find((a) => a.id === id);
}

export function providerSet(): string[] {
  return Array.from(new Set(ACCOUNTS.map((a) => a.provider)));
}

// ─── Run-time statement projection ──────────────────────────────────────────
// The runner shows a streamed table of statements it pulled. We project one
// row per account from May, with realistic variation around the average.

export type PulledStatement = {
  id: string;
  accountId: string;
  provider: string;
  category: ProviderCategory;
  residenceId: string;
  residenceName: string;
  ownerInitials: string;
  amountCents: number;
  status: "matched" | "flagged";
  flagReason?: string;
};

export function projectedStatements(): PulledStatement[] {
  return ACCOUNTS.map((a) => {
    const residence = RESIDENCES.find((r) => r.id === a.residenceId);
    const flagged = !!a.notes && a.notes.includes("flagged");
    return {
      id: `stmt-${a.id}`,
      accountId: a.id,
      provider: a.provider,
      category: a.category,
      residenceId: a.residenceId,
      residenceName: residence?.name ?? "—",
      ownerInitials: residence?.ownerInitials ?? "··",
      amountCents: a.lastAmountCents,
      status: flagged ? "flagged" : "matched",
      flagReason: flagged ? a.notes : undefined,
    };
  });
}

export const PROVIDER_TOTAL = ACCOUNTS.length;
export const FLAGGED_COUNT = projectedStatements().filter(
  (s) => s.status === "flagged",
).length;
export const MATCHED_COUNT = PROVIDER_TOTAL - FLAGGED_COUNT;
