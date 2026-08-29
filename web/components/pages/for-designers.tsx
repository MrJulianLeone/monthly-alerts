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

const PAGE_PATH = "/for-designers";

type Copy = {
  metaTitle: string;
  metaDesc: string;
  kicker: string;
  title: string;
  sub: string;
  quoteTitle: string;
  quoteP1: string;
  quoteP2: string;
  demoLabel: string;
  features: { title: string; body: string }[];
  audienceTitle: string;
  audience: string[];
  audienceNote: string;
  pricingBlurb: string;
};

const COPY: Record<Lang, Copy> = {
  en: {
    metaTitle: "Project Checklists for Interior Designers & Architects — MonthlyAlerts",
    metaDesc:
      "Give every contractor, subcontractor, and client the same project checklist — automatically translated into their language. A monthly summary email keeps clients informed without you writing a word.",
    kicker: "EN ⇄ IT ⇄ ES — For interior designers & architects",
    title: "Give everyone the same checklist — in their own language.",
    sub: "Contractors, subcontractors, and clients all work one project list, translated automatically. You look organized because you are.",
    quoteTitle: "“You’ll receive a monthly project summary automatically.”",
    quoteP1:
      "That one sentence wins clients. On the first of every month, each project member gets a status email in their language: overall progress, what was completed, what was added, and what's overdue — assembled from the checklist you're already keeping.",
    quoteP2:
      "Client communication is part of your job. This is the part of it you no longer have to write.",
    demoLabel: "One item, three readers",
    features: [
      {
        title: "Client-safe by design",
        body: "Invite clients as commenters: they see progress, photos, and phases, and can ask questions in the thread — without editing your checklist. Trades join as editors and check work off.",
      },
      {
        title: "From concept to install",
        body: "Start from the interior-design template — concept, approvals, space planning, FF&E, procurement, trades coordination, deliveries, installation, styling, handover — or any construction-trade template.",
      },
      {
        title: "Every trade, every language",
        body: "English, Italian, and Spanish on the same project. Your tile sub reads Spanish, your client reads English, your Milanese furniture maker reads Italian — nobody misses an instruction.",
      },
    ],
    audienceTitle: "Who uses it",
    audience: [
      "Interior designers",
      "Architects",
      "Design/build studios",
      "Kitchen & bath designers",
      "Landscape architects",
      "Project managers",
      "Procurement teams",
      "Staging & styling teams",
    ],
    audienceNote:
      "Per-phase budgets with budget vs. actual, photo documentation with captions, assignees and due dates — organized the way a design project actually runs, and printable when the client wants paper.",
    pricingBlurb:
      "One-time fee when you create a project — no subscription, no per-seat pricing to pass on to clients. Unlimited items and photos, and every client, contractor, and sub you invite joins free.",
  },
  it: {
    metaTitle: "Checklist di progetto per interior designer e architetti — MonthlyAlerts",
    metaDesc:
      "Dai a ogni impresa, subappaltatore e cliente la stessa checklist di progetto — tradotta automaticamente nella loro lingua. Con un riepilogo mensile che non devi scrivere tu.",
    kicker: "EN ⇄ IT ⇄ ES — Per interior designer e architetti",
    title: "Dai a tutti la stessa checklist — nella loro lingua.",
    sub: "Imprese, subappaltatori e clienti lavorano tutti su un'unica lista di progetto, tradotta automaticamente. Sembri organizzato perché lo sei.",
    quoteTitle: "«Riceverà automaticamente un riepilogo mensile del progetto.»",
    quoteP1:
      "Quella frase conquista i clienti. Il primo di ogni mese, ogni membro del progetto riceve un'email di stato nella propria lingua: avanzamento complessivo, cosa è stato completato, cosa è stato aggiunto e cosa è in ritardo — costruita dalla lista che già tieni.",
    quoteP2:
      "La comunicazione con il cliente fa parte del tuo lavoro. Questa è la parte che non devi più scrivere.",
    demoLabel: "Una voce, tre lettori",
    features: [
      {
        title: "Sicuro per i clienti",
        body: "Invita i clienti come commentatori: vedono avanzamento, foto e fasi e possono fare domande nei commenti — senza modificare la tua checklist. Le imprese entrano come editor e spuntano i lavori.",
      },
      {
        title: "Dal concept all'installazione",
        body: "Parti dal modello interior design — concept, approvazioni, progettazione degli spazi, arredi, acquisti, coordinamento delle imprese, consegne, installazione, styling, consegna finale — o da qualsiasi modello di cantiere.",
      },
      {
        title: "Ogni mestiere, ogni lingua",
        body: "Inglese, italiano e spagnolo sullo stesso progetto. Il piastrellista legge lo spagnolo, il cliente l'inglese, il tuo falegname di Milano l'italiano — nessuno perde un'istruzione.",
      },
    ],
    audienceTitle: "Chi lo usa",
    audience: [
      "Interior designer",
      "Architetti",
      "Studi design/build",
      "Progettisti di cucine e bagni",
      "Architetti del paesaggio",
      "Project manager",
      "Team di procurement",
      "Team di styling e allestimento",
    ],
    audienceNote:
      "Budget per fase con preventivo e consuntivo, documentazione fotografica con didascalie, assegnatari e scadenze — organizzati come funziona davvero un progetto di design, e stampabili quando il cliente vuole la carta.",
    pricingBlurb:
      "Tariffa una tantum alla creazione del progetto — nessun abbonamento, nessun costo per utente da girare ai clienti. Voci e foto illimitate, e ogni cliente, impresa e subappaltatore che inviti partecipa gratis.",
  },
  es: {
    metaTitle:
      "Listas de proyecto para diseñadores de interiores y arquitectos — MonthlyAlerts",
    metaDesc:
      "Dale a cada contratista, subcontratista y cliente la misma lista de proyecto — traducida automáticamente a su idioma. Con un resumen mensual que no tienes que escribir tú.",
    kicker: "EN ⇄ IT ⇄ ES — Para diseñadores de interiores y arquitectos",
    title: "Dales a todos la misma lista — en su propio idioma.",
    sub: "Contratistas, subcontratistas y clientes trabajan una sola lista de proyecto, traducida automáticamente. Te ves organizado porque lo estás.",
    quoteTitle: "«Recibirá un resumen mensual del proyecto automáticamente.»",
    quoteP1:
      "Esa frase gana clientes. El primero de cada mes, cada miembro del proyecto recibe un correo de estado en su idioma: avance general, qué se completó, qué se agregó y qué está atrasado — armado con la lista que ya llevas.",
    quoteP2:
      "La comunicación con el cliente es parte de tu trabajo. Esta es la parte que ya no tienes que escribir.",
    demoLabel: "Una tarea, tres lectores",
    features: [
      {
        title: "Seguro para clientes",
        body: "Invita a tus clientes como comentaristas: ven el avance, las fotos y las fases, y pueden preguntar en los comentarios — sin editar tu lista. Los gremios entran como editores y marcan el trabajo hecho.",
      },
      {
        title: "Del concepto a la instalación",
        body: "Empieza con la plantilla de diseño de interiores — concepto, aprobaciones, distribución, mobiliario, compras, coordinación de gremios, entregas, instalación, estilismo, entrega final — o con cualquier plantilla de obra.",
      },
      {
        title: "Cada gremio, cada idioma",
        body: "Inglés, italiano y español en el mismo proyecto. Tu azulejero lee español, tu cliente inglés, tu mueblista de Milán italiano — nadie pierde una instrucción.",
      },
    ],
    audienceTitle: "Quién lo usa",
    audience: [
      "Diseñadores de interiores",
      "Arquitectos",
      "Estudios de diseño y construcción",
      "Diseñadores de cocinas y baños",
      "Arquitectos paisajistas",
      "Gerentes de proyecto",
      "Equipos de compras",
      "Equipos de estilismo y montaje",
    ],
    audienceNote:
      "Presupuestos por fase con presupuesto vs. real, documentación fotográfica con leyendas, responsables y fechas límite — organizados como realmente funciona un proyecto de diseño, e imprimibles cuando el cliente quiere papel.",
    pricingBlurb:
      "Pago único al crear el proyecto — sin suscripción, sin precios por usuario que trasladar a tus clientes. Tareas y fotos ilimitadas, y cada cliente, contratista y subcontratista que invites participa gratis.",
  },
};

