---
name: ra-prospect-research
description: Use this skill when researching a property management firm as a potential RA client. Triggers on requests like "research [company]", "deep dive on [PM firm]", "prospect research for [url]", or any request to investigate a property management company's pain points and tech stack. Produces a structured brief and pain-point note in RA's standard format.
---

# RA Prospect Research

## When to use
User provides a property management company website (and optionally a contact name) and wants a prospect research brief for cold outreach.

## Inputs
- Company website URL (required)
- Contact name / title (optional, infer from About page or BBB if not given)
- Any extra context the user provides (existing pain mentions, PMS they use, etc.)

## Research workflow

Run these in order, but skip steps that are clearly answered by earlier ones.

1. **Fetch the company site**: homepage, /about, /services, /contact, /rentals or /properties. Pull leadership names, office locations, service mix (residential vs commercial vs HOA), and any tech mentions.

2. **Identify the PMS**: check resident/owner portal links for telltale subdomains:
   - `*.appfolio.com` → AppFolio
   - `*.managebuilding.com` → Buildium
   - `*.yardi.com` or RentCafe → Yardi
   - `*.propertyware.com` → Propertyware
   - `*.rentmanager.com` → Rent Manager
   - WordPress plugins like "Listings for AppFolio Pro" also reveal the stack
   Note the PMS in the output.

3. **Size and reputation signals**:
   - BBB profile: founding date, entity type, leadership, complaint volume
   - Google / Birdeye / Facebook review counts and ratings
   - LinkedIn employee count if findable
   - Count visible vacancies on their listings page; estimate total doors at 3-7% vacancy rate

4. **Job postings**: search "[company name] hiring" or check Indeed/LinkedIn jobs. Job descriptions are gold for pain points (mentions of specific portals, manual processes, hours spent on tasks).

5. **Geographic and regulatory context**: note states served, list 3-5 dominant utility providers for the region (e.g. PG&E + SoCalGas for CA, Eversource + Unitil + CMP for NH/ME, Con Ed + National Grid for NY), and any state-specific landlord-tenant quirks worth flagging.

6. **Cross-reference PMS against the RA pain-point library** (already in the system prompt). Surface the documented limitations of their specific PMS.

## Output format

Produce a markdown brief AND a short pain-point note in this exact format:

```
[Company Name] — [HQ city, state]

- Manages ~[X] units across [Y] properties in [region]
- Uses [PMS]. [Specific pain phrase or quoted job-posting line]
- [Region-specific utility/regulatory pain]
- [Service mix note if multi-modal: residential + commercial + HOA]
- [Founder / decision-maker name and title]
- [Reputation signal: rating, review count]
- [Top 2-3 PMS-specific limitations relevant to this firm]
- [Any growth signal: hiring, expansion, recent acquisition]
```

The bullet format above is what RA feeds into downstream outreach tooling, so keep it tight, scannable, and factual. No marketing language.

Also produce a longer markdown brief with these sections:
1. Company snapshot
2. Tech stack observations
3. PMS-specific pain points
4. Likely pain points at this firm (combining PMS gaps with their business shape)
5. Where RA can sell in (1-3 plays)
6. Outreach angle (hook, target buyer, channel)
7. Open questions to resolve in discovery

## Notes on quality
- Always web search before claiming a fact. Don't rely on training data for current PMS pricing, features, or company info.
- When estimating door counts from vacancies, state it as an estimate with the assumed vacancy rate.
- Quote pain phrases verbatim when found in job postings or reviews — those are the most powerful outreach hooks.
- If the company is too small (<100 units) or too large (enterprise REITs), flag this to the user before doing the full research.

After producing the brief, ask the user if they want a cold outreach email drafted next.
