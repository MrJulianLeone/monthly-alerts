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

const PAGE_PATH = "/for-contractors";

type Copy = {
  metaTitle: string;
  metaDesc: string;
  kicker: string;
  title: string;
  sub: string;
  onceTitle: string;
  onceP1: string;
  onceP2: string;
  demoLabel: string;
  features: { title: string; body: string }[];
  audienceTitle: string;
  audience: string[];
  audienceNote: string;
  pricingBlurb: string;
};

const COPY: Record<Lang, Copy> = {
  en: {
    metaTitle:
      "Construction Checklists for Contractors with Spanish-Speaking Crews — MonthlyAlerts",
    metaDesc:
      "Stop translating your project through text messages. Write the punch list in English; your foreman and subs work it in Spanish — translated automatically. One-time fee per project.",
    kicker: "EN ⇄ ES — For remodeling contractors",
    title: "Stop translating your project through text messages.",
    sub: "You write the punch list in English. Your foreman and subs work it in Spanish — the same list, translated automatically, on any phone.",
    onceTitle: "Type it once. Everyone reads it.",
    onceP1:
      "The homeowner reads English. Your crew reads Spanish. Today that means you re-typing every instruction into a group text and hoping nothing gets lost between languages.",
    onceP2:
      "On MonthlyAlerts you add each item to the project checklist once, in your language. Every member — homeowner, foreman, sub, inspector — sees it in theirs, along with every comment and photo caption.",
    demoLabel: "You type it — your crew sees it instantly",
    features: [
      {
        title: "No more group-text telephone",
        body: "Items, comments, due dates, and photo captions are translated for each member automatically. Nobody re-types anything, and nothing gets lost between English and Spanish.",
      },
      {
        title: "Templates for your trade",
        body: "Kitchen and bath remodels, painting, roofing, landscaping, full renovations — start every job from a phase-by-phase checklist and adjust it to the site.",
      },
      {
        title: "The homeowner stays informed",
        body: "Every member gets a monthly status email in their language: what got done, what's new, what's overdue. Fewer check-in calls, fewer surprises.",
      },
    ],
    audienceTitle: "Built for residential crews",
    audience: [
      "General contractors",
      "Kitchen & bath remodelers",
      "Landscapers",
      "Painting contractors",
      "Tile contractors",
      "Roofing contractors",
      "Design/build firms",
      "Construction managers",
    ],
    audienceNote:
      "MonthlyAlerts is made for companies running ten to a hundred residential projects a year — not enterprise construction software. If your project management currently lives in text messages, this is for you.",
    pricingBlurb:
      "One-time fee when you create a project — no subscription, no per-seat charges. Unlimited checklist items and photos, and your whole crew of subs and inspectors joins free, each in their own language.",
  },
  it: {
    metaTitle:
      "Liste di cantiere bilingui per imprese con squadre ispanofone — MonthlyAlerts",
    metaDesc:
      "Smetti di tradurre il progetto via messaggi. Scrivi la punch list in inglese; la squadra la lavora in spagnolo, tradotta automaticamente. Tariffa una tantum a progetto.",
    kicker: "EN ⇄ ES — Per imprese di ristrutturazione",
    title: "Smetti di tradurre il tuo progetto via messaggi.",
    sub: "Tu scrivi la punch list in inglese. Il tuo caposquadra e i subappaltatori la lavorano in spagnolo — la stessa lista, tradotta automaticamente, su qualsiasi telefono.",
    onceTitle: "Scrivilo una volta. Lo leggono tutti.",
    onceP1:
      "Il proprietario legge l'inglese. La tua squadra legge lo spagnolo. Oggi questo significa ribattere ogni istruzione in una chat di gruppo sperando che nulla si perda tra le lingue.",
    onceP2:
      "Su MonthlyAlerts aggiungi ogni voce alla lista di progetto una sola volta, nella tua lingua. Ogni membro — proprietario, caposquadra, subappaltatore, ispettore — la vede nella propria, insieme a ogni commento e didascalia delle foto.",
    demoLabel: "Tu lo scrivi — la tua squadra lo vede all'istante",
    features: [
      {
        title: "Basta telefono senza fili in chat",
        body: "Voci, commenti, scadenze e didascalie delle foto vengono tradotti automaticamente per ogni membro. Nessuno ribatte nulla e niente si perde tra inglese e spagnolo.",
      },
      {
        title: "Modelli per il tuo mestiere",
        body: "Rifacimenti di cucine e bagni, tinteggiatura, tetti, sistemazioni esterne, ristrutturazioni complete — inizia ogni lavoro da una lista fase per fase e adattala al cantiere.",
      },
      {
        title: "Il proprietario resta informato",
        body: "Ogni membro riceve un'email mensile di stato nella propria lingua: cosa è stato fatto, cosa c'è di nuovo, cosa è in ritardo. Meno telefonate di controllo, meno sorprese.",
      },
    ],
    audienceTitle: "Pensato per squadre residenziali",
    audience: [
      "Imprese edili generali",
      "Rifacimenti di cucine e bagni",
      "Paesaggisti",
      "Imbianchini",
      "Piastrellisti",
      "Imprese di coperture",
      "Studi design/build",
      "Responsabili di cantiere",
    ],
    audienceNote:
      "MonthlyAlerts è fatto per aziende che seguono da dieci a cento progetti residenziali l'anno — non è un software enterprise per l'edilizia. Se la gestione dei tuoi progetti oggi vive nei messaggi, è fatto per te.",
    pricingBlurb:
      "Tariffa una tantum alla creazione del progetto — nessun abbonamento, nessun costo per utente. Voci e foto illimitate, e tutta la tua squadra di subappaltatori e ispettori partecipa gratis, ognuno nella propria lingua.",
  },
  es: {
    metaTitle:
      "Listas de obra para contratistas con cuadrillas hispanohablantes — MonthlyAlerts",
    metaDesc:
      "Deja de traducir tu proyecto por mensajes de texto. Escribe la lista en inglés; tu cuadrilla la trabaja en español, traducida automáticamente. Pago único por proyecto.",
    kicker: "EN ⇄ ES — Para contratistas de remodelación",
    title: "Deja de traducir tu proyecto por mensajes de texto.",
    sub: "Tú escribes la lista de pendientes en inglés. Tu maestro de obra y tus subcontratistas la trabajan en español — la misma lista, traducida automáticamente, en cualquier teléfono.",
    onceTitle: "Escríbelo una vez. Todos lo leen.",
    onceP1:
      "El propietario lee inglés. Tu cuadrilla lee español. Hoy eso significa volver a escribir cada instrucción en un chat de grupo esperando que nada se pierda entre idiomas.",
    onceP2:
      "En MonthlyAlerts agregas cada tarea a la lista del proyecto una sola vez, en tu idioma. Cada miembro — propietario, maestro de obra, subcontratista, inspector — la ve en el suyo, junto con cada comentario y leyenda de foto.",
    demoLabel: "Tú lo escribes — tu cuadrilla lo ve al instante",
    features: [
      {
        title: "Se acabó el teléfono descompuesto",
        body: "Tareas, comentarios, fechas límite y leyendas de fotos se traducen automáticamente para cada miembro. Nadie vuelve a escribir nada y nada se pierde entre inglés y español.",
      },
      {
        title: "Plantillas para tu oficio",
        body: "Remodelaciones de cocina y baño, pintura, techado, paisajismo, renovaciones completas — empieza cada trabajo con una lista fase por fase y ajústala a la obra.",
      },
      {
        title: "El propietario se mantiene informado",
        body: "Cada miembro recibe un correo mensual de estado en su idioma: qué se hizo, qué hay de nuevo, qué está atrasado. Menos llamadas de seguimiento, menos sorpresas.",
      },
    ],
    audienceTitle: "Hecho para cuadrillas residenciales",
    audience: [
      "Contratistas generales",
      "Remodeladores de cocina y baño",
      "Paisajistas",
      "Contratistas de pintura",
      "Contratistas de azulejos",
      "Contratistas de techado",
      "Firmas de diseño y construcción",
      "Gerentes de construcción",
    ],
    audienceNote:
      "MonthlyAlerts está hecho para empresas que manejan de diez a cien proyectos residenciales al año — no es software empresarial de construcción. Si la gestión de tus proyectos hoy vive en los mensajes de texto, esto es para ti.",
    pricingBlurb:
      "Pago único al crear el proyecto — sin suscripción, sin cobros por usuario. Tareas y fotos ilimitadas, y toda tu cuadrilla de subcontratistas e inspectores participa gratis, cada uno en su propio idioma.",
  },
};

