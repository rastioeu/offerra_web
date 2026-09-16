/**
 * i18n pre web — ZATIAĽ len slovenčina (appka podporuje aj EN/DE, viď
 * `/root/offerra/src/i18n/index.tsx`). Rovnaký JSON slovník ako appka
 * (`{{premenná}}` interpolácia, `t('domain.key')`) — prenesené 1:1 z
 * `src/i18n/locales/sk.json`, aby texty medzi appkou a webom nešli
 * dvoma cestami.
 *
 * Prepínanie jazyka (EN/DE) a URL štruktúra (`/en/...` vs. query param
 * vs. Accept-Language) je OTVORENÉ ROZHODNUTIE — pozri
 * `reports/OFFERRA_WEB_MILNIK1.md` v `/root/offerra`. Kým sa nerozhodne,
 * appka renderuje len SK, presne ako cieľový trh domény `offerra.sk`.
 */
import sk from './locales/sk.json';

export type TFunc = (key: string, params?: Record<string, string | number>) => string;

const RESOURCES: Record<string, Record<string, string>> = sk as Record<string, Record<string, string>>;

function getPath(domain: Record<string, string> | undefined, key: string): string | undefined {
  return domain?.[key];
}

export const t: TFunc = (key, params) => {
  const [domain, ...rest] = key.split('.');
  const restKey = rest.join('.');
  const raw = getPath(RESOURCES[domain], restKey);
  if (typeof raw !== 'string') return key;
  if (!params) return raw;
  return raw.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
    params[name] != null ? String(params[name]) : match
  );
};

export const language = 'sk';
