# Google Ads: MonthlyAlerts.com

Operator: Julian Leone (solo). Account currency USD. All numbers below are the
launch configuration, not aspirations.

## 0. Ground rules

1. Search Network only. Search Partners OFF. Display Expansion OFF.
2. Exact and phrase match only at launch. Broad match is banned until a
   campaign has produced 20+ `project_activated` conversions.
3. Never bid on generic category terms. Benchmarks for that market are ~$5.31
   CPC and ~$166 cost per lead, which cannot clear a $100 one-time product.
   Blocked at the account level (see negatives): construction software, project
   management software, contractor software, construction management, punch list
   software (generic), field service software.
4. Do not scale spend until paid-project CAC is under $30 to $35.
5. Budget floor $750/month, ceiling $1,000/month. No overrides.

## 1. Account structure

Three campaigns, four ad groups. One landing page per ad group. One theme per
ad group so the RSA can match the query without dynamic keyword insertion.

```
Account
├── C1 - Crew Language Gap (US, EN+ES)
│   └── AG-A  Multilingual Crew            → /for-contractors
├── C2 - Checklist Intent (US, EN)
│   ├── AG-B  Construction Checklist App   → /
│   └── AG-C  Homeowner Renovation         → /for-homeowners
└── C3 - Italy / Renovating Abroad (US, EN)
    └── AG-D  Renovating in Italy          → /renovating-abroad
```

### Campaign settings

| Setting | C1 Crew Language Gap | C2 Checklist Intent | C3 Italy |
|---|---|---|---|
| Networks | Search only | Search only | Search only |
| Locations | NJ, NY, CT, FL, TX, CA | United States | United States |
| Location option | Presence only | Presence only | Presence only |
| Languages | English, Spanish | English | English |
| Bid strategy | Maximize Clicks, max CPC $3.00 | Maximize Clicks, max CPC $3.00 | Maximize Clicks, max CPC $3.50 |
| Ad rotation | Optimize | Optimize | Optimize |
| Ad schedule | Mon-Sat 06:00-20:00 local | All | All |
| Device bid adj. | none at launch | none at launch | Desktop +0%, Mobile +0% |
| Daily budget (at $750/mo) | $10.00 | $10.00 | $5.00 |
| Daily budget (at $1,000/mo) | $13.00 | $13.50 | $6.50 |

Presence-only targeting matters: "renovating house in Italy" searched from Italy
is a different (mostly non-buying) intent than the same query from the US.

## 2. Keywords

Match types: `[exact]`, `"phrase"`. Every keyword listed is worth its own
final-URL check before upload.

### AG-A - Multilingual Crew → https://www.monthlyalerts.com/for-contractors

| Keyword | Match |
|---|---|
| communicate with spanish speaking contractor | [exact] |
| "communicate with spanish speaking contractor" | phrase |
| spanish english construction app | [exact] |
| "spanish english construction app" | phrase |
| contractor translation app | [exact] |
| "contractor translation app" | phrase |
| multilingual construction app | [exact] |
| "multilingual construction app" | phrase |
| "bilingual construction checklist" | phrase |
| "construction punch list spanish" | phrase |
| "translate for construction crew" | phrase |
| "app for spanish speaking crew" | phrase |

### AG-B - Construction Checklist App → https://www.monthlyalerts.com/

| Keyword | Match |
|---|---|
| construction checklist app | [exact] |
| "construction checklist app" | phrase |
| remodeling checklist app | [exact] |
| "remodeling checklist app" | phrase |
| renovation project checklist | [exact] |
| "renovation project checklist" | phrase |
| "construction punch list app" | phrase |
| "kitchen remodel checklist app" | phrase |
| "bathroom remodel checklist app" | phrase |
| "digital punch list app" | phrase |

### AG-C - Homeowner Renovation → https://www.monthlyalerts.com/for-homeowners

| Keyword | Match |
|---|---|
| homeowner contractor communication app | [exact] |
| "homeowner contractor communication app" | phrase |
| manage renovation remotely | [exact] |
| "manage renovation remotely" | phrase |
| "track what my contractor promised" | phrase |
| "renovation punch list for homeowners" | phrase |
| "app to track home renovation" | phrase |
| "manage remodel from out of state" | phrase |