export function forContractorsMetadata(lang: Lang): Metadata {
  const c = COPY[lang];
  const url = SITE_URL + localePath(lang, PAGE_PATH);
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    keywords: [
      "bilingual construction checklist",
      "Spanish speaking crew app",
      "construction punch list Spanish",
      "contractor crew communication",
      "English Spanish construction app",
      "remodeling project checklist",
    ],
    alternates: localeAlternates(lang, PAGE_PATH),
    openGraph: { title: c.metaTitle, description: c.metaDesc, url },
  };
}

export function ForContractorsPage({ lang }: { lang: Lang }) {
  const c = COPY[lang];

  return (
    <MarketingShell lang={lang} basePath={PAGE_PATH}>
      <MarketingHero lang={lang} kicker={c.kicker} title={c.title} sub={c.sub} />

      <section className="border-b-[1.5px] border-line-strong bg-sheet">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 grid sm:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="display text-4xl mb-4">{c.onceTitle}</h2>
            <p className="text-sm text-ink-soft leading-relaxed mb-4">{c.onceP1}</p>
            <p className="text-sm text-ink-soft leading-relaxed">{c.onceP2}</p>
          </div>
          <TranslationDemo
            label={c.demoLabel}
            rows={[
              {
                code: "EN",
                text: "Install outlets on both sides of the kitchen island before drywall.",
              },
              {
                code: "ES",
                text: "Instalar tomacorrientes a ambos lados de la isla de cocina antes de instalar los paneles de yeso.",
              },
            ]}
          />
        </div>
      </section>

      <FeatureGrid features={c.features} />

      <AudienceBand title={c.audienceTitle} items={c.audience} note={c.audienceNote} />

      <PricingCta lang={lang} blurb={c.pricingBlurb} />

      <MarketCrossLinks lang={lang} current="/for-contractors" />
    </MarketingShell>
  );
}
