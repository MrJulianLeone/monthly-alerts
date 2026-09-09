# Google Ads Runbook for MonthlyAlerts

How to set up, launch, and run Google Ads for a $100-per-project product,
step by step, in order. The strategy (keywords, negatives, ad copy, budget
math) lives in `google-ads.md`; this file is the operating procedure. Expect
about three hours for setup, then 30 minutes a week.

Rules that never change:

- Only Search campaigns. No Display, no Performance Max, no Search Partners,
  no "Google Display Network" expansion. These spend the budget on clicks that
  never activate a project.
- Only exact and phrase match. Never broad match, even when Google
  "recommends" it.
- The conversion that matters is `project_activated`. Everything else is a
  diagnostic.
- Spend stays at the floor ($750/mo) until cost per activated project is
  under $35 for two consecutive weeks with at least 10 activations.

## Phase 0: before opening the account (30 minutes)

1. Confirm the landing pages load and say the right thing:
   `/for-contractors`, `/for-homeowners`, `/renovating-in-italy`,
   `/checklists/kitchen-renovation-checklist`,
   `/checklists/contractor-punch-list`. Each one should show the headline,
   the "$100 per project, not a subscription" line, and a Start button.
2. Confirm the funnel end to end with a test account: sign up → create a
   project (it starts as a free draft) → Activate → Stripe → land on
   `/projects/activated`. That last page fires `project_activated`.
3. Open Vercel Analytics for the project. You will use Visitors here for the
   visitor → project-creation rate; Google Ads cannot see it.

## Phase 1: account (45 minutes)

1. Go to ads.google.com with the Google account that owns the business. Create
   the account in **Expert Mode** (the link at the bottom of the "What's your
   main advertising goal" screen). Do not let the wizard build a campaign.
2. Settings → Account settings:
   - Currency USD, time zone America/New_York.
   - Turn **off** auto-apply recommendations (Recommendations → Auto-apply →
     uncheck everything). Google will otherwise switch you to broad match and
     raise budgets on its own.
3. Billing → add the card. Choose monthly invoicing only if offered later; the
   default automatic payments are fine.
4. Tools → Conversions → "New conversion action" → Website → enter
   `www.monthlyalerts.com` → scan → "Add a conversion action manually". Create
   four, all category "Sign-up" except the first which is "Purchase":

   | Name | Category | Value | Count | Window | Goal type |
   |---|---|---|---|---|---|
   | `project_activated` | Purchase | 100 USD, use same value | One | 30-day click | Primary |
   | `signup` | Sign-up | none | One | 30-day click | Secondary |
   | `project_created` | Sign-up | none | One | 30-day click | Secondary |
   | `checkout_started` | Sign-up | none | One | 7-day click | Secondary |

   Set each to "Use event snippet" (not "page load"). For each one Google
   shows a snippet containing `send_to: 'AW-XXXXXXXXX/YYYYYYYY'`. Write down
   the AW id and the label of `project_activated` and `signup`.
5. Put the ids in Vercel → Project → Settings → Environment Variables →
   Production:

   ```
   NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXX
   NEXT_PUBLIC_GOOGLE_ADS_ACTIVATION_LABEL=<label of project_activated>
   NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL=<label of signup>
   ```

   Redeploy (Deployments → ⋯ → Redeploy). The site then loads the Google tag
   on public pages and sends all four events; the two labelled ones report as
   Google Ads conversions, the rest arrive as GA-style events you can also
   import later if you link GA4.
6. Verify: open the site in a private window with `?gclid=test` on the URL,
   sign up with a throwaway email, and within 24 hours `signup` shows "Recording
   conversions" under Tools → Conversions. If it stays "Inactive" after two
   days, the env vars are wrong or the deploy did not run.
7. Tools → Audience manager → create a website audience "All visitors, 30
   days" and one for "Visited /projects/new but not /projects/activated".
   These are for retargeting later, and Google needs time to fill them.

## Phase 2: build the campaigns (60 minutes)

Build exactly what `google-ads.md` specifies. Summary of the three campaigns:

| Campaign | Ad groups | Landing page | Daily budget at launch |
|---|---|---|---|
| C1 Crew Language Gap | Spanish crew communication; contractor translation app | `/for-contractors` | $10 |
| C2 Checklist Intent | Renovation checklist app; remote renovation management | `/for-homeowners`, `/checklists/kitchen-renovation-checklist`, `/guides/how-to-manage-a-home-renovation-remotely` | $10 |
| C3 Italy | Renovating in Italy from the US | `/renovating-in-italy` | $5 |

For every campaign, the settings screen:

- Campaign type: Search. Goal: Purchases. Uncheck "Search Network partners"
  and "Display Network".
- Locations: C1 and C2 → United States (Presence: people in or regularly in).
  Later, narrow to NJ, NY, CT, FL, TX, CA if the search terms show waste. C3 →
  United States plus Canada, United Kingdom.
- Languages: English. C1 also Spanish (bilingual owners search in either).
- Bidding: "Maximize clicks" with a max CPC limit of $3.00 (C3: $2.50). Switch
  to Target CPA $30 only after 15 conversions in 30 days.
- Ad schedule: all days, 6:00 to 22:00 in the account time zone. Contractors
  search early; nobody buys at 3 a.m.
- Ad rotation: optimize. Sitelinks: For contractors, For homeowners,
  Checklist templates, Demo. Callouts: "$100 per project", "Not a
  subscription", "English · Italian · Spanish", "Free to build".
- Campaign-level negatives: paste the full list from `google-ads.md` into a
  shared negative keyword list (Tools → Shared library → Negative keyword
  lists → "Core negatives") and attach it to all three campaigns.

For every ad group:

- Keywords in exact `[keyword]` and phrase `"keyword"` match only, from the
  lists in `google-ads.md`. Paste the ad group's keywords, then check the
  match type column; Google defaults to broad if you paste bare words.
- Three responsive search ads from `google-ads.md`. Pin nothing. Ad strength
  "Good" is enough; do not chase "Excellent" by adding generic headlines.
- Final URL is the ad group's landing page with UTM parameters so the app can
  attribute the project to Google even if Google's own tag is blocked:

  ```
  https://www.monthlyalerts.com/for-contractors?utm_source=google&utm_medium=cpc&utm_campaign=c1-crew&utm_content={adgroupid}
  ```

  Use the campaign short name in `utm_campaign` (c1-crew, c2-checklist,
  c3-italy). The app records first touch on the account and every project;
  `/admin/kpis` buckets these as the `google` channel.

Launch all three paused, review the whole account once, then enable.

## Phase 3: the first two weeks

Daily, five minutes:

1. Campaigns → Search terms (all campaigns, last 7 days). Sort by cost. Add as
   negatives (to the shared list) anything that is not someone who could
   activate a project this month: job seekers, software comparisons, DIY
   translation tools, "free", student questions, other countries for C1/C2.
   Expect to add 20 to 40 negatives in week one; this is where the budget is
   saved.
2. Check that no keyword is spending more than 30% of its campaign without a
   single `project_created`. Pause it.
3. Look at the Status column for "Below first page bid" on your best exact
   keywords. Raise the max CPC on that keyword by $0.50, up to $4.50, never
   further.

Do not touch budgets, bidding strategy, or ad copy in the first 14 days.

## Phase 4: the weekly routine (30 minutes, same day each week)

1. Enter last week's spend per campaign on `/admin/kpis` (Record spend →
   channel `google`). The dashboard now shows Google CAC = spend ÷ activated
   projects attributed to Google.