### AG-D - Renovating in Italy → https://www.monthlyalerts.com/renovating-abroad

| Keyword | Match |
|---|---|
| renovating house in italy | [exact] |
| "renovating house in italy" | phrase |
| managing italian renovation from usa | [exact] |
| "managing italian renovation from usa" | phrase |
| italian contractor english homeowner | [exact] |
| "italian contractor english homeowner" | phrase |
| "renovating a home in italy from usa" | phrase |
| "italian renovation project management" | phrase |
| "communicate with italian contractor" | phrase |

## 3. Negative keyword list

Create one shared list named **MA-Global-Negatives** and apply it to all three
campaigns. Add the campaign-specific blocks underneath.

### Generic category terms (cost traps)

```
"construction software"
"project management software"
"contractor software"
"construction management software"
"construction management system"
"field service software"
"field service management"
"erp"
"construction erp"
"estimating software"
"takeoff software"
"bidding software"
"bid management"
"job costing software"
"accounting software"
"crm"
"contractor crm"
"scheduling software"
"gantt"
"bim"
"cad"
"blueprint software"
"procore"
"buildertrend"
"coconstruct"
"jobber"
"housecall pro"
"servicetitan"
"monday.com"
"asana"
"trello"
"smartsheet"
"microsoft project"
"notion"
```

### Free / cheap / DIY seekers

```
free
freeware
"free app"
"free template"
"free download"
"no cost"
cheap
cheapest
crack
cracked
torrent
"open source"
"excel template"
"google sheets template"
"pdf template"
"printable"
"print out"
```

### Wrong job (employment, education, licensing)

```
jobs
job
hiring
"hiring near me"
salary
resume
career
apprentice
"how to become"
license
licensing
"license exam"
"exam prep"
course
courses
class
classes
certification
degree
school
training
osha
```

### Wrong product (translation, hardware, services)

```
"google translate"
"translation service"
"human translator"
"certified translation"
"document translation"
interpreter
"interpreter service"
"translate pdf"
"translation agency"
"voice translator"
"earbuds"
"walkie talkie"
"two way radio"
"tablet"
"rugged phone"
"laser level"
"measuring app"
```

### Wrong buyer (enterprise, commercial, other verticals)

```
enterprise
commercial
industrial
"heavy civil"
infrastructure
highway
bridge
"oil and gas"
mining
shipbuilding
marine
aerospace
warehouse
"data center"
hospital
hotel
"multifamily development"
"real estate investing"
wholesaling
"house flipping software"
```

### Research / non-commercial intent

```
"what is"
"how does"
"meaning"
definition
wikipedia
reddit
forum
"vs"
comparison
alternatives
review
reviews
"case study"
statistics
"market size"
pdf
sample
example
examples
template
templates
```

`template` and `templates` are negatives at the account level even though the
product has templates. Those queries are people looking for a free document, not
a paid project. Revisit only if `/checklists/<template>` SEO pages start
converting organic traffic, and then run them in a separate low-cap campaign.

### Campaign-specific negatives

**C1 Crew Language Gap**
```
"learn spanish"
"spanish class"
"spanish for contractors book"
"spanish phrases"
"construction spanish vocabulary"
duolingo
"osha spanish"
```

**C2 Checklist Intent**
```
"punch list meaning"
"punch list example"
"checklist maker"
"to do list app"
"grocery list"
wedding
moving
"move in checklist"
"home inspection checklist"
"closing checklist"
```

**C3 Italy**
```
"1 euro homes"
"one euro house"
"1 euro house italy"
"cheap houses in italy"
"houses for sale italy"
"visa"
"citizenship"
"residency"
"tax"
"superbonus"
"bonus ristrutturazione"
"golden visa"
"move to italy"
"retire in italy"
"cost of living"
```

The Italy negatives matter more than the keywords. "renovating house in italy"
sits next to a huge pool of dreamers reading about 1-euro homes. Only presence-in-US
searchers with a project already underway are worth $3.50.

## 4. Responsive search ads

Three RSAs per ad group, twelve total. Character counts are in parentheses and
were verified against the 30-char headline and 90-char description limits. Pin
nothing except where noted; let Google assemble, but every headline must be
truthful on its own.

Path fields (all ads): `Path 1 = checklists`, `Path 2` varies by ad group
(`contractors`, `remodel`, `homeowners`, `italy`).

