import type { Locale } from "@/i18n";

/**
 * Texty súhlasu s analytickými cookies — mimo veľkého i18n slovníka
 * (rovnaký vzor ako `add-listing-labels.ts`). Text nesľubuje nič, čo kód
 * nerobí: Google Analytics sa NENAČÍTA, kým používateľ nekliknúť
 * „Prijať" (`src/components/analytics.tsx`).
 */
export const CONSENT_LABELS: Record<
  Locale,
  { text: string; accept: string; reject: string; settings: string; privacy: string }
> = {
  sk: {
    text: "Používame analytické cookies (Google Analytics), aby sme vedeli, čo na webe funguje. Bez tvojho súhlasu sa nenačítajú.",
    accept: "Prijať",
    reject: "Odmietnuť",
    settings: "Nastavenia cookies",
    privacy: "Ochrana osobných údajov",
  },
  en: {
    text: "We use analytics cookies (Google Analytics) to understand what works on the site. They are not loaded without your consent.",
    accept: "Accept",
    reject: "Reject",
    settings: "Cookie settings",
    privacy: "Privacy Policy",
  },
  de: {
    text: "Wir verwenden Analyse-Cookies (Google Analytics), um zu verstehen, was auf der Seite funktioniert. Ohne deine Zustimmung werden sie nicht geladen.",
    accept: "Akzeptieren",
    reject: "Ablehnen",
    settings: "Cookie-Einstellungen",
    privacy: "Datenschutz",
  },
};
