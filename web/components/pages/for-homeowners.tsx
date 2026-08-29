import type { Metadata } from "next";
import {
  FeatureGrid,
  MarketCrossLinks,
  MarketingHero,
  MarketingShell,
  PricingCta,
  TranslationDemo,
} from "@/components/marketing";
import type { Lang } from "@/lib/i18n";
import { SITE_URL, localeAlternates, localePath } from "@/lib/seo";

const PAGE_PATH = "/for-homeowners";

type Copy = {
  metaTitle: string;
  metaDesc: string;
  kicker: string;
  title: string;
  sub: string;
  hooksTitle: string;
  hooks: { quote: string; answer: string }[];
  langTitle: string;
  langP1: string;
  langP2: string;
  demoLabel: string;
  demoRows: { code: string; text: string }[];
  features: { title: string; body: string }[];
  pricingBlurb: string;
};

const COPY: Record<Lang, Copy> = {
  en: {
    metaTitle: "Keep Track of Everything Your Contractor Promised — MonthlyAlerts",
    metaDesc:
      "Your renovation is spread across texts, emails, and WhatsApp — maybe in two languages. Put every promise on one checklist you and your contractor both read in your own language.",
    kicker: "EN ⇄ IT ⇄ ES — For homeowners",
    title: "Everything your contractor promised, on one list.",
    sub: "Texts, emails, WhatsApp, and a language barrier — that's how renovations get lost. Put every task on one checklist you and your contractor both read in your own languages.",
    hooksTitle: "Sound familiar?",
    hooks: [
      {
        quote: "“My contractor speaks Spanish.”",
        answer:
          "Write items in English; your contractor and crew read them in Spanish — and their updates come back to you in English.",
      },
      {
        quote: "“Our project is spread across texts, emails and WhatsApp.”",
        answer:
          "One checklist holds every task, comment, photo, and due date. When something was agreed, it goes on the list — and stays there.",
      },
      {
        quote: "“I can't keep track of everything my contractor promised.”",
        answer:
          "Every promise becomes a checklist item with a status. Open, in progress, done — you always know which is which.",
      },
      {
        quote: "“I'm managing my renovation remotely.”",
        answer:
          "Photos attached to each item show you what actually got done, and a monthly status email sums up progress without you asking.",
      },
      {
        quote: "“I'm remodeling a house overseas.”",
        answer:
          "English, Italian, and Spanish on one project. Your builder abroad works in their language; you read everything in yours.",
      },
    ],
    langTitle: "You don't need to speak their language",
    langP1:
      "Add an item in English. Your contractor sees it in Spanish or Italian the moment they open the list — and when they comment or add a photo caption, you read it in English.",
    langP2: "No copy-pasting into a translator, no wondering whether the message landed.",
    demoLabel: "You write it — your contractor reads it",
    demoRows: [
      { code: "EN", text: "Please fix the leak under the bathroom sink this week." },
      { code: "ES", text: "Por favor reparar la fuga bajo el lavabo del baño esta semana." },
    ],
    features: [
      {
        title: "Start from a real checklist",
        body: "Kitchen remodel, bathroom, painting, roofing, landscaping, or a full renovation — pick a phase-by-phase template so nothing gets forgotten between demolition and final inspection.",
      },
      {
        title: "Photos as proof of progress",
        body: "Your contractor attaches photos to items as work happens. Whether you're across town or across an ocean, you see what got done.",
      },
      {
        title: "A monthly summary, automatically",
        body: "On the first of the month, everyone on the project gets a status email in their language: progress, completed work, and what's overdue.",
      },
    ],
    pricingBlurb:
      "One-time fee when you create a project — no subscription. Unlimited checklist items and photos, and your contractor and their whole crew join free, each in their own language.",
  },
  it: {
    metaTitle: "Tieni traccia di tutto ciò che la tua impresa ha promesso — MonthlyAlerts",
    metaDesc:
      "La tua ristrutturazione è sparsa tra messaggi, email e WhatsApp — forse in due lingue. Metti ogni promessa su una lista che tu e la tua impresa leggete ognuno nella propria lingua.",
    kicker: "EN ⇄ IT ⇄ ES — Per proprietari di casa",
    title: "Tutto ciò che l'impresa ha promesso, su una sola lista.",
    sub: "Messaggi, email, WhatsApp e una barriera linguistica — è così che le ristrutturazioni si perdono. Metti ogni compito su un'unica lista che tu e la tua impresa leggete ognuno nella propria lingua.",
    hooksTitle: "Ti suona familiare?",
    hooks: [
      {
        quote: "«Io e la mia impresa non parliamo la stessa lingua.»",
        answer:
          "Scrivi le voci nella tua lingua; l'impresa e la squadra le leggono nella loro — e i loro aggiornamenti ti arrivano nella tua.",
      },
      {
        quote: "«Il nostro progetto è sparso tra messaggi, email e WhatsApp.»",
        answer:
          "Una sola lista contiene ogni compito, commento, foto e scadenza. Quando qualcosa viene concordato, finisce sulla lista — e ci resta.",
      },
      {
        quote: "«Non riesco a tenere traccia di tutto ciò che l'impresa ha promesso.»",
        answer:
          "Ogni promessa diventa una voce della lista con uno stato. Aperto, in corso, completato — sai sempre a che punto è.",
      },
      {
        quote: "«Gestisco la mia ristrutturazione a distanza.»",
        answer:
          "Le foto allegate a ogni voce ti mostrano cosa è stato fatto davvero, e un'email mensile di stato riassume l'avanzamento senza che tu lo chieda.",
      },
      {
        quote: "«Sto ristrutturando una casa all'estero.»",
        answer:
          "Inglese, italiano e spagnolo su un unico progetto. Il tuo costruttore all'estero lavora nella sua lingua; tu leggi tutto nella tua.",
      },
    ],
    langTitle: "Non serve parlare la loro lingua",
    langP1:
      "Aggiungi una voce nella tua lingua. L'impresa la vede nella sua appena apre la lista — e quando commenta o aggiunge una didascalia, tu la leggi nella tua.",
    langP2: "Niente copia-incolla nel traduttore, niente dubbi se il messaggio è arrivato.",
    demoLabel: "Tu lo scrivi — la tua impresa lo legge",
    demoRows: [
      { code: "IT", text: "Per favore riparare la perdita sotto il lavabo del bagno questa settimana." },
      { code: "EN", text: "Please fix the leak under the bathroom sink this week." },
    ],
    features: [
      {
        title: "Parti da una lista vera",
        body: "Cucina, bagno, tinteggiatura, tetto, esterni o una ristrutturazione completa — scegli un modello fase per fase così nulla viene dimenticato tra la demolizione e il collaudo finale.",
      },
      {
        title: "Le foto come prova dell'avanzamento",
        body: "L'impresa allega foto alle voci man mano che il lavoro procede. Che tu sia dall'altra parte della città o dell'oceano, vedi cosa è stato fatto.",
      },
      {
        title: "Un riepilogo mensile, automatico",
        body: "Il primo del mese, tutti sul progetto ricevono un'email di stato nella propria lingua: avanzamento, lavori completati e ritardi.",
      },
    ],
    pricingBlurb:
      "Tariffa una tantum alla creazione del progetto — nessun abbonamento. Voci e foto illimitate, e la tua impresa con tutta la sua squadra partecipa gratis, ognuno nella propria lingua.",
  },
  es: {
    metaTitle: "Sigue todo lo que tu contratista prometió — MonthlyAlerts",
    metaDesc:
      "Tu renovación está regada entre mensajes, correos y WhatsApp — quizá en dos idiomas. Pon cada promesa en una lista que tú y tu contratista leen cada uno en su propio idioma.",
    kicker: "EN ⇄ IT ⇄ ES — Para propietarios",
    title: "Todo lo que tu contratista prometió, en una sola lista.",
    sub: "Mensajes, correos, WhatsApp y una barrera de idioma — así se pierden las renovaciones. Pon cada tarea en una sola lista que tú y tu contratista leen cada uno en su propio idioma.",
    hooksTitle: "¿Te suena familiar?",
    hooks: [
      {
        quote: "«Mi contratista habla otro idioma.»",
        answer:
          "Escribe las tareas en tu idioma; tu contratista y su cuadrilla las leen en el suyo — y sus actualizaciones te llegan en el tuyo.",
      },
      {
        quote: "«Nuestro proyecto está regado entre mensajes, correos y WhatsApp.»",
        answer:
          "Una sola lista guarda cada tarea, comentario, foto y fecha límite. Lo que se acuerda, va a la lista — y ahí se queda.",
      },
      {
        quote: "«No puedo seguir todo lo que mi contratista prometió.»",
        answer:
          "Cada promesa se vuelve una tarea con estado. Pendiente, en curso, hecha — siempre sabes cuál es cuál.",
      },
      {
        quote: "«Estoy manejando mi renovación a distancia.»",
        answer:
          "Las fotos adjuntas a cada tarea te muestran lo que de verdad se hizo, y un correo mensual resume el avance sin que preguntes.",
      },
      {
        quote: "«Estoy remodelando una casa en el extranjero.»",
        answer:
          "Inglés, italiano y español en un solo proyecto. Tu constructor en el extranjero trabaja en su idioma; tú lees todo en el tuyo.",
      },
    ],
    langTitle: "No necesitas hablar su idioma",
    langP1:
      "Agrega una tarea en tu idioma. Tu contratista la ve en el suyo al abrir la lista — y cuando comenta o agrega una leyenda de foto, tú la lees en el tuyo.",
    langP2: "Sin copiar y pegar en un traductor, sin preguntarte si el mensaje llegó.",
    demoLabel: "Tú lo escribes — tu contratista lo lee",
    demoRows: [
      { code: "ES", text: "Por favor reparar la fuga bajo el lavabo del baño esta semana." },
      { code: "EN", text: "Please fix the leak under the bathroom sink this week." },
    ],
    features: [
      {
        title: "Empieza con una lista de verdad",
        body: "Cocina, baño, pintura, techo, jardín o una renovación completa — elige una plantilla fase por fase para que nada se olvide entre la demolición y la inspección final.",
      },
      {
        title: "Fotos como prueba del avance",
        body: "Tu contratista adjunta fotos a las tareas conforme avanza el trabajo. Estés al otro lado de la ciudad o del océano, ves lo que se hizo.",
      },
      {
        title: "Un resumen mensual, automático",
        body: "El primero de mes, todos en el proyecto reciben un correo de estado en su idioma: avance, trabajo terminado y pendientes atrasados.",
      },
    ],
    pricingBlurb:
      "Pago único al crear el proyecto — sin suscripción. Tareas y fotos ilimitadas, y tu contratista y toda su cuadrilla participan gratis, cada uno en su propio idioma.",
  },
};

