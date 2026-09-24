/**
 * 301 presmerovania zo starého WordPress webu (`www.offerra.sk`, Yoast
 * SEO, Elementor) na nový web — aby SEO história a odkazy zvonka
 * (Google, Facebook, Instagram) nespadli na 404 v deň, keď sa apex
 * `offerra.sk` prepne z WordPressu na túto appku (Rastio, 24.9.2026).
 *
 * Zoznam URL je REÁLNY, z verejných Yoast sitemap
 * (`/page-sitemap.xml`, `/nehnutelnost-sitemap.xml`, stiahnuté 24.9.2026),
 * nie odhad. Kľúče sú cesty BEZ koncového lomítka (WordPress ich mal
 * vždy s lomítkom, Next.js ich odstraňuje, preto sa pred hľadaním
 * normalizuje).
 *
 * Kam čo vedie a prečo:
 *  - obsahové stránky (FAQ, O nás, Kontakt) → `/ako-to-funguje` alebo
 *    `/` — ich obsah nový web nemá 1:1, najbližší ekvivalent;
 *  - právne texty → verejné právne stránky (rovnaké, na ktoré odkazuje
 *    App Store Connect a pätička webu), nie kópia;
 *  - účtové stránky WordPressu (registrácia, prihlásenie, môj profil,
 *    moje ponuky…) → `/login` — staré WP účty sa NEPRENÁŠAJÚ, nový web
 *    má vlastné prihlásenie (Google/Apple);
 *  - ponuky/mapa/detail ponuky → `/` (katalóg).
 */
const LEGAL_BASE = "https://rastioeu.github.io/offerra_web";

const MAP: Record<string, string> = {
  "/ponuky": "/",
  "/mapa": "/",
  "/pridat-ponuku": "/",
  "/dat-ponuku": "/",
  "/kontakt": "/",
  "/welcome": "/",
  "/faq": "/ako-to-funguje",
  "/o-nas": "/ako-to-funguje",
  "/domaca-stranka-english": "/en",
  "/registracia": "/login",
  "/aktivacia-uctu": "/login",
  "/my-account": "/login",
  "/moj-profil": "/login",
  "/moje-odoslane-ponuky": "/login",
  "/moje-ponuky-2": "/login",
  "/podmienky-pouzivania": `${LEGAL_BASE}/terms.html`,
  "/ochrana-osobnych-udajov-gdpr": `${LEGAL_BASE}/privacy.html`,
  "/zasady-pouzivania-suborov-cookies": `${LEGAL_BASE}/privacy.html`,
};

/** Cieľ presmerovania pre starú WordPress cestu, alebo `null`, ak to nie je stará cesta. */
export function legacyRedirectTarget(pathname: string): string | null {
  const key = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  // `/login` je aj v mape WordPressu aj v novom webe — zámerne NIE JE v `MAP`,
  // inak by sa nový `/login` presmeroval sám na seba.
  if (Object.prototype.hasOwnProperty.call(MAP, key)) return MAP[key];
  if (key.startsWith("/ponuka/")) return "/"; // detail starého WP inzerátu (`nehnutelnost` post type)
  return null;
}
