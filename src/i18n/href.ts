import type { Locale } from '@/i18n';

/**
 * Predpona URL podľa jazyka — SK BEZ prefixu (`/dopyty`), EN/DE
 * S prefixom (`/en/dopyty`, `/de/dopyty`), presne rozhodnutie Rastia
 * (17.9.2026: „SK bez prefixu, najlepšie pre SEO/hreflang"). Čistá
 * funkcia, funguje aj v klientských komponentoch.
 */
export function localizeHref(locale: Locale, href: string): string {
  if (locale === 'sk') return href;
  return `/${locale}${href}`;
}
