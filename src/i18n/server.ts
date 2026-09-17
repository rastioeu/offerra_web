/**
 * Server-only časť — `next/headers` smie žiť LEN tu (nie v
 * `src/i18n/index.ts`, ten importuje aj `proxy.ts`, kde je to
 * zakázané). Server Components volajú `const t = await getT()` samé —
 * lacné, `cache()` memoizuje len v rámci jednej požiadavky, nie
 * naprieč požiadavkami (Next.js reset cache po každom requeste).
 */
import { cache } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { createT, DEFAULT_LOCALE, isLocale, type Locale, type TFunc } from './index';
import { localizeHref } from './href';

export const getLocale = cache(async (): Promise<Locale> => {
  const h = await headers();
  const raw = h.get('x-locale');
  return raw && isLocale(raw) ? raw : DEFAULT_LOCALE;
});

export const getT = cache(async (): Promise<TFunc> => {
  const locale = await getLocale();
  return createT(locale);
});

/**
 * `redirect()` s jazykovou predponou — CHYBA (Rastio, 17.9.2026:
 * „vyberiem jazyk a hneď zmení naspäť"): auth brány (`if (!user)
 * redirect('/login?next=...')`) boli všade napevno bez predpony, takže
 * PRIHLÁSENIE Z `/de/...` stránky poslalo na SK `/login` — človek si
 * myslel, že sa mu jazyk sám prepol naspäť. Každý `redirect()` na
 * cestu v appke musí ísť cez toto, nie cez holý `redirect(path)`.
 */
export async function redirectLocalized(path: string): Promise<never> {
  const locale = await getLocale();
  redirect(localizeHref(locale, path));
}
