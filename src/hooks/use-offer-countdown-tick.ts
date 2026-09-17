"use client";

/**
 * JEDEN spoločný tikajúci `now`, port appkového
 * `use-offer-countdown-tick.ts` (Rastio, 1.9.2026) — nie samostatný
 * `setInterval` na každú kartu/odznak zvlášť.
 *
 * Frekvencia je stupňovitá podľa najbližšej platnosti spomedzi všetkých
 * poslaných `validUntil`: pod 24 hodín tiká po sekundách, inak raz za
 * minútu (appkový dôvod platí rovnako aj tu — pozri appkový komentár).
 */
import { useEffect, useState } from "react";

const SECONDS_VISIBLE_WINDOW_MS = 86_400_000;
const SECONDS_TICK_MS = 1_000;
const NORMAL_TICK_MS = 60_000;

export function useOfferCountdownTick(validUntils: (string | null | undefined)[], enabled: boolean = true): number {
  const [now, setNow] = useState(() => Date.now());

  const anySecondsVisible = validUntils.some((iso) => {
    if (!iso) return false;
    const ms = new Date(iso).getTime() - now;
    return ms > 0 && ms <= SECONDS_VISIBLE_WINDOW_MS;
  });

  useEffect(() => {
    if (!enabled) return;
    const intervalMs = anySecondsVisible ? SECONDS_TICK_MS : NORMAL_TICK_MS;
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [anySecondsVisible, enabled]);

  return now;
}
