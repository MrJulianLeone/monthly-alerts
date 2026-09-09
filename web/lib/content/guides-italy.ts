import type { Guide } from "./types";

export const ITALY_GUIDES: Guide[] = [
  {
    slug: "how-to-manage-a-renovation-in-italy-from-the-us",
    cluster: "italy",
    title: "How to Manage a Renovation in Italy from the United States",
    metaTitle: "Managing an Italian Renovation from the US",
    metaDesc:
      "A practical playbook for running an Italian renovation remotely: who to hire, which permit you need, how payments and IVA work, and what to check every month.",
    keywords: [
      "renovating in Italy from abroad",
      "manage Italian renovation remotely",
      "Italian renovation project management",
      "geometra permesso di costruire SCIA CILA",
      "bonifico parlante fattura IVA renovation",
    ],
    kicker: "Italy · remote project management",
    intro:
      "Renovating in Italy from six or seven time zones away is not harder than renovating at home, but it fails in different places. It rarely fails on craftsmanship. It fails on paperwork nobody told you about, on a payment that went out without an invoice, and on three weeks of silence you only notice when the deadline is already gone. This is the end to end version: who you hire, which permit track you are on, how money actually moves, and what a remote owner should be checking every single month.",
    blocks: [
      { type: "h2", text: "Build the team before you negotiate the price" },
      {
        type: "p",
        text: "An Italian renovation has a professional layer and a labor layer, and foreign owners often try to hire the labor layer first. Do it the other way around. The technician you appoint writes the paperwork that makes everything else legal, and the paperwork determines your scope, your timeline, and in many cases your budget.",
      },
      { type: "h3", text: "The geometra is usually the spine of the job" },
      {
        type: "p",
        text: "A geometra is a licensed surveyor and building technician. For a typical apartment or village house renovation, the geometra files the permits, updates the cadastral records, and often acts as direttore dei lavori, the person legally responsible for making sure the work matches what was authorized. For a remote owner this is the single most important appointment you will make, because the direttore dei lavori is the one person on site whose duty runs to the permit rather than to the builder.",
      },
      { type: "h3", text: "When you also need an architetto or an ingegnere" },
      {
        type: "ul",
        items: [
          "Architetto: required for work on buildings under heritage protection, and worth hiring anywhere the layout, light, or finishes really matter. An architect will also run the tender and compare quotes for you.",
          "Ingegnere strutturale: required whenever you touch structure. New openings in load bearing walls, new beams, floor replacement, roof rebuilds, and anything in a seismic zone need structural calculations and a separate filing.",
          "Termotecnico: usually needed for the energy and heating paperwork if you are replacing the system or claiming any energy incentive.",
        ],
      },
      { type: "h3", text: "The impresa edile and the trades" },
      {
        type: "p",
        text: "The impresa edile is the general contractor. On small jobs it may be four people who do demolition, masonry, screeds, and plaster, then coordinate an idraulico for plumbing and an elettricista for electrical. On larger jobs the impresa subcontracts more, and you should ask for the list of subs in writing. In rural areas one impresa often works one village at a time, which is good for supervision and bad for scheduling.",
      },
      { type: "h2", text: "Know which permit track you are on" },
      {
        type: "p",
        text: "Italian building procedure is set nationally by the Testo Unico dell'Edilizia, DPR 380/2001, then layered with regional law and each comune's own building regulation. The national categories look like this. Treat it as orientation, not as a determination: only your technician can classify your specific job, and the classification is the thing that decides your cost and your calendar.",
      },
      {
        type: "table",
        headers: ["Track", "Roughly covers", "What it means for you"],
        rows: [
          [
            "Attività edilizia libera",
            "Ordinary maintenance: painting, replacing finishes and fixtures like for like",
            "No filing in most cases, though heritage constraints can still apply",
          ],
          [
            "CILA",
            "Extraordinary maintenance that does not touch structure or the exterior",
            "A technician certifies the work and files it; you can generally start on filing",
          ],
          [
            "SCIA",
            "Extraordinary maintenance touching structural parts, conservative restoration, lighter restructuring",
            "Filed with drawings and a technician's sworn statement; more documentation, more lead time",
          ],
          [
            "Permesso di costruire",
            "New construction and heavier restructuring, changes in volume or footprint, some changes of use",
            "An application the comune must actually issue, measured in months, not days",
          ],
        ],
      },
      {
        type: "p",
        text: "Two practical points. First, if the property is inside a landscape or heritage constraint, you may need a separate autorizzazione paesaggistica or a Soprintendenza opinion on top of the building track, and that runs on its own clock. Second, permit rules and tolerance thresholds have been revised repeatedly in recent years, including a significant round in 2024. Never plan around a rule you read online, including this page. Have your geometra confirm the current classification in writing before you sign a contract.",
      },
      { type: "h2", text: "Money moves differently than it does at home" },
      {
        type: "p",
        text: "This is where remote owners get hurt, and it is entirely avoidable.",
      },
      {
        type: "ul",
        items: [
          "Every payment gets a fattura. A quote, a preventivo, is not an invoice. Pay against an invoice with a VAT number on it, or you have no deductible cost, no warranty trail, and no proof of what the money bought.",
          "Pay by bank transfer, never in cash. Italian law caps cash payments, and cash payments are ineligible for any tax relief. A transfer also gives you a dated record you can match to a checklist item.",
          "If you intend to claim an Italian renovation tax deduction, the transfer must be a bonifico parlante, a special transfer that carries the reference to the tax provision, your codice fiscale, and the contractor's VAT number. Your bank has a form for it. Get the wording from your accountant before the first payment, because a normal transfer cannot be fixed afterward.",
          "IVA on renovation work on residential property is commonly 10% rather than the standard 22%, with a rule that pushes certain expensive items back up to 22% above the value of the labor. Professional fees are 22%. Verify the rates that apply to your job with your geometra or accountant.",
          "Pay in stages tied to completed work, a SAL, not to dates on a calendar. A deposit plus three or four milestones plus a final retainage after handover is normal and reasonable.",
        ],
      },
      {
        type: "callout",
        title: "One warning worth the whole article",
        text: "Italian renovation tax deductions are deductions against Italian income tax, spread over ten annual installments. If you have no Italian taxable income, which is the situation for most American owners, you cannot use them. Do not let anyone build your budget on an incentive you are not eligible to claim. Ask a cross-border accountant this question before you plan the finances.",
      },
      { type: "h2", text: "Communication cadence that survives the time difference" },
      {
        type: "p",
        text: "Italy is six hours ahead of New York and nine ahead of California. An Italian site day runs roughly 8:00 to 17:00 with a real lunch break, which means the site is closing as the US East Coast starts work. If you rely on live conversation, you get one narrow window a day and you will burn it on small talk.",
      },
      {
        type: "p",
        text: "What works is written, asynchronous, and structured around decisions.",
      },
      {
        type: "ol",
        items: [
          "One scheduled call every two weeks with the geometra, in the Italian afternoon, with a written agenda sent the day before.",
          "A weekly written update from the impresa or the direttore dei lavori. Two lines and three photos is plenty. The point is the rhythm, not the prose.",
          "A single decision log. Every choice with a cost or a lead time gets written down, dated, and confirmed by the person who will act on it. Verbal approvals evaporate.",
          "A rule that nothing off spec gets ordered or poured without written confirmation from you. Say it once, in writing, at the start.",
          "August planning. Much of Italian construction slows or stops for two to three weeks in August, and material suppliers close too. Build it into the schedule instead of discovering it.",
        ],
      },
      {
        type: "p",
        text: "The language gap is a real cost, not a detail. Your geometra may write good English; the muratore and the piastrellista almost certainly do not, and they are the ones making the decisions you care about. Anything that lets each person read and write in their own language, whether that is a bilingual project manager or a shared checklist that translates, removes an entire category of expensive misunderstanding. This is exactly the problem MonthlyAlerts was built for.",
      },
      { type: "h2", text: "Inspecting by proxy" },
      {
        type: "p",
        text: "You cannot walk the site, so you have to buy the next best thing: dated photographic evidence of the stages that get buried. Once tile goes down, the screed and the waterproofing are gone forever. Once plaster is up, the wiring routes are gone. Ask for photos at these moments specifically, and ask for them attached to the item they document, not dropped into a chat thread.",
      },
      {
        type: "ul",
        items: [
          "After demolition, before anything new goes in, with a tape measure in frame for key dimensions.",
          "Plumbing and electrical rough-in, before plaster or screed covers it. Wide shots that show the whole wall, not close ups.",
          "Waterproofing in wet rooms, before the tile.",
          "The pressure test on the plumbing, and the certified test report.",
          "Substrates before finishes: screed before flooring, plaster before paint.",
          "Delivered materials on site, showing the label, so you can confirm you got the tile, the boiler, and the windows you actually specified.",
        ],
      },
      { type: "h2", text: "What to track monthly" },
      {
        type: "p",
        text: "A remote owner should be able to answer these eight questions on the last day of every month without asking anyone. If you cannot, your reporting is not working.",
      },
      {
        type: "ol",
        items: [
          "Which permit filings are open, and is any authorization still pending.",
          "Which checklist items closed this month, with photos attached.",
          "Which items are overdue, and what specifically is blocking each one.",
          "Total invoiced to date versus total paid to date, per contractor.",
          "Budget spent versus budget remaining, by phase, in euros.",
          "Every variante requested this month, its cost, and whether you approved it in writing.",
          "Long lead items ordered, confirmed delivery dates, and anything slipping.",
          "Certificates collected so far: electrical conformity, gas, structural sign off, cadastral update, energy certificate.",
        ],
      },
      {
        type: "p",
        text: "The last one matters more than people expect. Certificates are collected at the end, when the crew has moved on and nobody wants to go back, and a missing dichiarazione di conformità can block a utility contract or delay a future sale. Ask for each certificate as its trade finishes, not at handover.",
      },
    ],
    faq: [
      {
        q: "Do I need to be in Italy to buy or renovate property?",
        a: "No. You can complete a purchase and run a renovation through a procura, a power of attorney, given to a trusted person or professional in Italy. A power of attorney signed in the United States generally needs notarization, an apostille, and a sworn Italian translation, or it can be executed at an Italian consulate. You will also need an Italian codice fiscale and, in practice, an Italian bank account or a reliable way to send euro transfers with the right references.",
      },
      {
        q: "How long does an Italian renovation actually take?",
        a: "Assume the permit phase is a real phase, not overhead. A CILA can be filed in weeks; a permesso di costruire in a constrained area can take several months before work starts, and longer if a heritage authority is involved. On site, a full apartment gut with new systems is commonly six to nine months of work, and rural stone houses take longer because surprises are structural. The honest planning rule is that the calendar risk sits in authorizations and long lead materials, not in the trades.",
      },
      {
        q: "Should I hire a project manager or rely on the geometra?",
        a: "For a modest renovation the geometra as direttore dei lavori is usually enough, provided you accept that this role is about compliance with the permit and not about protecting your budget. For a larger job, or one where you and the impresa share no common language, a separate project manager or an architetto running the works pays for itself. What you should not do is leave the contractor to supervise the contractor.",
      },
      {
        q: "What is the single most common remote owner mistake?",
        a: "Paying ahead of the work. A large deposit at the start plus generous progress payments leaves you with no leverage precisely when you need it, and you are eight hours away. Tie money to verified milestones, keep a final retainage until after the punch list is closed, and never release the last payment before you have the certificates in hand.",
      },
      {
        q: "How do I keep everyone working from the same list when we do not share a language?",
        a: "Write one list, not one list per person. The failure mode of WhatsApp plus a translation app is that the English version and the Italian version drift apart, and nobody knows which one the tiler read. A shared checklist where each member reads and writes in their own language, with photos attached to the item itself and a monthly status email in each person's language, keeps one authoritative record instead of several partial ones.",
      },
    ],
    template: "italy-renovation-checklist",
    related: [
      "what-is-a-geometra",
      "understanding-italian-renovation-estimates",
      "questions-to-ask-an-italian-contractor",
      "italian-construction-terminology",
    ],
    cta: "/renovating-abroad",
    publishedAt: "2026-09-08",
  },
  {
    slug: "what-is-a-geometra",
    cluster: "italy",
    title: "What Is a Geometra, and Do You Need One?",
    metaTitle: "What Is a Geometra? Role, Fees, How to Choose",
    metaDesc:
      "A geometra files your permits, updates the cadastre, and supervises the works. What the role covers, how it differs from an architetto, and what to ask before you hire.",
    keywords: [
      "what is a geometra",
      "geometra vs architetto",
      "geometra fees Italy",
      "direzione lavori",
      "geometra CILA SCIA catasto",
    ],
    kicker: "Italy · the people you hire",
    intro:
      "There is no clean English translation of geometra, which is why so many foreign buyers get the role wrong. Surveyor is close but too narrow. Building technician is accurate but sounds junior. In practice the geometra is the professional who turns your intentions into legal filings, keeps the cadastral record straight, and signs their name to the statement that the work matches the permit. On most Italian house renovations, this is the person whose competence determines whether your project is easy or a two year argument with the comune.",
    blocks: [
      { type: "h2", text: "What the role actually is" },
      {
        type: "p",
        text: "A geometra holds a technical diploma, passes a state examination, and is registered with the Collegio dei Geometri in their province. Registration is not decorative. It is what allows them to sign filings, certify statements to the comune, and carry the legal responsibility that goes with them. Every registered professional also has to hold professional indemnity insurance, and you are entitled to see the policy.",
      },
      {
        type: "p",
        text: "The work splits into four buckets.",
      },
      { type: "h3", text: "Pratiche edilizie: the permit filings" },
      {
        type: "p",
        text: "The geometra classifies your intervention, prepares the drawings and the technical report, and files the CILA, the SCIA, or the application for a permesso di costruire. For a CILA and a SCIA the filing includes a sworn statement, an asseverazione, in which the technician certifies compliance. That signature is a legal exposure for them, which is the reason a competent geometra will sometimes tell you no.",
      },
      { type: "h3", text: "Catasto: keeping the record true" },
      {
        type: "p",
        text: "Italy has a cadastral register that records every property's footprint, plan, category, and notional income value. A geometra pulls the visura and the planimetria, spots where the filed plan does not match the building as it stands, and files the update, a DOCFA, when your work changes the layout, the surface, or the category. Cadastral conformity and building conformity both have to be declared when a property is sold, so an unfixed mismatch is a problem you inherit and eventually have to pay to clear.",
      },
      { type: "h3", text: "Direzione lavori: supervising the work" },
      {
        type: "p",
        text: "The direttore dei lavori is appointed by the owner and is legally responsible for verifying that construction matches the authorized project. They check progress, sign off on stages, handle the fine lavori notice at the end, and file the agibilità paperwork where required. For an owner abroad this is the closest thing you have to a representative on site whose duty runs to the permit rather than to the builder. It is not the same as protecting your budget, and you should not assume it is.",
      },
      { type: "h3", text: "Measurement, costing, and closing documents" },
      {
        type: "ul",
        items: [
          "Rilievo: measuring the existing building and drawing the state of fact, which is where most projects should start.",
          "Computo metrico estimativo: an itemized quantity takeoff priced from a regional price list, which is the only honest way to compare contractor quotes.",
          "Successione: many geometri handle the property side of an inheritance filing, including cadastral transfer of the heirs.",
          "Sanatoria: assembling the case to regularize past unpermitted work, where that is possible.",
          "Closing paperwork: fine lavori, cadastral update, the segnalazione certificata di agibilità where the work triggers it, and collection of the trade certificates.",
        ],
      },
      { type: "h2", text: "Geometra, architetto, or ingegnere?" },
      {
        type: "p",
        text: "These are three separate professional registers with overlapping but not identical competence. The boundaries are set by law and, at the edges, argued about by lawyers. What follows is the practical version.",
      },
      {
        type: "table",
        headers: ["Professional", "Natural territory", "Hire when"],
        rows: [
          [
            "Geometra",
            "Permit filings, cadastre, measurement and costing, site supervision on ordinary buildings",
            "Standard apartment or village house renovation with no heritage protection and no ambitious structural work",
          ],
          [
            "Architetto",
            "Design, spatial planning, finishes, heritage work, tendering and comparing bids",
            "The layout and light matter to you, or the building is under heritage or landscape constraint",
          ],
          [
            "Ingegnere",
            "Structural calculation and certification, seismic verification, complex systems",
            "You are opening load bearing walls, replacing floors or a roof, or building in a seismic zone",
          ],
          [
            "Termotecnico or certificatore",
            "Heating and energy calculations, the APE energy certificate",
            "You are replacing the heating system or need an energy certificate",
          ],
        ],
      },
      {
        type: "p",
        text: "A geometra's scope on structural design is limited by law to modest works, and the limits are interpreted differently from province to province. Any competent geometra will bring in a structural engineer rather than push the boundary, and will say so unprompted. If yours does not raise the question when you propose removing a wall, that is information about the geometra.",
      },
      {
        type: "p",
        text: "The three roles are not mutually exclusive and on a serious job you will have all of them. The common arrangement for foreign owners is an architetto for design and an owner facing role, a geometra for filings and cadastre, and an engineer brought in for the structural package.",
      },
      {
        type: "callout",
        title: "Ask who is signing what",
        text: "Before work starts, get a one page list of every filing and certificate your job will need, and the name of the professional who will sign each one. Permit filing, structural report, electrical conformity, gas conformity, cadastral update, energy certificate, agibilità. Foreign owners routinely arrive at the end of a renovation to find that two of these were nobody's job. It is far cheaper to assign them at the beginning than to chase them once the crew has moved on.",
      },
      { type: "h2", text: "What it costs" },
      {
        type: "p",
        text: "Italy abolished mandatory professional fee schedules years ago, so the price is negotiated and varies a great deal between a Milan practice and a rural comune in Abruzzo. Anyone quoting you a single national number is guessing. What you can control is the structure of the quote, and the structure is comparable even when the amounts are not.",
      },
      {
        type: "ul",
        items: [
          "Flat fee per filing. Standard for a single CILA, a cadastral update, a visura, or an energy certificate. Ask what happens if the comune requests changes, because integrations are common and are sometimes billed separately.",
          "Percentage of the works value. Standard for design plus direzione lavori as a package. Percentages sit in the low single digits for straightforward jobs and rise as the project gets more complex or smaller in absolute value.",
          "Hourly or per visit, for supervision beyond the base package. Worth agreeing explicitly if you are abroad and want more site visits than the job strictly requires.",
          "Add ons that appear on the invoice: a mandatory contribution to the professional pension fund, IVA at the standard rate, and pass through costs such as comune filing fees, stamp duties, and cadastral search fees.",
        ],
      },
      {
        type: "p",
        text: "Get all of it in a written engagement letter, a disciplinare di incarico, that states the deliverables, the number of site visits included, who pays comune fees, and what triggers extra billing. Comparing two verbal quotes for professional services is not a comparison.",
      },
      { type: "h2", text: "How to choose one" },
      {
        type: "p",
        text: "Local beats famous. A geometra who files in your comune every week knows which technical officer wants what, which is worth more than a bigger practice two provinces away. Beyond that:",
      },
      {
        type: "ol",
        items: [
          "Confirm registration with the provincial Collegio and ask for the indemnity policy.",
          "Ask for two references from foreign clients, and actually contact them. The skill you are testing is not technical, it is whether the person answers email from a different time zone.",
          "Decide who owns the language problem. If your geometra's English is limited, agree at the outset who translates and how, rather than discovering the answer is nobody.",
          "Ask whether they have any commercial relationship with the impresa they are recommending. A recommendation is normal and often good. An undisclosed relationship is not.",
          "Ask them to walk the property and give you a written summary of the current state, including any conformity problems, before you commit to a scope. A geometra who wants to file first and look later is the wrong hire.",
        ],
      },
      { type: "h2", text: "Questions to ask at the first meeting" },
      {
        type: "ul",
        items: [
          "How would you classify this work, and which filing does it need?",
          "Is the building as it stands consistent with its cadastral plan and its permit history? How will you check?",
          "Are there any landscape, heritage, or seismic constraints on this parcel?",
          "What is the realistic timeline for authorization in this comune, from filing to being able to start?",
          "Which parts of this need a structural engineer, and do you have one you work with?",
          "Will you act as direttore dei lavori, and what does that include in terms of site visits?",
          "What is excluded from your fee?",
          "What documents will I hold at the end of the job, and when do you hand each one over?",
          "How do you prefer to receive questions and send updates, and how quickly do you reply?",
        ],
      },
      {
        type: "p",
        text: "Write down the answers and keep them where the rest of the project lives. A remote renovation runs on a written record: what was promised, when, by whom. If your professional's answers to those nine questions sit in one place alongside the checklist and the monthly status report, you will spend the next year confirming facts rather than reconstructing them.",
      },
    ],
    faq: [
      {
        q: "Can I renovate in Italy without a geometra?",
        a: "Only if the work is genuinely ordinary maintenance that requires no filing, and even then a heritage or landscape constraint can change the answer. Anything classified as extraordinary maintenance or above needs a technician's sworn statement to be filed, and that technician must be registered. Doing the work without the filing creates an unpermitted condition that will surface when you sell, refinance, or ask for an occupancy certificate.",
      },
      {
        q: "Is a geometra less qualified than an architect?",
        a: "Different, not lesser. A geometra's training is technical and procedural, and for filings, cadastral work, measurement, and site supervision they are usually faster and cheaper than an architect. What a geometra is not is a designer, and their scope on structural design is legally limited to modest work. Judge the individual on the work you need, not on the register they belong to.",
      },
      {
        q: "Who appoints the direttore dei lavori, me or the contractor?",
        a: "You do, and it matters. The direttore dei lavori is the owner's appointment and is responsible for verifying that the work matches the authorized project. If the contractor supplies the supervisor, the check on the contractor is being performed by the contractor. Keep the appointment on your side of the table even when the contractor suggests a name.",
      },
      {
        q: "Can the same geometra handle the inheritance filing and the renovation?",
        a: "Frequently yes, and it is often efficient, because the person who untangles the cadastral records and the succession chain already understands the property's history. Confirm they actually do succession work, since not all do, and expect the inheritance side to be billed separately from the building side.",
      },
      {
        q: "How do I work with a geometra who does not speak English?",
        a: "Insist on written communication rather than phone calls, and use a channel that translates in both directions so the technical detail survives. The failing pattern is a chain of relayed messages through a bilingual relative, where the version the geometra reads and the version you approved slowly diverge. One shared project record that every person reads in their own language solves this at the source, and it is why MonthlyAlerts stores each note in the language it was written in and translates on the way out.",
      },
    ],
    template: "italy-renovation-checklist",
    related: [
      "how-to-manage-a-renovation-in-italy-from-the-us",
      "italian-construction-terminology",
      "questions-to-ask-an-italian-contractor",
      "renovating-a-family-property-in-italy",
    ],
    cta: "/renovating-abroad",
    publishedAt: "2026-09-08",
  },
  {
    slug: "italian-construction-terminology",
    cluster: "italy",
    title: "Italian Construction Terminology for English Speakers",
    metaTitle: "Italian Construction Terms: Glossary for Owners",
    metaDesc:
      "Over 80 Italian building terms grouped by category, with English meanings and notes on what each one signals when it shows up in a quote or an email.",
    keywords: [
      "Italian construction terms English",
      "Italian building glossary",
      "computo metrico preventivo meaning",
      "impresa edile muratore idraulico",
      "SAL collaudo agibilita catasto",
    ],
    kicker: "Italy · glossary",
    intro:
      "You do not need to speak Italian to renovate in Italy, but you do need to read a preventivo without guessing. Most of the expensive misunderstandings between foreign owners and Italian builders are vocabulary problems wearing a disguise: a word that looks like an English word and means something narrower, or a line item whose absence is the whole story. This glossary covers the terms that appear in quotes, invoices, permit filings, and site emails, grouped so you can find them in context.",
    blocks: [
      { type: "h2", text: "People and trades" },
      {
        type: "p",
        text: "Italian trades are more specialized than American ones. The person who tiles does not plaster, and the person who plasters does not wire. If a scope of work looks thin, it is often because a trade is missing rather than because the price is good.",
      },
      {
        type: "table",
        headers: ["Italian", "English", "Note"],
        rows: [
          ["impresa edile", "building firm, general contractor", "The company that holds the main contract"],
          ["committente", "the client, the owner", "You. The word appears throughout your contract"],
          ["capocantiere", "site foreman", "Ask who this is by name; it is who answers on site"],
          ["muratore", "mason", "Also does demolition, screeds, and plaster on small jobs"],
          ["manovale", "laborer", "Billed at a lower hourly rate in daywork lines"],
          ["idraulico", "plumber", "Often termoidraulico, covering heating as well as water"],
          ["elettricista", "electrician", "Must be a registered firm to issue the conformity certificate"],
          ["falegname", "joiner", "Makes doors, windows, and built-ins; not a framer"],
          ["serramentista", "window and door installer", "Usually a supplier who also installs"],
          ["piastrellista", "tiler", "Prices per square metre, with extras for small or laid-diagonal formats"],
          ["cartongessista", "drywall installer", "Separate trade from the muratore"],
          ["intonacatore", "plasterer", "Applies intonaco; rasatura may be a separate line"],
          ["imbianchino", "painter and decorator", "Usually the last trade before cleaning"],
          ["fabbro", "metalworker", "Railings, gates, security doors, structural steel on small jobs"],
          ["marmista", "stone fabricator", "Worktops, sills, thresholds, stairs"],
          ["subappaltatore", "subcontractor", "Ask for the list in writing before signing"],
        ],
      },
      { type: "h2", text: "Professionals and their filings" },
      {
        type: "table",
        headers: ["Italian", "English", "Note"],
        rows: [
          ["geometra", "surveyor and building technician", "Files permits, handles cadastre, often supervises the works"],
          ["architetto", "architect", "Design, heritage work, tendering"],
          ["ingegnere", "engineer", "Structural calculation and certification"],
          ["direttore dei lavori", "works supervisor", "Appointed by you; certifies work matches the permit"],
          ["pratica edilizia", "building filing", "The paperwork bundle submitted to the comune"],
          ["asseverazione", "sworn technical statement", "A technician's certification, with legal liability attached"],
          ["CILA", "certified notice of works start", "Extraordinary maintenance not touching structure or facade"],
          ["SCIA", "certified notice of activity start", "Heavier maintenance, conservative restoration, lighter restructuring"],
          ["permesso di costruire", "building permit", "New build and heavier restructuring; the comune must issue it"],
          ["attivita edilizia libera", "work needing no filing", "Ordinary maintenance, subject to constraints"],
          ["fine lavori", "completion notice", "Filed with the comune when work ends"],
          ["agibilita", "fitness for occupancy", "Certified by filing after qualifying works"],
          ["collaudo", "testing and formal acceptance", "Structural collaudo is a separate certificate from a pressure test"],
          ["sopralluogo", "site visit or inspection", "Charge for these is often per visit"],
          ["rilievo", "measured survey", "The drawing of the building as it stands"],
        ],
      },
      { type: "h2", text: "Records, compliance, and problems" },
      {
        type: "table",
        headers: ["Italian", "English", "Note"],
        rows: [
          ["catasto", "cadastral register", "Records plans, surface, category, and notional value"],
          ["visura catastale", "cadastral extract", "Who owns it and how it is registered"],
          ["planimetria catastale", "filed floor plan", "Compare it to reality; mismatches are common"],
          ["rendita catastale", "notional cadastral income", "The basis for property taxes"],
          ["categoria catastale", "cadastral category", "A/2, A/3, A/4 for homes, A/7 for detached, C/2 storage, C/6 garage"],
          ["DOCFA", "cadastral update filing", "Filed when layout, surface, or category changes"],
          ["atto di provenienza", "deed of title", "Shows how the current owner acquired it"],
          ["abuso edilizio", "unpermitted work", "Anything built without or beyond authorization"],
          ["difformita", "divergence from the permit", "Smaller than an abuso but still a problem at sale"],
          ["tolleranze costruttive", "construction tolerances", "Small deviations the law forgives; thresholds have changed, verify current rules"],
          ["sanatoria", "regularization of past work", "Possible only under specific conditions, with a fine"],
          ["condono", "amnesty under a specific past law", "Old applications are often still unresolved; check for one"],
          ["vincolo paesaggistico", "landscape protection", "Triggers a separate authorization on top of the building filing"],
          ["Soprintendenza", "heritage authority", "Its opinion can be binding, and it runs on its own timetable"],
          ["DURC", "contribution compliance certificate", "Proof the firm has paid its social contributions; ask to see a current one"],
          ["notifica preliminare", "preliminary site notification", "Filed with the health authority on qualifying sites"],
          ["PSC and POS", "safety plans", "Required when more than one company works on the site"],
        ],
      },
      { type: "h2", text: "Money, quotes, and contracts" },
      {
        type: "table",
        headers: ["Italian", "English", "Note"],
        rows: [
          ["preventivo", "quote or estimate", "Not an invoice and not a contract"],
          ["computo metrico estimativo", "itemized priced takeoff", "Quantities times unit prices; ask for it"],
          ["capitolato", "specification", "Defines quality and method, not just quantity"],
          ["prezzario regionale", "regional unit price book", "The reference many quotes are built from"],
          ["analisi prezzi", "price breakdown", "How a unit price splits into labor, material, plant"],
          ["contratto d'appalto", "construction contract", "Signed by owner and impresa"],
          ["a corpo", "lump sum", "One price for a defined scope"],
          ["a misura", "measured", "Priced on quantities actually executed"],
          ["in economia", "daywork", "Hourly labor plus materials; the line to watch"],
          ["fornitura e posa", "supply and install", "If it says solo posa, you are buying the material yourself"],
          ["SAL", "progress payment stage", "Stato avanzamento lavori; tie money to these"],
          ["acconto", "deposit or payment on account", "Keep it modest"],
          ["ritenuta a garanzia", "retainage", "Held back until the punch list is closed"],
          ["saldo", "final payment", "Release it after certificates are in hand"],
          ["variante", "change order", "Get cost and time impact in writing before it is executed"],
          ["fattura", "invoice", "Carries the VAT number; pay against this only"],
          ["IVA", "VAT", "Commonly 10% on residential renovation work, 22% standard; verify your case"],
          ["bonifico parlante", "referenced bank transfer", "Required wording if you claim an Italian renovation deduction"],
          ["partita IVA", "VAT number", "A firm without one cannot invoice you properly"],
          ["codice fiscale", "Italian tax code", "You need one as a foreign owner"],
          ["garanzia decennale", "ten year liability for serious defects", "A statutory liability, not automatically an insurance policy"],
          ["polizza CAR", "contractor's all risks insurance", "Ask for the certificate, not a verbal assurance"],
          ["oneri di sicurezza", "safety costs", "A separate line in a properly built quote"],
          ["riserva", "formal reservation or claim", "How a contractor puts a disputed cost on the record"],
        ],
      },
      {
        type: "callout",
        title: "The four words that decide your budget",
        text: "Fornitura e posa, a corpo, in economia, and escluso. The first tells you whether the material is in the price. The second tells you whether the price can move on quantities. The third tells you which part of the job is an open meter. The fourth, escluso, is the word that introduces every list of exclusions, and reading that list carefully is worth more than negotiating the headline number.",
      },
      { type: "h2", text: "Materials and building elements" },
      {
        type: "table",
        headers: ["Italian", "English", "Note"],
        rows: [
          ["cantiere", "construction site", "Also used for the project as a whole"],
          ["demolizione", "demolition", "Usually priced with smaltimento, disposal, separately"],
          ["smaltimento macerie", "rubble disposal", "Legally tracked waste; check it is in the quote"],
          ["ponteggio", "scaffolding", "Frequently excluded and expensive"],
          ["muro portante", "load bearing wall", "Touching it means a structural filing"],
          ["tramezzo", "non structural partition", "Usually hollow block or plasterboard"],
          ["solaio", "floor and ceiling structure", "Replacing one is structural work"],
          ["trave", "beam", "Travi in legno means timber beams, common in old houses"],
          ["pilastro", "column or pier", "Reinforced concrete or masonry"],
          ["cemento armato", "reinforced concrete", "Abbreviated c.a. in drawings"],
          ["forati", "hollow clay blocks", "The standard partition material"],
          ["intonaco", "plaster or render", "Rough coat; rasatura is the smooth skim on top"],
          ["cartongesso", "plasterboard", "Used for partitions, boxing, and dropped ceilings"],
          ["controsoffitto", "dropped ceiling", "Where recessed lighting and ducts hide"],
          ["massetto", "screed", "Levels the floor over the services; needs drying time"],
          ["vespaio", "ventilated void or hardcore bed", "Damp control at ground level"],
          ["guaina", "waterproof membrane", "Liquid or sheet; essential under wet room tile"],
          ["cappotto", "external insulation system", "Changes the facade, so check constraints"],
          ["gres porcellanato", "porcelain stoneware", "The default Italian floor tile"],
          ["pavimento and rivestimento", "floor tile and wall tile", "Quoted separately, per square metre"],
          ["fuga", "grout joint", "Fuga stretta means a narrow joint, which costs more to lay"],
          ["battiscopa", "baseboard or skirting", "Often the same material as the floor"],
          ["infissi or serramenti", "windows and external doors", "The biggest single supply item in most renovations"],
          ["persiane, scuri, tapparelle", "louvred shutters, solid shutters, roller blinds", "Replacement type may be constrained by the comune"],
          ["davanzale and soglia", "window sill and threshold", "Usually stone, from the marmista"],
          ["coppi and tegole", "curved and flat roof tiles", "Reusing the originals is often required in historic centres"],
        ],
      },
      { type: "h2", text: "Systems and utilities" },
      {
        type: "table",
        headers: ["Italian", "English", "Note"],
        rows: [
          ["impianto", "installed system", "Impianto elettrico, idraulico, termico, gas"],
          ["traccia", "chased channel in masonry", "Where conduit runs before plastering"],
          ["corrugato", "flexible conduit", "Italian wiring is pulled through conduit, not stapled"],
          ["scatola 503", "three module wall box", "The standard Italian box size for switches and sockets"],
          ["quadro elettrico", "consumer unit or panel", "Ask for a labelled schedule of circuits"],
          ["salvavita", "residual current device", "Trade name in general use; formally interruttore differenziale"],
          ["magnetotermico", "circuit breaker", "Often combined with the differenziale in one device"],
          ["potenza impegnata", "contracted electrical power", "The default domestic contract is small; upgrades cost money"],
          ["contatore", "utility meter", "Electricity, gas, and water each have one"],
          ["POD and PDR", "electricity and gas supply point codes", "You need these to open or take over a contract"],
          ["subentro", "taking over a closed supply", "What you do when the meter has been dormant"],
          ["voltura", "transferring an active contract", "Faster than a subentro"],
          ["dichiarazione di conformita", "installer's certificate of conformity", "Required for electrical and gas work; keep the original"],
          ["caldaia", "boiler", "Camera stagna means a sealed combustion unit"],
          ["pompa di calore", "heat pump", "Increasingly the default replacement for a boiler"],
          ["termosifone", "radiator", "Also radiatore or elemento"],
          ["riscaldamento a pavimento", "underfloor heating", "Adds a commissioning cycle before tiling"],
          ["canna fumaria", "flue", "Cannot be shared between a hood and a gas appliance"],
          ["cappa", "extraction hood", "Ducted or recirculating; the difference is structural"],
          ["colonna di scarico", "soil stack", "Its position limits where a bathroom can go"],
          ["sifone", "trap", "Sifone ispezionabile means it can be opened for cleaning"],
          ["fossa Imhoff", "settlement septic tank", "Common where there is no mains drainage"],
          ["autoclave", "booster pump", "Needed where mains pressure is weak"],
          ["addolcitore", "water softener", "Worth it in most of Italy; limescale is aggressive"],
          ["sanitari and rubinetteria", "sanitaryware and taps", "Treated as significant goods for VAT purposes"],
          ["allaccio", "utility connection", "New connections are a separate cost and a separate timeline"],
        ],
      },
      { type: "h2", text: "False friends worth memorizing" },
      {
        type: "ul",
        items: [
          "Ristrutturazione is not simply renovation. It is a legal category of intervention, and which category you are in decides your permit, your VAT rate, and your timeline.",
          "Restauro means conservative restoration in the technical sense, with obligations to preserve what exists. It is not a synonym for a nice refurbishment.",
          "Camera means bedroom, not room. Cucina abitabile is a kitchen large enough to eat in; cucinotto is not.",
          "Rustico describes an unfinished or agricultural building shell, and often carries planning limits on turning it into a home.",
          "Cantina is a cellar or storage room, and as a cadastral category it may not be legally habitable regardless of how you finish it.",
          "Preventivo firmato, a signed quote, is often treated as the contract. If you sign one, read it as a contract, because in a dispute it will be read that way.",
        ],
      },
    ],
    faq: [
      {
        q: "Which single document should I insist on before signing anything?",
        a: "The computo metrico estimativo. A preventivo can be a single line and a number, which tells you nothing and lets the scope drift. An itemized takeoff with quantities and unit prices lets you compare two contractors item by item, spot what one of them left out, and check later whether the quantities billed match what was installed.",
      },
      {
        q: "Do I need to learn Italian to run the project?",
        a: "No, but you need to be able to read these words when they appear, because they carry the money. The practical setup is to keep every instruction and question in writing, translated in both directions, so the tiler reads the same item you approved. A checklist that stores each note in its author's language and shows it to everyone else in theirs removes most of the risk that the two versions diverge.",
      },
      {
        q: "What does escluso mean at the bottom of a quote?",
        a: "Excluded. It is followed by the list of everything the price does not cover, and that list is where the surprises live: scaffolding, waste disposal, VAT, professional fees, comune fees, utility connections, and often the supply of finishes. Read the exclusions before the total.",
      },
      {
        q: "Is garanzia decennale an insurance policy?",
        a: "Not by itself. It refers to the ten year liability an Italian builder carries for serious defects that affect the building's stability or essential parts. There is a separate insurance product, and it is only mandatory in specific situations such as a developer selling a newly built home. If you want an insured warranty rather than a claim against a company that may not exist in eight years, ask for the policy and read who is covered.",
      },
      {
        q: "What is the difference between collaudo and agibilita?",
        a: "Collaudo is a technical test and acceptance of something specific, for example the structural collaudo of reinforced concrete work or a pressure test on the plumbing. Agibilita is the administrative confirmation that the property is fit to occupy, filed by your technician after the works, with the trade certificates and the cadastral update attached. You can pass a collaudo and still be missing agibilita.",
      },
    ],
    template: "italy-renovation-checklist",
    related: [
      "understanding-italian-renovation-estimates",
      "what-is-a-geometra",
      "questions-to-ask-an-italian-contractor",
      "italian-vs-american-electrical-systems",
    ],
    cta: "/renovating-abroad",
    publishedAt: "2026-09-08",
  },
  {
    slug: "italian-vs-american-electrical-systems",
    cluster: "italy",
    title: "Italian vs American Electrical Systems: What Owners Need to Know",
    metaTitle: "Italian vs US Electrical Systems for Renovations",
    metaDesc:
      "230V, 50Hz, a 3 kW default contract, type L and Schuko plugs, salvavita protection, and the conformity certificate you must not skip. Written for American owners.",
    keywords: [
      "Italian electrical system 230V",
      "potenza impegnata 3 kW upgrade",
      "Italian plug type L Schuko",
      "dichiarazione di conformita DM 37/08",
      "American appliances in Italy",
    ],
    kicker: "Italy · systems",
    intro:
      "Electrical work is where an American owner's instincts are most reliably wrong in Italy. The voltage is different, the available power is far smaller than you expect, the plugs come in more than one shape, the wiring method is conduit rather than cable, and the whole installation is only legal if a registered firm issues a specific certificate at the end. None of it is difficult. All of it is easier to get right before the plaster goes on.",
    blocks: [
      { type: "h2", text: "The basics: 230 volts, 50 hertz" },
      {
        type: "p",
        text: "Italian domestic supply is nominally 230 volts at 50 hertz, single phase, delivered on two conductors plus earth. There is no split phase 120/240 arrangement as in North America, so there is no such thing as a 120 volt circuit in an Italian house and no half voltage for small loads. Larger supplies are three phase at 400 volts between phases, which is worth knowing because a heat pump plus induction plus an EV charger can push you into that territory.",
      },
      {
        type: "p",
        text: "Domestic installations are usually earthed as what the standards call a TT system: your house has its own earth electrode rather than relying on the utility's earth. The consequence is that residual current protection is not a nicety. It is the primary means of protecting people, and a house without working differential protection is not merely dated, it is unsafe.",
      },
      { type: "h2", text: "Potenza impegnata: the ceiling nobody warns you about" },
      {
        type: "p",
        text: "In the United States a house has a service size measured in amps and you rarely think about it. In Italy you sign a contract for a specific power level, the potenza impegnata, and your meter enforces it. The standard domestic contract is 3 kW, with a small tolerance above that before the meter trips. Three kilowatts is roughly one oven, or one washing machine plus a kettle, and that is the whole house.",
      },
      {
        type: "p",
        text: "Foreign owners plan an American kitchen and then discover it cannot be switched on. Do this arithmetic during design, not after tiling.",
      },
      { type: "h3", text: "Typical continuous draws to add up" },
      {
        type: "ul",
        items: [
          "A four zone induction hob has a nameplate rating in the range of seven kilowatts or more, managed down by its own power limiter to whatever ceiling you set.",
          "An electric oven runs around two to three kilowatts while heating.",
          "A resistance water heater is one to two kilowatts, and it runs unattended.",
          "An air conditioning split is under a kilowatt for a small room, more for a multi split.",
          "A heat pump for space heating is a different scale of load again, and should be sized with the supply contract in mind.",
          "An EV charger at even the modest end wants more headroom than a 3 kW contract has.",
        ],
      },
      { type: "h3", text: "How the upgrade works" },
      {
        type: "p",
        text: "You raise the contracted power by asking your electricity seller, who instructs the distributor that owns the meter. Steps above 3 kW are usually available in half kilowatt increments, and 4.5 or 6 kW covers most renovated homes comfortably. Above 6 kW the arrangement often changes to three phase, which means new supply cables, possibly a new meter position, and a different tariff structure. Expect a one off charge for the increase plus a higher standing charge on every bill thereafter. Ask for both numbers before deciding.",
      },
      {
        type: "callout",
        title: "Resident and non resident tariffs are not the same",
        text: "Italian electricity tariffs distinguish between a household's primary residence and a second home. If you are not registered as resident at the address, you pay a non resident domestic tariff with a different fixed component and no resident allowances. For an American owner using the house a few months a year, the standing charges can be a meaningful share of an annual bill on which very little electricity was actually consumed. Ask your supplier to quote the annual fixed cost, not the per kilowatt hour rate.",
      },
      { type: "h2", text: "Plugs and sockets" },
      {
        type: "p",
        text: "There is no single Italian plug. There are several, they are not interchangeable, and choosing the wrong socket type means your Italian appliances will not physically fit.",
      },
      {
        type: "table",
        headers: ["Type", "What it is", "Note"],
        rows: [
          [
            "Italian type L, 10 A",
            "Three round pins in a line, thin pins, narrow spacing",
            "The traditional Italian socket, still the most common in older homes",
          ],
          [
            "Italian type L, 16 A",
            "Same layout, thicker pins, wider spacing",
            "For heavier appliances; a 10 A plug will not fit and vice versa",
          ],
          [
            "Schuko, type F",
            "Two round pins with earth clips on the rim",
            "Standard across most of Europe; many appliances sold in Italy now ship with this",
          ],
          [
            "Bipasso",
            "Socket that accepts both sizes of type L",
            "The minimum sensible specification",
          ],
          [
            "Universale or Schuko bipasso",
            "Accepts both type L sizes and Schuko",
            "Specify this everywhere; it costs very little more and ends the problem",
          ],
        ],
      },
      {
        type: "p",
        text: "One instruction to your electrician saves years of adapters: universal sockets throughout, and more of them than Italian practice would suggest. Italian rooms are traditionally under provisioned for outlets by American standards. Decide the count and the positions yourself, room by room, while the walls are still open.",
      },
      { type: "h2", text: "Inside the panel: salvavita and magnetotermico" },
      {
        type: "p",
        text: "The quadro elettrico is the consumer unit. Two devices matter.",
      },
      {
        type: "ul",
        items: [
          "Interruttore magnetotermico: the circuit breaker, protecting the wiring against overload and short circuit. One per circuit.",
          "Interruttore differenziale, universally called the salvavita after an old trade name: the residual current device that protects people. Domestic protection is typically at 30 milliamps.",
        ],
      },
      {
        type: "p",
        text: "Two things to insist on. First, split the house across several differentials rather than one, so a faulty appliance in the kitchen does not black out the whole building, which matters when nobody is there to reset it. Second, ask for a labelled circuit schedule taped inside the panel door, in Italian and in English. It costs nothing at installation and is invaluble to whoever is standing in front of the panel later, which will not be you.",
      },
      { type: "h2", text: "The certificate: dichiarazione di conformita" },
      {
        type: "p",
        text: "Italian electrical work must be carried out by a firm qualified and registered for the purpose, and at the end that firm issues a dichiarazione di conformita under the ministerial decree of January 2008, commonly cited as DM 37/08. The declaration comes with mandatory annexes: the project where a project is required, a report on the materials used, and the firm's registration certificate. Above certain thresholds, including installations where the contracted power exceeds six kilowatts or the unit exceeds four hundred square metres, a design by a qualified professional is required rather than the installer's own drawing.",
      },
      {
        type: "p",
        text: "Keep the original. You will need it for the occupancy paperwork, sometimes for a utility contract, and reliably at resale, when the notary and the buyer will ask what documentation exists for the systems. If the house has an old installation with no paperwork at all, which is normal in an inherited property, a qualified professional with sufficient experience can issue a dichiarazione di rispondenza instead, a retrospective statement of conformity for a pre existing system. Ask your geometra whether that route applies to you before you assume the whole installation must be replaced.",
      },
      {
        type: "p",
        text: "The same logic applies to gas work, which carries its own conformity declaration. Collect certificates as each trade finishes. Chasing an electrician for paperwork nine months after the last invoice is a well documented form of misery, and it is the sort of item that belongs on the project checklist with a due date rather than in your memory.",
      },
      { type: "h2", text: "Do not ship your American appliances" },
      {
        type: "p",
        text: "This comes up in every project and the answer is almost always the same.",
      },
      {
        type: "ol",
        items: [
          "A transformer changes voltage, not frequency. Anything with a motor or a line synchronized timer designed for 60 hertz will run slower on 50 hertz and may overheat.",
          "American dryers and ranges use a 120/240 volt split phase supply with a neutral. There is no equivalent in an Italian house, so they cannot simply be rewired.",
          "Equipment sold in the United States carries American certification, not the European marking. That can matter for your installer's conformity declaration and for your insurer after a fire.",
          "Italian appliance dimensions are metric and modular, mostly built around 60 centimetre widths. An American refrigerator will not fit the cabinetry your falegname builds, and a 36 inch range has no Italian cabinet run to sit in.",
          "Service and spare parts are local. A broken American machine in Umbria is scrap.",
        ],
      },
      {
        type: "p",
        text: "The exceptions are small dual voltage electronics with switching power supplies, laptops and phone chargers and most camera gear, which need only a plug adapter. Everything else, buy in Italy.",
      },
      { type: "h2", text: "Lighting, and a trap with smart switches" },
      {
        type: "ul",
        items: [
          "Lamp bases are E27 and E14 rather than the American E26 and E12. Fittings are widely available; American fixtures usually need the lamp swapped and may not be rated for 230 volts at all.",
          "Italian wiring runs through corrugated conduit chased into masonry, into standardized rectangular wall boxes. This is why moving a switch later is a masonry job, and why you should mark every switch and socket position on a drawing before the electrician starts.",
          "Many Italian switch boxes contain only the switched line and the return, with no neutral present. A large share of American smart switches require a neutral at the switch and therefore cannot be installed. If you want smart lighting, tell your electrician at rough in so the neutral is pulled, or choose a system that works at the fixture or the panel instead.",
          "Ceiling outlets are often a single point per room. If you want multiple fixtures, or wall lights, or exterior lighting, specify every point during rough in.",
        ],
      },
      { type: "h2", text: "EV charging" },
      {
        type: "p",
        text: "European charging uses the type 2 connector, and a domestic wallbox is a fixed installation, not an appliance you plug in. Single phase charging at the higher end draws around seven kilowatts, which no standard 3 kW contract can support, so an EV usually means a power upgrade and sometimes a move to three phase. The installation needs its own circuit, its own protection, and specific handling of direct current residual currents, either through a dedicated device or through a wallbox that includes the detection internally. If your supply is small, ask about a wallbox with dynamic load management, which throttles charging when the rest of the house is drawing power. It is far cheaper than upsizing everything.",
      },
      { type: "h2", text: "Getting the power turned on" },
      {
        type: "p",
        text: "Your contract is with a seller you choose on the open market; the meter and the cable belong to the local distributor. The regulated tariff for ordinary domestic customers has been wound down, so everyone is now on a market offer of some kind. Two practical points for a renovation.",
      },
      {
        type: "ul",
        items: [
          "You need the POD code for electricity and the PDR for gas. They are printed on any old bill and identify the physical connection. Find them before you call anyone.",
          "If the previous contract was closed, you need a subentro rather than a simple transfer. If the meter was removed altogether, which happens on houses empty for years, you need a new connection, which is slower and more expensive. Start this early, because a site without power is a site without work.",
        ],
      },
      {
        type: "p",
        text: "Track the electrical scope as its own set of items with photographs: the panel with the door open, every wall at rough in before plaster, and the certificate itself. Those photos are the only record you will have of what is inside your walls, and they are worth more two years from now than any invoice.",
      },
    ],
    faq: [
      {
        q: "Is 3 kW really enough for a renovated house?",
        a: "For a small apartment used occasionally, sometimes. For a modern kitchen with induction and an oven, no. Most renovated homes end up at 4.5 or 6 kW. Decide before the electrician designs the circuits, because the panel, the cable sizes, and the supply cable may all depend on the answer, and redoing them after plastering costs several times what it costs to plan.",
      },
      {
        q: "Can I use my American power tools during the renovation?",
        a: "Not sensibly. Corded American tools are 120 volt and 60 hertz, and running them through a step down transformer at the wrong frequency stresses the motor. Battery tools are the exception, since the chargers are often dual voltage. Check the charger label for a 100 to 240 volt input range.",
      },
      {
        q: "The house is old and has no electrical paperwork. Do I have to rewire everything?",
        a: "Not necessarily. Where an installation predates the current decree and no declaration exists, a suitably experienced professional can inspect and issue a dichiarazione di rispondenza covering the existing system. Whether that is appropriate depends on the actual condition: cloth insulated wiring, no earth conductor, or no differential protection all point to replacement rather than certification. Get an inspection and a written opinion before you budget either way.",
      },
      {
        q: "How many sockets should I ask for?",
        a: "More than you are offered, and decided room by room on a drawing. Think about where a bed, a desk, a television, a coffee machine, and a vacuum cleaner will actually be. Specify universal sockets so both Italian and Schuko plugs fit, add dedicated circuits for the kitchen appliances, and put at least one outdoor weatherproof point where you will want to work outside.",
      },
      {
        q: "Who is responsible if the electrical work is not compliant?",
        a: "The installing firm issues the conformity declaration and carries the professional responsibility for the work it certifies. Your direttore dei lavori is responsible for verifying the works match the authorized project. That is precisely why you should not accept a final payment schedule that releases everything before the declarations are in your hands. Make the certificate a checklist item with the trade's final payment attached to it.",
      },
    ],
    template: "italy-renovation-checklist",
    related: [
      "italian-kitchen-and-bathroom-renovation-checklist",
      "italian-construction-terminology",
      "how-to-manage-a-renovation-in-italy-from-the-us",
      "renovating-a-family-property-in-italy",
    ],
    cta: "/renovating-abroad",
    publishedAt: "2026-09-08",
  },
  {
    slug: "understanding-italian-renovation-estimates",
    cluster: "italy",
    title: "Understanding Italian Renovation Estimates",
    metaTitle: "How to Read an Italian Renovation Estimate",
    metaDesc:
      "Preventivo versus computo metrico, regional unit prices, IVA rates, the exclusions that blow budgets, payment stages, and how to compare two Italian quotes fairly.",
    keywords: [
      "preventivo computo metrico estimativo",
      "Italian renovation quote explained",
      "IVA 10 percent ristrutturazione",
      "prezzario regionale unit prices",
      "SAL payment schedule Italy",
    ],
    kicker: "Italy · money",
    intro:
      "An Italian renovation quote can be one page with three lines and a total, or thirty pages with four hundred priced items. Both are called a preventivo. The difference is not formality, it is whether you can tell what you are buying, verify what you were charged, and compare one builder against another. Learning to read the long version, and refusing to sign the short one, is the highest return hour you will spend on the whole project.",
    blocks: [
      { type: "h2", text: "Preventivo and computo metrico estimativo are not the same document" },
      {
        type: "p",
        text: "A preventivo is an offer. A computo metrico estimativo is a measured, itemized takeoff: every operation listed, with its quantity, its unit of measure, its unit price, and the resulting total. The first is a number. The second is an argument for a number, and it is the only version you can audit.",
      },
      {
        type: "table",
        headers: ["Document", "What it contains", "What it is good for"],
        rows: [
          [
            "Preventivo",
            "A description of the works and a price, sometimes a handful of grouped lines",
            "A rough go or no go signal; dangerous to sign as a contract",
          ],
          [
            "Computo metrico estimativo",
            "Quantities times unit prices, line by line, usually organized by phase",
            "Comparing bids, checking progress claims, controlling variations",
          ],
          [
            "Capitolato",
            "The specification: materials, methods, standards, brands, tolerances",
            "Deciding quality, not quantity; this is where a cheap quote hides",
          ],
          [
            "Contratto d'appalto",
            "The binding agreement, with the computo and capitolato attached",
            "Enforcement; without attachments it is nearly unenforceable",
          ],
        ],
      },
      {
        type: "p",
        text: "If a contractor declines to produce a computo, you have two options that both work. Have your geometra or architetto prepare one and issue it to every bidder as the basis for pricing, so all quotes describe the same job. Or accept the contractor's number as a lump sum, but only with a detailed capitolato attached that defines the quality of everything, and with the understanding that you have no mechanism to challenge a quantity later.",
      },
      { type: "h2", text: "Where the unit prices come from" },
      {
        type: "p",
        text: "Italian unit prices are not invented per project. Each region publishes a price list, a prezzario, updated periodically, covering thousands of construction operations with a price for each. Private quotes are commonly built from the regional list or from a commercial price book, sometimes with a stated discount or uplift applied across the board.",
      },
      {
        type: "p",
        text: "Two things follow. First, a price for the same operation should be broadly comparable between two local firms, and a very large gap is a signal to investigate rather than to celebrate. Second, you can ask for an analisi prezzi, the breakdown of a unit price into labor, materials, and plant, on any line that looks strange. A firm that builds its prices properly can produce this in an afternoon. A firm that cannot has not costed the job, it has guessed at it.",
      },
      {
        type: "p",
        text: "Look for the labor content specifically. In a renovation, labor is normally the dominant share of most operations, and a quote whose prices are far below the local price list is usually not more efficient. It is either planning to use undeclared labor, planning to substitute materials, or planning to make it back on variations. All three are your problem eventually.",
      },
      { type: "h2", text: "IVA: the rate is part of the price" },
      {
        type: "p",
        text: "Value added tax is a substantial line and the rate depends on what is being done and by whom. The commonly applicable rates for residential renovation look like this, and you should have your geometra or accountant confirm the treatment of your specific job in writing rather than relying on a general description.",
      },
      {
        type: "table",
        headers: ["Rate", "Typically applies to", "Watch out for"],
        rows: [
          [
            "10%",
            "Maintenance and renovation works on residential property, supplied by the contractor under a works contract",
            "Subject to the significant goods rule below",
          ],
          [
            "4%",
            "Narrow cases, including certain new construction contracts and works to remove architectural barriers",
            "Rarely applies to an ordinary renovation; confirm before assuming it",
          ],
          [
            "22%",
            "Professional fees, materials you buy yourself, furniture, and works on non residential property",
            "Buying your own finishes moves them from 10% to 22%",
          ],
        ],
      },
      { type: "h3", text: "The significant goods rule, in plain arithmetic" },
      {
        type: "p",
        text: "Certain expensive components are treated as beni significativi: boilers, lifts, window and door frames, air conditioning equipment, bathroom sanitaryware and taps, security systems, and video entry systems. When the contractor supplies and installs one of these under a renovation contract, the reduced rate applies to the labor and other components in full, but to the significant goods only up to the value of everything else in that supply. The excess is taxed at the standard rate.",
      },
      {
        type: "p",
        text: "So on a bathroom package where the fixtures and taps are worth 3,000 euros and the labor and other materials are worth 2,000 euros, the reduced rate covers the 2,000 of labor plus 2,000 of the fixtures. The remaining 1,000 euros of fixtures is charged at the standard rate. The invoice must state the value of the significant goods separately, which is also a useful check that the contractor is invoicing properly.",
      },
      {
        type: "callout",
        title: "Buying your own finishes is usually a false economy",
        text: "Foreign owners often want to buy tile, fixtures, and lights themselves, sometimes online, to control the choice. Doing so moves those items from the reduced rate to the standard rate, removes them from the contractor's responsibility if they are wrong or damaged, makes delivery scheduling your problem, and gives the contractor a defence for every delay. Choose the products yourself, then have the contractor supply them at your specified brand and model. You keep the decision and lose the liability.",
      },
      { type: "h2", text: "What is usually excluded" },
      {
        type: "p",
        text: "Read the exclusions before the total. Every honest Italian quote has a list, introduced by escluso or non compreso, and this is where budgets are actually decided. The usual suspects:",
      },
      {
        type: "ul",
        items: [
          "IVA, stated as separate from the quoted amount.",
          "Spese tecniche: the geometra, architect, engineer, energy consultant, and safety coordinator.",
          "Comune fees, filing charges, and any contribution due on the permit.",
          "Ponteggio, scaffolding, and any road occupancy permit it needs.",
          "Waste disposal to a licensed facility, and the paperwork that tracks it.",
          "Utility connections, meter relocations, and any temporary site supply.",
          "Structural works and structural testing, if these were priced by a separate firm.",
          "Finishes described as a scelta del committente with an allowance figure attached.",
          "Sanitaryware, taps, light fittings, kitchen furniture, shutters, and interior doors, individually or as a group.",
          "Final cleaning, and the removal of protective coverings.",
          "Anything described as opere non prevedibili, which is the honest way of saying nobody knows what is behind that wall.",
        ],
      },
      {
        type: "p",
        text: "Allowances deserve their own paragraph. A line that reads supply of floor tile up to a stated price per square metre is not a price for your floor, it is a placeholder. Price your actual selections at the quotation stage, or accept that the total in front of you is provisional in a way the total does not admit.",
      },
      { type: "h2", text: "Payment schedules that protect both sides" },
      {
        type: "p",
        text: "Italian practice ties payments to a stato avanzamento lavori, a progress stage. A defensible structure for a private renovation looks like this, with the exact percentages negotiable and the principle not.",
      },
      {
        type: "ol",
        items: [
          "A modest deposit on signature, sized to cover mobilization and initial material orders, not a third of the job.",
          "A payment when demolition and rough in are complete and photographed, before anything is covered.",
          "A payment when screeds, plaster, and substrates are complete.",
          "A payment when finishes and fixtures are installed.",
          "A retainage released only after the punch list is closed and the certificates are handed over.",
        ],
      },
      {
        type: "p",
        text: "Two additions worth insisting on. Each stage payment should be requested against a measured claim referencing the computo, so you can check the quantities rather than the vibe. And the final retainage should be explicitly linked in the contract to delivery of the conformity declarations, the cadastral update, and the energy certificate, because otherwise those documents arrive slowly or not at all.",
      },
      { type: "h2", text: "Varianti: how a fixed price stops being fixed" },
      {
        type: "p",
        text: "A variante is a change to the agreed works. Some are your idea, some are genuinely unforeseeable, and in an old Italian building the unforeseeable ones are frequent: a floor structure weaker than assumed, damp behind plaster, a drain that goes somewhere nobody expected. The problem is never that variations happen. The problem is variations executed verbally and priced afterward.",
      },
      {
        type: "ul",
        items: [
          "Every variation gets written down before work proceeds, with a price and a schedule impact, and your written approval. No exceptions, including for small ones.",
          "Price variations from the same unit price basis as the original contract, not at fresh negotiated rates.",
          "Check whether the change affects the permit. Some variations require a filing with the comune, and a few require it before rather than after execution. Ask your geometra every time.",
          "Keep a running total of approved variations against your contingency, and look at it monthly. Variations kill budgets by accumulation, not by any single line.",
        ],
      },
      {
        type: "p",
        text: "A shared checklist where each variation is an item with its cost, its approval, and its photographs attached is the cheapest project control you will ever implement. It is also the difference between a contingency you manage and a number you discover.",
      },
      { type: "h2", text: "Comparing two quotes fairly" },
      {
        type: "ol",
        items: [
          "Normalize the scope first. If the quotes describe different work, you are not comparing prices, you are comparing intentions.",
          "Compare quantities before prices. A lower total with 30% less plaster area is not cheaper, it is incomplete.",
          "Compare the specification. Same tile format, same plaster system, same boiler class, same window glazing and hardware. Vague specifications are a pricing strategy.",
          "Line up the exclusion lists side by side. This alone often reverses the ranking.",
          "Check the schedule and the penalty, if any, for overrun. A price with no date is not a commitment.",
          "Check the firm: current contribution compliance certificate, insurance, registry extract, and whether the trades will be its own employees or subcontractors.",
          "Ask both firms one hard technical question about your building and read the answers. The quality of the reasoning predicts the quality of the site work better than the total does.",
        ],
      },
      {
        type: "p",
        text: "Then do not take the lowest number automatically. In renovation, the lowest bid is often the one that understood the job least, and the gap comes back as variations, delays, or a firm that walks away. Take the bid whose reasoning you trust, and negotiate that one.",
      },
    ],
    faq: [
      {
        q: "Should I ask for a fixed price or pay by measure?",
        a: "A lump sum for the parts of the job you can define precisely, and measured rates for the parts you cannot. Demolition and structural repairs in an old building are genuinely uncertain, and a contractor who fixes a price on them either loads the number heavily or will come back with variations. Agree unit prices for the uncertain work in advance, so the rate is settled even when the quantity is not.",
      },
      {
        q: "Can I claim Italian renovation tax deductions as an American owner?",
        a: "The renovation incentives are deductions against Italian income tax, taken in annual installments over several years, so they are only useful if you have Italian taxable income to deduct against. Many non resident owners have none and therefore cannot use them. There have also been repeated changes to the rates and to whether the credit can be transferred or taken as an invoice discount, including the wind down of the 110% Superbonus and the closure of most credit transfer routes. Do not build a budget around any of it without a written opinion from a cross border accountant for your specific situation and the current year's rules.",
      },
      {
        q: "What is a reasonable contingency?",
        a: "For an ordinary apartment renovation with a good survey and no structural work, a modest allowance is usually sufficient. For an old stone or masonry house, particularly one that has been empty, plan a substantial contingency and treat it as part of the budget rather than as a cushion you hope to keep. The variable is not the contractor's accuracy, it is how much of the building is still unknown when you sign.",
      },
      {
        q: "The contractor wants half up front. Is that normal?",
        a: "No, and it is not safe. A deposit should cover mobilization and the material orders that must be placed before work starts, nothing more. If a firm cannot fund the first stage of work without half the contract value, that is information about the firm. If it is genuinely about a large long lead order, pay the supplier directly for that order and keep it out of the contractor's cash flow.",
      },
      {
        q: "How do I verify a progress claim from six thousand miles away?",
        a: "By making photographs part of the claim rather than a courtesy. Each stage payment should reference the items in the computo it covers, and each of those items should carry dated photographs of the completed work. That is exactly the record a shared checklist produces as a side effect of daily use, and it is why owners who run their project as a checklist with photos attached to items argue about invoices far less than owners who run it out of a chat thread.",
      },
    ],
    template: "italy-renovation-checklist",
    related: [
      "questions-to-ask-an-italian-contractor",
      "italian-construction-terminology",
      "how-to-manage-a-renovation-in-italy-from-the-us",
      "what-is-a-geometra",
    ],
    cta: "/renovating-abroad",
    publishedAt: "2026-09-08",
  },
  {
    slug: "questions-to-ask-an-italian-contractor",
    cluster: "italy",
    title: "Questions to Ask an Italian Contractor Before You Sign",
    metaTitle: "30 Questions to Ask an Italian Contractor",
    metaDesc:
      "The questions that separate a good impresa edile from an expensive one: DURC and insurance, scope, timeline, payments, subs, warranty, and closeout documents.",
    keywords: [
      "hiring an Italian contractor",
      "impresa edile questions",
      "DURC insurance Italian builder",
      "garanzia decennale",
      "Italian construction contract checklist",
    ],
    kicker: "Italy · hiring",
    intro:
      "You are going to have one meeting, or one video call, that determines most of what happens over the next year. The instinct is to spend it talking about the work. Spend it instead on the questions below, which are about the firm, the paperwork, and the mechanics of being paid. Any competent impresa edile answers these easily and is not offended by them. The ones who bristle are telling you something useful for free.",
    blocks: [
      {
        type: "p",
        text: "Ask these in writing and keep the answers. If you are managing from abroad, the written record is the only version of the conversation that will still exist in nine months, and comparing two contractors' written answers side by side is more revealing than comparing their totals.",
      },
      { type: "h2", text: "Standing, licensing, and insurance" },
      {
        type: "ol",
        items: [
          "May I see a current DURC for your company? Why it matters: the DURC certifies the firm is up to date on social security and insurance contributions for its workers. An expired one signals cash flow trouble, and a firm without one can create problems for your filings.",
          "May I see your visura camerale? Why it matters: the registry extract shows how long the company has existed, what activities it is registered for, who can legally sign, and whether it is in liquidation. It takes minutes to read and occasionally ends the conversation.",
          "What is your partita IVA, and will every payment be invoiced? Why it matters: no VAT number means no proper invoice, no deductible cost, no warranty trail, and no legal recourse worth having.",
          "What insurance do you carry, and can I see the certificates? Why it matters: you want civil liability cover for damage to third parties and, on a substantial job, an all risks policy covering the works themselves. Verbal reassurance is not cover.",
          "Are your workers your employees, and are they registered with the construction workers fund? Why it matters: undeclared labor on your site exposes you to liability and usually indicates a price that cannot actually be delivered legally.",
          "Have you worked on buildings like this one before, in this comune? Why it matters: an old masonry house and a 1970s apartment are different trades. Local experience also means the firm knows the technical office and the local suppliers.",
          "Can you give me two references from jobs finished more than a year ago? Why it matters: recent clients are still polite. Clients from two years ago know whether the work held and whether the firm came back to fix anything.",
        ],
      },
      { type: "h2", text: "Scope and specification" },
      {
        type: "ol",
        items: [
          "Will you provide a computo metrico estimativo with quantities and unit prices? Why it matters: it is the only version of a quote you can audit, compare, and use to check progress claims.",
          "What exactly is excluded from your price? Why it matters: scaffolding, waste disposal, professional fees, VAT, utility connections, and the supply of finishes are commonly out. The exclusions decide the budget.",
          "For each finish, is it fornitura e posa or solo posa? Why it matters: supply and install means it is your contractor's problem if the material is wrong, late, or damaged. Install only means it is yours.",
          "Which brands and models are you pricing, by name? Why it matters: equivalent is not a specification. Naming the boiler, the tile, the window system, and the plaster is how you prevent a quiet substitution.",
          "What do you expect to find behind these walls, and how will we price it if you are right? Why it matters: an experienced firm has an opinion about a building. Agreeing unit rates for probable unknowns in advance avoids negotiating under pressure later.",
          "Who supplies and coordinates the windows? Why it matters: serramenti are usually the longest lead item and the most common cause of a stalled finishing sequence. Somebody has to own the measurement and the date.",
        ],
      },
      { type: "h2", text: "Timeline and site management" },
      {
        type: "ol",
        items: [
          "What is the start date, and what has to happen before it? Why it matters: a start date conditional on a permit you do not yet have is not a date. Write down the preconditions.",
          "What is the sequence, phase by phase, with durations? Why it matters: you cannot judge whether the job is late unless you agreed what on time looks like at each stage.",
          "How many of your people will be on this site, and will they be here continuously? Why it matters: small firms run several jobs at once. The honest answer is often that the crew rotates, which is fine if it is planned and disastrous if it is denied.",
          "How does August affect our schedule? Why it matters: much of Italian construction and most suppliers slow or close for weeks in August. It belongs in the plan, not in an apology.",
          "Who is the capocantiere, and can I have their name and number? Why it matters: the person who actually answers on site is rarely the person who sold you the job.",
        ],
      },
      {
        type: "callout",
        title: "Ask one hard technical question and listen to the reasoning",
        text: "Pick something specific about your building: how they intend to deal with rising damp in the ground floor wall, or how they will form the shower waterproofing, or what they will do if the floor structure is weaker than assumed. You are not testing whether you understand the answer. You are testing whether they have one, whether it is a method or a slogan, and whether they volunteer the risks. The firm that says it depends on what we find, and then explains what they would look for, is usually the better firm.",
      },
      { type: "h2", text: "Money and payments" },
      {
        type: "ol",
        items: [
          "What deposit do you need, and what specifically does it fund? Why it matters: a deposit tied to named material orders is reasonable. A deposit that is simply a share of the contract is you financing the firm.",
          "Can we tie payments to measured progress stages rather than dates? Why it matters: a calendar based schedule pays for time. A stage based schedule pays for work, which is the thing you want.",
          "Will you accept a retainage released after the punch list and the certificates? Why it matters: it is the only leverage that survives to the end of the job, which is exactly when you need leverage.",
          "How will you invoice, and at what VAT rate for each part of the work? Why it matters: the rate depends on the classification and on who supplies what. You want it settled before the first invoice, not argued afterward.",
          "If I claim an Italian tax deduction, are you set up to support the documentation? Why it matters: the payment references and invoice wording have to be right at the time of payment. It cannot be corrected retroactively.",
          "How will you price variations? Why it matters: agreeing that variations use the original unit price basis, in writing, removes the single largest source of renovation disputes.",
        ],
      },
      { type: "h2", text: "Subcontractors and coordination" },
      {
        type: "ol",
        items: [
          "Which trades will you subcontract, and to whom? Why it matters: you are entitled to know who is on your site. It also tells you whether the plumbing and electrical are core competence or an afterthought.",
          "Do your subcontractors carry their own insurance and contribution compliance? Why it matters: the same standards you applied to the main firm should apply down the chain, because the risk does not stop at the contract.",
          "Who coordinates between trades, and what happens when two of them disagree? Why it matters: on a renovation the expensive failures are almost always at handoffs, particularly between the plumber, the electrician, and the tiler.",
          "Will there be more than one company on site at the same time? Why it matters: the answer determines whether the safety coordination framework and its plans and notifications are required. Your geometra will confirm, but the contractor should raise it.",
        ],
      },
      { type: "h2", text: "Communication, since you will not be there" },
      {
        type: "ol",
        items: [
          "How will you send me progress updates, how often, and in what form? Why it matters: agree the rhythm at the start. Weekly, written, with photographs, is a reasonable ask and costs the firm ten minutes.",
          "Will you attach photographs to the specific item they document? Why it matters: fifty photos in a chat thread is not a record. Photographs attached to the checklist item they belong to are evidence you can find two years later.",
          "Who on your team can write to me in English, or how do you want to handle the language difference? Why it matters: pretending there is no language gap is how instructions get lost. Naming the mechanism, whether a bilingual contact or a shared tool that translates both directions, makes it somebody's job.",
          "How quickly will you answer a written question, and what do you do if you need a decision urgently? Why it matters: with six or more hours of time difference, an unanswered question can cost a full working day. Agree a rule for what happens when you are asleep.",
          "Will you and your trades use the project checklist I set up? Why it matters: one shared list beats parallel lists in two languages. This is the concrete thing MonthlyAlerts does, and the value is entirely in everyone actually working from the same record.",
        ],
      },
      { type: "h2", text: "Warranty and defects" },
      {
        type: "ol",
        items: [
          "What is your position on the ten year liability for serious defects? Why it matters: Italian law gives you a long liability for grave defects affecting the building's stability or essential parts, and a much shorter window for ordinary defects, with a short notice period once you discover one. Know both clocks.",
          "Is there an insurance policy behind that warranty, or only your company? Why it matters: a statutory liability against a firm that has dissolved is worth nothing. Where an insured warranty is available, ask what it covers and who the beneficiary is.",
          "What is the process if I find a defect after handover, and how fast will you return? Why it matters: for a remote owner the practical question is not liability, it is response time. Get a commitment in the contract.",
          "What manufacturer warranties come with the boiler, the windows, and the fixtures, and who registers them? Why it matters: several require registration or commissioning by an authorized installer to be valid, and nobody does it unless it is assigned.",
        ],
      },
      { type: "h2", text: "Cleanup, permits, and closeout" },
      {
        type: "ol",
        items: [
          "Who handles the permit filings, and are the professional fees in your price? Why it matters: contractors sometimes include the technician and sometimes assume you have your own. Both are fine. Unclear is not.",
          "Who is responsible for waste removal, and can you show the disposal documentation? Why it matters: construction waste is legally tracked in Italy. Dumping it is the owner's problem too, and the paperwork is cheap insurance.",
          "Is final cleaning included, and to what standard? Why it matters: builders' clean and habitable are different things, and the gap is a real cost when you are arriving from an airport with luggage.",
          "Which certificates will you hand over, and when? Why it matters: list them explicitly. Electrical conformity, gas conformity, structural sign off where applicable, product declarations, and the pressure test report. Attach the final payment to the list.",
          "Will you walk the punch list with my direttore dei lavori and sign it? Why it matters: a signed defects list dated at handover is the document that decides every later argument about whether something was damage or workmanship.",
        ],
      },
      {
        type: "p",
        text: "One last thing that is not a question. Watch how the firm behaves between the meeting and the contract. Do they send the quote when they said they would, answer the follow up email, and correct the thing you pointed out? A renovation is twelve months of exactly that behavior, repeated. The sample you get before signing is representative, and it is free.",
      },
    ],
    faq: [
      {
        q: "How many contractors should I get quotes from?",
        a: "Three is the sensible number, and all three should be pricing the same document. In a small comune you may only find two firms willing to bid, particularly if you are foreign and remote, in which case invest more in the specification and in checking the firm rather than in shopping the price.",
      },
      {
        q: "Should I use the contractor my geometra recommends?",
        a: "Often yes. A technician who files in the comune every week knows which firms finish and which do not, and a builder who has worked with your supervisor before argues less. What you should ask for is disclosure of any commercial relationship between them, and you should still get competing quotes so the recommendation is tested rather than assumed.",
      },
      {
        q: "Is a signed preventivo enough of a contract?",
        a: "It is often treated as one, which is exactly why you should not sign a thin one. If you sign a quote, assume a court would read it as the contract. Better is a short contratto d'appalto that names the parties, the price basis, the payment stages, the completion date, the variation procedure, and attaches the computo and the capitolato as annexes.",
      },
      {
        q: "What should I do if the work stalls and the contractor stops answering?",
        a: "Move immediately from informal channels to written notice, sent by your geometra or a lawyer, describing the delay and setting a deadline to resume. Do not release further payments. This is the moment when a dated record of instructions, approvals, invoices, and photographs stops being administrative diligence and becomes your entire position, so keep that record from day one rather than assembling it in a crisis.",
      },
    ],
    template: "italy-renovation-checklist",
    related: [
      "understanding-italian-renovation-estimates",
      "what-is-a-geometra",
      "how-to-manage-a-renovation-in-italy-from-the-us",
      "italian-construction-terminology",
    ],
    cta: "/renovating-abroad",
    publishedAt: "2026-09-08",
  },
  {
    slug: "renovating-a-family-property-in-italy",
    cluster: "italy",
    title: "Renovating a Family Property in Italy",
    metaTitle: "Renovating an Inherited Italian Family Property",
    metaDesc:
      "Succession, co-owners, cadastral mismatches, unpermitted work and sanatoria, heritage and rural constraints, utilities reactivation, and running it all from abroad.",
    keywords: [
      "inherited property in Italy renovation",
      "successione comproprieta",
      "abusi edilizi sanatoria",
      "vincolo paesaggistico Soprintendenza",
      "reactivate utilities Italian house",
    ],
    kicker: "Italy · inherited and ancestral homes",
    intro:
      "An inherited Italian house is a different project from a house you bought. You did not do due diligence, because nobody sells you a family property. There may be four or nine owners, several of whom you have never met. The building has almost certainly been altered over decades by people who did not file anything, and the paperwork describes a house that no longer exists. None of this is unusual and most of it is fixable. What it means is that your first phase is not design. It is establishing what you own, who else owns it, and what the state thinks is there.",
    blocks: [
      { type: "h2", text: "Start with the succession, not the survey" },
      {
        type: "p",
        text: "Italian inheritance runs through a dichiarazione di successione filed with the tax authority, normally within twelve months of the death, which also drives the transfer of the property into the heirs' names in the cadastral register. Inheritance tax in Italy is comparatively light for direct heirs, with a substantial per beneficiary allowance for a spouse and children and a low rate above it, plus mortgage and cadastral taxes calculated on cadastral values rather than market values. Rates and allowances change, so confirm the current figures with a notary or accountant rather than with a relative's memory of the 1990s.",
      },
      { type: "h3", text: "The chain problem" },
      {
        type: "p",
        text: "The recurring surprise in ancestral property is not tax, it is an unfinished chain. A grandparent dies, nobody files, the family keeps using the house, then thirty years later a grandchild wants to renovate. You cannot cleanly transact on a property whose ownership chain has a gap in it, and the fix is to file the missing successions in order, with penalties, before anything else. This is slow and it is not expensive relative to a renovation. Find out whether you have this problem in month one, because it can add a year.",
      },
      {
        type: "p",
        text: "Practical prerequisites for every heir who will be involved: an Italian codice fiscale, which non residents can obtain through the tax authority or an Italian consulate, and a decision about who will represent the group in Italy. That representation should be a written procura, a power of attorney. A power of attorney signed in the United States generally needs notarization, an apostille, and a sworn translation, or it can be executed directly at an Italian consulate, which is usually simpler.",
      },
      { type: "h2", text: "Co-ownership is a governance problem before it is a legal one" },
      {
        type: "p",
        text: "When several heirs inherit together they hold undivided shares, comproprietà, in the whole property rather than a piece each. Broadly, ordinary administration is decided by a majority measured on the value of shares, more substantial improvements require a larger majority, and selling or mortgaging requires everyone. Any co-owner can also ask for the property to be divided, amicably through a notary or, failing agreement, through a court. Get the specific thresholds for your situation from an Italian lawyer or notary, because the outcome depends on how the shares are held and on what you intend to do.",
      },
      {
        type: "p",
        text: "The practical advice is simpler than the law. Before you spend a euro, get a written agreement among the co-owners covering four things:",
      },
      {
        type: "ol",
        items: [
          "Who decides, and by what majority, on scope and budget.",
          "Who pays, in what proportion, and what happens when someone cannot or will not.",
          "Who holds the procura and signs contracts in Italy.",
          "What happens to the house afterward: shared use calendar, rental, or eventual sale.",
        ],
      },
      {
        type: "p",
        text: "Families skip this because it feels distrustful, then spend the renovation relitigating it monthly. It is also where a shared project record earns its keep: when three cousins in two countries can all see the same checklist, the same photographs, and the same budget by phase, each reading it in their own language, the arguments become arguments about the work rather than about who was told what.",
      },
      { type: "h2", text: "What the paperwork says versus what the building is" },
      {
        type: "p",
        text: "Two separate records have to match reality, and in an old family house they usually do not.",
      },
      {
        type: "ul",
        items: [
          "Conformità catastale: the cadastral plan on file should match the actual layout, surface, and category. Walls moved in 1978 and a bathroom added in 1991 are typically not on it.",
          "Conformità urbanistica: the building as it stands should match what was authorized by the comune over its history, filing by filing.",
        ],
      },
      {
        type: "p",
        text: "Both have to be declared when the property is eventually sold, so a mismatch is not a theoretical problem, it is a cost you have inherited and will pay at some point. Have a geometra pull the cadastral extract and plan, request the building file from the comune, and compare all of it against a measured survey of what is physically there. The output should be a written list of every discrepancy, classified by how serious it is. That document is the real starting point of the project.",
      },
      { type: "h2", text: "Unpermitted work and whether it can be regularized" },
      {
        type: "p",
        text: "Italian law distinguishes minor construction tolerances, which are forgiven within thresholds, from formal irregularities, from substantial unpermitted work. The regularization route most people mean when they say sanatoria requires the work to have complied with the rules both when it was built and when the application is made, and comes with a fine. That double test is why some old alterations can be regularized easily and others cannot be regularized at all.",
      },
      {
        type: "p",
        text: "Three things a geometra will check, and that you should ask about explicitly:",
      },
      {
        type: "ol",
        items: [
          "Is there an old condono application still pending? Italy ran national amnesties in the 1980s, 1990s, and 2000s, and a striking number of applications were filed, partially paid, and never concluded. A pending file has to be closed before you can move forward, and closing it is sometimes the cheapest good news in the project.",
          "Does the discrepancy involve added volume or surface in a landscape protected area? Retrospective authorization in protected areas is generally only available where no new surface or volume was created, which makes an unauthorized extension a genuinely different problem from an unauthorized internal wall.",
          "Which rules apply today? The tolerance thresholds and the regularization procedures were revised significantly in 2024, and the interpretation varies by region and comune. Anything you read about this, here included, needs confirmation against the current text by your technician.",
        ],
      },
      {
        type: "callout",
        title: "Pay for due diligence before you pay for design",
        text: "Commission a written technical due diligence report on the property as your first spend: cadastral position, permit history, discrepancies, constraints on the parcel, condition of structure and roof, and the state of the utility connections. It costs a fraction of a design fee. Foreign owners routinely commission drawings for a renovation that the constraints on the parcel will never permit, and then pay for the drawings twice.",
      },
      { type: "h2", text: "Rural and historic constraints" },
      {
        type: "p",
        text: "The romance of a stone house in the hills is inseparable from the rules that kept the hills looking like that.",
      },
      {
        type: "ul",
        items: [
          "Vincolo paesaggistico: landscape protection covering large areas of Italy, particularly coasts, lake shores, river corridors, woodland, and mountain zones. It triggers a separate landscape authorization on top of your building filing, with a simplified route for minor works and a longer route for the rest.",
          "Buildings of cultural interest: where the building itself is protected, works require the Soprintendenza's authorization, and a sale can trigger the state's right of first refusal. This changes both your timeline and your exit.",
          "Historic centre rules: many comuni prescribe roof tile type, render finish, paint colours from an approved range, window materials and profiles, and shutter type. Assume you cannot install the aluminium windows you were considering.",
          "Agricultural buildings: a barn or annex is not automatically convertible into a dwelling. Changing the use of a rural outbuilding can be restricted or prohibited depending on the zoning and on the parcel's agricultural status.",
          "Hydrogeological constraint: common in hill and mountain areas, it adds an authorization for earthworks, retaining walls, and drainage.",
          "Access and services: family properties often rely on arrangements nobody wrote down, a track across a neighbour's land, a shared well, a drain of uncertain destination. Establish the legal basis for access, water, and drainage before you commit to a design that depends on them.",
        ],
      },
      {
        type: "p",
        text: "Where there is no mains drainage you will be dealing with a settlement tank and dispersal system rather than a sewer connection, and the sizing and authorization are part of the permit package. Where the water comes from a well, expect a concession or authorization requirement and a water quality test if it will serve a dwelling.",
      },
      { type: "h2", text: "Turning the utilities back on" },
      {
        type: "p",
        text: "A house that has been empty for years is not simply unheated, it is administratively closed. Do this early, because a site without power and water is a site without work.",
      },
      {
        type: "ol",
        items: [
          "Find the POD code for electricity and the PDR for gas on any old bill. They identify the physical connection and every request needs them.",
          "If the old contract was closed, request a subentro. If the meter was physically removed, which happens after long dormancy, you need a new connection, which is slower and materially more expensive.",
          "Expect gas reactivation to require a safety verification, and possibly the installer's conformity declaration, before the supply is restored.",
          "Water is usually a municipal or local operator rather than a national one. Contact them directly, and budget for a plumber to prove the internal system holds pressure before it is recharged, because a decade old pipe run frequently does not.",
          "If the electrical installation has no documentation, ask whether a retrospective declaration of conformity is possible for the existing system or whether it needs replacing. Both are normal outcomes; the difference is thousands of euros.",
          "Register for the local waste charge and check the property tax position. A second home pays municipal property tax, and a building recorded as structurally unusable is taxed differently from a habitable one, which occasionally matters during a long renovation.",
        ],
      },
      { type: "h2", text: "Tax residency and reporting, briefly" },
      {
        type: "p",
        text: "Two points, both of which need a professional rather than an article. Spending enough time in Italy, broadly more than half the year, can make you Italian tax resident with consequences for your worldwide income, so if the renovation is a prelude to living there, get advice before you change your habits rather than after. And as a US person you remain subject to US reporting wherever you live, including reporting of foreign financial accounts once balances cross the threshold, which is relevant the moment you open an Italian bank account to pay contractors. Find a cross border accountant who works with both systems before the first transfer, not at the following April.",
      },
      { type: "h2", text: "Running it from abroad" },
      {
        type: "p",
        text: "Everything in the general remote renovation playbook applies here, with two additions specific to family property. First, you need eyes that are not the contractor's: a geometra as direttore dei lavori at minimum, and ideally a relative or neighbour who will walk through and take photographs when asked. Second, you have an audience. Co-owners who are not paying attention today will have opinions later, and the cheapest way to prevent that is a record they could have read all along.",
      },
      {
        type: "p",
        text: "That is the practical case for keeping the whole thing on one shared checklist rather than in a chat thread: the Italian speaking geometra writes in Italian, the American cousins read English, photographs attach to the item they document, and everyone gets the same monthly summary in their own language. Nobody has to be the translator, and nobody gets to say they were not told.",
      },
    ],
    faq: [
      {
        q: "Can one heir renovate without the agreement of the others?",
        a: "Not safely. Even where a majority can authorize ordinary work, a co-owner who did not agree can object to changes affecting the shared property, and you will have spent the money by the time that surfaces. Get written consent from all co-owners for the scope and the budget, and a power of attorney for whoever signs contracts. Where relations are already difficult, ask a notary about formally dividing the property first.",
      },
      {
        q: "The cadastral plan does not match the house. How serious is that?",
        a: "It ranges from a routine update to a genuine obstacle. If the layout was changed by works that were authorized at the time and simply never reflected in the cadastre, a geometra files an update and it is done. If the works were never authorized at all, you are in regularization territory, and the answer depends on what was done, when, and whether the parcel is protected. Either way it has to be resolved before a sale, so resolving it during the renovation is efficient.",
      },
      {
        q: "Is it cheaper to renovate a family house than to buy a renovated one?",
        a: "Frequently not, in pure financial terms, especially for a rural stone building with no documentation and no working services. What you are buying is the specific house, in the specific village, with the family history attached, and that is a legitimate reason. Just do the arithmetic honestly, including the paperwork, the systems, the roof, and the year of authorizations, before deciding it is the frugal option.",
      },
      {
        q: "What if a co-owner cannot be found?",
        a: "This happens, particularly with emigrant families spread across several countries and generations. There are legal mechanisms for dealing with absent or untraceable co-owners, but they run through a lawyer and a court rather than through a builder. Start that process in parallel with everything else, because it is measured in months at best.",
      },
      {
        q: "Do I need an Italian bank account?",
        a: "In practice it makes everything easier. Contractors expect domestic transfers, the referenced transfer format required for tax deductions is built into Italian banking, utilities want a direct debit, and international transfer fees on a year of progress payments add up. Non residents can open accounts, though the documentation requirements are heavier, and be aware of your US reporting obligations once the account exists.",
      },
    ],
    template: "italy-renovation-checklist",
    related: [
      "how-to-manage-a-renovation-in-italy-from-the-us",
      "what-is-a-geometra",
      "italian-vs-american-electrical-systems",
      "italian-construction-terminology",
    ],
    cta: "/renovating-abroad",
    publishedAt: "2026-09-08",
  },
  {
    slug: "italian-kitchen-and-bathroom-renovation-checklist",
    cluster: "italy",
    title: "Italian Kitchen and Bathroom Renovation Checklist",
    metaTitle: "Italian Kitchen & Bathroom Renovation Checklist",
    metaDesc:
      "A phase by phase checklist for Italian kitchens and bathrooms: demolition, rough-in, screed and waterproofing, tiling, fixtures, 60cm modules, bidets, hood venting, handover.",
    keywords: [
      "Italian bathroom renovation checklist",
      "Italian kitchen renovation phases",
      "bidet requirement Italy bathroom",
      "60cm kitchen modules Italy",
      "massetto guaina waterproofing screed",
    ],
    kicker: "Italy · kitchens and bathrooms",
    intro:
      "Kitchens and bathrooms are where an Italian renovation gets expensive, where the trades collide, and where a remote owner has the least ability to catch a mistake before it is buried. They are also the two rooms where Italian standards and Italian dimensions differ most from American ones. This is the phased version: what happens in what order, what to decide before it happens, and what to photograph before it disappears.",
    blocks: [
      { type: "h2", text: "Phase 0: decisions that must be made before anyone swings a hammer" },
      {
        type: "p",
        text: "Almost every kitchen and bathroom disaster is a decision made too late. The rough-in fixes the position of every drain, every water line, and every outlet, and it happens in week two.",
      },
      {
        type: "ol",
        items: [
          "Confirm the permit classification with your geometra. Moving a bathroom, adding one, or altering a wall changes the filing.",
          "Locate the soil stack. Where the colonna di scarico runs largely determines where a WC can go, and how far a fixture can be moved before you need a pump.",
          "Decide gas or induction for cooking, because the answer changes the ventilation, the flue, the electrical supply, and possibly your supply contract.",
          "Decide ducted or recirculating extraction, and if ducted, agree the route and the external outlet with whoever controls the facade.",
          "Choose the actual fixtures, by brand and model code, and get their technical sheets. Rough-in dimensions come from the sheet, not from a category.",
          "Choose the tile, including format and joint width, since large formats need flatter substrates and different adhesive.",
          "Order the long lead items. Italian kitchen furniture, custom joinery, and specific sanitaryware are commonly weeks to a couple of months out, and the finishing sequence stalls without them.",
          "Mark every socket, switch, light, and towel warmer position on a drawing and have the electrician sign it.",
        ],
      },
      { type: "h2", text: "Italian specifics you will not expect" },
      { type: "h3", text: "The bidet" },
      {
        type: "p",
        text: "Italian hygiene rules dating from the 1970s require a dwelling's bathroom to be equipped with a WC, a bidet, a washbasin, and a bath or shower, and the requirement is enforced through each comune's building and hygiene regulation. In practice that means at least one bathroom in the dwelling is generally expected to have a bidet, and your technician will design accordingly. If you genuinely do not want one, ask your geometra what the local regulation says before you delete it from the plan, and get the answer in writing. It is a cheap fixture and an expensive omission if it blocks your occupancy paperwork.",
      },
      { type: "h3", text: "Dimensions and ventilation" },
      {
        type: "table",
        headers: ["Item", "Italian norm", "Why it matters to you"],
        rows: [
          [
            "Kitchen base units",
            "60 cm deep, widths in 15 cm steps, worktop around 90 cm high",
            "American appliances and cabinet sizes will not fit the run",
          ],
          [
            "Built in appliances",
            "60 cm oven and dishwasher, 45 cm slim dishwasher, hobs 60, 75 or 90 cm",
            "Buy appliances before the joinery is cut, not after",
          ],
          [
            "Wall hung WC and bidet",
            "Fixing centres commonly 180 or 230 mm, on a concealed frame",
            "The frame and cistern add roughly 15 to 20 cm of wall depth to the room",
          ],
          [
            "WC and bidet spacing",
            "Allow around 35 to 40 cm between centres, and clear space to any side wall",
            "Tight spacing is the most common complaint about finished Italian bathrooms",
          ],
          [
            "Ceiling heights and room minimums",
            "Traditionally 2.70 m for habitable rooms, lower for bathrooms and corridors",
            "Minimums were relaxed for certain recovery works in 2024; confirm locally",
          ],
          [
            "Windowless bathroom",
            "Requires mechanical extraction to a specified performance",
            "A bagno cieco is legal, but the fan is not optional and needs a duct route",
          ],
        ],
      },
      { type: "h2", text: "Phase 1: demolition and strip out" },
      {
        type: "ol",
        items: [
          "Protect what stays: floors elsewhere in the property, the stair, the entrance, and any original element you intend to keep.",
          "Isolate services and prove they are isolated before anyone cuts. Old Italian plumbing often has no local shut off valve.",
          "Strip finishes, remove fixtures, and take out the old screed where new services will run.",
          "Investigate what appears. Damp at the base of a wall, a floor structure weaker than assumed, or a drain going somewhere unexpected all get priced now, not later.",
          "Photograph the empty room from every corner, with a tape measure visible for the key dimensions, and record the exact position of the soil stack and any existing vent.",
          "Confirm waste is going to a licensed facility, and keep the disposal documentation.",
        ],
      },
      { type: "h2", text: "Phase 2: plumbing and electrical rough-in" },
      {
        type: "ol",
        items: [
          "Set out the fixture positions physically on the floor and walls, and check them against the technical sheets before anything is chased in.",
          "Chase the walls, run the conduit, and fit the wall boxes. Italian wiring is pulled through corrugated conduit into standardized boxes, which is what makes changes afterward a masonry job.",
          "Run water lines with a shut off valve at each fixture, and use inspectable traps so a blockage does not become demolition.",
          "Set drain falls and confirm the WC drain position against the specific model, not a generic dimension.",
          "In the bathroom, respect the electrical zones around the bath and shower: no sockets inside the prescribed zones, appropriate ingress protection for anything within them, and supplementary bonding as your electrician specifies.",
          "Add the circuits the kitchen actually needs: separate supplies for the hob, oven, dishwasher, and washing machine rather than one shared ring.",
          "Pressure test the plumbing and hold it, then photograph the gauge with the date. Do not allow anything to be covered before this test.",
          "Photograph every open wall, wide enough to read the whole layout, before plaster or boarding.",
        ],
      },
      { type: "h2", text: "Phase 3: waterproofing and screed" },
      {
        type: "ol",
        items: [
          "Form the screed with the correct fall to the drains, particularly for a flush shower where the fall is the only thing keeping water off your floor.",
          "Apply the waterproofing system across the whole wet area: the shower floor, up the shower walls to full height, and a band at the base of the surrounding walls, with reinforcing tape at every corner and junction and a collar at the drain.",
          "Detail the door threshold and any pipe penetration explicitly. These two points are where most leaks originate.",
          "Flood test the shower floor if the system allows it, and photograph the standing water and the ceiling below afterward.",
          "If underfloor heating is being installed, complete the commissioning heat up cycle before tiling, not after.",
          "Measure residual moisture in the screed before laying tile. Do not accept the calendar as evidence.",
        ],
      },
      {
        type: "callout",
        title: "The screed sets your schedule, not the contractor",
        text: "A traditional sand and cement screed is commonly reckoned at roughly one week of drying per centimetre of thickness before tile goes down, which on a normal residential thickness is weeks, not days. Fast setting and additivated screeds shorten this substantially and are worth specifying if the schedule is tight. What you must not do is let anyone tile over a wet screed to hold a date. The failures show up months later as lifted tile, cracked grout, and moisture through the ceiling below, and by then the argument about whose fault it was is unwinnable. Ask for the residual moisture reading, in writing, before tiling starts.",
      },
      { type: "h2", text: "Phase 4: tiling and plaster" },
      {
        type: "ol",
        items: [
          "Agree the setting out before the first tile: where the pattern starts, where cuts land, how the floor meets the wall, and how the shower tiles align.",
          "Check the delivered tile against the order, including the batch, and confirm there is enough of the same batch to finish plus a spare box for later repairs.",
          "Use the adhesive class the tile and substrate require, particularly for large format porcelain and for anything over waterproofing or underfloor heating.",
          "Grout in the specified colour and joint width, and use a flexible sealant rather than grout at every movement joint and internal corner in the shower.",
          "Plaster and skim the remaining surfaces, then let them dry before paint. In an unheated house in winter this takes longer than anyone plans for.",
          "Photograph the finished surfaces, and separately photograph the shower before and after the first use.",
        ],
      },
      { type: "h2", text: "Phase 5: bathroom fixtures and fittings" },
      {
        type: "ol",
        items: [
          "Install sanitaryware, taps, and the shower enclosure, checking the enclosure against the finished opening rather than the drawing.",
          "Fit the concealed cistern access panel and confirm the flush plate is serviceable without breaking tile.",
          "Install the towel warmer or radiator, and confirm it is actually connected to the heating circuit rather than left as decoration.",
          "Fit extraction if the room has no window, and verify it moves air with the door closed, which is where undersized installations fail.",
          "Seal around the bath, the shower tray, and the basin with sanitary grade sealant, and check every waste for leaks under running water rather than a trickle.",
          "Confirm hot water arrives at every outlet at a sensible temperature and pressure, and consider a water softener if you are anywhere with hard water, which is most of Italy.",
        ],
      },
      { type: "h2", text: "Phase 6: kitchen installation" },
      {
        type: "ol",
        items: [
          "Confirm final measurements on site before the furniture is cut, after plaster and tile, since 10 mm matters in a 60 cm module.",
          "Set the units and level them, then template the worktop. Stone worktops are templated on the installed carcasses, which is a separate visit and a lead time of its own.",
          "Install the sink and tap, and confirm the waste and any dishwasher connection are accessible after the units are closed up.",
          "For a gas hob, the installation needs a permanent ventilation opening sized for the appliance and the gas type, correct clearances, and a tightness test, all documented by the installing firm.",
          "For induction, confirm the dedicated circuit, set the appliance's power limiter to match your supply contract, and check your pans are actually magnetic before deciding the hob is faulty.",
          "Install the hood. Ducted to the outside is the better outcome, with a short duct, few bends, and an outlet you are permitted to make. Never connect a hood into a flue that serves a combustion appliance.",
          "Fit appliances, register the warranties, and keep the manuals in one place with the rest of the project documents.",
          "Adjust doors and drawers after a week of use, once the room has settled and the furniture has moved.",
        ],
      },
      { type: "h2", text: "Phase 7: inspections, certificates, and handover" },
      {
        type: "ol",
        items: [
          "Collect the electrical dichiarazione di conformita with its annexes, and the gas conformity declaration where gas work was done.",
          "Collect the plumbing pressure test record and any waterproofing product documentation.",
          "Have your direttore dei lavori inspect and confirm the work matches the authorized project.",
          "Walk a punch list with the contractor, in writing, with a photograph of each item, and get it signed and dated by both sides.",
          "Confirm the cadastral update where the layout changed, and the occupancy filing where the works trigger it.",
          "Release the retainage only after the punch list is closed and every certificate is in your hands.",
          "Photograph the finished rooms and archive the whole record: drawings, invoices, certificates, product codes, and the tile batch number. Your future self, or the buyer's surveyor, will need it.",
        ],
      },
      {
        type: "p",
        text: "None of these phases is complicated in isolation. What makes kitchens and bathrooms hard from six thousand miles away is that the handoffs between plumber, electrician, tiler, and kitchen fitter all happen in a three week window, and each one buries the previous one's work. If you track the phases as items with due dates and photographs attached, and read a monthly summary of what closed and what slipped, you will catch the problems while they are still cheap. That, rather than any single technical detail, is what decides how these two rooms turn out.",
      },
    ],
    faq: [
      {
        q: "Do I really have to install a bidet?",
        a: "Italian hygiene regulations from the 1970s list the bidet among the required fixtures for a dwelling's bathroom, and enforcement runs through the municipal building and hygiene regulation, so the practical answer in most comuni is that at least one bathroom should have one. Ask your geometra for the local position in writing before omitting it. Where you have several bathrooms there is usually more flexibility for the additional ones.",
      },
      {
        q: "Can I put a bathroom anywhere in the apartment?",
        a: "Physically, with enough money and possibly a macerating pump, often yes. Practically, the soil stack position decides how easy it is, since a WC needs a short run with adequate fall. Adding a bathroom may also change your permit classification and, in an apartment building, may run into rules about penetrating structure or routing waste through common parts. Ask before you draw.",
      },
      {
        q: "Gas or induction in an Italian kitchen?",
        a: "Induction if your electrical supply can support it, which usually means raising the contracted power above the standard 3 kW and running a dedicated circuit. Gas avoids the electrical upgrade but brings its own requirements: a permanent ventilation opening, clearances, a tightness test, and a conformity declaration, plus care about how a ducted hood interacts with any open flue appliance in the same room. Decide before rough-in, because the two answers need different infrastructure.",
      },
      {
        q: "Why is my Italian bathroom so much smaller than the plan suggested?",
        a: "Usually the concealed cistern. A wall hung WC and bidet sit on a frame that is boxed out, and that box takes 15 to 20 centimetres off the room dimension. Tiled walls add a further layer, and a shower enclosure needs clearance to open. Check the plan against the finished dimensions, not the structural ones, before you commit to a layout.",
      },
      {
        q: "How do I keep the trades coordinated when I am not there?",
        a: "Sequence the work as items with owners and due dates, and require photographs at the moments where one trade covers another's work: rough-in before plaster, waterproofing before tile, screed before flooring. Make the handoff itself an item, so the tiler's start date depends on a screed moisture reading rather than on a phone call. A shared checklist each person reads in their own language, with a monthly status email, does this without anyone having to translate anything.",
      },
    ],
    template: "italy-renovation-checklist",
    related: [
      "italian-vs-american-electrical-systems",
      "italian-construction-terminology",
      "understanding-italian-renovation-estimates",
      "how-to-manage-a-renovation-in-italy-from-the-us",
    ],
    cta: "/renovating-abroad",
    publishedAt: "2026-09-08",
  },
];
