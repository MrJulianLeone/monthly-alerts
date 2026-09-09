# Contractor Outreach Playbook

Cold email to small residential remodeling contractors. Run by one person, 25 to
40 new contacts per week, three touches each. The pitch is "try your next project
on us", never "buy our software".

## 1. ICP

### Must have all of these

| Attribute | Target |
|---|---|
| Business type | Residential remodeling, general contracting, design/build, or a single trade doing full-room work (kitchen and bath, tile, painting, roofing, landscaping) |
| Volume | 10 to 100 residential projects a year |
| Team size | 3 to 25 people including subs |
| States | NJ, NY, CT, FL, TX, CA |
| Language signal | Visibly serving or employing multilingual crews or communities. Evidence: a Spanish-language page or Spanish/English toggle on the site, Spanish reviews on Google, Spanish or Italian surname clusters in the team page, "Se habla español" anywhere, bilingual job postings, Spanish-language ads or social posts |
| Decision maker | Owner or owner-operator reachable directly. A named person, not `info@` |
| Digital baseline | Has a website or a maintained Google Business Profile. If they have no web presence at all they will not onboard a checklist app by email |

### Strong positive signals (prioritize these)

- Google reviews mentioning communication problems, delays, or "hard to reach".
- Reviews in two languages on the same profile.
- A team page showing a foreman with a Hispanic surname and an owner without one,
  or vice versa. That gap is the product.
- Houzz or Angi profile with 20+ completed projects and photos.
- Serves an area with high Italian-American or Latino homeowner density
  (Bergen/Essex/Hudson NJ, Staten Island and Nassau NY, Fairfield CT, Broward and
  Miami-Dade FL, Harris and Bexar TX, LA and Orange County CA).
- Posts job-site photos with captions in two languages.

### Disqualifiers (do not contact)

| Disqualifier | Why |
|---|---|
| New construction only, or commercial only | Wrong workflow, wrong buyer, wrong budget cycle |
| Over 100 projects a year, or 50+ employees | Already has or is buying real construction management software |
| Under 5 projects a year, handyman, or solo with no crew | No coordination problem to solve |
| Franchise with corporate-mandated software | Cannot adopt anything |
| Roofing or restoration companies working exclusively on insurance claims | Their workflow is a claims workflow |
| No website, no Google profile, no email address | Cannot onboard |
| Already using Buildertrend, CoConstruct, JobTread, or Procore | They have a checklist. The wedge is language, and it is not enough to displace a live tool. Note and revisit in 12 months |
| Property managers and real estate investors | Different job to be done |
| Anyone who asked to be removed | Permanent suppression, no exceptions |

## 2. Sourcing

Work state by state. Pull 100 to 150 raw records, filter to the ICP, expect 25 to
40 qualified per 100 raw. All of these are public rosters.

| State | Primary source | How to use it |
|---|---|---|
| **NJ** | NJ Division of Consumer Affairs, Home Improvement Contractor (HIC) registration search. Registration is mandatory for home improvement work. | Search by county. Pull business name, town, registration number. Registrations do not include email, so cross-reference name plus town against Google. Prioritize Bergen, Essex, Hudson, Union, Passaic, Middlesex. |
| **NY (NYC)** | NYC Department of Consumer and Worker Protection (DCWP) Home Improvement Contractor license lookup, plus the NYC Open Data "Legally Operating Businesses" dataset | Open Data gives you a downloadable CSV filtered to license type "Home Improvement Contractor" with business address. Filter to Queens, Brooklyn, Staten Island, Bronx. |
| **NY (outside NYC)** | County-level licensing: Westchester, Nassau, Suffolk, Rockland each run their own HIC registry | Nassau and Suffolk have searchable consumer affairs rosters. Slower, higher quality. |
| **CT** | CT Department of Consumer Protection eLicense lookup, credential type Home Improvement Contractor | The eLicense portal supports downloadable search results. Filter to Fairfield and New Haven counties. |
| **FL** | Florida DBPR license search (Certified Building Contractor, Certified Residential Contractor, Certified General Contractor) | DBPR publishes downloadable licensee files with mailing addresses. Filter to Miami-Dade, Broward, Palm Beach, Hillsborough, Orange. Very high Spanish-language density. |
| **TX** | No state GC license exists. Use: (a) municipal contractor registrations for Houston, Dallas, San Antonio, Austin, Fort Worth; (b) TDLR for electrical and plumbing to identify affiliated GCs; (c) Houzz and Google Business Profile searches | Houzz "Kitchen & Bath Remodelers, Houston" filtered to 10+ reviews is the fastest usable list. Google Maps search "kitchen remodeling contractor" per neighborhood. |
| **CA** | CSLB (Contractors State License Board) license search, classifications B (General Building) and C-class trades | CSLB publishes a full downloadable licensee list with business name, address, and classification. Filter to class B, active, bond current, 5+ years licensed. Filter to LA, Orange, San Diego, Santa Clara, Alameda counties. |

