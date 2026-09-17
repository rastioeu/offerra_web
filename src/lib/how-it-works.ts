/**
 * „Ako funguje Offerra" — port appkového `src/lib/how-it-works.ts`.
 * ČISTÁ štruktúra (ikony, poradie, počet odsekov), text žije v
 * `src/i18n/locales/*.json` (domain `howItWorks`), rovnaký slovník ako
 * appka. Rovnaké standing rule ako appka (CLAUDE.md appky §8): keď sa
 * zmení AKÁKOĽVEK mechanika Offerra, tento text sa upraví v TOM ISTOM
 * kroku, nie dodatočne — inak appka/web klame o tom, ako appka funguje.
 */
import type { TFunc } from "@/i18n";

export type HowSection = { icon: string; title: string; paragraphs: string[] };

export function getHowLead(t: TFunc): string {
  return t("howItWorks.lead");
}

const SECTION_PARA_COUNTS = [5, 6, 3, 6, 6, 4, 4, 5, 5, 7, 3, 5, 5, 3, 3];

export function getHowSections(t: TFunc): HowSection[] {
  return SECTION_PARA_COUNTS.map((count, i) => ({
    icon: String(i),
    title: t(`howItWorks.section${i}Title`),
    paragraphs: Array.from({ length: count }, (_, j) => t(`howItWorks.section${i}Para${j}`)),
  }));
}
