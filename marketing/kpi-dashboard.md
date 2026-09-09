# KPI Dashboard and Review Rules

North star: **cost per activated project.** Everything else is diagnostic.

One sheet, one weekly review, one monthly decision. If a metric is not on this
page, do not track it.

## 0. Where the data lives (built Sept 2026)

Attribution is captured automatically; nothing to add before spending:

- `users.acquisition` (jsonb): first-touch `utm_*`, `gclid`, `fbclid`, landing
  path, referrer, captured by a 90-day cookie on the first visit and written at
  signup. `users.referred_by_code` holds the referral code; `users.prospect_id`
  links an outreach prospect.
- `projects.acquisition` / `projects.referral_code` / `projects.template_slug`:
  the same snapshot on each project, plus which public template it started from.
- `projects.activation_source`: `stripe` (paid), `credit` (referral credit or a
  comped project), `comp`. Only `stripe` counts as revenue.
- `credit_ledger`: referral credits (+$20 per activated referred project),
  comped projects, and redemptions.
- `marketing_spend`: monthly spend per channel, entered on `/admin/kpis`.

Channels are derived from the snapshot by `channelOf()` in `web/lib/attribution.ts`:
`google` (gclid or utm_source=google), `meta` (fbclid or facebook/instagram),
`referral`, `outreach`, `social`, `content` (landed on a guide or template),
`organic` (nothing else). `/admin/kpis` shows the monthly funnel, per-channel
activations, spend, and CAC against the targets in `web/lib/kpis.ts`; visitors
still come from Vercel Analytics.

## 1. Metric definitions

All windows are the trailing 30 days unless stated. All dates are UTC to match
`created_at`. Denominators of zero produce "n/a", never zero.

### Traffic

| Metric | Formula | Source |
|---|---|---|
| **Visitors** | Unique visitors to any page on `www.monthlyalerts.com`, trailing 30 days | Vercel Web Analytics (`<Analytics/>` in the root layout) |
| **Landing page visitors** | Unique visitors, split by path: `/`, `/for-contractors`, `/for-homeowners`, `/for-designers`, `/renovating-abroad`, `/checklists/*`, `/guides/*` | Vercel Analytics, Pages report |
| **Referral-link clicks** | Unique visitors to `/CODE` paths, grouped by code | Vercel Analytics, Pages report, filtered to partner codes |

Vercel Analytics is the visitor source of record. Do not compare it against Google
Ads clicks and expect the numbers to match; they never will, and the difference is
not a bug worth chasing.

### Funnel

| Metric | Formula | Source |
|---|---|---|
| **Signups** | `COUNT(users WHERE onboarded_at IS NOT NULL AND onboarded_at >= now() - interval '30 days' AND deleted_at IS NULL)` | app database |
| **Projects created** | `COUNT(projects WHERE created_at >= now() - interval '30 days')` | app database |
| **Checkouts started** | Count of Stripe Checkout Sessions created in the window | Stripe |
| **Projects activated** | `COUNT(projects WHERE paid_at IS NOT NULL AND paid_at >= now() - interval '30 days')` | app database (`paid_at` is set when Checkout completes) |
| **Paid projects** | Projects activated where `activation_source = 'stripe'` | app database |
| **Free-offer projects** | Projects activated where `activation_source IN ('credit','comp')` | app database |

While `BILLING_ENABLED=false`, `paid_at` stays null on every project. In that
window, treat **projects created with 2 or more members** as the activation proxy:

```sql
SELECT COUNT(*) FROM (
  SELECT p.id
  FROM projects p
  JOIN project_members m ON m.project_id = p.id
  WHERE p.created_at >= now() - interval '30 days'
  GROUP BY p.id
  HAVING COUNT(m.user_id) >= 2
) t;
```

A one-member project is a tire-kick. Two or more members means the owner invited
somebody, which is the moment the product's only real value appears.

### Conversion rates

| Metric | Formula | Target |
|---|---|---|
| **Visitor to project creation** | `projects_created / visitors` | **> 8%** |
| **Creation to paid** | `projects_activated / projects_created` | **> 20%** |
| **Signup to creation** | `projects_created / signups` | > 60% (below this, project creation is confusing, not the marketing) |
| **Checkout completion** | `projects_activated / checkouts_started` | > 70% (below this, checkout is broken) |
| **Invite acceptance** | `COUNT(invites WHERE accepted_at IS NOT NULL) / COUNT(invites)` in the window | > 55% |

Visitor to project creation above 8% is only plausible against qualified traffic.
If total-site traffic dilutes it below 8% because of SEO pages, compute it per
landing path as well and judge paid landing pages on their own number.

