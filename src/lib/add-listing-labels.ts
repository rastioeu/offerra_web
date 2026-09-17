import type { Locale } from "@/i18n";

/**
 * Texty pre `AddListingCta` — mimo veľkého i18n slovníka, rovnaký vzor
 * ako appkovo-nezávislé webové texty inde (napr. `site-header.tsx`
 * `LABELS`). Vlastný súbor, lebo komponenta sa presunula z hlavičky
 * (Rastio, 17.9.2026) na katalógovú stránku a obe miesta by si inak
 * museli držať vlastnú kópiu.
 */
export const ADD_LISTING_LABELS: Record<Locale, { addListing: string; addDemand: string; creating: string }> = {
  sk: { addListing: "Pridať inzerát", addDemand: "Pridať dopyt", creating: "Zakladám…" },
  en: { addListing: "Add listing", addDemand: "Add demand", creating: "Creating…" },
  de: { addListing: "Inserat aufgeben", addDemand: "Gesuch aufgeben", creating: "Wird angelegt…" },
};
