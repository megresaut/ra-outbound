/**
 * Fixed fictional data for the maintenance / concierge-operations demo.
 * Same six residences as the billing demo so the two read as one product.
 */

export type Residence = {
  id: string;
  name: string;
  shortLocation: string;
  address: string;
  ownerInitials: string;
  estateManager: string;
  staff: number;
  recurringServices: number;
  hero: string;
};

export const RESIDENCES: Residence[] = [
  {
    id: "the-glade",
    name: "The Glade",
    shortLocation: "Bel Air, CA",
    address: "1244 Stradella Road · Bel Air, CA",
    ownerInitials: "AR",
    estateManager: "Theodora Avila",
    staff: 6,
    recurringServices: 14,
    hero: "linear-gradient(135deg, #2e3d36 0%, #4d5a4f 100%)",
  },
  {
    id: "aspen-compound",
    name: "Aspen Compound",
    shortLocation: "Aspen, CO",
    address: "76 Red Mountain Place · Aspen, CO",
    ownerInitials: "MK",
    estateManager: "Soren Halvorsen",
    staff: 4,
    recurringServices: 11,
    hero: "linear-gradient(135deg, #3a3d4a 0%, #5b6072 100%)",
  },
  {
    id: "meadow-house",
    name: "Meadow House",
    shortLocation: "East Hampton, NY",
    address: "Lily Pond Lane · East Hampton, NY",
    ownerInitials: "TF",
    estateManager: "Charlotte Ainsley",
    staff: 3,
    recurringServices: 9,
    hero: "linear-gradient(135deg, #2f3e4d 0%, #4f6275 100%)",
  },
  {
    id: "snake-river-ranch",
    name: "Snake River Ranch",
    shortLocation: "Jackson, WY",
    address: "1100 Spring Gulch Road · Jackson, WY",
    ownerInitials: "HV",
    estateManager: "Walker Hartwell",
    staff: 7,
    recurringServices: 18,
    hero: "linear-gradient(135deg, #3d3429 0%, #5a4d3f 100%)",
  },
  {
    id: "pacific-heights",
    name: "Pacific Heights Residence",
    shortLocation: "San Francisco, CA",
    address: "2840 Broadway · San Francisco, CA",
    ownerInitials: "JC",
    estateManager: "Mei Sato",
    staff: 3,
    recurringServices: 10,
    hero: "linear-gradient(135deg, #2d3540 0%, #4c576a 100%)",
  },
  {
    id: "casa-mariposa",
    name: "Casa Mariposa",
    shortLocation: "Palm Beach, FL",
    address: "1480 S Ocean Boulevard · Palm Beach, FL",
    ownerInitials: "OW",
    estateManager: "Renata Olivares",
    staff: 5,
    recurringServices: 13,
    hero: "linear-gradient(135deg, #3d3a2e 0%, #5f5a47 100%)",
  },
];

export type Vendor = {
  id: string;
  name: string;
  trade:
    | "Landscape"
    | "Pool / spa"
    | "HVAC"
    | "Security"
    | "Housekeeping"
    | "Plumbing"
    | "Electrical"
    | "Appliances"
    | "Wine / cellar"
    | "Audio / AV"
    | "Arborist"
    | "Painters";
  region: string;
  status: "active" | "standby" | "review";
  lastVisit: string;
  satisfaction: number; // 1-5
  jobsYTD: number;
  primaryContact: string;
  serves: string[]; // residence ids
};