---

### AG-A - Multilingual Crew

Final URL: `https://www.monthlyalerts.com/for-contractors`

#### RSA A-1 "Your crew reads Spanish"

Headlines:
1. `Spanish Crew? One List.` (23)
2. `One List, English and ES` (24)
3. `Crew Reads It in Spanish` (24)
4. `Type It Once in English` (23)
5. `Stop Retyping in Group Text` (27)
6. `Punch List, Auto-Translated` (27)
7. `EN to ES Punch List App` (23)
8. `For Remodeling Contractors` (26)
9. `$100 Per Project, One Time` (26)
10. `No Subscription, No Seats` (25)
11. `Your Whole Crew Joins Free` (26)
12. `Photos on Every Item` (20)
13. `Monthly Status Email` (20)
14. `Works on Any Phone` (18)
15. `Start Your First Project` (24)

Descriptions:
1. `Write the punch list in English. Your foreman and subs work it in Spanish.` (74)
2. `Items, comments and photo captions translate automatically for each member.` (75)
3. `$100 once per project. No subscription. Everyone you invite joins free.` (71)
4. `Phases, assignees, due dates and photos, built the way job sites run.` (69)

#### RSA A-2 "Nothing lost in translation"

Headlines:
1. `Nothing Lost in Translation` (27)
2. `No More Group-Text Telephone` (28)
3. `Same List, Two Languages` (24)
4. `Bilingual Construction List` (27)
5. `Contractor Translation App` (26)
6. `Write EN, Crew Reads ES` (23)
7. `Subs and Inspectors Free` (24)
8. `Job Site Checklist App` (22)
9. `Kitchen and Bath Templates` (26)
10. `Due Dates and Assignees` (23)
11. `Photo Proof of Progress` (23)
12. `One Payment, Not Monthly` (24)
13. `Set Up in One Sitting` (21)
14. `No App Store Download` (21)
15. `See How It Works` (16)

Descriptions:
1. `Add each item once in your language. Every member sees it in theirs.` (68)
2. `Stop re-typing instructions into a group text and hoping nothing is lost.` (73)
3. `Start from a kitchen, bath, roofing or full-renovation phase template.` (70)
4. `One-time fee per project. Unlimited items and photos. No per-seat charge.` (73)

#### RSA A-3 "One payment, not another monthly tool"

Headlines:
1. `$100 a Project. That's It.` (26)
2. `Not Another Monthly Tool` (24)
3. `One Project, One Payment` (24)
4. `Cheaper Than One Callback` (25)
5. `Multilingual Punch List` (23)
6. `Built for 10-100 Jobs a Year` (28)
7. `Not Enterprise Software` (23)
8. `Invite Crew by Email` (20)
9. `Everyone in Their Language` (26)
10. `English, Spanish, Italian` (25)
11. `Unlimited Items and Photos` (26)
12. `Project PDFs in One Place` (25)
13. `Owner Pays, Crew Is Free` (24)
14. `Try It on Your Next Job` (23)
15. `Create a Project Now` (20)

Descriptions:
1. `No subscription and no per-seat pricing. You pay once when you start a job.` (75)
2. `Made for companies running ten to a hundred residential projects a year.` (72)
3. `Owner, editor or commenter. Give the homeowner view and comment access only.` (76)
4. `Every member gets a monthly status email in their own language.` (63)

---

### AG-B - Construction Checklist App

Final URL: `https://www.monthlyalerts.com/`

#### RSA B-1 "One list for the whole job"

Headlines:
1. `Construction Checklist App` (26)
2. `One List for the Whole Job` (26)
3. `Remodeling Checklist App` (24)
4. `Punch List That Translates` (26)
5. `Phase-by-Phase Templates` (24)
6. `Site Prep to Final Signoff` (26)
7. `Items, Photos, Due Dates` (24)
8. `Assign Work, Check It Off` (25)
9. `$100 Once Per Project` (21)
10. `Invitees Always Free` (20)
11. `Three Languages, One List` (25)
12. `Monthly Progress Email` (22)
13. `No Subscription Required` (24)
14. `Works in Any Browser` (20)
15. `Start a Project Today` (21)

