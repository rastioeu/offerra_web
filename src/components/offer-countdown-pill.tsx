"use client";

import { useOfferCountdownTick } from "@/hooks/use-offer-countdown-tick";
import { offerCountdown } from "@/lib/offer-validity";
import { createT, type Locale } from "@/i18n";

/**
 * Odpočet platnosti KONKRÉTNEJ ponuky (nie uzávierka inzerátu —
 * `DeadlineBadge`) — port appkového `OfferCountdownText`/`OfferCountdownPill`.
 * Mimo fotky: bežiaci, nenaliehavý stav = teplá pilulka s hodinovou
 * ikonou; posledná hodina = plain červený tučný text bez pilulky (appka:
 * „tam už má poplašná farba zmysel, pill by ju len zoslabil").
 *
 * `onPhoto` (Rastio, 17.9.2026: „dva vizuálne štýly pre časovo-citlivé
 * badge na karte — musia vyzerať ako súčasť jedného dizajn systému")
 * — na fotke katalógovej karty ide o ROVNAKÚ pilulku ako `DeadlineBadge`
 * (`bg-on-photo-surface`, žiadna ikona, vždy pilulka aj v poslednej
 * hodine — nemizne ako mimo fotky), farebná logika sa nesie len
 * v texte: akcentová oranžová bežne, `danger` v poslednej hodine,
 * tlmená pri expirovanej ponuke. Rovnaká pozícia, rovnaký typ pozadia,
 * jeden dizajn systém — líši sa len farba textu podľa stavu.
 */
export function OfferCountdownPill({
  status,
  validUntil,
  language,
  onPhoto = false,
}: {
  status: string;
  validUntil: string | null;
  language: Locale;
  onPhoto?: boolean;
}) {
  const t = createT(language);
  const now = useOfferCountdownTick([validUntil]);
  const cd = offerCountdown(t, language, status, validUntil, now);
  if (!cd) return null;

  if (onPhoto) {
    const color = cd.tier === "expired" ? "text-text-secondary" : cd.urgent ? "text-danger" : "text-accent-deep";
    return <span className={`w-fit rounded-full bg-on-photo-surface px-2.5 py-[3px] text-xs font-semibold ${color}`}>{cd.text}</span>;
  }

  if (cd.tier === "expired") {
    return <span className="text-xs font-medium text-warning">{cd.text}</span>;
  }
  if (cd.urgent) {
    return <span className="text-xs font-bold text-danger">{cd.text}</span>;
  }
  return (
    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-accent-soft px-2.5 py-[3px] text-xs font-semibold text-accent-deep">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
      {cd.text}
    </span>
  );
}