export const VENDORS: Vendor[] = [
  {
    id: "mariposa-gardens",
    name: "Mariposa Gardens",
    trade: "Landscape",
    region: "Greater LA · Coastal",
    status: "active",
    lastVisit: "2026-05-18",
    satisfaction: 5,
    jobsYTD: 38,
    primaryContact: "Esteban Ruiz",
    serves: ["the-glade", "pacific-heights"],
  },
  {
    id: "westside-aquatic",
    name: "Westside Aquatic",
    trade: "Pool / spa",
    region: "Westside LA",
    status: "active",
    lastVisit: "2026-05-17",
    satisfaction: 4.8,
    jobsYTD: 32,
    primaryContact: "Holly Tan",
    serves: ["the-glade"],
  },
  {
    id: "bh-protective",
    name: "Beverly Hills Protective",
    trade: "Security",
    region: "Greater LA",
    status: "active",
    lastVisit: "2026-05-19",
    satisfaction: 4.9,
    jobsYTD: 56,
    primaryContact: "Marcus Bell",
    serves: ["the-glade", "pacific-heights"],
  },
  {
    id: "crown-mechanical",
    name: "Crown Mechanical",
    trade: "HVAC",
    region: "Greater LA",
    status: "standby",
    lastVisit: "2026-04-19",
    satisfaction: 4.5,
    jobsYTD: 6,
    primaryContact: "James Crown",
    serves: ["the-glade", "pacific-heights"],
  },
  {
    id: "alpine-grounds",
    name: "Alpine Grounds",
    trade: "Landscape",
    region: "Roaring Fork Valley",
    status: "active",
    lastVisit: "2026-05-15",
    satisfaction: 4.7,
    jobsYTD: 22,
    primaryContact: "Hannah Frey",
    serves: ["aspen-compound"],
  },
  {
    id: "summit-mech",
    name: "Summit Mechanical",
    trade: "HVAC",
    region: "Aspen / Snowmass",
    status: "active",
    lastVisit: "2026-05-12",
    satisfaction: 4.6,
    jobsYTD: 14,
    primaryContact: "Diego Vargas",
    serves: ["aspen-compound", "snake-river-ranch"],
  },
  {
    id: "teton-arborists",
    name: "Teton Arborists",
    trade: "Arborist",
    region: "Jackson Hole",
    status: "active",
    lastVisit: "2026-05-09",
    satisfaction: 4.9,
    jobsYTD: 19,
    primaryContact: "Will Petersen",
    serves: ["snake-river-ranch"],
  },
  {
    id: "ranch-mgmt-coop",
    name: "Snake River Ranch Co-op",
    trade: "Landscape",
    region: "Jackson Hole",
    status: "active",
    lastVisit: "2026-05-18",
    satisfaction: 4.8,
    jobsYTD: 41,
    primaryContact: "Beth Kallen",
    serves: ["snake-river-ranch"],
  },
  {
    id: "hampton-grounds",
    name: "Hampton Grounds Co.",
    trade: "Landscape",
    region: "South Fork, LI",
    status: "active",
    lastVisit: "2026-05-16",
    satisfaction: 4.4,
    jobsYTD: 27,
    primaryContact: "Carl Reeve",
    serves: ["meadow-house"],
  },
  {
    id: "north-shore-pool",
    name: "North Shore Pool & Spa",
    trade: "Pool / spa",
    region: "Long Island",
    status: "review",
    lastVisit: "2026-05-08",
    satisfaction: 3.6,
    jobsYTD: 14,
    primaryContact: "Donna Imber",
    serves: ["meadow-house"],
  },
  {
    id: "atlantic-protective",
    name: "Atlantic Protective Services",
    trade: "Security",
    region: "Hamptons / Palm Beach",
    status: "active",
    lastVisit: "2026-05-19",
    satisfaction: 4.7,
    jobsYTD: 49,
    primaryContact: "Vincent Park",
    serves: ["meadow-house", "casa-mariposa"],
  },
  {
    id: "palm-aquatics",
    name: "Palm Aquatics",
    trade: "Pool / spa",
    region: "Palm Beach County",
    status: "active",
    lastVisit: "2026-05-17",
    satisfaction: 4.9,
    jobsYTD: 30,
    primaryContact: "Rosa Quintero",
    serves: ["casa-mariposa"],
  },
  {
    id: "coastal-hvac",
    name: "Coastal HVAC Services",
    trade: "HVAC",
    region: "South Florida",
    status: "active",
    lastVisit: "2026-05-14",
    satisfaction: 4.5,
    jobsYTD: 21,
    primaryContact: "Errol Banks",
    serves: ["casa-mariposa"],
  },
  {
    id: "bay-fine-finish",
    name: "Bay Fine Finish",
    trade: "Painters",
    region: "SF Bay",
    status: "standby",
    lastVisit: "2026-03-21",
    satisfaction: 4.8,
    jobsYTD: 3,
    primaryContact: "Liu Wen",
    serves: ["pacific-heights"],
  },
  {
    id: "pacific-electric",
    name: "Pacific Electric Co.",
    trade: "Electrical",
    region: "SF Bay",
    status: "active",
    lastVisit: "2026-05-11",
    satisfaction: 4.6,
    jobsYTD: 12,
    primaryContact: "Anand Iyer",
    serves: ["pacific-heights", "the-glade"],
  },
  {
    id: "highland-plumbing",
    name: "Highland Plumbing",
    trade: "Plumbing",
    region: "Greater LA",
    status: "active",
    lastVisit: "2026-05-13",
    satisfaction: 4.5,
    jobsYTD: 18,
    primaryContact: "Diane Park",
    serves: ["the-glade", "pacific-heights"],
  },
  {
    id: "summit-cellars",
    name: "Summit Cellars",
    trade: "Wine / cellar",
    region: "National (specialty)",
    status: "standby",
    lastVisit: "2026-04-02",
    satisfaction: 5.0,
    jobsYTD: 4,
    primaryContact: "Geoff Mahler",
    serves: ["the-glade", "snake-river-ranch", "aspen-compound"],
  },
  {
    id: "lyric-av",
    name: "Lyric AV",
    trade: "Audio / AV",
    region: "Bicoastal",
    status: "active",
    lastVisit: "2026-05-05",
    satisfaction: 4.7,
    jobsYTD: 9,
    primaryContact: "Priya Shah",
    serves: ["the-glade", "casa-mariposa", "meadow-house"],
  },
];

