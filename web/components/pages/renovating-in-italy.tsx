import type { Metadata } from "next";
import Link from "next/link";
import {
  AudienceBand,
  FeatureGrid,
  MarketCrossLinks,
  MarketingHero,
  MarketingShell,
  PricingCta,
  TranslationDemo,
} from "@/components/marketing";
import { GUIDES } from "@/lib/content";
import type { Lang } from "@/lib/i18n";
import { SITE_URL, localeAlternates, localePath } from "@/lib/seo";

const PAGE_PATH = "/renovating-in-italy";

type Copy = {
  metaTitle: string;
  metaDesc: string;
  kicker: string;
  title: string;
  sub: string;
  howTitle: string;
  howP1: string;
  howP2: string;
  demoLabel: string;
  demoRows: { code: string; text: string }[];
  features: { title: string; body: string }[];
  guidesTitle: string;
  guidesNote: string;
  templateCta: string;
  audienceTitle: string;
  audience: string[];
  audienceNote: string;
  pricingBlurb: string;
};

const COPY: Record<Lang, Copy> = {
  en: {
    metaTitle: "Manage Your Italian Renovation From Anywhere — MonthlyAlerts",
    metaDesc:
      "Your architect writes in Italian. Your contractor writes in Italian. You work in English. One renovation checklist keeps everyone on the same project, with photos and a monthly report.",
    kicker: "EN ⇄ IT — Renovating in Italy from the U.S.",
    title: "Manage your Italian renovation from anywhere.",
    sub: "Your architect writes in Italian. Your contractor writes in Italian. You work in English. MonthlyAlerts keeps everyone on the same project.",
    howTitle: "Six time zones, one list, no Google Translate",
    howP1:
      "Renovating a house in Italy from the U.S. usually means WhatsApp threads with the geometra, voice notes from the impresa, and a spreadsheet only you can read. Decisions get lost, and every misunderstanding costs a week.",
    howP2:
      "On MonthlyAlerts you write each task in English. Your geometra, architect, and crew read it in Italian, tick it off, attach photos, and reply in Italian. Their words come back to you in English. You wake up to progress you can actually read, and a record you can print.",
    demoLabel: "You write it in English. Your impresa reads it in Italian.",
    demoRows: [
      { code: "EN", text: "Send the updated electrical layout to the geometra before the SCIA is filed." },
      { code: "IT", text: "Inviare lo schema elettrico aggiornato al geometra prima del deposito della SCIA." },
    ],
    features: [
      {
        title: "A checklist built for Italy",
        body: "Start from the Renovation in Italy template: purchase and due diligence (visura, planimetria), permits (CILA, SCIA, Soprintendenza), impianti and the dichiarazione di conformità, utilities (voltura), fiscal paperwork (bonifico parlante, fatture), and closeout (fine lavori, agibilità).",
      },
      {
        title: "Photos are your site visit",
        body: "Your crew attaches photos to checklist items as work happens. You see what got done this week without flying over, and you keep the record for two years.",
      },
      {
        title: "A monthly report, in Italian and English",
        body: "On the 1st, every member gets a status email in their own language: progress, completed work, overdue items. Your contractor writes nothing extra. You stop asking where things stand.",
      },
    ],
    guidesTitle: "Read before you start",
    guidesNote:
      "Written for Americans renovating in Italy: how the permits work, what a geometra does, how to read a preventivo, and the questions that save you money.",
    templateCta: "Open the Renovation in Italy checklist",
    audienceTitle: "Who uses it",
    audience: [
      "Americans buying homes in Italy",
      "Families restoring ancestral property",
      "Second-home owners in Puglia, Tuscany, Sicily, Le Marche",
      "1-euro-house buyers",
      "Architects with U.S. clients",
      "Geometri and imprese with foreign clients",
      "Property managers and renovation consultants",
      "Brokers selling to foreign buyers",
    ],
    audienceNote:
      "It works both ways: Italian professionals invite their American clients and keep working in Italian, while the client reads everything in English. Spanish is on the same project too.",
    pricingBlurb:
      "One-time fee when you activate a project. Build the checklist free, preview it in Italian, then activate to invite your geometra, impresa, and family. Everyone you invite joins free, in their own language.",
  },
  it: {
    metaTitle: "Clienti americani, cantiere in Italia — MonthlyAlerts",
    metaDesc:
      "Il cliente scrive in inglese, tu e i tuoi artigiani in italiano. Una sola lista di cantiere tradotta automaticamente, con foto e report mensile. Per geometri, architetti e imprese con clienti esteri.",
    kicker: "EN ⇄ IT — Ristrutturazioni in Italia per clienti esteri",
    title: "Il cliente è in America. Il cantiere è qui.",
    sub: "Il tuo cliente scrive in inglese. Tu, il geometra e gli artigiani scrivete in italiano. MonthlyAlerts tiene tutti sullo stesso progetto.",
    howTitle: "Sei fusi orari, una sola lista, niente Google Translate",
    howP1:
      "Seguire un cantiere per un cliente che vive negli Stati Uniti significa WhatsApp a orari impossibili, messaggi vocali da tradurre e decisioni che si perdono. Ogni fraintendimento costa una settimana.",
    howP2:
      "Su MonthlyAlerts il cliente scrive le richieste in inglese; tu le leggi in italiano, le spunti, alleghi le foto e rispondi in italiano. Lui legge tutto in inglese. Ognuno lavora nella propria lingua e resta una traccia scritta e stampabile.",
    demoLabel: "Il cliente lo scrive in inglese. Tu lo leggi in italiano.",
    demoRows: [
      { code: "EN", text: "Send the updated electrical layout to the geometra before the SCIA is filed." },
      { code: "IT", text: "Inviare lo schema elettrico aggiornato al geometra prima del deposito della SCIA." },
    ],
    features: [
      {
        title: "Una checklist pensata per l'Italia",
        body: "Parti dal modello Ristrutturazione in Italia: acquisto e verifiche (visura, planimetria), pratiche (CILA, SCIA, Soprintendenza), impianti e dichiarazione di conformità, utenze (voltura), aspetti fiscali (bonifico parlante, fatture) e chiusura (fine lavori, agibilità).",
      },
      {
        title: "Le foto sono il sopralluogo",
        body: "La squadra allega le foto alle voci della lista man mano che il lavoro procede. Il cliente vede cosa è stato fatto senza prendere un aereo e tutto resta documentato per due anni.",
      },
      {
        title: "Un report mensile, in italiano e in inglese",
        body: "Il primo del mese ogni membro riceve un'email di stato nella propria lingua: avanzamento, lavori completati, voci in ritardo. Tu non scrivi nulla in più. Il cliente smette di chiedere a che punto siamo.",
      },
    ],
    guidesTitle: "Guide per i tuoi clienti",
    guidesNote:
      "Guide in inglese scritte per americani che ristrutturano in Italia: come funzionano i permessi, cosa fa un geometra, come leggere un preventivo. Condividile con i clienti.",
    templateCta: "Apri la checklist Ristrutturazione in Italia",
    audienceTitle: "Chi lo usa",
    audience: [
      "Geometri con clienti esteri",
      "Architetti con clienti americani",
      "Imprese di ristrutturazione",
      "Property manager",
      "Consulenti per ristrutturazioni",
      "Agenzie che vendono a stranieri",
      "Famiglie con parenti all'estero",
      "Proprietari di seconde case",
    ],
    audienceNote:
      "Funziona in entrambe le direzioni: inviti il cliente americano, continui a lavorare in italiano e lui legge tutto in inglese. Anche lo spagnolo è sullo stesso progetto.",
    pricingBlurb:
      "Tariffa una tantum all'attivazione del progetto. Costruisci la lista gratis, guardala in inglese, poi attivala per invitare cliente, artigiani e colleghi. Tutti gli invitati partecipano gratis nella propria lingua.",
  },
  es: {
    metaTitle: "Gestiona tu renovación en Italia desde cualquier lugar — MonthlyAlerts",
    metaDesc:
      "Tu arquitecto escribe en italiano. Tu contratista escribe en italiano. Tú trabajas en español o inglés. Una sola lista de renovación mantiene a todos en el mismo proyecto, con fotos e informe mensual.",
    kicker: "ES ⇄ IT — Renovar en Italia desde el extranjero",
    title: "Gestiona tu renovación en Italia desde cualquier lugar.",
    sub: "Tu arquitecto escribe en italiano. Tu contratista escribe en italiano. Tú trabajas en tu idioma. MonthlyAlerts mantiene a todos en el mismo proyecto.",
    howTitle: "Seis husos horarios, una sola lista, sin Google Translate",
    howP1:
      "Renovar una casa en Italia desde lejos suele significar hilos de WhatsApp con el geometra, notas de voz de la empresa y una hoja de cálculo que solo tú entiendes. Las decisiones se pierden y cada malentendido cuesta una semana.",
    howP2:
      "En MonthlyAlerts escribes cada tarea en tu idioma. Tu geometra, arquitecto y cuadrilla la leen en italiano, la marcan, adjuntan fotos y responden en italiano. Sus palabras te llegan traducidas. Despiertas con avances que sí puedes leer y un registro que puedes imprimir.",
    demoLabel: "Tú lo escribes. Tu empresa lo lee en italiano.",
    demoRows: [
      { code: "ES", text: "Enviar el esquema eléctrico actualizado al geometra antes de presentar la SCIA." },
      { code: "IT", text: "Inviare lo schema elettrico aggiornato al geometra prima del deposito della SCIA." },
    ],
    features: [
      {
        title: "Una lista hecha para Italia",
        body: "Empieza con la plantilla Renovación en Italia: compra y verificaciones (visura, planimetria), permisos (CILA, SCIA, Soprintendenza), instalaciones y dichiarazione di conformità, servicios (voltura), trámites fiscales (bonifico parlante, fatture) y cierre (fine lavori, agibilità).",
      },
      {
        title: "Las fotos son tu visita de obra",
        body: "La cuadrilla adjunta fotos a las tareas conforme avanza el trabajo. Ves qué se hizo esta semana sin cruzar el océano y conservas el registro durante dos años.",
      },
      {
        title: "Un informe mensual, en italiano y en tu idioma",
        body: "El día 1, cada miembro recibe un correo de estado en su idioma: avance, trabajo completado, tareas atrasadas. Tu contratista no escribe nada extra. Tú dejas de preguntar cómo vamos.",
      },
    ],
    guidesTitle: "Lee antes de empezar",
    guidesNote:
      "Guías en inglés para quien renueva en Italia desde el extranjero: cómo funcionan los permisos, qué hace un geometra, cómo leer un preventivo y las preguntas que ahorran dinero.",
    templateCta: "Abrir la lista Renovación en Italia",
    audienceTitle: "Quién lo usa",
    audience: [
      "Compradores de vivienda en Italia",
      "Familias que restauran propiedades de origen",
      "Dueños de segunda vivienda",
      "Compradores de casas a 1 euro",
      "Arquitectos con clientes extranjeros",
      "Geometri y empresas con clientes extranjeros",
      "Administradores de propiedades",
      "Agencias que venden a extranjeros",
    ],
    audienceNote:
      "Funciona en ambos sentidos: los profesionales italianos invitan a sus clientes y siguen trabajando en italiano mientras el cliente lee en su idioma. El inglés está en el mismo proyecto.",
    pricingBlurb:
      "Pago único al activar el proyecto. Construye la lista gratis, revísala en italiano y actívala para invitar a tu geometra, empresa y familia. Todos los invitados participan gratis en su idioma.",
  },
};

