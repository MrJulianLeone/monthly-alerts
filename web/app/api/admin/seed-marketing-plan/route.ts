import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

/**
 * One-time seeding endpoint: creates the "MonthlyAlerts Marketing Plan"
 * project for the site admin. Idempotent (no-op if the project exists),
 * protected by a single-use random token, and removed after use.
 */
const SEED_TOKEN = "435c46138ed9c36bfe35314a6f30dfbcc8d103c2bc737ed5e740f81bd2b5582e";
const OWNER_EMAIL = "julianleone@gmail.com";
const PROJECT_NAME = "MonthlyAlerts Marketing Plan";

const PLAN: { section: string; items: { title: string; desc?: string }[] }[] = [
  {
    section: "Positioning & Brand",
    items: [
      {
        title: "Pair the name with its descriptor everywhere: MonthlyAlerts — Your Project. Every Language.",
        desc: "The name doesn't say construction, but the monthly report explains it — no rename needed. The descriptor does the rest.",
      },
      {
        title: "Homepage headline: Construction projects shouldn't get lost in translation.",
      },
      {
        title: "Show pricing everywhere: $100 per project — not $100/month",
        desc: "One project. One payment. No subscription, no per-user charges, invite everyone involved. For a $50k–$500k renovation, $100 feels insignificant.",
      },
    ],
  },
  {
    section: "Channel Mix",
    items: [
      { title: "Contractor/designer partnerships — 30% of effort (repeat users)" },
      { title: "SEO / content / templates — 25% (very low long-term CAC)" },
      { title: "Google Search — 15% (captures immediate intent)" },
      { title: "Meta / Instagram — 15% (strong demonstration product)" },
      { title: "Expat / Italy communities — 10% (excellent niche)" },
      { title: "Referral program — 5% (built-in viral opportunity)" },
    ],
  },
  {
    section: "Google Ads",
    items: [
      {
        title: "Budget $750–$1,000/month, exact/phrase match primarily",
        desc: "Do not scale until paid-project CAC is below roughly $30–$35.",
      },
      {
        title: "Avoid generic software terms",
        desc: "Skip 'construction software', 'project management software', 'contractor software'. 2025 benchmarks: ~$5.31 CPC and ~$166 cost per lead in construction — unprofitable for $100 projects.",
      },
      {
        title: "Bid highly specific intent keywords",
        desc: "construction checklist app; remodeling checklist app; communicate with Spanish speaking contractor; Spanish English construction app; contractor translation app; multilingual construction app; renovation project checklist; homeowner contractor communication app; manage renovation remotely.",
      },
      {
        title: "Bid Italy intent keywords",
        desc: "renovating house in Italy; managing Italian renovation from USA; Italian contractor English homeowner.",
      },
    ],
  },
  {
    section: "Meta / Instagram Ads",
    items: [
      {
        title: "Produce 10–20 second demo videos; budget $500–$750/month",
      },
      {
        title: "Ad 1 — the translation flip",
        desc: "Contractor writes 'La plomería estará terminada el viernes.' Screen switches; homeowner sees 'The plumbing will be completed Friday.' Then: One project. Every language.",
      },
      {
        title: "Ad 2 — chaos into one list",
        desc: "Screen full of WhatsApp, texts, emails, notes — they disappear. One project checklist. English. Italian. Spanish. $100 per project.",
      },
      {
        title: "Ad 3 — Italy",
        desc: "'Renovating your home in Italy from the U.S.?' US owner → MonthlyAlerts → Italian contractor. Audience is small enough for very specific targeting.",
      },
    ],
  },
  {
    section: "Contractor Outreach",
    items: [
      {
        title: "Build a database of small remodeling contractors (10–100 residential projects/year)",
      },
      {
        title: "Start geographically: NJ, NY, CT, FL, TX, CA",
        desc: "Focus on companies visibly serving multilingual crews or communities.",
      },
      {
        title: "Pitch: 'Try your next project on us' — first project free",
        desc: "Not 'buy our software'. If one contractor then runs ten projects, that's $1,000 of annual project revenue acquired for a $100 giveaway.",
      },
      { title: "Contact the first 250 contractors/designers (Month 2)" },
    ],
  },
  {
    section: "Referral Program",
    items: [
      {
        title: "Build referral codes into the app",
        desc: "Example: an architect sends clients to monthlyalerts.com/ANDREALEONE. Track every paid project per code.",
      },
      { title: "Offer $20–$25 referral credit per paid project" },
      { title: "Let professionals accumulate credits toward their own projects" },
      { title: "Launch the program in Month 3" },
    ],
  },
  {
    section: "Italy / Abroad Campaign",
    items: [
      {
        title: "Run as a separate campaign from general US construction marketing",
      },
      {
        title: "Landing message: Manage Your Italian Renovation From Anywhere",
        desc: "Your architect writes in Italian. Your contractor writes in Italian. You work in English. MonthlyAlerts keeps everyone on the same project.",
      },
      {
        title: "Publish articles around real renovation problems",
        desc: "How to manage a renovation in Italy from the US; What is a geometra?; Italian construction terminology; Italian vs American electrical systems; Understanding Italian renovation estimates; Questions to ask an Italian contractor; Renovating a family property in Italy; Italian kitchen/bathroom renovation checklists.",
      },
      {
        title: "Partner with Italy-side professionals",
        desc: "Italian real estate brokers serving Americans, architects, geometri, property managers, renovation consultants.",
      },
    ],
  },
  {
    section: "SEO & Content",
    items: [
      {
        title: "Build toward 30–50 highly specific pages; skip 'construction management software'",
      },
      {
        title: "Cluster: multilingual construction",
        desc: "English Spanish construction communication; construction translation app; Spanish contractor communication; bilingual construction checklist.",
      },
      {
        title: "Cluster: remodeling",
        desc: "kitchen renovation checklist; bathroom remodel checklist; whole house renovation checklist; contractor punch list; renovation progress report.",
      },
      {
        title: "Cluster: remote construction",
        desc: "manage home renovation remotely; remote construction project management; second home renovation management.",
      },
      {
        title: "Cluster: Italy",
        desc: "Italy renovation checklist; renovating property in Italy; manage Italian renovation remotely; Italian construction terminology; English Italian construction communication.",
      },
      { title: "Turn the checklist templates themselves into SEO assets" },
    ],
  },
  {
    section: "Social Media",
    items: [
      {
        title: "Post translation examples: contractor said this → homeowner sees this",
      },
      {
        title: "Post construction tips",
        desc: "e.g. 12 things homeowners forget during a kitchen renovation.",
      },
      {
        title: "Post project organization content",
        desc: "e.g. Stop managing a $150,000 remodel through 14 different text threads.",
      },
      {
        title: "Stick to Instagram, Facebook, YouTube Shorts; no paid LinkedIn",
        desc: "LinkedIn CAC is unlikely to make sense for a $100 product. No need to become a major social brand — demonstrate the problem.",
      },
    ],
  },
  {
    section: "Product Funnel & Trust",
    items: [
      {
        title: "Let people experience the product before paying",
        desc: "Funnel: create project → choose template → enter tasks → select participants/languages → preview translation → preview monthly report → activate for $100. The aha moment comes before the payment screen.",
      },
      {
        title: "Preserve original language, translation, author, date/time, edit history",
      },
      {
        title: "Add translation disclosure",
        desc: "Automated translations are for project communication and should not replace certified translations of legal, engineering or safety-critical documentation.",
      },
    ],
  },
  {
    section: "Budget & KPIs",
    items: [
      {
        title: "Six-month launch budget: ~$20,000",
        desc: "Monthly: Google $900, Meta $600, retargeting $200, SEO/content $500, outreach/data/tools $300, partnerships/creators $300; one-time: creative/video $1,500, landing assets $1,000. Lean owner-operated version: $10–12k.",
      },
      {
        title: "North-star KPI: cost per activated project (not traffic)",
      },
      {
        title: "CAC targets",
        desc: "Direct consumer CAC <$30–35; referral/organic CAC <$15; blended CAC <$25–30; professional acquisition cost <$150 with 5+ projects/year each.",
      },
      {
        title: "Funnel targets",
        desc: "Visitor → project creation >8%; project creation → paid >20%; referral/organic share >30% by Month 6.",
      },
    ],
  },
  {
    section: "Six-Month Rollout",
    items: [
      {
        title: "Weeks 1–2: finalize positioning, analytics, conversion tracking, demo project, sample report",
      },
      {
        title: "Weeks 3–4: launch EN/ES and EN/IT landing pages; build kitchen/bathroom templates",
      },
      {
        title: "Month 2: begin Google/Meta testing; contact first 250 contractors/designers",
      },
      {
        title: "Month 3: launch referral program; begin Italy/remote-renovation campaign",
      },
      {
        title: "Month 4: identify top acquisition channel and cut weak advertising",
      },
      {
        title: "Month 5: expand winning SEO pages/templates and professional partnerships",
      },
      {
        title: "Month 6: scale only channels meeting CAC thresholds",
      },
    ],
  },
];