### Cost

| Metric | Formula | Source |
|---|---|---|
| **Paid spend** | Google Ads spend + Meta spend, trailing 30 days | Google Ads, Meta Ads Manager |
| **Direct CAC** | `paid_spend / projects_activated_from_paid` where `channel IN ('google','meta')` | ad platforms + app database |
| **Referral/organic CAC** | `(partner_credits_issued + content_cost) / projects_activated_from_referral_and_organic` | app database + credit ledger |
| **Outreach CAC** | `(outreach_hours x hourly_rate) / projects_activated_from_outreach` | tracking sheet |
| **Blended CAC** | `total_marketing_cost / total_projects_activated` where `total_marketing_cost = paid_spend + partner_credits_issued + (outreach_hours x hourly_rate)` | all |
| **Cost per activated project (north star)** | Same as blended CAC, but the denominator counts every activated project including free-offer ones | all |

Two things that must not be fudged:

1. `partner_credits_issued` is `$25 x referred paid projects` in the window. It is
   a real cost even though no cash moves, because each credit displaces $100 of
   future revenue at a 25% rate.
2. `hourly_rate` for your own outreach time. Pick a number ($50 is reasonable) and
   never change it. A CAC computed with your time at zero is not a CAC.

### Targets

| Metric | Target |
|---|---|
| Direct CAC (Google + Meta) | **< $30 to $35** |
| Referral / organic CAC | **< $15** |
| Blended CAC | **< $25 to $30** |
| Professional acquisition cost (contractor or partner producing 5+ projects/yr) | **< $150** |
| Visitor to project creation | **> 8%** |
| Creation to paid | **> 20%** |
| Referral + organic share of activated projects by month 6 | **> 30%** |

### Channel mix

| Metric | Formula |
|---|---|
| **Referral + organic share** | `activated_projects WHERE channel IN ('organic','referral','content') / total_activated_projects` |
| **Paid share** | `activated_projects WHERE channel IN ('google','meta') / total_activated_projects` |
| **Outreach share** | `activated_projects WHERE channel = 'outreach' / total_activated_projects` |

### Revenue and unit economics

| Metric | Formula | Source |
|---|---|---|
| **Gross revenue** | Sum of succeeded Stripe charges in the window | Stripe |
| **Revenue per activated project** | `gross_revenue / paid_projects` | Stripe + app database |
| **Contribution per project** | `100 - stripe_fee - translation_cost - storage_cost` | Stripe + OpenAI + Vercel Blob invoices |
| **Payback** | Immediate. The product is a one-time $100 purchase, so CAC must be under the contribution margin on the first project. There is no LTV runway to hide a bad CAC in. |
| **Repeat rate** | `COUNT(DISTINCT owner_id WITH 2+ paid projects) / COUNT(DISTINCT owner_id WITH 1+ paid project)`, all time | app database |

Repeat rate is the only forward-looking number that matters. A contractor's second
project at full price is where this business either works or does not. Report it
monthly from month 3, and never use it to justify a CAC above $35 before you have
90 days of data behind it.

### Health metrics (not marketing, but they gate scaling)

| Metric | Formula | Watch level |
|---|---|---|
| **Activated projects with 2+ members** | share of activated projects | below 60% means the invite flow is failing |
| **Multilingual projects** | share of activated projects where members have 2+ distinct `preferred_language` values | below 40% means you are selling a checklist, not a translation product, and the whole positioning is wrong |
| **Items per project at day 14** | median `COUNT(items)` per project | below 8 means abandonment |
| **Projects with 1+ photo** | share | below 50% means photos are not discoverable |

`multilingual_projects` share is the single most important diagnostic on this page.
Every claim, ad and landing page is built on the language gap. If most paying
owners run monolingual projects, stop scaling and re-read the positioning.

```sql
-- multilingual share of activated projects, trailing 30 days
SELECT
  COUNT(*) FILTER (WHERE langs >= 2)::float / NULLIF(COUNT(*), 0) AS multilingual_share
FROM (
  SELECT p.id, COUNT(DISTINCT u.preferred_language) AS langs
  FROM projects p
  JOIN project_members m ON m.project_id = p.id
  JOIN users u ON u.id = m.user_id
  WHERE p.paid_at >= now() - interval '30 days'
  GROUP BY p.id
) t;
```

## 2. Data sources