export function forDesignersMetadata(lang: Lang): Metadata {
  const c = COPY[lang];
  const url = SITE_URL + localePath(lang, PAGE_PATH);
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    keywords: [
      "interior designer project management",
      "architect client communication",
      "design project checklist",
      "FF&E procurement tracker",
      "translated project checklist",
      "monthly client report interior design",
    ],
    alternates: localeAlternates(lang, PAGE_PATH),
    openGraph: { title: c.metaTitle, description: c.metaDesc, url },
  };
}

export function ForDesignersPage({ lang }: { lang: Lang }) {
  const c = COPY[lang];

  return (
    <MarketingShell lang={lang} basePath={PAGE_PATH}>
      <MarketingHero lang={lang} kicker={c.kicker} title={c.title} sub={c.sub} />

      <section className="border-b-[1.5px] border-line-strong bg-sheet">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 grid sm:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="display text-4xl mb-4">{c.quoteTitle}</h2>
            <p className="text-sm text-ink-soft leading-relaxed mb-4">{c.quoteP1}</p>
            <p className="text-sm text-ink-soft leading-relaxed">{c.quoteP2}</p>
          </div>
          <TranslationDemo
            label={c.demoLabel}
            rows={[
              { code: "EN", text: "Confirm the marble slab selection at the stone yard." },
              { code: "IT", text: "Confermare la scelta della lastra di marmo dal marmista." },
              { code: "ES", text: "Confirmar la selección de la placa de mármol en el depósito." },
            ]}
          />
        </div>
      </section>

      <FeatureGrid features={c.features} />

      <AudienceBand title={c.audienceTitle} items={c.audience} note={c.audienceNote} />

      <PricingCta lang={lang} blurb={c.pricingBlurb} />

      <MarketCrossLinks lang={lang} current="/for-designers" />
    </MarketingShell>
  );
}
