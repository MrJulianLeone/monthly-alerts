import type { Metadata } from "next";
import {
  AudienceBand,
  FeatureGrid,
  MarketCrossLinks,
  MarketingHero,
  MarketingShell,
  PricingCta,
  TranslationDemo,
} from "@/components/marketing";
import type { Lang } from "@/lib/i18n";
import { SITE_URL, localeAlternates, localePath } from "@/lib/seo";

const PAGE_PATH = "/renovating-abroad";

type Copy = {
  metaTitle: string;
  metaDesc: string;
  kicker: string;
  title: string;
  sub: string;
  zonesTitle: string;
  zonesP1: string;
  zonesP2: string;
  demoLabel: string;
  demoRows: { code: string; text: string }[];
  features: { title: string; body: string }[];
  audienceTitle: string;
  audience: string[];
  audienceNote: string;
  pricingBlurb: string;
};

const COPY: Record<Lang, Copy> = {
  en: {
    metaTitle: "Renovating a Home Abroad — One Checklist in Every Language — MonthlyAlerts",
    metaDesc:
      "You work in English. Your contractor abroad works in Italian or Spanish. Everyone sees the same renovation checklist, translated automatically — with photos, budgets, and a monthly status email.",
    kicker: "EN ⇄ IT ⇄ ES — Renovating abroad",
    title: "Renovating a home abroad?",
    sub: "You work in English. Your contractor works in Italian or Spanish. Everyone sees the same project — one checklist, translated automatically.",
    zonesTitle: "Six time zones, one list",
    zonesP1:
      "Running an overseas renovation over WhatsApp and Google Translate means instructions garbled in both directions, and decisions buried in chat history nobody can find.",
    zonesP2:
      "On MonthlyAlerts you write each task in English; your builder, surveyor, and crew read it in their language — and their questions, comments, and photo captions come back to you in English. You wake up to progress you can actually read.",
    demoLabel: "You write it — your contractor reads it in their language",
    demoRows: [
      {
        code: "EN",
        text: "Confirm the window measurements with the carpenter before ordering.",
      },
      {
        code: "IT",
        text: "Confermare le misure delle finestre con il falegname prima di ordinare.",
      },
    ],
    features: [
      {
        title: "Photos are your site visit",
        body: "Your crew attaches photos to checklist items as work happens. You see exactly what got done this week without flying over — and you have a record of it for the next two years.",
      },
      {
        title: "A template made for this",
        body: "Start from the overseas-renovation template: purchase and due diligence, permits and approvals, structural work, systems, finishes, utilities, and handover.",
      },
      {
        title: "A monthly report, automatically",
        body: "Every member gets a monthly status email in their own language — progress, completed work, and overdue items. You stay current; your contractor writes nothing extra.",
      },
    ],
    audienceTitle: "Who uses it",
    audience: [
      "Americans buying homes abroad",
      "Families renovating ancestral property",
      "Second-home owners",
      "Property management companies",
      "Architects with international clients",
      "Local surveyors & geometri",
      "Agencies selling to foreign buyers",
      "Contractors serving foreign homeowners",
    ],
    audienceNote:
      "English, Italian, and Spanish today — more languages to come. And it works both ways: local professionals invite their foreign clients and work in their own language while the client reads theirs. The same project can carry all three languages at once.",
    pricingBlurb:
      "One-time fee when you create a project — no subscription. Unlimited checklist items and photos, per-phase budgets in euros or dollars, and everyone you invite — builder, surveyor, family — joins free in their own language.",
  },
  it: {
    metaTitle: "Cantieri con clienti all'estero — checklist multilingue — MonthlyAlerts",
    metaDesc:
      "Il tuo cliente lavora in inglese o spagnolo, tu in italiano. Tutti vedono la stessa lista di progetto, tradotta automaticamente — con foto, budget ed email mensile di stato.",
    kicker: "EN ⇄ IT ⇄ ES — Ristrutturare dall'estero",
    title: "Clienti all'estero, cantiere qui?",
    sub: "Il tuo cliente lavora in inglese o spagnolo. Tu e i tuoi artigiani lavorate in italiano. Tutti vedono lo stesso progetto — una sola lista, tradotta automaticamente.",
    zonesTitle: "Sei fusi orari, una sola lista",
    zonesP1:
      "Gestire un cantiere con un cliente all'estero via WhatsApp e Google Translate significa istruzioni distorte in entrambe le direzioni e decisioni sepolte in chat che nessuno ritrova.",
    zonesP2:
      "Su MonthlyAlerts il cliente scrive nella sua lingua; tu, il geometra e gli artigiani leggete tutto in italiano — e le vostre domande, commenti e didascalie delle foto gli arrivano tradotti. Ognuno legge il progetto nella propria lingua.",
    demoLabel: "Il cliente lo scrive — tu lo leggi in italiano",
    demoRows: [
      {
        code: "EN",
        text: "Confirm the window measurements with the carpenter before ordering.",
      },
      {
        code: "IT",
        text: "Confermare le misure delle finestre con il falegname prima di ordinare.",
      },
    ],
    features: [
      {
        title: "Le foto sono il sopralluogo",
        body: "La squadra allega foto alle voci della lista man mano che il lavoro procede. Il cliente vede esattamente cosa è stato fatto senza prendere un aereo — e resta tutto documentato per due anni.",
      },
      {
        title: "Un modello fatto apposta",
        body: "Parti dal modello per ristrutturazioni dall'estero: acquisto e verifiche, permessi e pratiche, opere strutturali, impianti, finiture, utenze e consegna.",
      },
      {
        title: "Un report mensile, automatico",
        body: "Ogni membro riceve un'email mensile di stato nella propria lingua — avanzamento, lavori completati e voci in ritardo. Il cliente è sempre aggiornato; tu non scrivi nulla in più.",
      },
    ],
    audienceTitle: "Chi lo usa",
    audience: [
      "Stranieri che comprano casa in Italia",
      "Famiglie che ristrutturano case di origine",
      "Proprietari di seconde case",
      "Società di gestione immobiliare",
      "Architetti con clienti internazionali",
      "Geometri",
      "Agenzie che vendono a compratori esteri",
      "Imprese con clienti stranieri",
    ],
    audienceNote:
      "Oggi inglese, italiano e spagnolo — e altre lingue in arrivo. Funziona in entrambe le direzioni: i professionisti locali invitano i clienti esteri e lavorano nella propria lingua mentre il cliente legge nella sua. Lo stesso progetto può avere tutte e tre le lingue insieme.",
    pricingBlurb:
      "Tariffa una tantum alla creazione del progetto — nessun abbonamento. Voci e foto illimitate, budget per fase in euro o dollari, e tutti gli invitati — impresa, geometra, famiglia — partecipano gratis nella propria lingua.",
  },
  es: {
    metaTitle:
      "Renovar una casa en el extranjero — una lista en todos los idiomas — MonthlyAlerts",
    metaDesc:
      "Tú trabajas en español; tu contratista en italiano o inglés. Todos ven la misma lista de renovación, traducida automáticamente — con fotos, presupuestos y un correo mensual de estado.",
    kicker: "EN ⇄ IT ⇄ ES — Renovar en el extranjero",
    title: "¿Renovando una casa en el extranjero?",
    sub: "Tú trabajas en español. Tu contratista trabaja en italiano o en inglés. Todos ven el mismo proyecto — una sola lista, traducida automáticamente.",
    zonesTitle: "Seis husos horarios, una sola lista",
    zonesP1:
      "Manejar una renovación en el extranjero por WhatsApp y Google Translate significa instrucciones distorsionadas en ambas direcciones y decisiones enterradas en un chat que nadie encuentra.",
    zonesP2:
      "En MonthlyAlerts escribes cada tarea en tu idioma; tu constructor, tu perito y la cuadrilla la leen en el suyo — y sus preguntas, comentarios y leyendas de fotos te llegan traducidos. Despiertas con avances que sí puedes leer.",
    demoLabel: "Tú lo escribes — tu contratista lo lee en su idioma",
    demoRows: [
      {
        code: "ES",
        text: "Confirmar las medidas de las ventanas con el carpintero antes de ordenar.",
      },
      {
        code: "IT",
        text: "Confermare le misure delle finestre con il falegname prima di ordinare.",
      },
    ],
    features: [
      {
        title: "Las fotos son tu visita de obra",
        body: "La cuadrilla adjunta fotos a las tareas conforme avanza el trabajo. Ves exactamente qué se hizo esta semana sin cruzar el océano — y queda registrado durante dos años.",
      },
      {
        title: "Una plantilla hecha para esto",
        body: "Empieza con la plantilla de renovación en el extranjero: compra y verificaciones, permisos y trámites, obra estructural, instalaciones, acabados, servicios y entrega.",
      },
      {
        title: "Un informe mensual, automático",
        body: "Cada miembro recibe un correo mensual de estado en su idioma — avance, trabajo completado y tareas atrasadas. Tú te mantienes al día; tu contratista no escribe nada extra.",
      },
    ],
    audienceTitle: "Quién lo usa",
    audience: [
      "Compradores de vivienda en el extranjero",
      "Familias que renuevan propiedades de origen",
      "Dueños de segunda vivienda",
      "Administradoras de propiedades",
      "Arquitectos con clientes internacionales",
      "Peritos y técnicos locales",
      "Agencias que venden a compradores extranjeros",
      "Contratistas con clientes extranjeros",
    ],
    audienceNote:
      "Hoy inglés, italiano y español — y más idiomas en camino. Funciona en ambos sentidos: los profesionales locales invitan a sus clientes extranjeros y trabajan en su propio idioma mientras el cliente lee en el suyo. El mismo proyecto puede llevar los tres idiomas a la vez.",
    pricingBlurb:
      "Pago único al crear el proyecto — sin suscripción. Tareas y fotos ilimitadas, presupuestos por fase en euros o dólares, y todos tus invitados — constructor, perito, familia — participan gratis en su idioma.",
  },
};

