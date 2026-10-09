/**
 * Fixed fictional data for the utility / owner-billing demo.
 * Believable luxury-estate portfolio. No real owners, no real addresses.
 */

export type Residence = {
  id: string;
  name: string;
  shortLocation: string;
  address: string;
  ownerInitials: string;
  ownerDisplay: string;
  sqft: number;
  acres: number | null;
  staff: number;
  monthlyOpCents: number;
  managementFeeCents: number;
  utilities: string[];
  vendorCount: number;
  status: "current" | "pending" | "exception";
  lastStatementSentISO: string;
  hero: string;
};

export const RESIDENCES: Residence[] = [
  {
    id: "the-glade",
    name: "The Glade",
    shortLocation: "Bel Air, CA",
    address: "1244 Stradella Road · Bel Air, CA",
    ownerInitials: "AR",
    ownerDisplay: "Owner · A.R. Family Office",
    sqft: 18400,
    acres: 1.2,
    staff: 6,
    monthlyOpCents: 8424700,
    managementFeeCents: 632000,
    utilities: ["LADWP", "SoCalGas", "Spectrum", "Veolia"],
    vendorCount: 14,
    status: "current",
    lastStatementSentISO: "2026-05-03",
    hero: "linear-gradient(135deg, #2e3d36 0%, #4d5a4f 100%)",
  },
  {
    id: "aspen-compound",
    name: "Aspen Compound",
    shortLocation: "Aspen, CO",
    address: "76 Red Mountain Place · Aspen, CO",
    ownerInitials: "MK",
    ownerDisplay: "Owner · M. Karlsson Trust",
    sqft: 12000,
    acres: 3.4,
    staff: 4,
    monthlyOpCents: 6128400,
    managementFeeCents: 459000,
    utilities: ["Holy Cross Energy", "Black Hills Energy", "Comcast"],
    vendorCount: 11,
    status: "current",
    lastStatementSentISO: "2026-05-03",
    hero: "linear-gradient(135deg, #3a3d4a 0%, #5b6072 100%)",
  },
  {
    id: "meadow-house",
    name: "Meadow House",
    shortLocation: "East Hampton, NY",
    address: "Lily Pond Lane · East Hampton, NY",
    ownerInitials: "TF",
    ownerDisplay: "Owner · The Fairview Trust",
    sqft: 9200,
    acres: 2.1,
    staff: 3,
    monthlyOpCents: 4287200,
    managementFeeCents: 321000,
    utilities: ["PSEG Long Island", "National Grid", "Optimum"],
    vendorCount: 9,
    status: "exception",
    lastStatementSentISO: "2026-04-04",
    hero: "linear-gradient(135deg, #2f3e4d 0%, #4f6275 100%)",
  },
  {
    id: "snake-river-ranch",
    name: "Snake River Ranch",
    shortLocation: "Jackson, WY",
    address: "1100 Spring Gulch Road · Jackson, WY",
    ownerInitials: "HV",
    ownerDisplay: "Owner · Hartwell Ventures LLC",
    sqft: 14500,
    acres: 220,
    staff: 7,
    monthlyOpCents: 9712400,
    managementFeeCents: 728000,
    utilities: ["Lower Valley Energy", "Silver Star", "Starlink Business"],
    vendorCount: 18,
    status: "current",
    lastStatementSentISO: "2026-05-03",
    hero: "linear-gradient(135deg, #3d3429 0%, #5a4d3f 100%)",
  },
  {
    id: "pacific-heights",
    name: "Pacific Heights Residence",
    shortLocation: "San Francisco, CA",
    address: "2840 Broadway · San Francisco, CA",
    ownerInitials: "JC",
    ownerDisplay: "Owner · J. Chen (private)",
    sqft: 11800,
    acres: null,
    staff: 3,
    monthlyOpCents: 5142800,
    managementFeeCents: 386000,
    utilities: ["PG&E", "Recology", "Sonic Fiber"],
    vendorCount: 10,
    status: "pending",
    lastStatementSentISO: "2026-04-03",
    hero: "linear-gradient(135deg, #2d3540 0%, #4c576a 100%)",
  },
  {
    id: "casa-mariposa",
    name: "Casa Mariposa",
    shortLocation: "Palm Beach, FL",
    address: "1480 S Ocean Boulevard · Palm Beach, FL",
    ownerInitials: "OW",
    ownerDisplay: "Owner · Oakwell Holdings",
    sqft: 16200,
    acres: 1.6,
    staff: 5,
    monthlyOpCents: 7836500,
    managementFeeCents: 587000,
    utilities: ["FPL", "Comcast Business", "Town of Palm Beach Water"],
    vendorCount: 13,
    status: "current",
    lastStatementSentISO: "2026-05-03",
    hero: "linear-gradient(135deg, #3d3a2e 0%, #5f5a47 100%)",
  },
];

