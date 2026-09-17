import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from "@/lib/contact";
import type { TFunc } from "@/i18n";

/**
 * Telefón/e-mail Offerra — `tel:`/`mailto:` odkazy, aby sa z mobilu dalo
 * rovno zavolať/napísať (Rastio, 17.9.2026). Jeden zdroj údajov
 * (`lib/contact.ts`), dve zobrazenia — kompaktné (hlavička) a plné
 * (pätička) — zdieľajú rovnaké odkazy, líši sa len vzhľad.
 */
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
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        aria-label={t("footer.emailAriaLabel", { email: CONTACT_EMAIL })}
        title={CONTACT_EMAIL}
        className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-pressed hover:text-text-primary"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3.5 6 8.5 7 8.5-7" />
        </svg>
      </a>
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
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-text-secondary hover:bg-surface-pressed hover:text-text-primary"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3.5 6 8.5 7 8.5-7" />
        </svg>
        {CONTACT_EMAIL}
      </a>
    </div>
  );
}
