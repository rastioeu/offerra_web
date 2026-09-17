"use client";

import { useOfferCountdownTick } from "@/hooks/use-offer-countdown-tick";
import { offerCountdown } from "@/lib/offer-validity";
import { t, language } from "@/i18n";

/**
 * Odpočet platnosti KONKRÉTNEJ ponuky (nie uzávierka inzerátu —
 * `DeadlineBadge`) — port appkového `OfferCountdownText`/`OfferCountdownPill`.
 * Bežiaci, nenaliehavý stav = teplá pilulka s hodinovou ikonou; posledná
 * hodina = plain červený tučný text bez pilulky (appka: „tam už má
 * poplašná farba zmysel, pill by ju len zoslabil").
 */
export function OfferCountdownPill({ status, validUntil }: { status: string; validUntil: string | null }) {
  const now = useOfferCountdownTick([validUntil]);
  const cd = offerCountdown(t, language, status, validUntil, now);
  if (!cd) return null;

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