| Source | What it is the record of | How it is pulled |
|---|---|---|
| **Vercel Web Analytics** | Visitors, page views, paths, referrers | Vercel dashboard. Export weekly by hand; there is no API worth building for this volume |
| **App database (Neon Postgres)** | Signups, projects created, projects activated, members, invites, items, photos, languages, referral codes, acquisition source | `psql` or a saved SQL file run weekly. Keep the queries in `web/scripts/` so they are versioned |
| **Stripe** | Checkouts started, revenue, fees, refunds | Stripe dashboard. Reconcile `projects.paid_at` count against Stripe charge count every week; a mismatch means a webhook was missed |
| **Google Ads** | Paid search spend, clicks, impressions, imported conversions | Google Ads dashboard, weekly export |
| **Meta Ads Manager** | Paid social spend, plays, hook rate, conversions | Ads Manager, weekly export |
| **Outreach tracking sheet** | Contacts, sends, replies, offers, hours | Google Sheet from `contractor-outreach.md` |
| **Partner sheet** | Partner referrals, credits issued and redeemed | Google Sheet from `italy-partners.md` |
| **Resend** | Monthly status email delivery and open rate | Resend dashboard |

### Reconciliation rule

Every week, three numbers must agree within 5%:

1. `COUNT(projects WHERE paid_at IS NOT NULL)` in the window
2. Stripe succeeded charges for the project price in the window
3. Google Ads + Meta reported `project_activated` conversions, plus non-paid
   activations from the database

If they disagree by more than 5%, fix the plumbing before making any budget
decision that week. Note that project creation on payment is idempotent on
`stripe_session_id` and is called from both the webhook and the success page, so
the risk is a missing project, not a duplicate one.

## 3. The sheet

One Google Sheet, tab `kpi_weekly`, one row per week. 22 columns, no more.

| Column | Type | Source |
|---|---|---|
| `week_of` | date (Monday) | manual |
| `visitors` | int | Vercel |
| `visitors_paid_lp` | int | Vercel, sum of paid landing paths |
| `signups` | int | DB |
| `projects_created` | int | DB |
| `checkouts_started` | int | Stripe |
| `projects_activated` | int | DB |
| `paid_projects` | int | DB |
| `free_offer_projects` | int | DB |
| `spend_google` | $ | Google Ads |
| `spend_meta` | $ | Meta |
| `credits_issued` | $ | partner sheet |
| `outreach_hours` | float | outreach sheet |
| `activated_google` | int | DB by channel |
| `activated_meta` | int | DB |
| `activated_organic` | int | DB |
| `activated_referral` | int | DB |
| `activated_outreach` | int | DB |
| `revenue` | $ | Stripe |
| `pct_2plus_members` | % | DB |
| `pct_multilingual` | % | DB |
| `notes` | text | one line, the decision made this week |

Everything else (CAC, rates, shares) is a formula over these columns on a second
tab. Do not hand-enter a computed number.

## 4. Weekly review template

30 minutes, Monday. Copy this block into the sheet's `notes` or a running doc.

```
WEEK OF: ____________

1. NUMBERS (trailing 7 days unless noted)
   Visitors                      ______
   Signups                       ______
   Projects created              ______
   Projects activated            ______   (paid ____ / free-offer ____)
   Spend: Google ____  Meta ____  Credits ____  Outreach hrs ____

2. RATES (trailing 30 days)
   Visitor -> creation           ____%   target >8%
   Creation -> paid              ____%   target >20%
   Checkout completion           ____%   target >70%
   Invite acceptance             ____%   target >55%

3. COST (trailing 30 days)
   Direct CAC (Google+Meta)      $____   target <$30-35
   Referral/organic CAC          $____   target <$15
   Blended CAC                   $____   target <$25-30
   Cost per activated project    $____   NORTH STAR

4. MIX (trailing 30 days)
   Paid share                    ____%
   Referral+organic share        ____%   target >30% by month 6
   Outreach share                ____%

5. HEALTH
   Activated with 2+ members     ____%   floor 60%
   Multilingual projects         ____%   floor 40%
   Reconciliation (DB/Stripe/ads within 5%?)   Y / N

6. GOOGLE ADS (from google-ads.md checklist)
   Negatives added this week     ______
   Keywords paused               ______
   Search-term waste as % spend  ____%   target <15%
   Worst-performing ad group     ____________

7. META (from meta-ads.md)
   Best hook rate                ____%   ad: ______
   Any creative under 20% hook rate killed?   Y / N
   Frequency over 2.5?           Y / N

8. OUTREACH
   Qualified contacts added      ______
   T1 sends                      ______
   Replies                       ______   rate ____%
   Offers accepted               ______

9. PARTNERS
   Pitched                       ______
   Replies                       ______
   Referred activations          ______

10. ONE DECISION MADE THIS WEEK
    ______________________________________________

11. ONE THING NOT DONE THAT SHOULD HAVE BEEN
    ______________________________________________
```

