/**
 * Obhliadky — ČISTÉ typy a texty, prenesené z
 * `/root/offerra/src/lib/viewing.ts` (appka). Dátové funkcie sú
 * v `lib/viewing-data.ts`.
 *
 * Žiadosť vznikne ako `REQUESTED` (pod prezývkou, bez kontaktu), vlastník
 * ju potvrdí alebo zamietne, a až potvrdením (`CONFIRMED`) sa kontakt
 * odkryje OBOM stranám naraz — rovnaký mechanizmus ako pri prijatí
 * ponuky. Appka NENAVRHUJE ani nepotvrdzuje TERMÍNY — to zostáva na
 * telefonáte mimo appky.
 *
 * Na rozdiel od ponuky obhliadka VEREJNÁ NIE JE — súkromná dohoda dvoch
 * ľudí, nie súťaž.
 */
import type { TFunc } from '@/i18n';

export type ViewingStatus = 'REQUESTED' | 'CONFIRMED' | 'CONTACT_SHARED' | 'COMPLETED' | 'CANCELLED';

export type Viewing = {
  id: string;
  property_id: string;
  requester_id: string;
  status: ViewingStatus;
  created_at: string;
  updated_at: string;
};

export type ViewingContact = {
  party: 'OWNER' | 'REQUESTER';
  nickname: string | null;
  full_name: string | null;
  phone: string | null;
  email: string | null;
};

/** Stavy, v ktorých je kontakt už odkrytý. `CONTACT_SHARED` je len pre riadky spred zmeny mechaniky (13.8.2026). */
export const REVEALED: ViewingStatus[] = ['CONFIRMED', 'CONTACT_SHARED'];

export function getViewingStatusLabel(t: TFunc): Record<ViewingStatus, string> {
  return {
    REQUESTED: t('viewing.statusRequested'),
    CONFIRMED: t('viewing.statusConfirmed'),
    CONTACT_SHARED: t('viewing.statusContactShared'),
    COMPLETED: t('viewing.statusCompleted'),
    CANCELLED: t('viewing.statusCancelled'),
  };
}

/**
 * Veta, ktorá musí byť VIDNO PREDTÝM, než niekto o obhliadku požiada —
 * podstata informovaného súhlasu (appka to má rovnako).
 */
export function getViewingConsent(t: TFunc): string {
  return t('viewing.consent');
}
