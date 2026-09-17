/**
 * i18n pre web — ČISTÁ časť (žiadny `next/headers`), bezpečná aj v
 * `proxy.ts` (Edge middleware runtime nesmie importovať `next/headers`
 * inde než v samotnom middleware súbore). Server-only časť
 * (`getLocale`/`getT`) je v `src/i18n/server.ts`.
 *
 * SK/EN/DE, port appkového `src/i18n/index.tsx` (rovnaký JSON slovník,
 * `{{premenná}}` interpolácia, `t('domain.key')`).
 *
 * PREČO `t`/`language` NIE SÚ jeden globálny modulový singleton
 * (17.9.2026, i18n kolo): Next.js Server Components bežia SÚČASNE pre
 * viacero požiadaviek na tom istom Node procese — mutovateľná hodnota
 * na úrovni modulu by bola pretekom naprieč požiadavkami. `createT`
 * je preto ČISTÁ funkcia, žiadny modulový stav.
 */
import sk from './locales/sk.json';
import en from './locales/en.json';
import de from './locales/de.json';

export type Locale = 'sk' | 'en' | 'de';
export const LOCALES: Locale[] = ['sk', 'en', 'de'];
export const DEFAULT_LOCALE: Locale = 'sk';

export function isLocale(value: string): value is Locale {
  return (LOCALES as string[]).includes(value);
}

export type TFunc = (key: string, params?: Record<string, string | number>) => string;

const DICTS: Record<Locale, Record<string, Record<string, string>>> = {
  sk: sk as Record<string, Record<string, string>>,
  en: en as Record<string, Record<string, string>>,
  de: de as Record<string, Record<string, string>>,
};

function getPath(domain: Record<string, string> | undefined, key: string): string | undefined {
  return domain?.[key];
}

/** Čistá, bez modulového stavu — bezpečná aj v klientských komponentoch. */
export function createT(locale: Locale): TFunc {
  const resources = DICTS[locale];
  return (key, params) => {
    const [domain, ...rest] = key.split('.');
    const restKey = rest.join('.');
    const raw = getPath(resources[domain], restKey);
    if (typeof raw !== 'string') return key;
    if (!params) return raw;
    return raw.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
      params[name] != null ? String(params[name]) : match
    );
  };
}
