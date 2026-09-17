import { CONTACT_EMAIL } from "@/lib/contact";
import type { TFunc } from "@/i18n";

/**
 * Telefón/e-mail Offerra — `tel:`/`mailto:` odkazy, aby sa z mobilu dalo
 * rovno zavolať/napísať (Rastio, 17.9.2026). Jeden zdroj údajov
 * (`lib/contact.ts`).
 *
 * PREČ Z HLAVIČKY (Rastio, 17.9.2026: „telefón a mail nemusia byť hore
 * na lište") — pôvodne tri zobrazenia (ikona v hlavičke, ikona+text
 * v hamburgeri, plný text v pätičke), teraz ostáva LEN pätička
 * (`FooterMailLink`) — kontakt je tam už aj tak plný a výrazný (Rastio,
 * 17.9.2026, prvá požiadavka na kontakt), v hlavičke bol duplicitný.
 * `HeaderContact`/`MobileNavContact` a ich ikona (`mailIconSvg`) preto
 * zmazané, nie len odpojené — nič iné ich nepoužívalo.
 *
 * DRUHÝ POKUS (Rastio, 17.9.2026, druhé hlásenie): prvý pokus zakódoval
 * `@` ako `&#64;` v surových bajtoch — teória bola, že Cloudflare Scrape
 * Shield skenuje bajty REGEXOM, ktorý entitu nenájde. PO NASADENÍ (curl
 * na živý web) sa ukázalo, že Scrape Shield entity DEKÓDUJE skôr, než ich
 * porovnáva — teda `href="mailto:kontakt&#64;offerra.sk"` NAŠIEL a
 * `href` prepísal na `/cdn-cgi/l/email-protection#…`. Viditeľný text
 * ostal čitateľný (entita v texte sa prepísať nedala, tam sa Scrape
 * Shield nedotkol obsahu <a>, len href), takže PÔVODNÝ nahlásený problém
 * („[email protected]" namiesto adresy) bol touto zmenou už vyriešený —
 * ale odkaz sa spoliehal na to, že sa na klientovi stiahne a spustí
 * Cloudflareov `email-decode.min.js`, presne tá istá krehkosť, kvôli
 * ktorej problém vznikol prvýkrát.
 *
 * SPRÁVNE RIEŠENIE: Cloudflare má na presne toto ZDOKUMENTOVANÝ bypass —
 * `<!--email_off-->…<!--/email_off-->` okolo obsahu vypne Scrape Shield
 * pre všetko, čo je medzi týmito komentármi, bez ohľadu na API práva
 * (netreba teda meniť nastavenia zóny, ktoré token z `.offerra-secrets`
 * aj tak nemá). `href` aj viditeľný text preto teraz idú ako OBYČAJNÉ
 * `mailto:kontakt@offerra.sk` — Cloudflare sa ich vôbec nedotkne.
 *
 * `dangerouslySetInnerHTML` ostáva (nie normálny JSX prop) — React by
 * HTML komentár v bežnom texte/atribúte escapoval na viditeľný text
 * `<!--email_off-->`, nie na skutočný komentár, ktorý Cloudflare vie
 * rozpoznať.
 */
function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

/** Plná verzia pre pätičku — jediné miesto, kde sa e-mail zobrazuje. */
export function FooterMailLink({ t, className }: { t: TFunc; className: string }) {
  const ariaLabel = escapeAttr(t("footer.emailAriaLabel", { email: CONTACT_EMAIL }));
  const anchor = `<a href="mailto:${CONTACT_EMAIL}" aria-label="${ariaLabel}" class="${className}">${escapeAttr(CONTACT_EMAIL)}</a>`;
  return <span dangerouslySetInnerHTML={{ __html: `<!--email_off-->${anchor}<!--/email_off-->` }} />;
}
