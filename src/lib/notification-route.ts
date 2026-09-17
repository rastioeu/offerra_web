/**
 * Kam vedie oznámenie — port appkového `src/lib/notification-route.ts`.
 * Web ZJEDNODUŠENIE oproti appke: appka má vlastnú obrazovku pre
 * majiteľa (`/ponuky/[id]`), web ukazuje správu ponúk priamo v
 * `OffersSection` na `/inzerat/[id]` — preto tu `NOVA_PONUKA` vedie na
 * ten istý detail ako ostatné typy, nie na samostatnú cestu.
 *
 * Čistá funkcia (žiadny router) — vracia LOKÁLNU cestu bez jazykovej
 * predpony, volajúci ju prevedie cez `localizeHref(locale, path)`.
 */
import type { NotificationType } from './notifications';

export type NotificationTarget = {
  propertyId: string | null;
  offerId?: string | null;
  requestId?: string | null;
};

export function notificationRoute(type: NotificationType | string, target: NotificationTarget): string | null {
  const { propertyId, requestId } = target;

  if (type === 'SYSTEMOVE') return '/oznamenia';

  if (type === 'NOVA_SPRAVA' && !propertyId && requestId) {
    return `/dopyt/${requestId}`;
  }

  if (!propertyId) return null;

  // OSLOVENIE_DOPYTU aj všetky ostatné typy s `propertyId` (vrátane
  // NOVA_PONUKA — pozri komentár vyššie) vedú na detail inzerátu.
  return `/inzerat/${propertyId}`;
}
