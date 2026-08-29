import type { Lang } from "@/lib/i18n";

/**
 * Standard construction-phase sections offered when a checklist is empty,
 * created in the owner's language (so their language is the source language).
 */
export const TEMPLATE_SECTIONS: Record<Lang, string[]> = {
  en: [
    "Site preparation",
    "Demolition",
    "Foundation",
    "Framing",
    "Roofing",
    "Windows & doors",
    "Electrical",
    "Plumbing",
    "HVAC",
    "Insulation & drywall",
    "Finishes",
    "Final inspection",
  ],
  it: [
    "Preparazione del cantiere",
    "Demolizione",
    "Fondazioni",
    "Struttura",
    "Copertura",
    "Finestre e porte",
    "Impianto elettrico",
    "Impianto idraulico",
    "Climatizzazione",
    "Isolamento e cartongesso",
    "Finiture",
    "Collaudo finale",
  ],
  es: [
    "Preparación del terreno",
    "Demolición",
    "Cimentación",
    "Estructura",
    "Techado",
    "Ventanas y puertas",
    "Instalación eléctrica",
    "Fontanería",
    "Climatización",
    "Aislamiento y tablaroca",
    "Acabados",
    "Inspección final",
  ],
};
