/**
 * Správy 1:1 — ČISTÉ typy a funkcie, prenesené z
 * `/root/offerra/src/lib/messages.ts` (appka). Dátové funkcie (čítanie/
 * zápis cez Supabase) sú v `lib/message-data.ts` — rovnaké rozdelenie
 * ako `offers.ts`/`my-offers.ts` v tomto projekte.
 *
 * VŽDY DVAJA. Vlákno neurčuje inzerát, ale DVOJICA ľudí pri ňom — drží to
 * RLS `message_select_parties` V DATABÁZE, nie táto vrstva.
 *
 * IDENTITA OSTÁVA POD PREZÝVKOU — chat kontakt sám osebe neodkrýva,
 * kontaktné údaje sa v ňom ani nedajú napísať (`send_message` ich
 * odmietne; `contactInText` je klientská kópia tej istej kontroly, aby
 * človek nemusel čakať na server — NIE je to ochrana, tú drží DB).
 */
import type { TFunc } from '@/i18n';

export type Message = {
  id: string;
  property_id: string | null;
  request_id: string | null;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
};

export type MessageSubject = { propertyId: string; requestId?: never } | { requestId: string; propertyId?: never };

export function subjectIds(s: MessageSubject): { propertyId: string | null; requestId: string | null } {
  return 'propertyId' in s && s.propertyId
    ? { propertyId: s.propertyId, requestId: null }
    : { propertyId: null, requestId: (s as { requestId: string }).requestId };
}

export const MESSAGE_MAX = 2000;

export function contactInText(text: string): 'email' | 'phone' | null {
  const t = (text ?? '').toLowerCase();

  if (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/.test(t)) return 'email';
  if (/[a-z0-9._%+-]+\s*(\(at\)|\[at\]|\s+at\s+|zavinac|zavináč)\s*[a-z0-9.-]+\s*(\.|\s+bodka\s+)\s*[a-z]{2,}/.test(t)) {
    return 'email';
  }

  const zlepene = t.replace(/[\s\-./()]+/g, '');
  for (const skupina of zlepene.split(/[^0-9+]+/)) {
    if (skupina.replace(/[^0-9]/g, '').length >= 9) return 'phone';
  }
  return null;
}

export function contactBlockedText(t: TFunc, reason: 'email' | 'phone'): string {
  return t('messages.contactBlocked', {
    reason: reason === 'email' ? t('messages.reasonEmail') : t('messages.reasonPhone'),
  });
}

export type Thread = {
  otherId: string;
  last: Message;
  unread: number;
};
