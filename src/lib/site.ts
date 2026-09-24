/**
 * Jediný zdroj pravdy pre verejnú adresu webu — canonical, sitemap,
 * robots, JSON-LD, hreflang, `llms.txt`, `metadataBase`.
 *
 * Predtým bola adresa `https://app.offerra.sk` natvrdo na ~15 miestach.
 * Rastio (24.9.2026): „potrebujem to teraz tak aby to išlo na offerra.sk
 * nie na app.offerra.sk, aj SEO a všetko" — presun na apex je preto
 * JEDNA premenná (`SITE_URL` v `.env.local`, potom `npm run build` +
 * reštart), nie hľadanie po celom repozitári.
 *
 * Predvolená hodnota ostáva `https://app.offerra.sk`, kým sa DNS reálne
 * neprepne — canonical odkazujúci na doménu, ktorá ešte bežný web
 * (WordPress) servíruje, by bol horší než starý.
 */
export const SITE_URL = (process.env.SITE_URL ?? "https://app.offerra.sk").replace(/\/+$/, "");
export const SITE_HOST = new URL(SITE_URL).host;

/**
 * Hostitelia, ktorí po presune NESMÚ ostať samostatnými kópiami webu
 * (duplicitný obsah = rozdelené SEO) — všetky sa 301 presmerujú na
 * `SITE_URL`. Zoznam je zámerne uzavretý: neznámy hostiteľ (napr.
 * `localhost:3001` pri lokálnom teste, dočasná tunelová adresa) sa NEDOTKNE.
 */
export const ALIAS_HOSTS = ["offerra.sk", "www.offerra.sk", "app.offerra.sk"].filter((h) => h !== SITE_HOST);