2. Fill the weekly row in `kpi-dashboard.md` §Weekly sheet: impressions,
   clicks, CTR, avg CPC, spend, `project_created`, `project_activated`, CAC,
   and Vercel visitors → project-creation rate.
3. Search terms review as in Phase 3 (now 10 minutes).
4. Per ad group, check CTR. Under 2% on exact match after 300 impressions
   means the ad does not match the query; swap the weakest RSA for a new one
   from the `google-ads.md` spare copy, keep two running.
5. Per keyword, after 40 clicks with no `project_created`: pause. After 100
   clicks with no `project_activated`: pause and note it in `google-ads.md`.
6. Landing page check: `/admin/kpis` "content" and "google" channels show
   creation → activation. If Google traffic creates projects but does not
   activate (rate under half of organic), the promise in the ad is off, not
   the product. Rewrite the RSA to match what the landing page delivers.

## Phase 5: scale, hold, or kill (monthly, from week 4)

Decide with the numbers on `/admin/kpis`, never with Google's
recommendations. Minimum 10 Google-attributed activations before any
decision; below that, hold.

| Google CAC (4-week) | Action |
|---|---|
| Under $25 | Raise the campaign budget 25%, once per two weeks. Switch that campaign to Target CPA $30. |
| $25 to $35 | Hold. Keep trimming search terms and pausing dead keywords. |
| $35 to $45 | Cut the daily budget of the worst ad group by half. No new keywords. |
| Over $45 for 4 weeks | Pause the campaign. Keep C1 running only if its CAC alone is under $35. Reallocate the money to outreach and the Italy partner track. |

Never scale past $1,000/month until blended CAC across all channels is under
$30 with 30+ activations in the month.

## Phase 6: retargeting (only after 1,000 visitors)

Add one campaign, "R1 Retarget", Search only (RLSA): same keywords as C1 and
C2 with broader match allowed *because* it is restricted to the "All
visitors, 30 days" audience with bid adjustment +50%. Budget $5/day. Do not
add Display retargeting; the product does not benefit from banner
impressions.

## Troubleshooting

- **Conversions show 0 but Stripe shows payments.** The tag only fires on
  `/projects/activated`. Check the env vars are in Production (not Preview),
  the deploy happened after adding them, and that your browser is not blocking
  the tag (test in a normal window). Payments through Apple Pay on mobile can
  complete without the return page loading; expect Google to under-count by
  10 to 20 percent and rely on `/admin/kpis` for the true number.
- **"Limited by budget" everywhere.** Normal at $10/day. Ignore it.
- **Google emails saying an account manager wants to help.** Decline. Their
  changes (broad match, Performance Max, auto-apply) contradict this runbook.
- **Policy disapproval "Unavailable video" or "Misleading claims".** The
  "$100 per project" claim needs the price visible on the landing page; it is.
  Appeal with the landing page URL.
- **Clicks from outside the target countries.** Set Location options to
  "Presence" rather than "Presence or interest" (the default hides this
  under Location options → Target).
- **A keyword suddenly costs $8/click.** A competitor started bidding. Do not
  match them; the $4.50 cap holds. If the keyword stops serving, let it.

## What "done" looks like each month

- Spend entered on `/admin/kpis`, and Google CAC visible per month.
- Search terms reviewed at least four times; shared negative list growing.
- At least one RSA replaced per campaign with a variant from `google-ads.md`.
- A one-line note in `google-ads.md` under "Log" with the month's CAC, the
  decision taken from the Phase 5 table, and why.
