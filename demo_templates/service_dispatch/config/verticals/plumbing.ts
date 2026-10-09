import type { VerticalPack } from "./types";

export const plumbingPack: VerticalPack = {
  key: "plumbing",
  workerNoun: { singular: "plumber", plural: "plumbers" },
  jobNoun: { singular: "service call", plural: "service calls" },
  tradeNoun: "plumbing",
  productTagline: "Service Operations",
  ticketSources: [
    { label: "Voicemail (Twilio)", icon: "phone", sampleCount: 4 },
    { label: "Web form submissions", icon: "form", sampleCount: 6 },
    { label: "Email (info@)", icon: "email", sampleCount: 2 },
    { label: "ServiceTitan sync", icon: "platform", sampleCount: 1 },
  ],
  urgencyExamples: [
    { label: "Burst pipe", description: "Active flooding, basement, customer panicking" },
    { label: "No hot water", description: "Water heater failure, family with infants" },
    { label: "Sewage backup", description: "Main line clog, full bathroom unusable" },
  ],
  issueTypes: [
    { label: "Leaking faucet", category: "service" },
    { label: "Running toilet", category: "service" },
    { label: "Slow drain", category: "service" },
    { label: "Garbage disposal stuck", category: "service" },
    { label: "Low water pressure", category: "service" },
    { label: "Water heater repair", category: "service" },
    { label: "Annual maintenance — drain inspection", category: "maintenance" },
    { label: "Backflow testing", category: "maintenance" },
    { label: "Water heater flush", category: "maintenance" },
    { label: "New fixture installation", category: "install" },
    { label: "Water heater replacement", category: "install" },
    { label: "Repipe", category: "install" },
    { label: "Emergency: burst pipe", category: "emergency" },
    { label: "Emergency: sewage backup", category: "emergency" },
    { label: "Emergency: no water", category: "emergency" },
  ],
  skills: [
    { label: "Master plumber", short: "Master" },
    { label: "Gas line certified", short: "Gas line" },
    { label: "Backflow certified", short: "Backflow" },
    { label: "Sewer line / hydro-jetting", short: "Sewer" },
    { label: "Water heater install", short: "Water heater" },
    { label: "Repipe specialist", short: "Repipe" },
    { label: "Commercial plumbing", short: "Commercial" },
    { label: "Septic systems", short: "Septic" },
  ],
  typicalJobMinutes: 75,
  commonStack: ["ServiceTitan", "Jobber", "Housecall Pro"],
  heroCopy: {
    headline: "Dispatch on autopilot. Your plumbers stay on the truck, not on the phone.",
    subhead:
      "Every morning, voicemails, web forms, and emails pile up overnight. Someone spends two hours triaging, calling plumbers, and rearranging the day before any pipe gets fixed. We replaced that with one scheduled job.",
  },
};