export function forHomeownersMetadata(lang: Lang): Metadata {
  const c = COPY[lang];
  const url = SITE_URL + localePath(lang, PAGE_PATH);
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    keywords: [
      "track contractor work",
      "renovation checklist app",
      "my contractor speaks Spanish",
      "manage renovation remotely",
      "contractor promised list",
      "home renovation punch list",
    ],
    alternates: localeAlternates(lang, PAGE_PATH),
    openGraph: { title: c.metaTitle, description: c.metaDesc, url },
  };
}

export function ForHomeownersPage({ lang }: { lang: Lang }) {
  const c = COPY[lang];

  return (
    <MarketingShell lang={lang} basePath={PAGE_PATH}>
      <MarketingHero lang={lang} kicker={c.kicker} title={c.title} sub={c.sub} />

      <section className="border-b-[1.5px] border-line-strong bg-sheet">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
          <h2 className="display text-4xl mb-10">{c.hooksTitle}</h2>
          <ul className="space-y-6 max-w-3xl">
            {c.hooks.map((h) => (
              <li key={h.quote} className="flex flex-col sm:flex-row gap-2 sm:gap-6">
                <p className="display text-xl sm:w-72 shrink-0">{h.quote}</p>
                <p className="text-sm text-ink-soft leading-relaxed pt-0.5">{h.answer}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16 grid sm:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="display text-4xl mb-4">{c.langTitle}</h2>
          <p className="text-sm text-ink-soft leading-relaxed mb-4">{c.langP1}</p>
          <p className="text-sm text-ink-soft leading-relaxed">{c.langP2}</p>
        </div>
        <TranslationDemo label={c.demoLabel} rows={c.demoRows} />
      </section>

      <FeatureGrid features={c.features} />

      <PricingCta lang={lang} blurb={c.pricingBlurb} />

      <MarketCrossLinks lang={lang} current="/for-homeowners" />
    </MarketingShell>
  );
}
