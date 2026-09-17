"use client";

import { useOfferCountdownTick } from "@/hooks/use-offer-countdown-tick";
import { deadlineLabel, deadlineUrgency } from "@/lib/deadline";
import { createT, type Locale } from "@/i18n";

/**
 * Živý odpočet uzávierky ponúk — appka: `PropertyCard`/`ponuka/[id]`
 * cez `useOfferCountdownTick`. Na webe bola predtým počítaná len raz
 * na serveri (statický render), teraz tiká rovnako ako appka.
 *
 * `onPhoto` — appkový `PhotoBadge`: priesvitné pozadie ponad fotku
 * (`--color-on-photo-surface`), text farbí sa podľa naliehavosti. Bez
 * neho (na detaile, mimo fotky) je pozadie plné, appkový `Badge`.
 *
 * IKONA KALENDÁRA na fotke (Rastio, 17.9.2026, druhé kolo: „ak sa oba
 * badge zobrazujú súčasne, over že je jasné, ktorý je ktorý — napr.
 * malá ikonka pred textom") — táto pilulka a `OfferCountdownPill`
 * `onPhoto` sú teraz VIZUÁLNE ROVNAKÉ (rovnaké pozadie, tvar, farebná
 * logika), takže keď sú v tej istej karte nad sebou, text sám osebe
 * stačí na rozlíšenie, ale ikona to robí OKAMŽITE, bez čítania —
 * kalendár = termín INZERÁTU, hodiny (na `OfferCountdownPill`) =
 * platnosť PONUKY.
 */
export function DeadlineBadge({
  iso,
  language,
  className = "",
  onPhoto = false,
}: {
  iso: string | null;
  language: Locale;
  className?: string;
  onPhoto?: boolean;
}) {
  const t = createT(language);
  const now = useOfferCountdownTick([iso]);
  const label = deadlineLabel(t, language, iso, now);
  if (!label) return null;
  const urgency = deadlineUrgency(iso);
  const urgent = urgency === "SOON" || urgency === "PASSED";

  return (
    <p
      className={`w-fit rounded-full px-2.5 py-[3px] text-xs font-semibold ${
        onPhoto
          ? `inline-flex items-center gap-1 bg-on-photo-surface ${urgent ? "text-danger" : "text-text-secondary"}`
          : urgent
            ? "bg-danger/10 text-danger"
            : "bg-surface-pressed text-text-secondary"
      } ${className}`}
    >
      {onPhoto ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      ) : null}
      {label}
    </p>
  );
}
