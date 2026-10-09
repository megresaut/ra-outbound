import {
  Mail,
  Calendar,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { demoConfig } from "@/config/demo.config";

const CONTACT_EMAIL = "megha@reasonableautomations.com";

export default function ConnectPage() {
  const primaryMailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    `Following up on the ${demoConfig.company.name} demo`
  )}&body=${encodeURIComponent(
    `Hi Megha,\n\nI saw the tailored demo for ${demoConfig.company.name} and want to talk about:\n\n- \n- \n\nBest time to chat:\n\nThanks,\n`
  )}`;

  return (
    <PageShell>
      <div className="mb-8 max-w-3xl">
        <div className="text-xs uppercase tracking-wider text-accent mb-2">
          Connect with us
        </div>
        <h1 className="font-display text-4xl text-text-primary mb-3">
          Let's talk about what to build for {demoConfig.company.name}.
        </h1>
        <p className="text-text-secondary leading-relaxed">
          Tell us what your team is doing manually today — the dispatching, the
          inbox triage, the invoicing, the follow-ups. We'll come back within
          one business day with what we can automate, what it would take, and
          whether it's a good fit. No pitch deck.
        </p>
      </div>

      <a
        href={primaryMailto}
        className="group block rounded-lg border border-accent-border bg-gradient-to-br from-accent-glow via-transparent to-transparent p-8 hover:border-accent transition-colors mb-6"
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="text-2xs uppercase tracking-wider text-accent mb-2">
              Email Megha directly
            </div>
            <div className="font-display text-2xl text-text-primary mb-2">
              {CONTACT_EMAIL}
            </div>
            <p className="text-text-secondary text-sm max-w-xl leading-relaxed">
              Click to open your email with a pre-filled message about the{" "}
              {demoConfig.company.name} demo. We typically respond within 4
              hours during business hours.
            </p>
          </div>
          <div className="h-12 w-12 rounded-md bg-accent-glow border border-accent-border flex items-center justify-center shrink-0">
            <Mail className="h-5 w-5 text-accent-bright" />
          </div>
        </div>
        <div className="mt-6 flex items-center gap-2 text-sm text-accent-bright group-hover:gap-3 transition-all">
          Open email
          <ArrowRight className="h-4 w-4" />
        </div>
      </a>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        <ContactCard
          icon={Calendar}
          title="Book a 30-min call"
          body="Walk us through your current dispatch + intake workflow. We'll come back with what's automatable."
          cta="Schedule via email"
          href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
            "Schedule a discovery call"
          )}&body=${encodeURIComponent(
            "Hi Megha,\n\nI'd like to book a 30-min call. Some times that work for me:\n\n- \n- \n- \n\nThanks,\n"
          )}`}
        />
        <ContactCard
          icon={MessageSquare}
          title="Quick question"
          body="Have a single question about whether something is feasible? Drop us a line."
          cta="Send a question"
          href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
            "Quick question"
          )}`}
        />
        <ContactCard
          icon={Sparkles}
          title="Custom automation request"
          body="Already know the workflow you'd like built? Send us the details and we'll scope it."
          cta="Describe the workflow"
          href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
            "Custom automation request"
          )}&body=${encodeURIComponent(
            "Hi Megha,\n\nWe'd like to scope an automation for:\n\nWhat the workflow does today (manual):\n\n\nWhat triggers it:\n\n\nHow often it runs:\n\n\nSystems involved:\n\n\nThanks,\n"
          )}`}
        />
      </div>

      <div className="rounded-lg border border-border-subtle bg-bg-raised p-6 mb-6">
        <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-3">
          What to expect
        </div>
        <h3 className="font-display text-xl text-text-primary mb-5">
          From your email to a working automation.
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ExpectStep
            step="01"
            title="We reply within 1 business day"
            body="Real human, no auto-responder. Usually with a few clarifying questions and a short Loom walking through what we'd build."
            timing="day 1"
          />
          <ExpectStep
            step="02"
            title="30-min discovery call"
            body="You walk us through what your team does today. We come back with a written scope, timeline, and price."
            timing="week 1"
          />
          <ExpectStep
            step="03"
            title="Build kicks off"
            body="If the scope is a fit, we kick off. Most automations are live in production within 4-8 weeks of the discovery call."
            timing="week 2+"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-border-subtle bg-bg-raised p-5 flex items-start gap-3">
          <Clock className="h-4 w-4 text-accent shrink-0 mt-0.5" />
          <div className="text-sm text-text-secondary leading-relaxed">
            <span className="text-text-primary font-medium">
              12-hour daily coverage.
            </span>{" "}
            Median response under 30 minutes during business hours, under 4
            hours otherwise.
          </div>
        </div>
        <div className="rounded-lg border border-border-subtle bg-bg-raised p-5 flex items-start gap-3">
          <ShieldCheck className="h-4 w-4 text-accent shrink-0 mt-0.5" />
          <div className="text-sm text-text-secondary leading-relaxed">
            <span className="text-text-primary font-medium">
              Anything you share stays confidential.
            </span>{" "}
            We don't share workflow details, customer data, or vendor lists
            across customers — ever.
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function ContactCard({
  icon: Icon,
  title,
  body,
  cta,
  href,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
  cta: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group rounded-lg border border-border-subtle bg-bg-raised p-5 hover:border-accent-border transition-colors flex flex-col"
    >
      <div className="h-8 w-8 rounded-md bg-accent-glow text-accent-bright flex items-center justify-center mb-3">
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-sm font-medium text-text-primary mb-1">{title}</div>
      <div className="text-xs text-text-tertiary mb-4 leading-relaxed flex-1">
        {body}
      </div>
      <div className="text-2xs text-accent-bright flex items-center gap-1 group-hover:gap-2 transition-all">
        {cta}
        <ArrowRight className="h-3 w-3" />
      </div>
    </a>
  );
}

function ExpectStep({
  step,
  title,
  body,
  timing,
}: {
  step: string;
  title: string;
  body: string;
  timing: string;
}) {
  return (
    <div>
      <div className="font-mono text-2xs text-accent mb-1.5 tabular">{step}</div>
      <div className="text-sm font-medium text-text-primary mb-1.5">{title}</div>
      <div className="text-2xs text-text-tertiary leading-relaxed mb-2">
        {body}
      </div>
      <div className="text-2xs text-text-dim tabular">{timing}</div>
    </div>
  );
}
