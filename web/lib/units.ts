/**
 * Imperial <-> metric conversions. The database stores metric (kg / cm);
 * every user-facing surface collects and displays imperial (lbs / ft-in).
 */

const KG_PER_LB = 0.45359237;
const CM_PER_IN = 2.54;

export function lbToKg(lb: number): number {
  return Math.round(lb * KG_PER_LB * 10) / 10;
}

export function kgToLb(kg: number): number {
  return Math.round((kg / KG_PER_LB) * 10) / 10;
}

export function ftInToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * CM_PER_IN * 10) / 10;
}

export function cmToFtIn(cm: number): { feet: number; inches: number } {
  const totalInches = cm / CM_PER_IN;
  let feet = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches - feet * 12);
  if (inches === 12) {
    feet += 1;
    inches = 0;
  }
  return { feet, inches };
}

/** "5 ft 11 in" for display, or empty string when height is unknown. */
export function formatFtIn(cm: number | null | undefined): string {
  if (!cm) return "";
  const { feet, inches } = cmToFtIn(Number(cm));
  return `${feet} ft ${inches} in`;
}
