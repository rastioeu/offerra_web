/**
 * Platnosť ponuky — prenesené z `/root/offerra/src/lib/offer-validity.ts`
 * (appka), teraz vrátane `offerCountdown` (živý, stupňovitý odpočet —
 * appkový viackolový formát: dni [+h] / h+m+s pod deň / m+s poslednú
 * hodinu / expired). `now` posiela volajúci zo spoločného tikajúceho
 * hooku (`useOfferCountdownTick`), táto funkcia sama žiadny interval
 * nezakladá.
 */
import type { TFunc } from '@/i18n';

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function offerValidityDaysLabel(t: TFunc, language: string, days: number): string {
  if (language === 'sk') {
    const key = days === 1 ? 'pickerDaysOne' : days >= 2 && days <= 4 ? 'pickerDaysFew' : 'pickerDaysMany';
    return t(`offerValidity.${key}`, { count: days });
  }
  return t(days === 1 ? 'offerValidity.pickerDaysOne' : 'offerValidity.pickerDaysMany', { count: days });
}

export function isOfferExpired(status: string, validUntil: string | null, now: number = Date.now()): boolean {
  return status === 'EXPIRED' || (validUntil != null && new Date(validUntil).getTime() <= now);
}

export type OfferCountdownTier = 'days' | 'hm' | 'hms' | 'expired';

export interface OfferCountdown {
  tier: OfferCountdownTier;
  /** Holé trvanie bez podmetu — „12h 35m 08s" / „47m 12s" / „38 s" / „3 dni 4h". */
  value: string;
  /** Hotová veta vrátane podmetu („Ponuka platí ešte…"). */
  text: string;
  /** Skutočná naliehavosť — len posledná hodina (`hms`). */
  urgent: boolean;
}

export function offerCountdown(
  t: TFunc,
  language: string,
  status: string,
  iso: string | null,
  now: number = Date.now()
): OfferCountdown | null {
  if (!iso) return null;
  if (isOfferExpired(status, iso, now)) {
    const value = t('offerValidity.expired');
    return { tier: 'expired', value, text: value, urgent: false };
  }
  const totalSeconds = Math.max(0, Math.floor((new Date(iso).getTime() - now) / 1000));
  if (totalSeconds < 86_400) {
    const h = Math.floor(totalSeconds / 3_600);
    const m = Math.floor((totalSeconds % 3_600) / 60);
    const s = totalSeconds % 60;
    const value = h > 0 ? `${h}h ${pad2(m)}m ${pad2(s)}s` : m > 0 ? `${m}m ${pad2(s)}s` : `${s} s`;
    const urgent = totalSeconds < 3_600;
    return { tier: urgent ? 'hms' : 'hm', value, text: t('offerValidity.countdown', { value }), urgent };
  }
  const days = Math.floor(totalSeconds / 86_400);
  const h = Math.floor((totalSeconds % 86_400) / 3_600);
  const daysLabel = offerValidityDaysLabel(t, language, days);
  const value = h > 0 ? `${daysLabel} ${h}h` : daysLabel;
  return { tier: 'days', value, text: t('offerValidity.countdown', { value }), urgent: false };
}
