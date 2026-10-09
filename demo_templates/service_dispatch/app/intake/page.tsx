"use client";

import { useState } from "react";
import {
  Inbox,
  Phone,
  Mail,
  Globe,
  MessageSquare,
  Search,
  Brain,
  Filter,
  CheckCircle2,
  ArrowRight,
  Clock,
  TrendingUp,
  AlertCircle,
  X,
  Edit3,
  Send,
  Flame,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { WorkflowRunner } from "@/components/demo/workflow-runner";
import { demoConfig } from "@/config/demo.config";
import { verticalPacks } from "@/config/verticals";
import { cn } from "@/lib/utils";

type LeadSource =
  | "email"
  | "voicemail"
  | "sms"
  | "webform"
  | "nextdoor"
  | "yelp"
  | "google"
  | "reddit"
  | "craigslist";

interface Lead {
  id: string;
  source: LeadSource;
  sourceLabel: string;
  receivedAgo: string;
  customer: string;
  location: string;
  intent: "service" | "quote" | "question" | "urgent";
  snippet: string;
  fullMessage: string;
  draftedReply: string;
  isPublic: boolean;
}

const SOURCE_META: Record<
  LeadSource,
  { icon: React.ElementType; color: string }
> = {
  email: { icon: Mail, color: "text-text-secondary" },
  voicemail: { icon: Phone, color: "text-text-secondary" },
  sms: { icon: MessageSquare, color: "text-text-secondary" },
  webform: { icon: Inbox, color: "text-text-secondary" },
  nextdoor: { icon: Globe, color: "text-accent-bright" },
  yelp: { icon: Globe, color: "text-accent-bright" },
  google: { icon: Globe, color: "text-accent-bright" },
  reddit: { icon: Globe, color: "text-accent-bright" },
  craigslist: { icon: Globe, color: "text-accent-bright" },
};

const INTENT_STYLES = {
  urgent: "bg-status-error/10 text-status-error border-status-error/20",
  service: "bg-accent-glow text-accent-bright border-accent-border",
  quote: "bg-status-warning/10 text-status-warning border-status-warning/20",
  question: "bg-white/5 text-text-secondary border-border",
} as const;

export default function IntakePage() {
  const pack = verticalPacks[demoConfig.vertical];
  const tradeLower = pack.tradeNoun.toLowerCase();
  const cityName = demoConfig.company.location.split(",")[0].trim();
  const leads = buildLeads(cityName, tradeLower);

  return (
    <PageShell>
      <div className="mb-8 max-w-3xl">
        <div className="text-xs uppercase tracking-wider text-accent mb-2">
          Automation · Lead intake
        </div>
        <h1 className="font-display text-4xl text-text-primary mb-3">
          Every request, in one queue.
        </h1>
        <p className="text-text-secondary leading-relaxed">
          Calls go to voicemail. Emails sit in five inboxes. Someone posts on
          Nextdoor asking for a {tradeLower} recommendation. We sweep all of
          these — your existing channels and the public sources where {cityName}{" "}
          people actually ask — pull the relevant ones in, and put them in one
          queue for your team to triage. Nothing is replied to without your say.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <ContextStat
          icon={Clock}
          label="Sweep cadence"
          value="every 15 min"
          sub="all channels"
          accent
        />
        <ContextStat
          icon={Inbox}
          label="Channels watched"
          value="9"
          sub="your inboxes + public sources"
        />
        <ContextStat
          icon={TrendingUp}
          label="Lead capture lift"
          value="+34%"
          sub="vs. inbox monitoring alone"
        />
        <ContextStat
          icon={AlertCircle}
          label="Spam / off-topic filtered"
          value="62%"
          sub="of inbound, never bothers your team"
        />
      </div>

      <WorkflowRunner
        title="Sweep all sources for new requests"
        schedule="Scheduled every 15 minutes · or run on demand"
        runLabel="Run intake"
        stages={[
          {
            key: "inboxes",
            label: "Pulling from your inboxes",
            detail: "Email, voicemail, web form, SMS, existing tools",
            icon: Inbox,
            durationMs: 1800,
            log: [
              { text: "  · Email (info@ + service@) · 14 new since last sweep" },
              { text: "  · Voicemail (Twilio) · 6 new · transcribed" },
              { text: "  · Web form submissions · 3 new" },
              { text: "  · SMS line · 2 new" },
              { text: `  · ${demoConfig.details.fieldServiceSystem ?? "Field service system"} sync · 1 new`, type: "info" },
              { text: "  ✓ 26 raw inbound messages collected", type: "success" },
            ],
          },
          {
            key: "scrape",
            label: "Scraping public sources",
            detail: `Nextdoor, Yelp inbox, Google Business Q&A, local Reddit, Craigslist gigs · ${cityName} only`,
            icon: Globe,
            durationMs: 2400,
            log: [
              { text: `  · Nextdoor · 4 ${cityName} posts mentioning ${tradeLower}` },
              { text: "  · Yelp message inbox · 2 unread quote requests" },
              { text: "  · Google Business Q&A · 1 new question" },
              { text: `  · r/${cityName} · 3 posts asking for ${tradeLower} recs` },
              { text: "  · Craigslist gigs · 5 jobs in service area" },
              { text: "  ✓ 15 public mentions collected · respecting per-source rate limits", type: "success" },
            ],
          },
          {
            key: "classify",
            label: "Classifying intent",
            detail: "LLM tags: service request · question · spam · off-topic",
            icon: Brain,
            durationMs: 1600,
            log: [
              { text: "  · 41 messages analyzed" },
              { text: "  · 18 service requests · 7 questions · 12 spam/promo · 4 off-topic" },
              { text: "  ⚠ 1 flagged URGENT: 'no AC, baby in house' · paged on-call now", type: "urgent" },
              { text: "  · Spam filtered out before reaching your team", type: "success" },
            ],
          },
          {
            key: "dedupe",
            label: "De-duplicating against existing tickets",
            detail: "Match by phone, address, customer name, issue similarity",
            icon: Filter,
            durationMs: 1200,
            log: [
              { text: "  · Cross-checked against last 30 days of tickets" },
              { text: "  · 3 duplicates found (same customer, multiple channels) · merged" },
              { text: "  · 22 unique new requests remain" },
            ],
          },
          {
            key: "route",
            label: "Routing to your triage queue",
            detail: "Drafted reply attached · awaiting your approval to send",
            icon: CheckCircle2,
            durationMs: 1000,
            log: [
              { text: "  · Drafted personalized reply for each lead" },
              { text: "  · 1 urgent paged · already in dispatch flow" },
              { text: "  ✓ 22 leads queued for your team's review", type: "success" },
              { text: "  · No outbound replies sent — awaiting your approval", type: "info" },
            ],
          },
        ]}
        summary={[
          { label: "Sources swept", value: 9, total: 9 },
          { label: "Raw messages", value: 41, accent: true },
          { label: "New leads", value: 22, total: 41 },
          { label: "Urgent paged", value: 1, warn: true },
        ]}
        completionFootnote="Equivalent manual work: ~90 min of inbox-and-feed checking"
        reviewCallout={
          <>
            <span className="text-text-primary font-medium">
              22 leads ready for your triage.
            </span>{" "}
            Scroll down to see the queue · click any lead to read the full
            message and review the drafted reply. Nothing sends without your
            approval. The 1 urgent ticket is already in the dispatch flow with
            on-call paged.
          </>
        }
        resultPanel={<LeadsQueue leads={leads} />}
      />

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-lg border border-border-subtle bg-bg-raised p-6">
          <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-3">
            How it works
          </div>
          <h3 className="font-display text-xl text-text-primary mb-4">
            Two intake streams: yours, and the rest of the internet.
          </h3>
          <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
            <p>
              <span className="text-text-primary font-medium">
                Your existing channels.
              </span>{" "}
              We pull from every inbox your team already watches: shared email,
              voicemail (transcribed), web form, SMS, and your field service
              platform. No more "did anyone see that?" — every inbound message
              hits one queue within 15 minutes.
            </p>
            <p>
              <span className="text-text-primary font-medium">
                Public sources where customers actually ask.
              </span>{" "}
              People needing a {tradeLower} in {cityName} ask on Nextdoor, post
              on local subreddits, and DM you on Yelp before they ever fill out
              your contact form. We sweep those sources, surface the relevant
              ones, and let your team decide which to engage.
            </p>
            <p>
              Every lead goes into a queue with a drafted reply attached.
              Nothing is sent without your approval — public-facing replies
              especially never go out without a human checking the tone first.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-border-subtle bg-bg-raised p-5">
            <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-3">
              Sources we sweep
            </div>
            <div className="space-y-2">
              <SourceRow icon={Mail} label="Shared email inboxes" sub="info@, service@" />
              <SourceRow icon={Phone} label="Voicemail" sub="Twilio · transcribed" />
              <SourceRow icon={MessageSquare} label="SMS line" sub="business number" />
              <SourceRow icon={Globe} label="Web form" sub="contact + quote pages" />
              <SourceRow icon={Search} label="Nextdoor" sub={`${cityName} radius`} />
              <SourceRow icon={Search} label="Yelp inbox" sub="message requests" />
              <SourceRow icon={Search} label="Google Business Q&A" sub="public questions" />
              <SourceRow icon={Search} label={`r/${cityName}`} sub={`${tradeLower} mentions`} />
              <SourceRow icon={Search} label="Craigslist gigs" sub="service area only" />
            </div>
          </div>

          <div className="rounded-lg border border-accent-border bg-accent-glow/30 p-5 flex flex-col">
            <ArrowRight className="h-4 w-4 text-accent mb-2" />
            <div className="text-sm font-medium text-text-primary mb-1">
              Triage stays human
            </div>
            <p className="text-2xs text-text-secondary leading-relaxed">
              We collect, classify, draft, and queue. Your team approves what
              gets a reply — especially anything posted publicly.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function LeadsQueue({ leads }: { leads: Lead[] }) {
  const [selected, setSelected] = useState<Lead | null>(null);
  const [filter, setFilter] = useState<"all" | "yours" | "public">("all");

  const filtered = leads.filter((l) =>
    filter === "all"
      ? true
      : filter === "public"
      ? l.isPublic
      : !l.isPublic
  );

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-raised overflow-hidden">
      <div className="px-5 py-3 border-b border-border-subtle flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm font-medium text-text-primary">
            Triage queue · {leads.length} leads
          </div>
          <div className="text-2xs text-text-tertiary">
            Drafted replies attached · click any row to review and approve
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
            All ({leads.length})
          </FilterPill>
          <FilterPill
            active={filter === "yours"}
            onClick={() => setFilter("yours")}
          >
            Your channels ({leads.filter((l) => !l.isPublic).length})
          </FilterPill>
          <FilterPill
            active={filter === "public"}
            onClick={() => setFilter("public")}
          >
            Public sources ({leads.filter((l) => l.isPublic).length})
          </FilterPill>
        </div>
      </div>
      <div className="divide-y divide-border-subtle">
        {filtered.map((lead) => (
          <LeadRow key={lead.id} lead={lead} onClick={() => setSelected(lead)} />
        ))}
      </div>
      {selected && (
        <LeadDetail lead={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function LeadRow({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const meta = SOURCE_META[lead.source];
  const Icon = meta.icon;
  const isUrgent = lead.intent === "urgent";
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-5 py-3 flex items-start gap-3 hover:bg-white/[0.02] transition-colors",
        isUrgent && "bg-status-error/5 hover:bg-status-error/10"
      )}
    >
      <div
        className={cn(
          "h-7 w-7 rounded-md flex items-center justify-center shrink-0 mt-0.5",
          isUrgent
            ? "bg-status-error/10 text-status-error"
            : lead.isPublic
            ? "bg-accent-glow text-accent-bright"
            : "bg-white/5 text-text-tertiary"
        )}
      >
        {isUrgent ? <Flame className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-sm text-text-primary truncate">
            {lead.customer}
          </span>
          <span className="text-2xs text-text-tertiary">
            via {lead.sourceLabel}
          </span>
          {lead.isPublic && (
            <span className="text-2xs text-accent-bright">· public</span>
          )}
          <span className="text-2xs text-text-dim ml-auto tabular shrink-0">
            {lead.receivedAgo}
          </span>
        </div>
        <div className="text-xs text-text-secondary mt-0.5 line-clamp-1">
          {lead.snippet}
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span
            className={cn(
              "inline-flex items-center px-1.5 py-0.5 rounded text-2xs uppercase tracking-wider border",
              INTENT_STYLES[lead.intent]
            )}
          >
            {lead.intent}
          </span>
          <span className="text-2xs text-text-tertiary">{lead.location}</span>
        </div>
      </div>
      <ArrowRight className="h-3.5 w-3.5 text-text-dim mt-1 shrink-0" />
    </button>
  );
}

function LeadDetail({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const meta = SOURCE_META[lead.source];
  const Icon = meta.icon;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg h-full bg-bg-raised border-l border-border overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-border-subtle flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "h-9 w-9 rounded-md flex items-center justify-center shrink-0",
                lead.intent === "urgent"
                  ? "bg-status-error/10 text-status-error"
                  : lead.isPublic
                  ? "bg-accent-glow text-accent-bright"
                  : "bg-white/5 text-text-tertiary"
              )}
            >
              {lead.intent === "urgent" ? (
                <Flame className="h-4 w-4" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
            </div>
            <div>
              <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-0.5">
                {lead.sourceLabel}
                {lead.isPublic && (
                  <span className="text-accent-bright ml-1">· public</span>
                )}
              </div>
              <div className="font-display text-lg text-text-primary leading-tight">
                {lead.customer}
              </div>
              <div className="text-2xs text-text-tertiary mt-0.5">
                {lead.location} · {lead.receivedAgo}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-2">
              Intent
            </div>
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-md text-2xs uppercase tracking-wider border",
                INTENT_STYLES[lead.intent]
              )}
            >
              {lead.intent}
            </span>
          </div>

          <div>
            <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-2">
              Original message
            </div>
            <div className="rounded-md border border-border-subtle bg-bg-base p-3 text-sm text-text-primary leading-relaxed whitespace-pre-line">
              {lead.fullMessage}
            </div>
          </div>

          <div>
            <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-2 flex items-center gap-1.5">
              <Edit3 className="h-3 w-3" /> Drafted reply (awaiting your approval)
            </div>
            <div className="rounded-md border border-accent-border bg-accent-glow/30 p-3 text-sm text-text-primary leading-relaxed whitespace-pre-line">
              {lead.draftedReply}
            </div>
            {lead.isPublic && (
              <div className="text-2xs text-text-tertiary mt-2 flex items-start gap-1.5">
                <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                Public-facing reply — your team should always read this before
                sending. Tone matters more on Nextdoor than in email.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border-subtle flex gap-2">
            <button
              onClick={() =>
                alert(
                  `Reply sent to ${lead.customer}\n\nLead converted to a service ticket and pushed to dispatch.`
                )
              }
              className="flex-1 px-3 py-2 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-bright flex items-center justify-center gap-2"
            >
              <Send className="h-3.5 w-3.5" />
              Approve & send
            </button>
            <button
              onClick={() => alert("Edit reply — opens the composer in production.")}
              className="px-3 py-2 rounded-md border border-border bg-bg-subtle text-sm text-text-secondary hover:bg-white/[0.04]"
            >
              Edit
            </button>
            <button
              onClick={() => {
                alert("Lead skipped · removed from queue");
                onClose();
              }}
              className="px-3 py-2 rounded-md border border-border bg-bg-subtle text-sm text-text-secondary hover:bg-white/[0.04]"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 rounded-md text-2xs border transition-colors",
        active
          ? "border-accent-border bg-accent-glow text-text-primary"
          : "border-border bg-bg-raised text-text-secondary hover:text-text-primary"
      )}
    >
      {children}
    </button>
  );
}

function buildLeads(cityName: string, tradeLower: string): Lead[] {
  return [
    {
      id: "l1",
      source: "voicemail",
      sourceLabel: "Voicemail",
      receivedAgo: "12m ago",
      customer: "Margaret Wu",
      location: "8801 Camelback Rd",
      intent: "urgent",
      snippet: "no AC at all and we have a baby in the house, please help…",
      fullMessage:
        "Hi, this is Margaret Wu calling — our AC just stopped working completely and we have a four-month-old baby in the house. It's already 89 inside. We've been a customer for two years. My number is (602) 555-0184. Please call back as soon as you can.",
      draftedReply:
        "Hi Margaret — we got your voicemail and a tech is being routed to you right now. ETA is 35 minutes. We've also flagged this as priority so you'll get a call from our dispatcher within 5 minutes. — On-call team",
      isPublic: false,
    },
    {
      id: "l2",
      source: "nextdoor",
      sourceLabel: `Nextdoor · ${cityName}`,
      receivedAgo: "23m ago",
      customer: "Jen H.",
      location: `${cityName} (Arcadia)`,
      intent: "quote",
      snippet: `Anyone have a recent ${tradeLower} they'd recommend? Need a tune-up before it gets really hot…`,
      fullMessage: `Hey neighbors — looking for a recent ${tradeLower} recommendation. We had someone last year who was fine but didn't love them. Need a tune-up before things really heat up. Single-family in Arcadia, ~2400 sqft, original 2018 system.`,
      draftedReply: `Hi Jen — we're a local ${tradeLower} based right here in ${cityName}. Happy to do a tune-up for you; we run a flat-rate maintenance visit and can usually get you on the calendar within a few days. If you'd like a quote, reply here or DM and we'll send a few times. (Also happy to share customer references in Arcadia.)`,
      isPublic: true,
    },
    {
      id: "l3",
      source: "email",
      sourceLabel: "Email · service@",
      receivedAgo: "34m ago",
      customer: "Ryan O'Connor",
      location: "4421 N 16th St",
      intent: "service",
      snippet: "Thermostat is unresponsive, batteries are fine, screen is blank…",
      fullMessage:
        "Hi — our smart thermostat (Ecobee) is completely unresponsive. Replaced batteries, no luck. Screen is blank. AC seems to still run sometimes but we can't control it. Available most weekdays after 2pm. Thanks, Ryan",
      draftedReply:
        "Hi Ryan — sounds like the C-wire might not be powering the thermostat properly. We can come out tomorrow afternoon between 2-4pm to diagnose and replace if needed. Service call is $89, applied to the repair if you proceed. Reply YES to confirm and we'll send a calendar invite.",
      isPublic: false,
    },
    {
      id: "l4",
      source: "yelp",
      sourceLabel: "Yelp inbox",
      receivedAgo: "47m ago",
      customer: "Daniela R.",
      location: `${cityName} (Biltmore)`,
      intent: "quote",
      snippet: "Looking for a quote on a full system replacement, 1800 sqft…",
      fullMessage:
        "Hi! Looking for a quote on replacing our full HVAC system. House is ~1800 sqft, single story, current system is 17 years old. Multiple bids being collected. Please include warranty info.",
      draftedReply:
        "Hi Daniela — thanks for reaching out via Yelp. We'd be glad to bid on a system replacement. We typically come on-site for an accurate quote (free, takes ~45 min) and provide written estimate within 24h with multiple system tier options. We back installs with a 10-year parts warranty + 2-year labor. What day this week works for the site visit?",
      isPublic: true,
    },
    {
      id: "l5",
      source: "webform",
      sourceLabel: "Web form",
      receivedAgo: "1h ago",
      customer: "Anita Patel",
      location: "9034 E Indian School Rd",
      intent: "service",
      snippet: "Annual maintenance — fall tune-up. Existing customer.",
      fullMessage:
        "Submitted via /book. Service: Fall tune-up. Notes: Same as last year please. Address on file.",
      draftedReply:
        "Hi Anita — got your tune-up request. We have you down for a fall maintenance visit. Booking you in for next Tuesday 9-11am. Reply STOP to reschedule or CONFIRM to lock it in. — Atlas team",
      isPublic: false,
    },
    {
      id: "l6",
      source: "reddit",
      sourceLabel: `r/${cityName}`,
      receivedAgo: "1h ago",
      customer: "u/desert_dweller_85",
      location: `${cityName} (general)`,
      intent: "question",
      snippet: `Realistic cost to replace a 3-ton AC unit in ${cityName}? Getting wild quotes…`,
      fullMessage: `Title: Realistic cost to replace a 3-ton AC unit in ${cityName}? Getting wild quotes\n\nGetting bids from $7k to $14k for the same job. House is 1600 sqft, single story, just need a basic replacement. What's actually fair? Should I get more bids? Anything I should be wary of?`,
      draftedReply: `For a 3-ton straight replacement in ${cityName}: realistic range is $8-11k for a mid-tier 16 SEER system, parts + labor + permits. Below $7k usually means lowest-tier equipment or skipping permits. Above $13k is either very high SEER or upselling. Always ask for itemized: equipment cost, labor, permit fee, ductwork inspection, warranty terms. Happy to do a no-pressure on-site quote if you want a comparison — we're a local shop.`,
      isPublic: true,
    },
    {
      id: "l7",
      source: "sms",
      sourceLabel: "SMS line",
      receivedAgo: "1h ago",
      customer: "(602) 555-0192",
      location: "address pending",
      intent: "service",
      snippet: "Hi, my AC is making a really loud rattling noise…",
      fullMessage:
        "Hi, my AC is making a really loud rattling noise when it kicks on. Started yesterday. Still working but worried it'll break soon. Can someone come out? — Steve",
      draftedReply:
        "Hi Steve — sounds like a fan or compressor mount issue, often quick to fix if caught early. We can have a tech out tomorrow morning. What's the address? Service call is $89, waived if you proceed with the repair.",
      isPublic: false,
    },
    {
      id: "l8",
      source: "google",
      sourceLabel: "Google Business · Q&A",
      receivedAgo: "2h ago",
      customer: "Public question",
      location: "Google profile",
      intent: "question",
      snippet: "Do you service mini-split systems in addition to central AC?",
      fullMessage:
        "Public question on Google Business profile: Do you service mini-split systems in addition to central AC? I have two Mitsubishi units that need maintenance.",
      draftedReply:
        "Yes — we service mini-splits including Mitsubishi, Daikin, and Fujitsu. Routine maintenance is $129 per indoor unit and includes coil cleaning, condensate line flush, and refrigerant pressure check. Happy to schedule whenever works for you.",
      isPublic: true,
    },
    {
      id: "l9",
      source: "craigslist",
      sourceLabel: "Craigslist gigs",
      receivedAgo: "3h ago",
      customer: "Anonymous (CL)",
      location: `${cityName} area`,
      intent: "quote",
      snippet: "Need a/c install on a small ADU, looking for licensed pro…",
      fullMessage: `Posted on Craigslist gigs section: Need ductless AC install on a 400sqft ADU in ${cityName}. Already have the unit (Mitsubishi mini-split). Need a licensed installer. Cash or check.`,
      draftedReply: `Hi — saw your CL post. We're a licensed and insured ${tradeLower} in ${cityName} and install Mitsubishi mini-splits regularly. Typical install on a 400sqft ADU runs $1,400-1,800 depending on the line set run and electrical. We can do an estimate by photo if you can share a few shots of the install location and electrical panel.`,
      isPublic: true,
    },
    {
      id: "l10",
      source: "email",
      sourceLabel: "Email · info@",
      receivedAgo: "4h ago",
      customer: "Mark Thompson",
      location: "2245 N 32nd St",
      intent: "question",
      snippet: "Question about your service area, we just moved to Tempe…",
      fullMessage:
        "Hi, we just moved to Tempe and were wondering if you service that area? We had a great experience with you when we lived in central Phoenix. Thanks!",
      draftedReply:
        "Hi Mark — yes, we do service Tempe (it's part of our standard service area, no extra trip charge). Welcome to the East Valley! Let us know whenever you need a tune-up or service call and we'll get you on the calendar.",
      isPublic: false,
    },
  ];
}

function ContextStat({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        accent
          ? "border-accent-border bg-accent-glow"
          : "border-border-subtle bg-bg-raised"
      }`}
    >
      <Icon
        className={`h-4 w-4 mb-3 ${
          accent ? "text-accent-bright" : "text-text-tertiary"
        }`}
      />
      <div
        className={`font-display text-2xl tabular ${
          accent ? "text-accent-bright" : "text-text-primary"
        }`}
      >
        {value}
      </div>
      <div className="text-2xs text-text-tertiary mt-1">{label}</div>
      <div className="text-2xs text-text-dim">{sub}</div>
    </div>
  );
}

function SourceRow({
  icon: Icon,
  label,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="h-3.5 w-3.5 text-text-tertiary mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-xs text-text-primary leading-tight">{label}</div>
        <div className="text-2xs text-text-tertiary">{sub}</div>
      </div>
    </div>
  );
}