### Enrichment workflow

Rosters give name, address, license. They do not give email. For each qualified
business:

1. Google `"<business name>" <town> contractor` to find the site.
2. Look for `/about`, `/team`, `/contact`. Get the owner's first name.
3. Get the email from the site. If only a form exists, try `firstname@domain`
   and verify with a free verifier before sending.
4. Check the site and Google reviews for the language signal. No signal, no send.
5. Log the specific signal you found. It goes in the email's first line.

Rule: if you cannot name a specific reason this contractor has a language gap,
skip them. Generic sends to this list will burn the domain and the offer.

### Sending hygiene

- Send from a real mailbox on a subdomain, for example `julian@mail.monthlyalerts.com`,
  not the root domain used for transactional email. Keep Resend's transactional
  reputation separate from cold outreach.
- SPF, DKIM, DMARC configured before the first send.
- Warm up: 10/day week 1, 20/day week 2, 30/day week 3, then hold at 30 to 40.
- Plain text. No images, no tracking pixel, no HTML signature, no unsubscribe
  header theater. One link maximum, and only in touch 1 and 3.
- Never send more than 3 emails to a contact, ever.

## 3. Email sequence

Three touches. Day 0, day 4, day 11. All under 120 words. All plain text. Merge
fields in braces.

### Touch 1 - Day 0

**Subject line options** (rotate, track which pulls):
- `your Spanish-speaking crew`
- `question about {Company}`
- `punch list in two languages`

```
{FirstName},

I saw {SpecificSignal} on your site, so I'm guessing at least some of your crew
works in Spanish and some of your clients don't.

I built MonthlyAlerts for exactly that. You write the punch list once in English.
Your foreman and subs read the same list in Spanish, with photos, due dates and
comments translated both ways. Nobody re-types anything into a group text.

It's normally $100 per project, one time. I'd like to set up your next project on
us so you can see whether it holds up on a real job.

Worth a look?

Julian Leone
monthlyalerts.com
```

Word count: 108. `{SpecificSignal}` examples: "the Spanish page", "your reviews
in two languages", "the bilingual job posting", "'Se habla español' on your
contact page".

### Touch 2 - Day 4

**Subject:** reply in the same thread, no new subject.

```
{FirstName},

Short version of the last one: your next project's checklist, free, in English and
Spanish at the same time.

Concretely: you pick a kitchen or bath template, adjust the phases to the job, and
invite your foreman and subs by email with their language. They check items off
and post photos. On the first of the month everyone gets a status email in their
own language, including the homeowner.

Takes an evening to set up. Nothing to install.

Want me to set it up? I just need the project name and the emails.

Julian
```

Word count: 100.

### Touch 3 - Day 11 (breakup)

**Subject:** reply in the same thread.

```
{FirstName},

I'll stop here.

If the language thing ever becomes a real problem on a job, the offer stands: I'll
set up your first project free, no card, no call. Just reply to this email.

And if you'd rather look at it yourself, it's at monthlyalerts.com/for-contractors.

Good luck with the season.

Julian
```

Word count: 62.

No fourth touch. No "just bumping this to the top of your inbox". No re-adding a
contact to a new sequence in three months without a new reason to write.

## 4. "First project on us" mechanics

