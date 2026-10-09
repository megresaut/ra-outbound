export type Stage =
  | "researched"
  | "pain_mapped"
  | "demo_built"
  | "email_drafted"
  | "email_sent"
  | "replied"
  | "meeting_booked"
  | "closed_lost";

export const STAGE_ORDER: Stage[] = [
  "researched",
  "pain_mapped",
  "demo_built",
  "email_drafted",
  "email_sent",
  "replied",
  "meeting_booked",
];

export const STAGE_LABEL: Record<Stage, string> = {
  researched: "Researched",
  pain_mapped: "Pain mapped",
  demo_built: "Demo built",
  email_drafted: "Drafted",
  email_sent: "Sent",
  replied: "Replied",
  meeting_booked: "Meeting booked",
  closed_lost: "Closed lost",
};

export type ResearchSignal = { source: string; quote: string };

export type Research = {
  fundingStatus: string;          // "Bootstrapped — no external funding found"
  yearsOperating: number;
  techProfile: string;            // "Vertical SaaS (Buildium) + Excel + Outlook"
  developerHeadcount: number;     // typically 0
  workflowSignals: ResearchSignal[];
};

export type Prospect = {
  slug: string;
  company: string;
  industry: "Property management" | "HVAC" | "Plumbing" | "Electrical";
  template: "property_management" | "service_dispatch";
  pack?: "hvac" | "plumbing" | "electrical";
  employees: number;
  location: string;
  website: string;
  champion: { name: string; title: string; email: string };
  stage: Stage;
  fitScore: number; // 0-100
  research?: Research;
  pains: { title: string; pattern: string; evidence: string }[];
  demoUrl: string;
  emailDraft: { subject: string; body: string };
  timeline: { date: string; event: string; note?: string }[];
  addedAt: string;
  lastTouch: string;
};