export function renovatingInItalyMetadata(lang: Lang): Metadata {
  const c = COPY[lang];
  const url = SITE_URL + localePath(lang, PAGE_PATH);
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    keywords: [
      "renovating house in Italy",
      "managing Italian renovation from USA",
      "Italian contractor English homeowner",
      "renovate property in Italy remotely",
      "geometra English",
      "Italy renovation checklist",
      "manage Italian renovation remotely",
      "English Italian construction communication",
    ],
    alternates: localeAlternates(lang, PAGE_PATH),
    openGraph: { title: c.metaTitle, description: c.metaDesc, url },
  };
}

export function RenovatingInItalyPage({ lang }: { lang: Lang }) {
  const c = COPY[lang];
  const guides = GUIDES.filter((g) => g.cluster === "italy");

  return (
    <MarketingShell lang={lang} basePath={PAGE_PATH}>
      <MarketingHero lang={lang} kicker={c.kicker} title={c.title} sub={c.sub} />

      <section className="border-b-[1.5px] border-line-strong bg-sheet">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 grid sm:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="display text-4xl mb-4">{c.howTitle}</h2>
            <p className="text-sm text-ink-soft leading-relaxed mb-4">{c.howP1}</p>
            <p className="text-sm text-ink-soft leading-relaxed">{c.howP2}</p>
          </div>
          <TranslationDemo label={c.demoLabel} rows={c.demoRows} />
        </div>
      </section>

      <FeatureGrid features={c.features} />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="display text-3xl mb-2">{c.guidesTitle}</h2>
            <p className="text-sm text-ink-soft leading-relaxed max-w-2xl">{c.guidesNote}</p>
          </div>
          <Link href="/checklists/italy-renovation-checklist" className="btn btn-ghost btn-sm shrink-0">
            {c.templateCta}
          </Link>
        </div>
        <ul className="grid sm:grid-cols-2 gap-px bg-line-strong border-[1.5px] border-line-strong">
          {guides.map((g) => (
            <li key={g.slug}>
              <Link href={`/guides/${g.slug}`} className="block bg-sheet p-5 h-full hover:bg-paper transition-colors">
                <h3 className="display text-lg mb-1">{g.title}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{g.metaDesc}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <AudienceBand title={c.audienceTitle} items={c.audience} note={c.audienceNote} />

      <PricingCta lang={lang} blurb={c.pricingBlurb} />

      <MarketCrossLinks lang={lang} current={PAGE_PATH} />
    </MarketingShell>
  );
}
