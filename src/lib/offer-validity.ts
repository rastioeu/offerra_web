/**
 * Platnosť ponuky — prenesené z `/root/offerra/src/lib/offer-validity.ts`
 * (appka), len `offerValidityDaysLabel` a `isOfferExpired`. Appka má
 * naviac ŽIVÝ, po sekundách tikajúci odpočet (`offerCountdown`, veľká
 * viackolová práca) — pre web zatiaľ len statický dátum/stav, live
 * odpočet je FOLLOW-UP, nie súčasť tohto kroku.
 */
import type { TFunc } from '@/i18n';

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
