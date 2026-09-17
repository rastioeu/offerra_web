import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from "@/lib/contact";
import type { TFunc } from "@/i18n";

/**
 * Telefón/e-mail Offerra — `tel:`/`mailto:` odkazy, aby sa z mobilu dalo
 * rovno zavolať/napísať (Rastio, 17.9.2026). Jeden zdroj údajov
 * (`lib/contact.ts`), tri zobrazenia — ikona (hlavička), ikona+text
 * (hamburger menu) a plný text (pätička) — zdieľajú rovnakú ochranu
 * e-mailu, líši sa len vzhľad.
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

function mailIconSvg(size: number): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3.5 6 8.5 7 8.5-7"></path></svg>`;
}

/**
 * `icon` je RAW SVG markup (nie escapované — je to skutočné HTML), `text`
 * je viditeľný e-mail (len escapovaný, BEZ entity — Cloudflare sa vďaka
 * `<!--email_off-->` obalu nemá čo dotknúť). Oddelené zámerne — miešať by
 * znamenalo escapovať `<svg>` tagy ako obyčajný text.
 */
function mailLinkHtml({
  className,
  ariaLabel,
  title,
  icon,
  text,
}: {
  className: string;
  ariaLabel: string;
  title?: string;
  icon?: string;
  text?: string;
}): string {
  const inner = (icon ?? "") + (text ? escapeAttr(text) : "");
  const titleAttr = title ? ` title="${escapeAttr(title)}"` : "";
  const anchor = `<a href="mailto:${CONTACT_EMAIL}" aria-label="${escapeAttr(ariaLabel)}"${titleAttr} class="${className}">${inner}</a>`;
  return `<!--email_off-->${anchor}<!--/email_off-->`;
}

export function HeaderContact({ t }: { t: TFunc }) {
  return (
    <div className="flex items-center gap-1">
      <a
        href={`tel:${CONTACT_PHONE_TEL}`}
        aria-label={t("footer.callAriaLabel", { phone: CONTACT_PHONE_DISPLAY })}
        title={CONTACT_PHONE_DISPLAY}
        className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-pressed hover:text-text-primary"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M4 5c0-.55.45-1 1-1h3.09a1 1 0 0 1 .98.79l.9 3.6a1 1 0 0 1-.27.95l-1.7 1.7a12.5 12.5 0 0 0 5.96 5.96l1.7-1.7a1 1 0 0 1 .95-.27l3.6.9a1 1 0 0 1 .79.98V20c0 .55-.45 1-1 1h-1.5C9.62 21 3 14.38 3 6.5V5z" />
        </svg>
      </a>
      <span
        dangerouslySetInnerHTML={{
          __html: mailLinkHtml({
            className:
              "flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-pressed hover:text-text-primary",
            ariaLabel: t("footer.emailAriaLabel", { email: CONTACT_EMAIL }),
            title: CONTACT_EMAIL,
            icon: mailIconSvg(18),
          }),
        }}
      />
    </div>
  );
}

/** Do hamburger menu (appka: „na mobile schované do menu") — text, nie len ikona, nech je jasné, čo je čo. */
export function MobileNavContact({ t }: { t: TFunc }) {
  return (
    <div className="flex flex-col gap-1 border-t border-border pt-2">
      <a
        href={`tel:${CONTACT_PHONE_TEL}`}
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-text-secondary hover:bg-surface-pressed hover:text-text-primary"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M4 5c0-.55.45-1 1-1h3.09a1 1 0 0 1 .98.79l.9 3.6a1 1 0 0 1-.27.95l-1.7 1.7a12.5 12.5 0 0 0 5.96 5.96l1.7-1.7a1 1 0 0 1 .95-.27l3.6.9a1 1 0 0 1 .79.98V20c0 .55-.45 1-1 1h-1.5C9.62 21 3 14.38 3 6.5V5z" />
        </svg>
        {CONTACT_PHONE_DISPLAY}
      </a>
      <div
        dangerouslySetInnerHTML={{
          __html: mailLinkHtml({
            className:
              "flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-text-secondary hover:bg-surface-pressed hover:text-text-primary",
            ariaLabel: t("footer.emailAriaLabel", { email: CONTACT_EMAIL }),
            icon: mailIconSvg(16),
            text: CONTACT_EMAIL,
          }),
        }}
      />
    </div>
  );
}

/** Plná verzia pre pätičku — viditeľný text, bez ikony. */
export function FooterMailLink({ t, className }: { t: TFunc; className: string }) {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: mailLinkHtml({
          className,
          ariaLabel: t("footer.emailAriaLabel", { email: CONTACT_EMAIL }),
          text: CONTACT_EMAIL,
        }),
      }}
    />
  );
}
