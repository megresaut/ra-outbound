/**
 * Deterministic fake data generation, vertical-aware.
 *
 * Seeded by company name so each prospect gets unique-looking
 * but stable data. Pulls vertical-specific vocabulary from the
 * vertical pack.
 */

import { demoConfig } from "@/config/demo.config";
import { verticalPacks } from "@/config/verticals";

const pack = verticalPacks[demoConfig.vertical];

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

const rng = makeRng(`${demoConfig.company.name}::${demoConfig.vertical}`);
const choice = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
const between = (min: number, max: number) => min + rng() * (max - min);
const intBetween = (min: number, max: number) =>
  Math.floor(between(min, max + 1));

const FIRST_NAMES = [
  "James", "Maria", "Robert", "Jennifer", "Michael", "Lisa", "David",
  "Sarah", "Daniel", "Karen", "Mark", "Jessica", "Anthony", "Amanda",
  "Steven", "Rachel", "Kevin", "Nicole", "Brian", "Stephanie",
];
const LAST_NAMES_TECH = [
  "Reyes", "Nguyen", "O'Brien", "Patel", "Williams", "Johnson", "Martinez",
  "Garcia", "Cohen", "Singh", "Walsh", "Rodriguez", "Chen", "Kim", "Brown",
];
const LAST_NAMES_CUSTOMER = [
  "Anderson", "Taylor", "Thomas", "Moore", "Jackson", "Martin", "Lee",
  "Thompson", "White", "Harris", "Clark", "Lewis", "Young", "King",
  "Scott", "Green", "Adams", "Baker", "Hill", "Nelson",
];
const STREET_NAMES = [
  "Maple", "Oak", "Cedar", "Pine", "Elm", "Birch", "Willow",
  "Magnolia", "Sycamore", "Linden", "Ash", "Cypress", "Hawthorne",
  "Juniper", "Poplar", "Spruce", "Chestnut", "Dogwood", "Laurel",
  "Mesa", "Ridge", "Valley", "Highland", "Park",
];
const STREET_TYPES = ["St", "Ave", "Blvd", "Ln", "Dr", "Way", "Pl", "Ct"];

export interface Ticket {
  id: string;
  ticketNumber: string;
  source: "phone" | "form" | "email" | "platform" | "sms";
  customer: string;
  address: string;
  issue: string;
  category: "emergency" | "service" | "maintenance" | "install";
  priority: "urgent" | "high" | "medium" | "low";
  status: "new" | "classified" | "assigned" | "scheduled" | "completed";
  createdAt: string;
  scheduledFor?: string;
  assignedTech?: string;
  estimatedMinutes: number;
}

export interface Tech {
  id: string;
  name: string;
  initials: string;
  skills: string[];
  rating: number;
  jobsToday: number;
  jobsThisWeek: number;
  status: "on_job" | "traveling" | "available" | "off";
  truck: string;
}

function fakeAddress(): string {
  const number = intBetween(100, 9999);
  const street = choice(STREET_NAMES);
  const type = choice(STREET_TYPES);
  return `${number} ${street} ${type}`;
}

function fakeTechName(): { name: string; initials: string } {
  const first = choice(FIRST_NAMES);
  const last = choice(LAST_NAMES_TECH);
  return {
    name: `${first} ${last}`,
    initials: `${first[0]}${last[0]}`,
  };
}

function fakeCustomerName(): string {
  return `${choice(FIRST_NAMES)} ${choice(LAST_NAMES_CUSTOMER)}`;
}

const sources: Array<Ticket["source"]> = ["phone", "form", "email", "platform"];

export function generateTickets(count: number = 13): Ticket[] {
  const tickets: Ticket[] = [];

  // First few are emergencies (deterministic for the demo punch)
  const emergencyTypes = pack.issueTypes.filter((t) => t.category === "emergency");
  const otherTypes = pack.issueTypes.filter((t) => t.category !== "emergency");

  for (let i = 0; i < count; i++) {
    const isEmergency = i < 2 && emergencyTypes.length > 0;
    const issueType = isEmergency
      ? emergencyTypes[i % emergencyTypes.length]
      : choice(otherTypes);

    const priority: Ticket["priority"] =
      issueType.category === "emergency"
        ? "urgent"
        : issueType.category === "service"
        ? choice(["high", "medium"])
        : issueType.category === "maintenance"
        ? "low"
        : "medium";

    const minutes =
      issueType.category === "install"
        ? pack.typicalJobMinutes * 3
        : issueType.category === "maintenance"
        ? pack.typicalJobMinutes * 0.7
        : pack.typicalJobMinutes;

    const hour = 6 + Math.floor((i * 1.5) % 14);
    const minute = (i * 17) % 60;

    tickets.push({
      id: `tkt_${i + 1}`,
      ticketNumber: `WO-${10240 + i}`,
      source: choice(sources),
      customer: fakeCustomerName(),
      address: fakeAddress(),
      issue: issueType.label,
      category: issueType.category,
      priority,
      status: "new",
      createdAt: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      estimatedMinutes: Math.round(minutes / 15) * 15,
    });
  }

  return tickets;
}

export function generateTechs(): Tech[] {
  const count = demoConfig.scale.workers;
  const trucks = ["A1", "A2", "A3", "B1", "B2", "B3", "B4", "C1", "C2", "C3"];
  const statuses: Tech["status"][] = [
    "on_job", "on_job", "on_job", "traveling", "traveling",
    "available", "available", "off",
  ];

  const techs: Tech[] = [];
  for (let i = 0; i < count; i++) {
    const { name, initials } = fakeTechName();
    // Each tech has 2-4 skills from the pack
    const skillCount = intBetween(2, 4);
    const skills: string[] = [];
    const available = [...pack.skills];
    for (let s = 0; s < skillCount && available.length > 0; s++) {
      const idx = Math.floor(rng() * available.length);
      skills.push(available[idx].short);
      available.splice(idx, 1);
    }

    techs.push({
      id: `tech_${i + 1}`,
      name,
      initials,
      skills,
      rating: Math.round(between(3.8, 5) * 10) / 10,
      jobsToday: intBetween(0, 6),
      jobsThisWeek: intBetween(8, 32),
      status: choice(statuses),
      truck: i < trucks.length ? `Truck ${trucks[i]}` : `Truck ${i + 1}`,
    });
  }

  return techs;
}

export function getPack() {
  return pack;
}