Descriptions:
1. `Create a project, pick your phases and check off work as the job moves.` (71)
2. `Items carry status, assignee, due date, photos and comments in one place.` (73)
3. `Every member reads the list in English, Italian or Spanish automatically.` (73)
4. `One-time $100 per project. No subscription and no charge for your team.` (71)

#### RSA B-2 "Stop managing jobs in texts"

Headlines:
1. `Renovation Project Checklist` (28)
2. `Stop Managing Jobs in Texts` (27)
3. `Every Task in One Place` (23)
4. `Kitchen Remodel Checklist` (25)
5. `Bathroom Remodel Checklist` (26)
6. `Roofing and Painting Lists` (26)
7. `Full Renovation Template` (24)
8. `Photos Attached to Items` (24)
9. `Overdue Items Flagged` (21)
10. `Comments on Every Task` (22)
11. `Print the List Anytime` (22)
12. `One-Time Fee, No Seats` (22)
13. `Free for Everyone Invited` (25)
14. `Set Up in One Sitting` (21)
15. `See the Templates` (17)

Descriptions:
1. `Start from a ready-made template or build your own phases from scratch.` (71)
2. `Photos and comments live on the item they belong to, not in a chat thread.` (74)
3. `A monthly status email tells every member what is done and what is late.` (72)
4. `Pay once when you create the project. Storage included for two years.` (69)

#### RSA B-3 "Multilingual by default"

Headlines:
1. `Multilingual Checklist App` (26)
2. `For Residential Remodels` (24)
3. `One Project, Every Language` (27)
4. `English, Italian, Spanish` (25)
5. `Auto-Translated Checklists` (26)
6. `No Per-User Pricing` (19)
7. `$100 and the Job Is Set Up` (26)
8. `Budget by Phase` (15)
9. `Track Budget vs Actual` (22)
10. `Keep Project PDFs Together` (26)
11. `Free To Build, Pay Once` (22)
12. `Preview It In 3 Languages` (25)
13. `Crew Joins in One Tap` (21)
14. `Built for Job Sites` (19)
15. `Create Your Checklist` (21)

Descriptions:
1. `Per-phase budgets with budget versus actual, in dollars or euros.` (65)
2. `Sign in with an emailed link. No passwords for you or your crew.` (64)
3. `Keep permits, plans and invoices as PDFs on the project itself.` (63)
4. `One list, three languages, one payment. Start your project in minutes.` (70)

---

### AG-C - Homeowner Renovation

Final URL: `https://www.monthlyalerts.com/for-homeowners`

#### RSA C-1 "Every promise on one list"

Headlines:
1. `Track Every Promise Made` (24)
2. `Renovation on One List` (22)
3. `Homeowner Contractor App` (24)
4. `Your Contractor Reads ES` (24)
5. `No Translator App Needed` (24)
6. `See Photos of the Work` (22)
7. `Manage a Remodel Remotely` (25)
8. `Monthly Progress Email` (22)
9. `One List, Not 14 Threads` (24)
10. `Every Task Has a Status` (23)
11. `$100 Once, No Subscription` (26)
12. `Your Contractor Joins Free` (26)
13. `For Kitchen and Bath Jobs` (25)
14. `Know What Is Overdue` (20)
15. `Start Your Project List` (23)

Descriptions:
1. `Put every task your contractor promised on one list with a clear status.` (72)
2. `Write in English. Your contractor and crew read it in Spanish or Italian.` (73)
3. `Photos attach to each item, so you see what got done without a site visit.` (74)
4. `One-time $100 per project. Your contractor and their crew join at no cost.` (74)

#### RSA C-2 "Managing a remodel remotely"

Headlines:
1. `Managing a Remodel Remotely` (27)
2. `Renovate From Out of State` (26)
3. `Photos Instead of Visits` (24)
4. `Ask in English, Get English` (27)
5. `Language Barrier, Solved` (24)
6. `One Checklist, Both Sides` (25)
7. `Comments Stay With the Task` (27)
8. `Nothing Buried in WhatsApp` (26)
9. `Due Dates You Can See` (21)
10. `Monthly Email, No Asking` (24)
11. `Invite Your Contractor Free` (27)
12. `$100 for the Whole Project` (26)
13. `Two Years of Project Files` (26)
14. `Works on Phone or Laptop` (24)
15. `See How It Works` (16)