export async function POST(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${SEED_TOKEN}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const q = sql();

  const users = (await q`
    SELECT id FROM users WHERE email = ${OWNER_EMAIL}
  `) as { id: string }[];
  if (users.length === 0) {
    return NextResponse.json({ error: "owner not found" }, { status: 404 });
  }
  const ownerId = users[0].id;

  const existing = (await q`
    SELECT id FROM projects WHERE owner_id = ${ownerId} AND name = ${PROJECT_NAME}
  `) as { id: string }[];
  if (existing.length > 0) {
    return NextResponse.json({ ok: true, existing: existing[0].id });
  }

  const projects = (await q`
    INSERT INTO projects (name, name_lang, description, owner_id, paid_at)
    VALUES (
      ${PROJECT_NAME},
      'en',
      ${"Customized six-month customer acquisition plan for MonthlyAlerts.com: channel mix, ad strategy, outreach, referral program, Italy/abroad campaign, SEO, budget, KPIs, and rollout timeline."},
      ${ownerId},
      now()
    )
    RETURNING id
  `) as { id: string }[];
  const projectId = projects[0].id;

  await q`
    INSERT INTO project_members (project_id, user_id, role)
    VALUES (${projectId}, ${ownerId}, 'owner')
  `;

  let sectionCount = 0;
  let itemCount = 0;
  for (const [sIdx, block] of PLAN.entries()) {
    const sections = (await q`
      INSERT INTO sections (project_id, name, name_lang, position, created_by)
      VALUES (${projectId}, ${block.section}, 'en', ${sIdx}, ${ownerId})
      RETURNING id
    `) as { id: string }[];
    sectionCount++;
    for (const [iIdx, item] of block.items.entries()) {
      await q`
        INSERT INTO items (project_id, section_id, title, description, source_lang, position, created_by)
        VALUES (${projectId}, ${sections[0].id}, ${item.title}, ${item.desc ?? null}, 'en', ${iIdx}, ${ownerId})
      `;
      itemCount++;
    }
  }

  return NextResponse.json({ ok: true, projectId, sectionCount, itemCount });
}
