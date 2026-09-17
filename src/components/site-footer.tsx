import Link from "next/link";

import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from "@/lib/contact";
import { localizeHref } from "@/i18n/href";
import { getLocale, getT } from "@/i18n/server";

/**
 * Pätička — appka nemá web ekvivalent (appka nemá web routing vôbec),
 * toto je čisto webová vec. Právne texty (Ochrana osobných údajov,
 * Podmienky používania) žijú na `rastioeu.github.io/offerra_web` —
 * appka odkazuje na TÚ ISTÚ verejnú verziu (appkový `legal.tsx`
 * komentár: „appka nemôže tvrdiť niečo iné než verejná stránka, na
 * ktorú odkazuje App Store Connect"), preto sem vedie ten istý odkaz,
 * nie nová kópia obsahu vo web appke.
 */
const LEGAL_BASE = "https://rastioeu.github.io/offerra_web";

export async function SiteFooter() {
  const [locale, t] = await Promise.all([getLocale(), getT()]);
  const href = (path: string) => localizeHref(locale, path);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              {t("footer.contactSection")}
            </h2>
            <a
              href={`tel:${CONTACT_PHONE_TEL}`}
              aria-label={t("footer.callAriaLabel", { phone: CONTACT_PHONE_DISPLAY })}
              className="text-lg font-semibold text-text-primary hover:text-link"
            >
              {CONTACT_PHONE_DISPLAY}
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              aria-label={t("footer.emailAriaLabel", { email: CONTACT_EMAIL })}
              className="text-lg font-semibold text-text-primary hover:text-link"
            >
              {CONTACT_EMAIL}
            </a>
          </div>

          <nav className="flex flex-col gap-1.5 sm:items-end">
            <Link href={href("/ako-to-funguje")} className="text-sm text-text-secondary hover:text-text-primary">
              {t("nastavenia.howItWorks")}
            </Link>
            <a
              href={`${LEGAL_BASE}/privacy.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-text-secondary hover:text-text-primary"
            >
              {t("footer.privacyPolicy")}
            </a>
            <a
              href={`${LEGAL_BASE}/terms.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-text-secondary hover:text-text-primary"
            >
              {t("footer.termsOfUse")}
            </a>
          </nav>
        </div>

        <p className="text-xs text-text-muted">{t("footer.rights", { year })}</p>
      </div>
    </footer>
  );
}