The offer is a real free project, not a trial that expires and holds their data
hostage.

### What they get

- One project, fully activated, no charge. Unlimited checklist items and photos,
  all three languages, all invitees, monthly status email, per-phase budgets,
  project PDFs, two years of storage. Identical to a paid project.
- No credit card. No call required. No time limit on the project itself.

### How to grant it

The offer is built into the app as a **credit** (`credit_ledger`, reason `comp`),
so there is no coupon to mint and nothing to do by hand in the normal case:

1. **Automatic (outreach link).** Every prospect email carries a tracked link
   (`/w/<token>`). Visiting it sets a 90-day cookie; when that person signs up,
   the account is attributed to the prospect and receives one project's worth of
   credit ($100). The prospect row flips to `converted`. The project they build
   activates free at the "Activate" step, with `activation_source = 'credit'`.
2. **Manual (anyone else).** Admin → Referrals → "Comp a project": enter the
   account email. Same credit, reason `comp`, note of your choosing.

A comped activation fires the real `checkout_started` / `project_activated`
events, so the funnel numbers stay honest, and it is excluded from paid
activations on `/admin/kpis` (`activation_source` is `credit`, not `stripe`).
Never count it as revenue in CAC.

### Limits

| Rule | Value |
|---|---|
| One free project per company, ever | Enforced by email domain plus company name |
| Free projects granted per month | Cap at 25. If you cannot follow up with 25 contractors in a month, do not grant more than you can support |
| What happens on project 2 | Full $100. Say this in the first email if asked, never volunteer it as a condition |
| Referral | A contractor who refers another paying owner gets a $20 credit, same mechanics as the partner program in `italy-partners.md` |

### Onboarding a "yes"

Do this within 24 hours of the reply, by email, no call unless they ask.

1. Ask for three things only: project name, the emails of the people to invite, and
   each person's language.
2. Create the project, pick the closest template, invite everyone.
3. Send one email: "It's set up. Here's the link. Your foreman will get an invite,
   they sign in with an emailed link, no password."
4. Day 3: one email. "Did your foreman get in?" Nothing else.
5. Day 14: one email. "Is anything missing from the list?"
6. Day 35 (after their first monthly status email lands): "Did the monthly email
   land right? If this worked, I'd love to know, and if you know another GC with
   the same language problem, send them my way."

That day-35 message is where referrals come from. Do not skip it.

## 5. Reply handling scripts

Keep replies under 80 words. Answer the question, then one question back.

### "How much is it?"
```
$100 one time per project. Not a subscription, no per-seat charge, and everyone you
invite joins free. Your first project I'll set up on us so you can judge it on a
real job. Want me to?
```

### "We already use [Buildertrend / CoConstruct / JobTread]"
```
Fair, and I'm not going to try to replace it. The one thing those don't do is put
the same punch list in front of an English-speaking client and a Spanish-speaking
crew at the same time. If that's ever the friction, I'm here. If it isn't, no
worries at all.
```

### "Is this an app? My guys won't download anything."
```
Nothing to download. They get an email, tap the link, and they're in. No password,
no app store. It works in the phone browser they already have.
```

### "How good is the translation?"
```
It's machine translation, not a human translator, and it's good enough for punch
list items, comments and photo captions. It's not a contract or a legal document
tool. Your crew reads a clear instruction instead of a garbled group text, which is
the bar it has to clear.
```

### "Can I see a demo?"
```
Faster than a demo: I'll set up your next project for free and you can look at the
real thing. Send me the project name, the emails of your foreman and subs, and each
person's language. It'll be live today.
```

### "Send me info"
```
Here it is: monthlyalerts.com/for-contractors. Short version, you write the punch
list once in English, your crew reads it in Spanish, photos and comments translate
both ways, $100 one time per project, everyone you invite is free. Happy to set your
first one up on us. Want me to?
```

### "Not interested" / "Remove me"
```
Understood, I won't write again. Good luck with the season.
```
Then add to permanent suppression. Do not reply beyond this.

### "Do you support [other language]?"
```
English, Italian and Spanish today. If you'd use it in [language], tell me and I'll
add it to the list; it's a small change on my end and demand decides the order.
```

