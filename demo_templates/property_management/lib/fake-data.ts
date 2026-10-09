/**
 * Deterministic fake data generation.
 *
 * All randomness is seeded by the company name so:
 *   - Each prospect's demo has unique-looking data
 *   - Re-running the build produces identical output
 *   - No "data jumps around" weirdness across page loads
 */

import { demoConfig } from "@/config/demo.config";

// Mulberry32 PRNG — small, deterministic, good enough
function makeRng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = makeRng(demoConfig.company.name);
const choice = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
const between = (min: number, max: number) => min + rng() * (max - min);
const intBetween = (min: number, max: number) => Math.floor(between(min, max + 1));

const STREET_NAMES = [
  "Maple", "Oak", "Cedar", "Pine", "Elm", "Birch", "Willow",
  "Magnolia", "Sycamore", "Linden", "Ash", "Cypress", "Hawthorne",
  "Juniper", "Poplar", "Spruce", "Chestnut", "Dogwood", "Laurel",
];
const STREET_TYPES = ["St", "Ave", "Blvd", "Ln", "Dr", "Way", "Pl"];

const FIRST_NAMES = [
  "Sarah", "Michael", "Jennifer", "David", "Lisa", "James", "Maria",
  "Robert", "Jessica", "William", "Ashley", "Christopher", "Amanda",
  "Daniel", "Stephanie", "Matthew", "Nicole", "Anthony", "Emily",
  "Mark", "Rachel", "Steven", "Laura", "Kevin", "Karen",
];
const LAST_NAMES = [
  "Chen", "Patel", "Rodriguez", "Kim", "Williams", "Johnson", "Martinez",
  "Garcia", "Brown", "Davis", "Miller", "Wilson", "Anderson", "Taylor",
  "Thomas", "Moore", "Jackson", "Martin", "Lee", "Thompson", "Nguyen",
  "Singh", "Cohen", "O'Brien", "Walsh",
];

export interface Property {
  id: string;
  address: string;
  city: string;
  units: number;
  type: "Multifamily" | "Townhomes" | "Single-family" | "Mixed-use";
  occupancy: number;
  monthlyRevenue: number;
  yearBuilt: number;
  manager: string;
}

export interface Unit {
  id: string;
  property: string;
  unitNumber: string;
  tenant: string;
}

export interface UtilityStatement {
  id: string;
  provider: string;
  property: string;
  unitNumber: string;
  tenant: string;
  amount: number;
  dueDate: string;
  serviceFrom: string;
  serviceTo: string;
  status: "pending" | "parsed" | "matched" | "posted" | "error";
}

export function generateProperties(): Property[] {
  const count = demoConfig.scale.properties;
  const totalUnits = demoConfig.scale.units;
  const avgUnitsPerProperty = totalUnits / count;
  const cityName = demoConfig.company.location.split(",")[0].trim();

  const props: Property[] = [];
  let unitsRemaining = totalUnits;

  for (let i = 0; i < count; i++) {
    const isLast = i === count - 1;
    const variance = between(0.5, 1.5);
    const units = isLast
      ? unitsRemaining
      : Math.max(2, Math.min(unitsRemaining - (count - i - 1) * 2,
          Math.round(avgUnitsPerProperty * variance)));
    unitsRemaining -= units;

    const number = intBetween(100, 9999);
    const street = choice(STREET_NAMES);
    const type = choice(STREET_TYPES);

    const propertyTypes: Property["type"][] = units > 20
      ? ["Multifamily", "Mixed-use"]
      : units > 6
      ? ["Multifamily", "Townhomes"]
      : ["Townhomes", "Single-family"];

    const avgRentByType: Record<Property["type"], number> = {
      Multifamily: 1850,
      "Mixed-use": 2400,
      Townhomes: 2200,
      "Single-family": 2650,
    };
    const ptype = choice(propertyTypes);
    const occupiedUnits = Math.max(1, units - intBetween(0, Math.max(1, Math.floor(units * 0.06))));
    const monthlyRevenue = Math.round(occupiedUnits * avgRentByType[ptype] * between(0.92, 1.08));

    props.push({
      id: `prop_${i + 1}`,
      address: `${number} ${street} ${type}`,
      city: cityName,
      units,
      type: ptype,
      occupancy: Math.round((occupiedUnits / units) * 1000) / 10,
      monthlyRevenue,
      yearBuilt: intBetween(1968, 2021),
      manager: `${choice(FIRST_NAMES)} ${choice(LAST_NAMES)}`,
    });
  }

  return props;
}