Rules for the review:

- Fill the numbers before reading them. Do not look at a chart and then find data
  that supports the mood.
- Line 10 is mandatory. A week with no decision is a week of drift.
- Do not change more than two things in a week. With this volume, three
  simultaneous changes make the following week unreadable.
- Do not act on any channel with fewer than 5 activations in the window. Below 5,
  the noise is larger than the signal, and the only valid action is "keep going and
  keep collecting".

## 5. Monthly review additions

On the first Monday of each month, add:

- Repeat rate, all time.
- Contribution per project (recompute from the actual Stripe, OpenAI and Vercel
  Blob invoices, not from an estimate).
- Cohort view: of the projects created in month N, how many activated by the end of
  month N+1. Creation to paid on a rolling 30-day window hides slow converters.
- Partner credit balance total, and how much future revenue it displaces.
- One paragraph written by hand: what changed, what you believe now that you did
  not believe a month ago.

## 6. Month-4 channel cut decision rule

Run this once, at the start of month 4 (day 91 to 97), with the trailing 60 days of
data. It is a mechanical rule. Write the numbers down first, then apply it.

### Preconditions

The rule needs a minimum of **10 activated projects total** across all channels in
the trailing 60 days. If there are fewer than 10, the honest answer is that no
channel has been tested, not that all channels failed. In that case:

- Hold Google Ads at the $750 floor.
- Hold Meta at $500.
- Double the outreach volume, because it is the only channel whose output scales
  with effort rather than budget.
- Re-run this rule at month 5. Do this at most twice; if month 5 also has fewer
  than 10 activations, the problem is the offer or the market, and no budget
  reallocation fixes that.

### The rule

Compute, for the trailing 60 days, for each of the four channels (Google Ads,
Meta, contractor outreach, Italy partners):

```
channel_CAC   = channel_cost / channel_activated_projects
channel_share = channel_activated_projects / total_activated_projects
```

Then apply, in order:

| # | Condition | Action |
|---|---|---|
| 1 | Channel has 5+ activations and CAC < $30 | **Scale.** Increase that channel's budget or hours by 50%. Fund it from the channel cut in rules 4 and 5. |
| 2 | Channel has 5+ activations and CAC $30 to $45 | **Hold.** Same budget, fix the weakest funnel step. Re-evaluate at month 5. |
| 3 | Channel has 5+ activations and CAC $45 to $60 | **Halve.** Cut budget or hours 50%, keep the channel alive for learning. |
| 4 | Channel has 5+ activations and CAC > $60 | **Cut.** Pause it. Move the entire budget to the highest-ranked channel under rule 1. |
| 5 | Channel spent $600+ cumulative with 0 or 1 activation | **Cut.** No exceptions, no "it needs more time". $600 at these CPCs is enough clicks to know. |
| 6 | Channel has 2 to 4 activations and CAC < $35 | **Hold and extend one month.** Not enough data to scale, too promising to cut. |
| 7 | Channel has 2 to 4 activations and CAC > $60 | **Halve**, and re-evaluate at month 5. |

### The specific paid-search decision

The rule most likely to fire in month 4, given the CPC structure of this market:

> If Google Ads blended CAC is above $45 while referral and organic CAC is under
> $15, cut Google Ads to $250/month maintenance spend on campaign C1 (Crew
> Language Gap) only, and reallocate the difference: 60% to contractor outreach
> hours, 40% to Italy partner development.

The logic is unsentimental. A $100 one-time product with no subscription tail
cannot carry a $45 acquisition cost, and the channels that can hit $15 are the ones
where a human being with product knowledge does the work. Paid search is worth
keeping at maintenance level for the specific-intent exact-match terms that do
convert, and worth nothing above that.

### The mirror decision

> If referral plus organic share is below 15% at month 4 while paid CAC is under
> $30, the problem is not paid acquisition. It is that nobody is telling anybody
> else about the product.

In that case do not cut anything. Instead:
- Add the day-35 referral ask to every onboarding sequence (see
  `contractor-outreach.md` section 4).
- Ship the `/checklists/<template>` and `/guides/<article>` SEO pages, which are
  the only asset in the plan that compounds without spend.
- Give every paying owner a referral link on the same terms as partners.

### What is never cut at month 4

- The `/checklists/*` and `/guides/*` SEO pages. They have a 6 to 12 month lag and
  judging them at month 4 is a category error.
- The monthly status email. It is the product's retention mechanism and its best
  organic surface.
- The Italy partner program, unless rule 5 fires on it. Partner cycles run longer
  than 60 days: a broker's March closing becomes a June renovation.