Descriptions:
1. `Stop running a six-figure remodel through texts, email and WhatsApp.` (68)
2. `Your questions go out in English and come back to you in English.` (65)
3. `On the first of the month you get a status email with progress and delays.` (74)
4. `Create the project, invite your contractor, and work one shared list.` (69)

#### RSA C-3 "Say it once, correctly"

Headlines:
1. `Remodeling With a Spanish Crew` (30)
2. `Talk to Your Contractor` (23)
3. `Say It Once, Correctly` (22)
4. `English In, Spanish Out` (23)
5. `No More Google Translate` (24)
6. `Your Punch List, Shared` (23)
7. `Photos on Each Item` (19)
8. `Status You Can Trust` (20)
9. `Free for Your Contractor` (24)
10. `Pay Once Per Project` (20)
11. `Templates for Every Trade` (25)
12. `Kitchen Remodel Template` (24)
13. `Print It for the Meeting` (24)
14. `Set It Up in an Evening` (23)
15. `Start Your Checklist` (20)

Descriptions:
1. `Add an item in English. Your contractor sees it in Spanish right away.` (70)
2. `Their comments and photo captions come back to you translated.` (62)
3. `Pick a kitchen, bath, painting or full-renovation template to start.` (68)
4. `No subscription. One payment covers the project and everyone on it.` (67)

---

### AG-D - Renovating in Italy

Final URL: `https://www.monthlyalerts.com/renovating-abroad`

#### RSA D-1 "Six time zones, one list"

Headlines:
1. `Renovating a Home in Italy` (26)
2. `Italian Builder, US Owner` (25)
3. `One List in EN and IT` (21)
4. `Manage It From the States` (25)
5. `Six Time Zones, One List` (24)
6. `Your Geometra Reads Italian` (27)
7. `You Read Everything in EN` (25)
8. `Photos Are Your Site Visit` (26)
9. `Monthly Status Email` (20)
10. `Overseas Renovation List` (24)
11. `Permits to Handover` (19)
12. `Budgets in Euros or USD` (23)
13. `$100 Once Per Project` (21)
14. `Your Builder Joins Free` (23)
15. `Start Your Italy Project` (24)

Descriptions:
1. `You write in English. Your Italian builder and geometra read Italian.` (69)
2. `Their updates, questions and photo captions come back to you in English.` (72)
3. `Start from the overseas renovation template: purchase, permits, works, handover.` (80)
4. `One-time $100 per project. Everyone you invite joins free in their language.` (76)

#### RSA D-2 "Stop guessing in WhatsApp"

Headlines:
1. `Italian Reno, US Homeowner` (26)
2. `Renovation Abroad Checklist` (27)
3. `Stop Using Google Translate` (27)
4. `No WhatsApp Guesswork` (21)
5. `Every Decision on Record` (24)
6. `See Progress Every Week` (23)
7. `Photos From the Job Site` (24)
8. `Ask in English, Get Answers` (27)
9. `One Project, Three Languages` (28)
10. `Made for Remote Owners` (22)
11. `Not a Monthly Subscription` (26)
12. `Permits and Plans in One Place` (30)
13. `Two Years of Storage` (20)
14. `Invite Family and Builder` (25)
15. `See the Template` (16)

Descriptions:
1. `Running an Italian renovation from the US should not live in a chat app.` (72)
2. `Tasks, comments and photo captions translate between English and Italian.` (73)
3. `Keep permits, plans and invoices as PDFs attached to the project itself.` (72)
4. `Pay once when you create the project. No subscription, no per-seat fees.` (72)

#### RSA D-3 "Progress you can read"

Headlines:
1. `Casa in Italy, Owner in US` (26)
2. `Renovating Abroad, Remotely` (27)
3. `One List, Both Languages` (24)
4. `Your Contractor Reads IT` (24)
5. `Written Once, Read by All` (25)
6. `Progress You Can Read` (21)
7. `No Flight Needed to Check` (25)
8. `Phase by Phase to Handover` (26)
9. `Budget vs Actual by Phase` (25)
10. `Family Can Follow Along` (23)
11. `$100, One Time, Per Project` (27)
12. `Invitees Never Pay` (18)
13. `English, Italian, Spanish` (25)
14. `Set It Up This Weekend` (22)
15. `Start Your Project` (18)