export const PROSPECTS: Prospect[] = [
  {
    slug: "harborline-hvac",
    company: "Harborline HVAC",
    industry: "HVAC",
    template: "service_dispatch",
    pack: "hvac",
    employees: 38,
    location: "Tacoma, WA",
    website: "harborlinehvac.com",
    champion: {
      name: "Daniel Reyes",
      title: "Operations Manager",
      email: "daniel@harborlinehvac.com",
    },
    stage: "meeting_booked",
    fitScore: 94,
    pains: [
      {
        title: "After-hours dispatch handoff",
        pattern: "Manual on-call rotation w/ paper logs",
        evidence: "Glassdoor review (Jan 2026): 'on-call sheet gets lost half the time'",
      },
      {
        title: "Maintenance contract renewal lapse",
        pattern: "No automated renewal reminder; tracked in spreadsheet",
        evidence: "Job posting for 'service coordinator' lists 'maintain renewal tracker' as #1 duty",
      },
    ],
    demoUrl: "http://localhost:3001",
    emailDraft: {
      subject: "Harborline's renewal tracker — built it for you",
      body: `Daniel —

Saw the service coordinator listing — "maintain renewal tracker" as the lead duty stood out. Most HVAC ops I talk to are running that out of a spreadsheet that nobody trusts by month 4.

Built a working version using Harborline's branding so you can see it move, not just hear about it: {{demo_url}}

If renewal lapse is actually costing you the contracts I think it is, 15 minutes next week?

— Megha`,
    },
    timeline: [
      { date: "2026-04-22", event: "Researched", note: "Pulled from Apollo HVAC export" },
      { date: "2026-04-22", event: "Pain mapped", note: "2 high-confidence patterns matched" },
      { date: "2026-04-23", event: "Demo built", note: "service_dispatch + hvac pack" },
      { date: "2026-04-23", event: "Email drafted" },
      { date: "2026-04-24", event: "Email sent" },
      { date: "2026-04-28", event: "Replied", note: "'Interesting — what's the catch?'" },
      { date: "2026-05-01", event: "Meeting booked", note: "Tue May 6, 11am PT" },
    ],
    addedAt: "2026-04-22",
    lastTouch: "2026-05-01",
  },
  {
    slug: "cedar-grove-properties",
    company: "Cedar Grove Properties",
    industry: "Property management",
    template: "property_management",
    employees: 22,
    location: "Portland, OR",
    website: "cedargroveproperties.com",
    champion: {
      name: "Ana Whitfield",
      title: "Director of Operations",
      email: "ana@cedargroveproperties.com",
    },
    stage: "replied",
    fitScore: 89,
    pains: [
      {
        title: "Utility billback reconciliation",
        pattern: "Per-unit utility split done by hand each month",
        evidence: "LinkedIn post (Mar 2026) about 'finally hiring a billing clerk'",
      },
      {
        title: "Vendor coordination for turnovers",
        pattern: "Email threads w/ 4–5 vendors per turnover",
        evidence: "Job posting for 'turnover coordinator' explicit about 'wrangling vendors'",
      },
    ],
    demoUrl: "http://localhost:3000",
    emailDraft: {
      subject: "Cedar Grove's turnover coordinator — automated",
      body: `Ana —

Read your March post about finally hiring a billing clerk. The turnover coordinator listing right after it told the same story from a different angle.

Spun up a working demo of what a vendor-coordination + utility-billback layer looks like, branded as Cedar Grove so it actually means something: {{demo_url}}

Worth 15 min if turnovers are still your most expensive 3 days?

— Megha`,
    },
    timeline: [
      { date: "2026-04-25", event: "Researched" },
      { date: "2026-04-25", event: "Pain mapped" },
      { date: "2026-04-26", event: "Demo built", note: "property_management template" },
      { date: "2026-04-26", event: "Email drafted" },
      { date: "2026-04-27", event: "Email sent" },
      { date: "2026-05-02", event: "Replied", note: "'Send a calendar link.'" },
    ],
    addedAt: "2026-04-25",
    lastTouch: "2026-05-02",
  },
  {
    slug: "summit-electric-co",
    company: "Summit Electric",
    industry: "Electrical",
    template: "service_dispatch",
    pack: "electrical",
    employees: 51,
    location: "Boise, ID",
    website: "summitelectric.com",
    champion: {
      name: "Marcus Lin",
      title: "VP Operations",
      email: "marcus@summitelectric.com",
    },
    stage: "email_sent",
    fitScore: 86,
    pains: [
      {
        title: "Permit tracking across 4 jurisdictions",
        pattern: "Foreman texts photos of permit status to office",
        evidence: "Indeed review: 'permit status is a guessing game'",
      },
      {
        title: "Material reorder triggers",
        pattern: "Weekly walk-through, no inventory threshold automation",
        evidence: "Hiring 'inventory manager' — third role this year",
      },
    ],
    demoUrl: "http://localhost:3002",
    emailDraft: {
      subject: "Summit's permit board — what if it just updated itself",
      body: `Marcus —

Indeed reviews mention permit status being a "guessing game" twice in the last quarter. That's the kind of thing that doesn't fix itself with another hire.

Built a working board that tracks permit state across the four jurisdictions you operate in, with Summit's branding: {{demo_url}}

Worth a look?

— Megha`,
    },
    timeline: [
      { date: "2026-04-29", event: "Researched" },
      { date: "2026-04-29", event: "Pain mapped" },
      { date: "2026-04-30", event: "Demo built", note: "service_dispatch + electrical pack" },
      { date: "2026-04-30", event: "Email drafted" },
      { date: "2026-05-01", event: "Email sent" },
    ],
    addedAt: "2026-04-29",
    lastTouch: "2026-05-01",
  },
  {
    slug: "pinecrest-residential",
    company: "Pinecrest Residential",
    industry: "Property management",
    template: "property_management",
    employees: 17,
    location: "Asheville, NC",
    website: "pinecrestresidential.com",
    champion: {
      name: "Theo Marston",
      title: "Operations Lead",
      email: "theo@pinecrestresidential.com",
    },
    stage: "email_drafted",
    fitScore: 78,
    pains: [
      {
        title: "Maintenance request triage",
        pattern: "Phone + email + portal — three inboxes, no merge",
        evidence: "Yelp review mentions 'had to call three times'",
      },
    ],
    demoUrl: "http://localhost:3003",
    emailDraft: {
      subject: "Three inboxes, one queue",
      body: `Theo —

Few of Pinecrest's recent reviews mention having to call multiple times to get a maintenance ticket logged. Almost always means the request is landing in three places and nobody owns the merge.

Built a unified-queue demo with Pinecrest's branding so you can see it move: {{demo_url}}

Worth 15?

— Megha`,
    },
    timeline: [
      { date: "2026-05-02", event: "Researched" },
      { date: "2026-05-02", event: "Pain mapped" },
      { date: "2026-05-02", event: "Demo built", note: "property_management template" },
      { date: "2026-05-03", event: "Email drafted", note: "Awaiting Megha review" },
    ],
    addedAt: "2026-05-02",
    lastTouch: "2026-05-03",
  },
  {
    slug: "westwind-plumbing",
    company: "Westwind Plumbing",
    industry: "Plumbing",
    template: "service_dispatch",
    pack: "plumbing",
    employees: 29,
    location: "Sacramento, CA",
    website: "westwindplumbing.com",
    champion: {
      name: "Priya Shah",
      title: "Service Manager",
      email: "priya@westwindplumbing.com",
    },
    stage: "demo_built",
    fitScore: 81,
    pains: [
      {
        title: "Estimate-to-invoice gap",
        pattern: "Tech writes estimate on paper, office re-keys into QuickBooks",
        evidence: "Job posting for 'admin assistant' lists 'enter estimates' as primary",
      },
    ],
    demoUrl: "http://localhost:3004",
    emailDraft: { subject: "", body: "" },
    timeline: [
      { date: "2026-05-02", event: "Researched" },
      { date: "2026-05-02", event: "Pain mapped" },
      { date: "2026-05-03", event: "Demo built", note: "service_dispatch + plumbing pack" },
    ],
    addedAt: "2026-05-02",
    lastTouch: "2026-05-03",
  },
  {
    slug: "oakridge-management",
    company: "Oakridge Management Group",
    industry: "Property management",
    template: "property_management",
    employees: 43,
    location: "Charlotte, NC",
    website: "oakridgemgmt.com",
    champion: {
      name: "Helena Brooks",
      title: "COO",
      email: "helena@oakridgemgmt.com",
    },
    stage: "closed_lost",
    fitScore: 72,
    pains: [
      {
        title: "Owner statement generation",
        pattern: "Excel templates, manual per-property assembly",
        evidence: "LinkedIn — recently hired 2nd accountant",
      },
    ],
    demoUrl: "http://localhost:3005",
    emailDraft: {
      subject: "Oakridge owner statements — automated",
      body: `Helena — saw the second accountant hire...`,
    },
    timeline: [
      { date: "2026-04-15", event: "Researched" },
      { date: "2026-04-15", event: "Pain mapped" },
      { date: "2026-04-16", event: "Demo built" },
      { date: "2026-04-16", event: "Email drafted" },
      { date: "2026-04-17", event: "Email sent" },
      { date: "2026-04-24", event: "Replied", note: "'We just signed with Buildium last month.'" },
      { date: "2026-04-24", event: "Closed lost", note: "Timing — locked into incumbent" },
    ],
    addedAt: "2026-04-15",
    lastTouch: "2026-04-24",
  },

  // ─── Today's batch (2026-05-05) ─────────────────────────────────────────
  {
    slug: "northwind-pm",
    company: "Northwind Property Mgmt",
    industry: "Property management",
    template: "property_management",
    employees: 42,
    location: "Portland, OR",
    website: "northwindpm.com",
    champion: {
      name: "Jamie Reyes",
      title: "Director of Operations",
      email: "jreyes@northwindpm.com",
    },
    stage: "email_drafted",
    fitScore: 92,
    research: {
      fundingStatus: "Bootstrapped — no external funding signals across SEC, Crunchbase, or press",
      yearsOperating: 28,
      techProfile: "Buildium + Excel + Outlook · static-site WordPress · no CRM",
      developerHeadcount: 0,
      workflowSignals: [
        {
          source: "Indeed posting · Apr 28",
          quote: "Billing Specialist will pull monthly utility statements from PGE, NW Natural, and city portals and post into Buildium",
        },
        {
          source: "LinkedIn · Mar 2026",
          quote: "Hiring our 2nd billing clerk this year — owner ops scaling faster than ever",
        },
        {
          source: "Company site",
          quote: "800+ units under management across multifamily and SFR portfolios",
        },
      ],
    },
    pains: [
      {
        title: "Multi-portal utility billback",
        pattern: "Three utility portals → manual download → re-key into Buildium",
        evidence: "Indeed posting names PGE, NW Natural, and city portals as primary duties",
      },
      {
        title: "Monthly owner statement assembly",
        pattern: "Excel templates per property, manual aggregation",
        evidence: "Second billing clerk hire signals scaling pain in finance ops",
      },
      {
        title: "Maintenance vendor coordination",
        pattern: "Email threads with 4–5 vendors per turnover",
        evidence: "Job posting mentions 'wrangling vendors' as recurring duty",
      },
    ],
    demoUrl: "https://northwind-pm.demo.ra.dev",
    emailDraft: {
      subject: "Northwind's billing clerk #2 — what if you didn't need them",
      body: `Jamie —

Saw the Billing Specialist posting last week — pulling monthly statements from PGE, NW Natural, and city portals into Buildium is exactly the workflow we automated for another PM (~20 employees, 800 units, same Buildium setup). Cut their billing time from ~200hrs/mo to effectively zero.

Spun up a working version with Northwind's branding so you can see the actual flow, not just hear about it: {{demo_url}}

If a second billing hire feels like the wrong direction, worth 15 min next week?

— Megha`,
    },
    timeline: [
      { date: "2026-05-05", event: "Researched", note: "ICP confirmed · 3 strong workflow signals" },
      { date: "2026-05-05", event: "Pain mapped", note: "3 patterns matched, top: multi_portal_extraction" },
      { date: "2026-05-05", event: "Demo built", note: "property_management template" },
      { date: "2026-05-05", event: "Email drafted", note: "Awaiting Megha review" },
    ],
    addedAt: "2026-05-05",
    lastTouch: "2026-05-05",
  },
  {
    slug: "ridgeway-hvac",
    company: "Ridgeway HVAC",
    industry: "HVAC",
    template: "service_dispatch",
    pack: "hvac",
    employees: 28,
    location: "Boise, ID",
    website: "ridgewayhvac.com",
    champion: {
      name: "Marcus Holt",
      title: "General Manager",
      email: "marcus@ridgewayhvac.com",
    },
    stage: "email_drafted",
    fitScore: 88,
    research: {
      fundingStatus: "Family-owned since 1994 — no funding records",
      yearsOperating: 32,
      techProfile: "ServiceTitan (basic plan) + paper work-orders · QuickBooks Desktop",
      developerHeadcount: 0,
      workflowSignals: [
        {
          source: "Indeed posting · Apr 22",
          quote: "Service Coordinator: maintain on-call rotation sheet, dispatch after-hours techs by phone",
        },
        {
          source: "Glassdoor review · Feb 2026",
          quote: "Maintenance contracts get re-typed into the system every renewal — annoying but it's the process",
        },
      ],
    },
    pains: [
      {
        title: "After-hours dispatch via phone",
        pattern: "Manual on-call rotation, paper sheet, no escalation log",
        evidence: "Service Coordinator listing names this as primary responsibility",
      },
      {
        title: "Maintenance contract re-keying at renewal",
        pattern: "Renewal process triggers manual data entry into ServiceTitan",
        evidence: "Glassdoor review explicitly calls this out as annoying-but-routine",
      },
    ],
    demoUrl: "https://ridgeway-hvac.demo.ra.dev",
    emailDraft: {
      subject: "Ridgeway's on-call sheet — what if it was the system",
      body: `Marcus —

Saw the Service Coordinator listing — "maintain on-call rotation sheet, dispatch after-hours by phone" is exactly the kind of workflow that ages badly past ~30 techs.

Built a working dispatch board with Ridgeway's branding so you can see what after-hours could look like when the rotation IS the system, not a sheet on top of it: {{demo_url}}

Worth a look?

— Megha`,
    },
    timeline: [
      { date: "2026-05-05", event: "Researched", note: "ICP confirmed · ServiceTitan + paper hybrid" },
      { date: "2026-05-05", event: "Pain mapped", note: "2 patterns matched" },
      { date: "2026-05-05", event: "Demo built", note: "service_dispatch + hvac pack" },
      { date: "2026-05-05", event: "Email drafted", note: "Awaiting Megha review" },
    ],
    addedAt: "2026-05-05",
    lastTouch: "2026-05-05",
  },
  {
    slug: "copperline-plumbing",
    company: "Copperline Plumbing Co",
    industry: "Plumbing",
    template: "service_dispatch",
    pack: "plumbing",
    employees: 19,
    location: "Reno, NV",
    website: "copperlineplumbing.com",
    champion: {
      name: "Sam Ortega",
      title: "Operations Manager",
      email: "sortega@copperlineplumbing.com",
    },
    stage: "email_drafted",
    fitScore: 84,
    research: {
      fundingStatus: "Bootstrapped — owner-operated since 2008",
      yearsOperating: 18,
      techProfile: "Housecall Pro + spreadsheets · Gmail · QuickBooks Online",
      developerHeadcount: 0,
      workflowSignals: [
        {
          source: "Indeed posting · Apr 18",
          quote: "Office Manager: process warranty registrations across 4 manufacturer portals weekly",
        },
        {
          source: "Yelp review · Mar 2026",
          quote: "Took two weeks to get a warranty claim sorted — the office had to call the manufacturer twice",
        },
      ],
    },
    pains: [
      {
        title: "Warranty registration across manufacturer portals",
        pattern: "Weekly manual login + form-fill across 4 portals",
        evidence: "Office Manager listing puts this as a weekly recurring duty",
      },
      {
        title: "Warranty claim follow-through",
        pattern: "Phone-based escalation, no claim status tracking",
        evidence: "Yelp review describes 2-week resolution involving multiple manufacturer calls",
      },
    ],
    demoUrl: "https://copperline-plumbing.demo.ra.dev",
    emailDraft: {
      subject: "Copperline's warranty desk — automated",
      body: `Sam —

Saw the Office Manager listing — "warranty registrations across 4 manufacturer portals weekly" is exactly the workflow that quietly costs 8–10 hours every week and nobody notices until it's gone.

Built a working warranty-desk demo with Copperline's branding: {{demo_url}}

Worth 15 if warranty admin is still an Office Manager problem?

— Megha`,
    },
    timeline: [
      { date: "2026-05-05", event: "Researched" },
      { date: "2026-05-05", event: "Pain mapped", note: "2 patterns matched" },
      { date: "2026-05-05", event: "Demo built", note: "service_dispatch + plumbing pack" },
      { date: "2026-05-05", event: "Email drafted" },
    ],
    addedAt: "2026-05-05",
    lastTouch: "2026-05-05",
  },
  {
    slug: "summit-electric-services",
    company: "Summit Electric Services",
    industry: "Electrical",
    template: "service_dispatch",
    pack: "electrical",
    employees: 51,
    location: "Salt Lake City, UT",
    website: "summitelec.com",
    champion: {
      name: "Priya Shah",
      title: "Director of Field Operations",
      email: "priya.shah@summitelec.com",
    },
    stage: "email_drafted",
    fitScore: 81,
    research: {
      fundingStatus: "PE-owned since 2021 (Wasatch Capital, growth-equity, no operating control)",
      yearsOperating: 22,
      techProfile: "ServiceTitan + Procore · custom Excel reports · no CRM integration",
      developerHeadcount: 1,
      workflowSignals: [
        {
          source: "Company blog · Feb 2026",
          quote: "Now serving four jurisdictions across the Wasatch Front, each with its own permit portal",
        },
        {
          source: "Indeed posting · Apr 30",
          quote: "Permit Coordinator: track permit status across SLC, Sandy, Provo, Ogden municipal portals",
        },
      ],
    },
    pains: [
      {
        title: "Permit status across 4 jurisdictions",
        pattern: "Coordinator manually polls 4 municipal portals daily",
        evidence: "Permit Coordinator role exists specifically because of cross-jurisdiction sprawl",
      },
      {
        title: "Job-cost rollup from Procore to ServiceTitan",
        pattern: "Weekly export-import, manual reconciliation",
        evidence: "Company blog mentions custom Excel reports bridging the two",
      },
    ],
    demoUrl: "https://summit-electric.demo.ra.dev",
    emailDraft: {
      subject: "Summit's permit board — same data, no coordinator polling",
      body: `Priya —

Saw the Permit Coordinator listing pulling status across SLC, Sandy, Provo, and Ogden — the kind of role that exists because the systems don't talk, not because the work is hard.

Built a working permit board with Summit's branding showing what the four-jurisdiction view could look like as one surface: {{demo_url}}

Worth 15?

— Megha`,
    },
    timeline: [
      { date: "2026-05-05", event: "Researched", note: "PE-owned but no ops control · ICP fit" },
      { date: "2026-05-05", event: "Pain mapped" },
      { date: "2026-05-05", event: "Demo built", note: "service_dispatch + electrical pack" },
      { date: "2026-05-05", event: "Email drafted" },
    ],
    addedAt: "2026-05-05",
    lastTouch: "2026-05-05",
  },
  {
    slug: "blueline-mechanical",
    company: "Blueline Mechanical",
    industry: "HVAC",
    template: "service_dispatch",
    pack: "hvac",
    employees: 33,
    location: "Denver, CO",
    website: "bluelinemech.com",
    champion: {
      name: "Alex Park",
      title: "Service Manager",
      email: "apark@bluelinemech.com",
    },
    stage: "email_drafted",
    fitScore: 85,
    research: {
      fundingStatus: "Family-owned, no external capital",
      yearsOperating: 16,
      techProfile: "FieldEdge + paper invoices · QuickBooks Online",
      developerHeadcount: 0,
      workflowSignals: [
        {
          source: "Glassdoor review · Jan 2026",
          quote: "Techs write invoices on paper, office re-enters into FieldEdge — a whole role for it",
        },
        {
          source: "Indeed posting · Apr 25",
          quote: "Admin Assistant: enter daily invoices, follow up on parts orders across 3 distributors",
        },
      ],
    },
    pains: [
      {
        title: "Estimate-to-invoice re-keying",
        pattern: "Paper invoice from tech → manual entry into FieldEdge",
        evidence: "Admin Assistant listing names invoice entry as #1 daily duty",
      },
      {
        title: "Parts ordering across 3 distributors",
        pattern: "Manual portal logins per supplier, no status sync",
        evidence: "Same listing names cross-distributor parts follow-up as recurring",
      },
    ],
    demoUrl: "https://blueline-mechanical.demo.ra.dev",
    emailDraft: {
      subject: "Blueline's invoice re-entry — gone",
      body: `Alex —

Glassdoor review put it sharply: "techs write invoices on paper, office re-enters into FieldEdge — a whole role for it."

Built a working invoice-flow demo with Blueline's branding so you can see what that role's day actually looks like when the entry is automatic: {{demo_url}}

Worth 15?

— Megha`,
    },
    timeline: [
      { date: "2026-05-05", event: "Researched" },
      { date: "2026-05-05", event: "Pain mapped" },
      { date: "2026-05-05", event: "Demo built", note: "service_dispatch + hvac pack" },
      { date: "2026-05-05", event: "Email drafted" },
    ],
    addedAt: "2026-05-05",
    lastTouch: "2026-05-05",
  },
  {
    slug: "evergreen-pm",
    company: "Evergreen PM Partners",
    industry: "Property management",
    template: "property_management",
    employees: 22,
    location: "Seattle, WA",
    website: "evergreenpm.com",
    champion: {
      name: "Robin Castillo",
      title: "Head of Operations",
      email: "robin@evergreenpm.com",
    },
    stage: "email_drafted",
    fitScore: 79,
    research: {
      fundingStatus: "Bootstrapped — partner-owned",
      yearsOperating: 11,
      techProfile: "AppFolio + Slack · Excel for owner reporting",
      developerHeadcount: 0,
      workflowSignals: [
        {
          source: "Company blog · Mar 2026",
          quote: "Owner reporting cycle takes the first week of every month — non-negotiable",
        },
        {
          source: "Indeed posting · Apr 12",
          quote: "Property Accountant: assemble monthly owner statements across 60+ properties in Excel",
        },
      ],
    },
    pains: [
      {
        title: "Monthly owner statement assembly",
        pattern: "Per-property Excel template, manual aggregation, week-long cycle",
        evidence: "Both blog post and Property Accountant listing reference the monthly cycle explicitly",
      },
      {
        title: "Multi-source data pull for statements",
        pattern: "AppFolio export + bank feeds + utility data merged by hand",
        evidence: "Implied by the cross-source nature of owner reporting",
      },
    ],
    demoUrl: "https://evergreen-pm.demo.ra.dev",
    emailDraft: {
      subject: "Evergreen's first-week-of-the-month — automated",
      body: `Robin —

Read the March blog post — "owner reporting takes the first week of every month — non-negotiable." Most PM ops I talk to have made peace with that, but it doesn't have to be that way.

Built a working owner-statement demo with Evergreen's branding so you can see what week one could look like when the assembly happens automatically: {{demo_url}}

Worth a look?

— Megha`,
    },
    timeline: [
      { date: "2026-05-05", event: "Researched" },
      { date: "2026-05-05", event: "Pain mapped" },
      { date: "2026-05-05", event: "Demo built", note: "property_management template" },
      { date: "2026-05-05", event: "Email drafted" },
    ],
    addedAt: "2026-05-05",
    lastTouch: "2026-05-05",
  },
];

export function getProspect(slug: string): Prospect | undefined {
  return PROSPECTS.find((p) => p.slug === slug);
}

export function stageProgress(stage: Stage): number {
  if (stage === "closed_lost") return 0;
  const idx = STAGE_ORDER.indexOf(stage);
  return Math.round(((idx + 1) / STAGE_ORDER.length) * 100);
}