export function renovatingAbroadMetadata(lang: Lang): Metadata {
  const c = COPY[lang];
  const url = SITE_URL + localePath(lang, PAGE_PATH);
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    keywords: [
      "renovating abroad",
      "overseas renovation checklist",
      "renovating a house in Italy",
      "managing foreign contractor remotely",
      "English Italian renovation checklist",
      "English Spanish renovation checklist",
      "international renovation project management",
    ],
    alternates: localeAlternates(lang, PAGE_PATH),
    openGraph: { title: c.metaTitle, description: c.metaDesc, url },
  };
}

export function RenovatingAbroadPage({ lang }: { lang: Lang }) {
  const c = COPY[lang];

  return (
    <MarketingShell lang={lang} basePath={PAGE_PATH}>
      <MarketingHero lang={lang} kicker={c.kicker} title={c.title} sub={c.sub} />

      <section className="border-b-[1.5px] border-line-strong bg-sheet">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 grid sm:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="display text-4xl mb-4">{c.zonesTitle}</h2>
            <p className="text-sm text-ink-soft leading-relaxed mb-4">{c.zonesP1}</p>
            <p className="text-sm text-ink-soft leading-relaxed">{c.zonesP2}</p>
          </div>
          <TranslationDemo label={c.demoLabel} rows={c.demoRows} />
        </div>
      </section>

      <FeatureGrid features={c.features} />

      <AudienceBand title={c.audienceTitle} items={c.audience} note={c.audienceNote} />

      <PricingCta lang={lang} blurb={c.pricingBlurb} />

      <MarketCrossLinks lang={lang} current="/renovating-abroad" />
    </MarketingShell>
  );
}