export type StatementLineItem = {
  id: string;
  category:
    | "utility"
    | "grounds"
    | "pool"
    | "security"
    | "staff"
    | "repair"
    | "supplies"
    | "fee";
  description: string;
  vendor: string;
  invoiceRef: string;
  serviceDate: string;
  amountCents: number;
  source: "portal" | "email" | "manual" | "computed";
  matchConfidence: number; // 0-1
};

export type Statement = {
  id: string;
  residenceId: string;
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  preparedDate: string;
  sentDate: string | null;
  status: "sent" | "ready" | "exception" | "draft";
  ownerName: string;
  ownerEmail: string;
  lineItems: StatementLineItem[];
  managementFeeRate: number; // 0-1
  notes: string | null;
};

// One worked-up statement for "The Glade" — this is the page-1 example.
export const STATEMENTS: Statement[] = [
  {
    id: "stmt-2026-04-the-glade",
    residenceId: "the-glade",
    periodLabel: "April 2026",
    periodStart: "2026-04-01",
    periodEnd: "2026-04-30",
    preparedDate: "2026-05-02",
    sentDate: "2026-05-03",
    status: "sent",
    ownerName: "A.R. Family Office",
    ownerEmail: "accounting@arfamilyoffice.example",
    managementFeeRate: 0.075,
    notes:
      "Pool heater replacement scheduled for May 18 — provisional estimate of $14,800 will appear on May statement; final invoice pending.",
    lineItems: [
      {
        id: "li-1",
        category: "utility",
        description: "Electricity · main residence + guest house",
        vendor: "LADWP",
        invoiceRef: "LADWP · 8842-7710",
        serviceDate: "2026-04-28",
        amountCents: 484200,
        source: "portal",
        matchConfidence: 0.99,
      },
      {
        id: "li-2",
        category: "utility",
        description: "Natural gas · radiant floor + pool heat",
        vendor: "SoCalGas",
        invoiceRef: "SCG · 5180-2204",
        serviceDate: "2026-04-26",
        amountCents: 218400,
        source: "portal",
        matchConfidence: 0.99,
      },
      {
        id: "li-3",
        category: "utility",
        description: "Water · estate + landscape irrigation",
        vendor: "LADWP Water",
        invoiceRef: "LADWP · 8842-W221",
        serviceDate: "2026-04-26",
        amountCents: 312700,
        source: "portal",
        matchConfidence: 0.98,
      },
      {
        id: "li-4",
        category: "utility",
        description: "Internet · Business fiber, 5Gbps",
        vendor: "Spectrum Business",
        invoiceRef: "SPC · INV-001188",
        serviceDate: "2026-04-15",
        amountCents: 78900,
        source: "portal",
        matchConfidence: 0.99,
      },
      {
        id: "li-5",
        category: "grounds",
        description: "Landscape maintenance · weekly + monthly rose pruning",
        vendor: "Mariposa Gardens",
        invoiceRef: "MG-2604-118",
        serviceDate: "2026-04-30",
        amountCents: 1248000,
        source: "email",
        matchConfidence: 0.96,
      },
      {
        id: "li-6",
        category: "pool",
        description: "Pool & spa service · weekly chemistry + filter clean",
        vendor: "Westside Aquatic",
        invoiceRef: "WSA-04-2026",
        serviceDate: "2026-04-30",
        amountCents: 184000,
        source: "email",
        matchConfidence: 0.97,
      },
      {
        id: "li-7",
        category: "security",
        description: "Security monitoring · 24/7 + 4 site visits",
        vendor: "Beverly Hills Protective",
        invoiceRef: "BHP-2604",
        serviceDate: "2026-04-30",
        amountCents: 642000,
        source: "email",
        matchConfidence: 0.99,
      },
      {
        id: "li-8",
        category: "staff",
        description:
          "Household staff payroll reimbursement (estate manager, 2 housekeepers, chef)",
        vendor: "OnPay · payroll passthrough",
        invoiceRef: "OP-PR-APR2026",
        serviceDate: "2026-04-30",
        amountCents: 3892800,
        source: "portal",
        matchConfidence: 1.0,
      },
      {
        id: "li-9",
        category: "supplies",
        description: "Household supplies & provisioning (April)",
        vendor: "Concierge purchases · receipts attached",
        invoiceRef: "EXP-2604",
        serviceDate: "2026-04-30",
        amountCents: 187400,
        source: "manual",
        matchConfidence: 0.92,
      },
      {
        id: "li-10",
        category: "repair",
        description: "HVAC zone-3 thermostat replacement + system check",
        vendor: "Crown Mechanical",
        invoiceRef: "CM-04-1182",
        serviceDate: "2026-04-19",
        amountCents: 144800,
        source: "email",
        matchConfidence: 0.94,
      },
      {
        id: "li-11",
        category: "repair",
        description: "Guest house dishwasher repair · service call + part",
        vendor: "Appliance Pros",
        invoiceRef: "AP-7740",
        serviceDate: "2026-04-11",
        amountCents: 87200,
        source: "email",
        matchConfidence: 0.93,
      },
      {
        id: "li-12",
        category: "fee",
        description: "Management fee · 7.5% of pass-through operating costs",
        vendor: "Pinecrest Estate Group",
        invoiceRef: "internal · computed",
        serviceDate: "2026-04-30",
        amountCents: 632000,
        source: "computed",
        matchConfidence: 1.0,
      },
    ],
  },
];