export function generateUtilityStatements(count: number = 47): UtilityStatement[] {
  const properties = generateProperties();
  const utilities = demoConfig.details.utilities ?? [
    "City Water", "Electric Co", "Gas Service",
  ];

  const stmts: UtilityStatement[] = [];

  for (let i = 0; i < count; i++) {
    const property = choice(properties);
    const unitNumber = String(intBetween(1, property.units)).padStart(2, "0");
    const provider = choice(utilities);

    const baseAmount = provider.toLowerCase().includes("water")
      ? between(45, 180)
      : provider.toLowerCase().includes("gas")
      ? between(25, 140)
      : between(80, 320);

    const dueDay = intBetween(15, 28);
    const status: UtilityStatement["status"] = i < 3 ? "error" : "posted";

    stmts.push({
      id: `stmt_${i + 1}`,
      provider,
      property: property.address,
      unitNumber: `Unit ${unitNumber}`,
      tenant: `${choice(FIRST_NAMES)} ${choice(LAST_NAMES)}`,
      amount: Math.round(baseAmount * 100) / 100,
      dueDate: `2026-05-${String(dueDay).padStart(2, "0")}`,
      serviceFrom: "2026-03-15",
      serviceTo: "2026-04-14",
      status,
    });
  }

  return stmts;
}

export function generateMaintenanceTickets(count: number = 24) {
  const properties = generateProperties();
  const issues = [
    "Leaking faucet in kitchen",
    "HVAC not cooling properly",
    "Clogged garbage disposal",
    "Bathroom exhaust fan broken",
    "Garage door opener malfunctioning",
    "Dishwasher not draining",
    "Water heater making noise",
    "Refrigerator not cooling",
    "Bedroom outlet not working",
    "Front door lock sticking",
    "Patio screen torn",
    "Smoke detector chirping",
  ];
  const priorities = ["low", "medium", "high", "urgent"] as const;
  const statuses = ["new", "assigned", "in_progress", "completed"] as const;

  return Array.from({ length: count }, (_, i) => {
    const property = choice(properties);
    return {
      id: `mnt_${i + 1}`,
      ticketNumber: `WO-${2026000 + i + 1}`,
      property: property.address,
      unit: `Unit ${String(intBetween(1, property.units)).padStart(2, "0")}`,
      tenant: `${choice(FIRST_NAMES)} ${choice(LAST_NAMES)}`,
      issue: choice(issues),
      priority: choice([...priorities]),
      status: choice([...statuses]),
      created: `2026-04-${String(intBetween(1, 27)).padStart(2, "0")}`,
    };
  });
}

export function generateVendors() {
  const types = [
    { name: "Plumbing", count: 4 },
    { name: "HVAC", count: 3 },
    { name: "Electrical", count: 3 },
    { name: "Landscaping", count: 5 },
    { name: "Pest Control", count: 2 },
    { name: "Cleaning", count: 6 },
    { name: "Roofing", count: 2 },
  ];

  const vendorNames: Record<string, string[]> = {
    Plumbing: ["Reliable Plumbing", "AAA Plumbing & Drain", "Pipemaster", "QuickFix Plumbing"],
    HVAC: ["Cool Air Solutions", "Climate Pros", "Mountain HVAC"],
    Electrical: ["Sparks Electric", "BrightLine Electrical", "Voltage Co"],
    Landscaping: ["Greenwood Landscape", "TerraLawn", "Outdoor Pros", "Yardsmith", "Bloom & Mow"],
    "Pest Control": ["BugOff Services", "Sentry Pest"],
    Cleaning: ["Pristine Clean", "Sparkle Co", "Janitech", "FreshStart", "TopShelf Cleaning", "Clearview"],
    Roofing: ["Apex Roofing", "Skyline Roofers"],
  };

  const vendors: Array<{
    id: string;
    name: string;
    type: string;
    rating: number;
    activeJobs: number;
    avgResponse: string;
  }> = [];
  let id = 1;
  for (const t of types) {
    for (let i = 0; i < t.count; i++) {
      vendors.push({
        id: `vnd_${id++}`,
        name: vendorNames[t.name][i] ?? `${t.name} Co ${i + 1}`,
        type: t.name,
        rating: Math.round(between(3.5, 5) * 10) / 10,
        activeJobs: intBetween(0, 8),
        avgResponse: `${intBetween(1, 24)}h`,
      });
    }
  }

  return vendors;
}
