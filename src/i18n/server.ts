/**
 * Server-only časť — `next/headers` smie žiť LEN tu (nie v
 * `src/i18n/index.ts`, ten importuje aj `proxy.ts`, kde je to
 * zakázané). Server Components volajú `const t = await getT()` samé —
 * lacné, `cache()` memoizuje len v rámci jednej požiadavky, nie
 * naprieč požiadavkami (Next.js reset cache po každom requeste).
 */
import { cache } from 'react';
import { headers } from 'next/headers';

import { createT, DEFAULT_LOCALE, isLocale, type Locale, type TFunc } from './index';

export const getLocale = cache(async (): Promise<Locale> => {
  const h = await headers();
  const raw = h.get('x-locale');
  return raw && isLocale(raw) ? raw : DEFAULT_LOCALE;
});

export const getT = cache(async (): Promise<TFunc> => {
  const locale = await getLocale();
  return createT(locale);
});