Descriptions:
1. `Purchase and due diligence, permits, structure, systems, finishes, handover.` (76)
2. `Invite your builder, surveyor and family. Each one reads their own language.` (76)
3. `A monthly status email sums up progress without anyone writing a report.` (72)
4. `English, Italian and Spanish on the same project at the same time.` (66)

## 5. Extensions

Account-level, applied to all campaigns.

**Sitelinks** (4 minimum, description lines under 35 chars each):
| Text | Description 1 | Description 2 | URL |
|---|---|---|---|
| For contractors | Spanish-speaking crews | One list, both languages | /for-contractors |
| For homeowners | Every promise on one list | See photos of the work | /for-homeowners |
| Renovating abroad | Italy, Spain, anywhere | Read progress in English | /renovating-abroad |
| Designers & architects | Clients read their language | Monthly summary, automatic | /for-designers |

**Callouts:** `$100 per project` / `No subscription` / `Invitees join free` /
`English, Italian, Spanish` / `Photos on every item` / `Monthly status email`

**Structured snippet** (header: Types): `Kitchen remodel`, `Bathroom remodel`,
`Full renovation`, `Painting`, `Roofing`, `Landscaping`, `Interior design`,
`Overseas renovation`

No call extension (solo operator, no phone support promised on the site). No
price extension until `BILLING_ENABLED=true` is live in production.

## 6. Conversion actions

Import four actions. Names must match exactly so the reporting in
`kpi-dashboard.md` lines up.

| Name | Fires when | Category | Count | Value | Attribution | Role |
|---|---|---|---|---|---|---|
| `signup` | Account created (email + password), confirmation link used, and the profile form (name, company, phone, language) saved | Sign-up | One | none | Data-driven, 30-day click | Secondary (observation) |
| `project_created` | A project row is created (pre-payment) | Lead | One | none | Data-driven, 30-day click | Secondary (observation) |
| `checkout_started` | Stripe Checkout session is created | Begin checkout | One | none | Data-driven, 30-day click | Secondary (observation) |
| `project_activated` | Stripe Checkout completes and the paid project exists | Purchase | One | $100 | Data-driven, 30-day click | **Primary** |

Only `project_activated` is marked "Primary action" (the one used for bidding).
The other three are "Secondary action" so they appear in reporting but never
steer bids.

### Implementation notes

- Import via Google Ads conversion tag + `gtag('event', ...)` on the client, or
  offline conversion import from the app database keyed on GCLID. Prefer the
  offline import for `project_activated` since payment confirmation happens
  server-side (Stripe webhook and the success page both create the project;
  the creation is idempotent on `stripe_session_id`, so import once from the
  database, not from both callers).
- Store `gclid` on the user row at signup so activation can be attributed back
  even when it happens days later on another device.
- While `BILLING_ENABLED=false`, `checkout_started` and `project_activated` will
  not fire. In that window, set `project_created` as Primary temporarily and
  hold spend at the $750 floor. Do not judge CAC on `project_created` alone.
- Enhanced conversions: on. Consent mode: on.

## 7. Bidding and budget

### Phase 1, weeks 1 to 4 (learning)

- Strategy: Maximize Clicks with a max CPC cap ($3.00 C1/C2, $3.50 C3).
- Purpose is to buy search-term data cheaply, not to hit CAC yet.
- Expected volume at $750/month and ~$2.50 average CPC: roughly 300 clicks
  a month across all campaigns. That is thin. Read search terms, not CPA.
- Weekly job: mine the search terms report and grow the negative list. Expect
  to add 20 to 40 negatives a week in weeks 1 to 3.

### Phase 2, weeks 5 to 8

- Once a campaign has 15+ `project_activated` conversions in a rolling 30 days,
  switch that campaign to Maximize Conversions with a target CPA of $30.
- Campaigns below 15 conversions stay on Maximize Clicks with the cap lowered
  to whatever the current CPC that produced conversions was, plus 20%.

### Phase 3, week 9 onward

- tCPA $30. Raise to $35 only if volume is starved (impression share lost to
  budget under 10% and fewer than 5 activations a month).

### Budget split

