import type { VerticalPack } from "./types";

export const hvacPack: VerticalPack = {
  key: "hvac",
  workerNoun: { singular: "technician", plural: "technicians" },
  jobNoun: { singular: "service call", plural: "service calls" },
  tradeNoun: "HVAC",
  productTagline: "Service Operations",
  ticketSources: [
    { label: "Voicemail (Twilio)", icon: "phone", sampleCount: 3 },
    { label: "Web form submissions", icon: "form", sampleCount: 7 },
    { label: "Email (info@)", icon: "email", sampleCount: 2 },
    { label: "ServiceTitan sync", icon: "platform", sampleCount: 1 },
  ],
  urgencyExamples: [
    { label: "No heat", description: "Furnace failure, residential occupied" },
    { label: "No AC", description: "100°F+ outdoor, elderly tenant" },
    { label: "Gas smell", description: "Reported odor near furnace — dispatch immediately" },
  ],
  issueTypes: [
    { label: "AC not cooling", category: "service" },
    { label: "Furnace not heating", category: "service" },
    { label: "Strange noise from condenser", category: "service" },
    { label: "Thermostat replacement", category: "service" },
    { label: "Refrigerant recharge", category: "service" },
    { label: "Annual maintenance — spring tune-up", category: "maintenance" },
    { label: "Annual maintenance — fall tune-up", category: "maintenance" },
    { label: "Filter replacement", category: "maintenance" },
    { label: "Duct cleaning", category: "maintenance" },
    { label: "New system installation", category: "install" },
    { label: "Heat pump install", category: "install" },
    { label: "Mini-split install", category: "install" },
    { label: "Emergency: gas smell", category: "emergency" },
    { label: "Emergency: no heat (winter)", category: "emergency" },
    { label: "Emergency: no AC (heat advisory)", category: "emergency" },
  ],
  skills: [
    { label: "EPA 608 Universal", short: "EPA 608" },
    { label: "NATE certified", short: "NATE" },
    { label: "Refrigerant handling", short: "Refrigerant" },
    { label: "Heat pump install", short: "Heat pump" },
    { label: "Ductwork", short: "Ductwork" },
    { label: "Gas line", short: "Gas" },
    { label: "Commercial RTU", short: "Commercial" },
    { label: "Mini-split install", short: "Mini-split" },
  ],
  typicalJobMinutes: 90,
  commonStack: ["ServiceTitan", "Housecall Pro", "FieldEdge"],
  heroCopy: {
    headline: "Dispatch on autopilot. Your team handles the work, not the routing.",
    subhead:
      "Every morning, calls, web forms, and emails pile up. Someone spends two hours triaging, calling techs, and updating calendars before any wrench turns. We replaced that with one scheduled job.",
  },
};