### "Who else uses it?"
Do not invent customers.
```
It's new and I'm the whole company, so I'm not going to hand you a customer list.
That's exactly why the first project is free: you get to judge it on your own job
instead of on my references.
```

### "Can the homeowner see it?"
```
Yes, and you control how much. Invite them as a commenter: they see phases, progress
and photos and can ask questions in the thread, but can't edit your list. Trades
join as editors and check work off.
```

## 6. Tracking sheet spec

One Google Sheet, three tabs. No CRM.

### Tab 1: `contacts`

| Column | Type | Notes |
|---|---|---|
| `id` | int | sequential |
| `company` | text | |
| `first_name` | text | |
| `email` | text | one per row, deduplicate on this |
| `phone` | text | optional, never used for cold calls |
| `state` | enum | NJ, NY, CT, FL, TX, CA |
| `county_or_city` | text | |
| `source` | enum | NJ_HIC, NYC_DCWP, NY_COUNTY, CT_DCP, FL_DBPR, TX_MUNI, TX_HOUZZ, CA_CSLB, GOOGLE, REFERRAL |
| `license_no` | text | from the roster, proves the record is real |
| `trade` | enum | GC, KITCHEN_BATH, PAINTING, ROOFING, TILE, LANDSCAPE, DESIGN_BUILD |
| `est_projects_yr` | enum | <10, 10-30, 30-60, 60-100, >100 |
| `lang_signal` | text | the exact evidence, verbatim. Blank means do not send |
| `existing_tool` | text | blank, or the tool named |
| `disqualified` | bool | |
| `disqualify_reason` | text | |
| `qualified_date` | date | |

### Tab 2: `sequence`

| Column | Type | Notes |
|---|---|---|
| `contact_id` | int | joins to tab 1 |
| `subject_variant` | enum | A, B, C |
| `t1_sent` | date | |
| `t2_sent` | date | blank if they replied |
| `t3_sent` | date | blank if they replied |
| `replied` | bool | |
| `reply_date` | date | |
| `reply_type` | enum | INTERESTED, QUESTION, NOT_NOW, HAS_TOOL, NO, REMOVE |
| `offer_accepted` | bool | |
| `project_created_date` | date | from the app database |
| `invitees_added` | int | from the app database. This is the real activation signal |
| `first_item_checked_date` | date | from the app database |
| `paid_project_date` | date | their second project, or a paid first one |
| `referred_count` | int | |
| `notes` | text | one line max |

### Tab 3: `weekly`

One row per week. Fill it Friday.

| Column | Formula or source |
|---|---|
| `week_of` | date |
| `raw_pulled` | count from rosters |
| `qualified` | count where `disqualified = FALSE` and `lang_signal` not blank |
| `t1_sent` | count |
| `replies` | count where `replied = TRUE` |
| `reply_rate` | `replies / t1_sent` |
| `offers_accepted` | count |
| `accept_rate` | `offers_accepted / t1_sent` |
| `projects_created` | count |
| `projects_with_2plus_invitees` | count. The number that actually predicts retention |
| `paid_projects` | count |
| `hours_spent` | manual |
| `cost_per_activated_project` | `hours_spent x your hourly rate / projects_with_2plus_invitees` |

### Benchmarks to judge against

| Metric | Acceptable | Good | Stop and rethink |
|---|---|---|---|
| Qualified per 100 raw records | 20 | 35+ | under 12 |
| Reply rate | 6% | 12%+ | under 3% after 200 sends |
| Offer accept rate | 2% | 5%+ | under 1% after 300 sends |
| Free project to 2+ invitees | 50% | 75%+ | under 30% (onboarding is broken, not the offer) |
| Free project to a paid second project | 15% | 30%+ | under 8% (the product is not sticking) |

Under 3% reply rate after 200 sends means the first line is not specific enough,
not that the offer is wrong. Fix `lang_signal` quality before touching the copy.

The professional acquisition target from the plan is under $150 per contractor who
brings 5+ projects a year. Charge your own time at a real rate when you compute
that, or the number is a fantasy.