export type WorkOrderStatus =
  | "new"
  | "scheduled"
  | "in_progress"
  | "awaiting_owner"
  | "done";
export type WorkOrderPriority = "routine" | "elevated" | "urgent";

export type WorkOrder = {
  id: string;
  residenceId: string;
  title: string;
  trade: Vendor["trade"];
  vendorId: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  scheduledFor: string | null;
  createdAt: string;
  notes: string;
  raisedBy: string;
};

export const WORK_ORDERS: WorkOrder[] = [
  // NEW
  {
    id: "wo-1001",
    residenceId: "meadow-house",
    title: "Pool heater intermittent · diagnostic + repair",
    trade: "Pool / spa",
    vendorId: "north-shore-pool",
    priority: "elevated",
    status: "new",
    scheduledFor: null,
    createdAt: "2026-05-19T11:42:00Z",
    notes:
      "Estate manager reports heater cycling off after 20 min. Vendor on review status — second opinion requested from Atlantic Mechanical (pending intro).",
    raisedBy: "Charlotte Ainsley",
  },
  {
    id: "wo-1002",
    residenceId: "the-glade",
    title: "Wine cellar humidity drift · investigate climate unit",
    trade: "Wine / cellar",
    vendorId: "summit-cellars",
    priority: "elevated",
    status: "new",
    scheduledFor: null,
    createdAt: "2026-05-19T08:11:00Z",
    notes:
      "Sensor logged 67% RH overnight (target 55–60%). Owner travelling next week — schedule before Wed.",
    raisedBy: "Theodora Avila",
  },
  {
    id: "wo-1003",
    residenceId: "casa-mariposa",
    title: "Seasonal hurricane-shutter inspection · all openings",
    trade: "HVAC",
    vendorId: "coastal-hvac",
    priority: "routine",
    status: "new",
    scheduledFor: null,
    createdAt: "2026-05-18T14:55:00Z",
    notes:
      "Annual pre-season check. Coordinate with Atlantic Protective for the alarm shunt during testing.",
    raisedBy: "Renata Olivares",
  },

  // SCHEDULED
  {
    id: "wo-2001",
    residenceId: "the-glade",
    title: "Pool heater replacement · install new unit + leak test",
    trade: "Pool / spa",
    vendorId: "westside-aquatic",
    priority: "elevated",
    status: "scheduled",
    scheduledFor: "2026-05-20T15:00:00Z",
    createdAt: "2026-05-12T09:20:00Z",
    notes:
      "Replacement unit on site. Estimate $14,800 — owner approved via email 5/14. Coordinate staff entry 8a–1p.",
    raisedBy: "Theodora Avila",
  },
  {
    id: "wo-2002",
    residenceId: "snake-river-ranch",
    title: "Annual tree health survey · 220-acre grounds",
    trade: "Arborist",
    vendorId: "teton-arborists",
    priority: "routine",
    status: "scheduled",
    scheduledFor: "2026-05-22T16:00:00Z",
    createdAt: "2026-05-01T10:00:00Z",
    notes:
      "Two-day survey · drone + ground inspection. Looking for bark beetle activity in north pasture.",
    raisedBy: "Walker Hartwell",
  },
  {
    id: "wo-2003",
    residenceId: "aspen-compound",
    title: "Snowmelt boiler shutdown · summer mode",
    trade: "HVAC",
    vendorId: "summit-mech",
    priority: "routine",
    status: "scheduled",
    scheduledFor: "2026-05-21T18:00:00Z",
    createdAt: "2026-05-08T14:30:00Z",
    notes:
      "Standard seasonal transition. Drain driveway loops, isolate boiler, swap thermostats to ventilation profile.",
    raisedBy: "Soren Halvorsen",
  },
  {
    id: "wo-2004",
    residenceId: "casa-mariposa",
    title: "Generator load test + fuel polish",
    trade: "Electrical",
    vendorId: "pacific-electric",
    priority: "routine",
    status: "scheduled",
    scheduledFor: "2026-05-23T14:00:00Z",
    createdAt: "2026-05-10T11:10:00Z",
    notes: "Pre-hurricane-season routine. 90-minute window, no power interruption expected.",
    raisedBy: "Renata Olivares",
  },

  // IN PROGRESS
  {
    id: "wo-3001",
    residenceId: "pacific-heights",
    title: "Roof gutter clearing + minor flashing repair",
    trade: "Landscape",
    vendorId: "mariposa-gardens",
    priority: "routine",
    status: "in_progress",
    scheduledFor: "2026-05-19T13:00:00Z",
    createdAt: "2026-05-15T09:00:00Z",
    notes: "Crew on site since 9:15a. Expected completion 4p.",
    raisedBy: "Mei Sato",
  },
  {
    id: "wo-3002",
    residenceId: "snake-river-ranch",
    title: "Guesthouse master suite repaint · prep + 2 coats",
    trade: "Painters",
    vendorId: "bay-fine-finish",
    priority: "routine",
    status: "in_progress",
    scheduledFor: "2026-05-17T14:00:00Z",
    createdAt: "2026-05-02T10:00:00Z",
    notes: "Day 3 of 5. On schedule. Owner returns 5/27 — comfortable buffer.",
    raisedBy: "Walker Hartwell",
  },
  {
    id: "wo-3003",
    residenceId: "meadow-house",
    title: "Foyer chandelier rewire · LED retrofit",
    trade: "Electrical",
    vendorId: "pacific-electric",
    priority: "routine",
    status: "in_progress",
    scheduledFor: "2026-05-19T16:00:00Z",
    createdAt: "2026-05-11T12:00:00Z",
    notes:
      "Lift in place. New driver fitted, dimmer compatibility check this afternoon.",
    raisedBy: "Charlotte Ainsley",
  },

  // AWAITING OWNER
  {
    id: "wo-4001",
    residenceId: "the-glade",
    title: "Replace 1986 boiler · two-quote comparison",
    trade: "HVAC",
    vendorId: "crown-mechanical",
    priority: "elevated",
    status: "awaiting_owner",
    scheduledFor: null,
    createdAt: "2026-05-04T15:00:00Z",
    notes:
      "Two bids attached ($38,200 / $44,900). Recommendation: Crown — longer warranty, in-house aftercare. Awaiting A.R. Family Office sign-off.",
    raisedBy: "Theodora Avila",
  },
  {
    id: "wo-4002",
    residenceId: "aspen-compound",
    title: "Greenhouse irrigation overhaul · capital project",
    trade: "Landscape",
    vendorId: "alpine-grounds",
    priority: "routine",
    status: "awaiting_owner",
    scheduledFor: null,
    createdAt: "2026-04-30T18:00:00Z",
    notes:
      "Proposal $22,400. Includes drip lines, control valve replacement, and 2-year warranty. Owner reviewing in 5/22 call.",
    raisedBy: "Soren Halvorsen",
  },

  // DONE (recent)
  {
    id: "wo-5001",
    residenceId: "casa-mariposa",
    title: "Salt-air corrosion inspection · gate hardware",
    trade: "Security",
    vendorId: "atlantic-protective",
    priority: "routine",
    status: "done",
    scheduledFor: "2026-05-17T15:00:00Z",
    createdAt: "2026-05-09T10:00:00Z",
    notes: "Light pitting on south-gate latch — replacement ordered, ETA 5/24.",
    raisedBy: "Renata Olivares",
  },
  {
    id: "wo-5002",
    residenceId: "the-glade",
    title: "Rose pruning · biannual",
    trade: "Landscape",
    vendorId: "mariposa-gardens",
    priority: "routine",
    status: "done",
    scheduledFor: "2026-05-15T15:00:00Z",
    createdAt: "2026-05-01T08:30:00Z",
    notes: "Completed cleanly. Next pass scheduled 11/14.",
    raisedBy: "Theodora Avila",
  },
  {
    id: "wo-5003",
    residenceId: "snake-river-ranch",
    title: "Spring barn opening · safety walk + fire-extinguisher recharge",
    trade: "Security",
    vendorId: "atlantic-protective",
    priority: "routine",
    status: "done",
    scheduledFor: "2026-05-12T16:00:00Z",
    createdAt: "2026-04-25T10:00:00Z",
    notes: "All 11 extinguishers recharged; one replaced. No hazards noted.",
    raisedBy: "Walker Hartwell",
  },
  {
    id: "wo-5004",
    residenceId: "pacific-heights",
    title: "Kitchen Sub-Zero · annual service",
    trade: "Appliances",
    vendorId: "bay-fine-finish",
    priority: "routine",
    status: "done",
    scheduledFor: "2026-05-11T17:00:00Z",
    createdAt: "2026-05-02T12:00:00Z",
    notes: "Compressor and condenser cleaned. Filter changed.",
    raisedBy: "Mei Sato",
  },
];