| Campaign | Share | At $750/mo | At $1,000/mo | Rationale |
|---|---|---|---|---|
| C1 Crew Language Gap | 40% | $300 | $400 | Highest-intent, clearest wedge, six-state focus |
| C2 Checklist Intent | 40% | $300 | $400 | Broadest volume, two ad groups sharing the budget |
| C3 Italy | 20% | $150 | $200 | Thin volume, high value, needs negative hygiene first |

Move to the $1,000 level only when blended CAC over a trailing 30 days is under
$35 with at least 10 activations. Otherwise stay at $750 indefinitely. There is
no scenario where spend goes above $1,000 in the first six months.

## 8. Weekly review checklist

Block 45 minutes, same slot every week (suggested: Monday morning). Work top to
bottom. Do not skip step 1.

1. **Search terms report** (last 7 days, all campaigns). For every term with 2+
   clicks and no conversion: add as a negative, or promote to a keyword if the
   intent is genuinely ours. Target: search-term waste under 15% of spend.
2. **Spend vs pace.** Actual spend / days elapsed x days in month. If projecting
   over the ceiling, cut the worst-performing campaign's daily budget, do not
   raise the others.
3. **Conversions by action.** Pull `signup`, `project_created`,
   `checkout_started`, `project_activated` counts per campaign. Check the funnel
   steps against the KPI targets: visitor to project creation above 8%, creation
   to paid above 20%.
4. **CAC per campaign** = campaign spend / `project_activated` for that campaign,
   trailing 30 days. Write the number down every week even when it is ugly.
5. **Landing page match.** Click each ad group's final URL. Does the page's
   headline answer the queries that spent the most this week? If not, the fix is
   the ad group split, not the bid.
6. **RSA asset report.** Any headline rated "Low" for 3 consecutive weeks gets
   replaced. Keep at least 12 headlines live per RSA.
7. **Zero-impression keywords.** Any keyword with zero impressions for 21 days
   gets paused. Note it; do not delete (history is useful).
8. **Disapprovals and policy notices.** Clear same day.
9. **One-line log entry** in the weekly review template from
   `kpi-dashboard.md`: spend, activations, CAC, biggest negative added, one
   decision made.

## 9. Scale and kill rules

All rules use a trailing 30-day window and require the minimum conversion
volume stated. No decision on fewer conversions than the minimum.

### Scale up

| Condition | Action |
|---|---|
| Campaign CAC under $30 and 5+ activations | Raise that campaign's daily budget 25%. Wait 14 days before the next raise. |
| Campaign CAC under $25 and 10+ activations | Raise 50%, and add one new ad group from the search-term winners. |
| Blended CAC under $35 with 10+ activations | Move total monthly spend from $750 to $1,000. |
| An ad group's exact-match keyword converts twice at under $30 | Add its phrase variant, and give the ad group its own campaign if it is budget-starved. |

### Hold

| Condition | Action |
|---|---|
| CAC $30 to $45 | No budget change. Fix the funnel step that is lagging: page copy, offer clarity, or checkout friction. Re-check in 14 days. |
| Fewer than 3 activations in 30 days at full spend | No budget change. Keep mining negatives and rewriting RSAs. Volume, not bidding, is the constraint. |

### Kill

| Condition | Action |
|---|---|
| Campaign CAC above $60 with 5+ activations, two months running | Pause the campaign. |
| Campaign spends $300 cumulative with zero `project_created` | Pause the ad group, keep the keywords for organic/SEO reference. |
| Ad group spends $150 cumulative with zero `project_created` | Pause the ad group. |
| Keyword spends $50 with zero `project_created` | Pause the keyword. |
| Any keyword whose average CPC exceeds $5.00 | Pause immediately. That is the generic-term cost structure the plan exists to avoid. |
| Google Ads blended CAC above $45 at month 4 while organic and referral CAC is under $15 | Cut paid search to $250/month maintenance on C1 only, and move the difference into contractor outreach and Italy partners. See the month-4 decision rule in `kpi-dashboard.md`. |

### Never

- Never enable Broad match to "get more volume".
- Never accept Google's recommendation to add generic category keywords.
- Never turn on Performance Max. The product is a $100 one-time purchase with
  thin conversion volume; PMax will spend the whole budget on brand and junk.
- Never raise budget in the same week a campaign switched bid strategies.
