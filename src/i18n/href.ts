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

/**
 * Cesta na `/login?next=...` s LOKALIZOVANÝM `next` — appka/web opravu
 * (17.9.2026) potrebuje na oboch miestach naraz: aj samotné `/login`
 * (appka: `redirectLocalized`), aj cieľ, kam sa má vrátiť PO prihlásení
 * (appka: `auth/callback/route.ts` použije `next` doslovne, bez ďalšej
 * úpravy — ak by bol bez predpony, prihlásenie z `/de/...` by skončilo
 * na SK stránke).
 */
export function loginRedirectPath(locale: Locale, path: string): string {
  return `/login?next=${encodeURIComponent(localizeHref(locale, path))}`;
}