export function vendorById(id: string): Vendor | undefined {
  return VENDORS.find((v) => v.id === id);
}

export function residenceById(id: string): Residence | undefined {
  return RESIDENCES.find((r) => r.id === id);
}

export function workOrdersFor(residenceId: string): WorkOrder[] {
  return WORK_ORDERS.filter((w) => w.residenceId === residenceId);
}

// Per-residence maintenance timeline (recurring + ad-hoc) — extends what's in
// WORK_ORDERS with recurring service cadence so the per-property timeline reads
// like a real estate book of business.

export type TimelineEntry = {
  date: string;
  kind: "completed" | "scheduled" | "recurring";
  title: string;
  vendorName: string;
  trade: Vendor["trade"];
  detail?: string;
};

export function timelineFor(residenceId: string): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  for (const wo of workOrdersFor(residenceId)) {
    const v = vendorById(wo.vendorId);
    if (!v) continue;
    if (wo.status === "done" && wo.scheduledFor) {
      entries.push({
        date: wo.scheduledFor,
        kind: "completed",
        title: wo.title,
        vendorName: v.name,
        trade: wo.trade,
        detail: wo.notes,
      });
    } else if (
      (wo.status === "scheduled" || wo.status === "in_progress") &&
      wo.scheduledFor
    ) {
      entries.push({
        date: wo.scheduledFor,
        kind: "scheduled",
        title: wo.title,
        vendorName: v.name,
        trade: wo.trade,
        detail: wo.notes,
      });
    }
  }

  const RECURRING_BY_RESIDENCE: Record<string, TimelineEntry[]> = {
    "the-glade": [
      {
        date: "2026-05-21",
        kind: "recurring",
        title: "Pool service · weekly",
        vendorName: "Westside Aquatic",
        trade: "Pool / spa",
      },
      {
        date: "2026-05-21",
        kind: "recurring",
        title: "Landscape · weekly",
        vendorName: "Mariposa Gardens",
        trade: "Landscape",
      },
      {
        date: "2026-05-26",
        kind: "recurring",
        title: "Housekeeping · staff deep clean",
        vendorName: "In-house staff",
        trade: "Housekeeping",
      },
    ],
    "aspen-compound": [
      {
        date: "2026-05-24",
        kind: "recurring",
        title: "Landscape · biweekly summer",
        vendorName: "Alpine Grounds",
        trade: "Landscape",
      },
    ],
    "meadow-house": [
      {
        date: "2026-05-23",
        kind: "recurring",
        title: "Pool service · weekly",
        vendorName: "North Shore Pool & Spa",
        trade: "Pool / spa",
      },
      {
        date: "2026-05-23",
        kind: "recurring",
        title: "Landscape · weekly",
        vendorName: "Hampton Grounds Co.",
        trade: "Landscape",
      },
    ],
    "snake-river-ranch": [
      {
        date: "2026-05-25",
        kind: "recurring",
        title: "Grounds · weekly pasture rounds",
        vendorName: "Snake River Ranch Co-op",
        trade: "Landscape",
      },
    ],
    "pacific-heights": [
      {
        date: "2026-05-26",
        kind: "recurring",
        title: "Housekeeping · staff deep clean",
        vendorName: "In-house staff",
        trade: "Housekeeping",
      },
    ],
    "casa-mariposa": [
      {
        date: "2026-05-24",
        kind: "recurring",
        title: "Pool service · weekly",
        vendorName: "Palm Aquatics",
        trade: "Pool / spa",
      },
      {
        date: "2026-05-26",
        kind: "recurring",
        title: "Landscape · weekly",
        vendorName: "Hampton Grounds Co.",
        trade: "Landscape",
      },
    ],
  };

  for (const e of RECURRING_BY_RESIDENCE[residenceId] ?? []) {
    entries.push(e);
  }

  return entries.sort((a, b) => a.date.localeCompare(b.date));
}

export const STATUS_LABEL: Record<WorkOrderStatus, string> = {
  new: "New",
  scheduled: "Scheduled",
  in_progress: "In progress",
  awaiting_owner: "Awaiting owner",
  done: "Done",
};

export const STATUS_ORDER: WorkOrderStatus[] = [
  "new",
  "scheduled",
  "in_progress",
  "awaiting_owner",
  "done",
];

export function workOrdersByStatus(): Record<WorkOrderStatus, WorkOrder[]> {
  const out: Record<WorkOrderStatus, WorkOrder[]> = {
    new: [],
    scheduled: [],
    in_progress: [],
    awaiting_owner: [],
    done: [],
  };
  for (const wo of WORK_ORDERS) out[wo.status].push(wo);
  return out;
}
