"use client";

import { useOfferCountdownTick } from "@/hooks/use-offer-countdown-tick";
import { deadlineLabel, deadlineUrgency } from "@/lib/deadline";
import { t, language } from "@/i18n";

/**
 * Živý odpočet uzávierky ponúk — appka: `PropertyCard`/`ponuka/[id]`
 * cez `useOfferCountdownTick`. Na webe bola predtým počítaná len raz
 * na serveri (statický render), teraz tiká rovnako ako appka.
 */
export function DeadlineBadge({ iso, className = "" }: { iso: string | null; className?: string }) {
  const now = useOfferCountdownTick([iso]);
  const label = deadlineLabel(t, language, iso, now);
  if (!label) return null;
  const urgency = deadlineUrgency(iso);

  return (
    <p
      className={`w-fit rounded-full px-3 py-1.5 text-sm font-medium ${
        urgency === "SOON" || urgency === "PASSED"
          ? "bg-danger/10 text-danger"
          : "bg-surface-pressed text-text-secondary"
      } ${className}`}
    >
      {label}
    </p>
  );
}