// Activity feed entries for dashboard
export type FeedEvent = {
  id: string;
  kind: "statement_sent" | "exception" | "invoice_matched" | "owner_paid" | "draft_ready";
  residenceId: string;
  message: string;
  timestamp: string; // ISO
};

export const FEED: FeedEvent[] = [
  {
    id: "f1",
    kind: "owner_paid",
    residenceId: "the-glade",
    message: "A.R. Family Office · wire received · $90,569.00",
    timestamp: "2026-05-08T14:24:00Z",
  },
  {
    id: "f2",
    kind: "owner_paid",
    residenceId: "snake-river-ranch",
    message: "Hartwell Ventures · ACH received · $104,404.00",
    timestamp: "2026-05-07T19:11:00Z",
  },
  {
    id: "f3",
    kind: "exception",
    residenceId: "meadow-house",
    message:
      "Optimum invoice exceeds rolling 90-day median by 38% — flagged for review",
    timestamp: "2026-05-06T09:02:00Z",
  },
  {
    id: "f4",
    kind: "statement_sent",
    residenceId: "casa-mariposa",
    message: "April statement sent to Oakwell Holdings · $83,235.00",
    timestamp: "2026-05-03T15:18:00Z",
  },
  {
    id: "f5",
    kind: "statement_sent",
    residenceId: "aspen-compound",
    message: "April statement sent to M. Karlsson Trust · $65,874.00",
    timestamp: "2026-05-03T15:17:00Z",
  },
  {
    id: "f6",
    kind: "statement_sent",
    residenceId: "the-glade",
    message: "April statement sent to A.R. Family Office · $90,569.00",
    timestamp: "2026-05-03T15:16:00Z",
  },
  {
    id: "f7",
    kind: "invoice_matched",
    residenceId: "pacific-heights",
    message: "PG&E April invoice auto-matched to recurring expense (98% conf.)",
    timestamp: "2026-05-02T11:42:00Z",
  },
  {
    id: "f8",
    kind: "draft_ready",
    residenceId: "pacific-heights",
    message:
      "April draft ready for review · 1 manual line item awaiting categorization",
    timestamp: "2026-05-01T17:30:00Z",
  },
];

// Reconciliation — what the spreadsheet looked like vs. what the system does.
export type ReconRow = {
  invoice: string;
  vendor: string;
  amountCents: number;
  expected: number; // baseline cents for comparison
  status: "matched" | "exception" | "manual";
  reason?: string;
};

export const RECON_INBOUND = 184; // invoices received this period
export const RECON_AUTO_MATCHED = 171;
export const RECON_EXCEPTIONS = 9;
export const RECON_MANUAL = 4;

export const RECON_FLAGGED: ReconRow[] = [
  {
    invoice: "Optimum · INV-90412",
    vendor: "Optimum",
    amountCents: 71200,
    expected: 51400,
    status: "exception",
    reason: "+38% vs. 90-day median",
  },
  {
    invoice: "Crown Mechanical · CM-04-1182",
    vendor: "Crown Mechanical",
    amountCents: 144800,
    expected: 0,
    status: "exception",
    reason: "Non-recurring · new vendor relationship",
  },
  {
    invoice: "EXP-2604 (provisioning)",
    vendor: "Concierge purchases",
    amountCents: 187400,
    expected: 0,
    status: "manual",
    reason: "Receipts attached · awaiting category assignment",
  },
  {
    invoice: "FPL · 4488-2210",
    vendor: "FPL",
    amountCents: 348200,
    expected: 268000,
    status: "exception",
    reason: "+30% — Palm Beach (seasonal cooling load)",
  },
];

export function residenceById(id: string): Residence | undefined {
  return RESIDENCES.find((r) => r.id === id);
}

export function statementById(id: string): Statement | undefined {
  return STATEMENTS.find((s) => s.id === id);
}

// Roll-ups
export function statementSubtotalCents(s: Statement): number {
  return s.lineItems
    .filter((li) => li.category !== "fee")
    .reduce((acc, li) => acc + li.amountCents, 0);
}

export function statementTotalCents(s: Statement): number {
  return s.lineItems.reduce((acc, li) => acc + li.amountCents, 0);
}
