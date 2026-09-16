/**
 * Uzávierka ponúk — ČISTÉ funkcie, prenesené z
 * `/root/offerra/src/lib/deadline.ts` (appka), bez zmeny logiky. Dôvod
 * oddelenia od `property.ts` v appke (aby sa dalo testovať bez appky) tu
 * neplatí rovnako, ale zachovávam rovnaký tvar, aby prípadná budúca
 * synchronizácia oboch repozitárov bola priama.
 */
import type { TFunc } from '@/i18n';

export type DeadlineUrgency = 'NONE' | 'OPEN' | 'SOON' | 'PASSED';

export const SOON_DAYS = 3;

export function isDeadlinePassed(iso: string | null): boolean {
  return iso != null && new Date(iso).getTime() <= Date.now();
}

export function deadlineUrgency(iso: string | null): DeadlineUrgency {
  if (!iso) return 'NONE';
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return 'PASSED';
  return ms < SOON_DAYS * 86_400_000 ? 'SOON' : 'OPEN';
}

function localDate(language: string, iso: string): string {
  const tag = language === 'sk' ? 'sk-SK' : language === 'de' ? 'de-DE' : 'en-GB';
  return new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
}

/** Ostávajúci čas do uzávierky ponúk. `null` = bez časovača alebo už po ňom. */
export function deadlineLabel(t: TFunc, language: string, iso: string | null, now: number = Date.now()): string | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - now;
  if (ms <= 0) return t('deadline.offersEnded');
  const days = Math.floor(ms / 86_400_000);
  if (days >= 1) return t('deadline.offersUntil', { date: localDate(language, iso), days });
  const hours = Math.max(1, Math.floor(ms / 3_600_000));
  return t('deadline.offersClosingInHours', { hours });
}
