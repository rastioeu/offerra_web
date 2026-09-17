"use client";

import { useOfferCountdownTick } from "@/hooks/use-offer-countdown-tick";
import { deadlineLabel, deadlineUrgency } from "@/lib/deadline";
import { t, language } from "@/i18n";

/**
 * Živý odpočet uzávierky ponúk — appka: `PropertyCard`/`ponuka/[id]`
 * cez `useOfferCountdownTick`. Na webe bola predtým počítaná len raz
 * na serveri (statický render), teraz tiká rovnako ako appka.
 *
 * `onPhoto` — appkový `PhotoBadge`: priesvitné pozadie ponad fotku
 * (`--color-on-photo-surface`), text farbí sa podľa naliehavosti. Bez
 * neho (na detaile, mimo fotky) je pozadie plné, appkový `Badge`.
 */
export function DeadlineBadge({
  iso,
  className = "",
  onPhoto = false,
}: {
  iso: string | null;
  className?: string;
  onPhoto?: boolean;
}) {
  const now = useOfferCountdownTick([iso]);
  const label = deadlineLabel(t, language, iso, now);
  if (!label) return null;
  const urgency = deadlineUrgency(iso);
  const urgent = urgency === "SOON" || urgency === "PASSED";

  return (
    <p
      className={`w-fit rounded-full px-2.5 py-[3px] text-xs font-semibold ${
        onPhoto
          ? `bg-on-photo-surface ${urgent ? "text-danger" : "text-text-secondary"}`
          : urgent
            ? "bg-danger/10 text-danger"
            : "bg-surface-pressed text-text-secondary"
      } ${className}`}
    >
      {label}
    </p>
  );
}
