import type { Locale } from "@/i18n";

/** Chybové hlášky Google One Tap — mimo veľkého i18n slovníka (vzor `consent-labels.ts`). */
export const ONE_TAP_LABELS: Record<Locale, { loadFailed: string; notAvailable: string; signInFailed: string }> = {
  sk: {
    loadFailed: "Rýchle prihlásenie Google sa nenačítalo (možno ho blokuje blokovač reklám). Použi tlačidlo nižšie.",
    notAvailable: "Rýchle prihlásenie Google tu nie je dostupné. Použi tlačidlo nižšie.",
    signInFailed: "Prihlásenie cez Google sa nepodarilo. Skús to znova tlačidlom nižšie.",
  },
  en: {
    loadFailed: "Google quick sign-in did not load (an ad blocker may be blocking it). Use the button below.",
    notAvailable: "Google quick sign-in is not available here. Use the button below.",
    signInFailed: "Google sign-in failed. Please try again with the button below.",
  },
  de: {
    loadFailed: "Die schnelle Google-Anmeldung wurde nicht geladen (evtl. blockiert ein Werbeblocker sie). Nutze die Schaltfläche unten.",
    notAvailable: "Die schnelle Google-Anmeldung ist hier nicht verfügbar. Nutze die Schaltfläche unten.",
    signInFailed: "Die Anmeldung über Google ist fehlgeschlagen. Versuche es mit der Schaltfläche unten erneut.",
  },
};
