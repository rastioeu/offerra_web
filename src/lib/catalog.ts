/**
 * Verejný katalóg — SERVER-SIDE dotaz pre SSR (kvôli SEO, viď
 * `reports/OFFERRA_WEB_PLAN.md`). RLS pustí anon kľúču len `status =
 * 'ACTIVE'` riadky rovnako, ako appke — explicitný `.eq('status',
 * 'ACTIVE')` tu je pre čitateľnosť dotazu, nie obchádzanie RLS.
 *
 * Filtrovanie je rovnaká logika ako appka (`use-properties.ts` →
 * `useProperties`) — bez `onlyFavorites` (vyžaduje prihlásenie, ktoré
 * web zatiaľ nemá).
 */
import { isOfferExpired } from '@/lib/offer-validity';
import { sortProperties, type CatalogSort, type Media, type Property, type PropertyWithMedia } from '@/lib/property';
import { stemQuery, type CatalogFilter } from '@/lib/search';
import { createClient } from '@/lib/supabase/server';

/**
 * Súhrn ponúk pre karty v katalógu — najvyššia ŽIVÁ ponuka a ich počet.
 * Port appkového `attachOfferStats` (`use-properties.ts`) — jeden dotaz na
 * celú stránku, nie jeden na kartu. Platnosť sa počíta ŽIVO
 * (`isOfferExpired`), nie len zo `status`, z toho istého dôvodu ako appka:
 * cron `offerra.expire_offers()` beží len raz za pár minút.
 */
async function attachOfferStats(
  db: ReturnType<Awaited<ReturnType<typeof createClient>>['schema']>,
  rows: PropertyWithMedia[]
): Promise<PropertyWithMedia[]> {
  if (rows.length === 0) return rows;
  const { data, error } = await db
    .from('property_offer')
    .select('property_id, amount, status, valid_until')
    .in(
      'property_id',
      rows.map((r) => r.id)
    );
  if (error) throw error;

  const best = new Map<string, { top: number | null; topValidUntil: string | null; count: number }>();
  for (const o of (data ?? []) as { property_id: string; amount: number; status: string; valid_until: string | null }[]) {
    if (o.status !== 'PENDING' && o.status !== 'ACCEPTED') continue;
    if (o.status === 'PENDING' && isOfferExpired(o.status, o.valid_until)) continue;
    const cur = best.get(o.property_id) ?? { top: null, topValidUntil: null, count: 0 };
    cur.count += 1;
    if (cur.top == null || o.amount > cur.top) {
      cur.top = o.amount;
      cur.topValidUntil = o.valid_until;
    }
    best.set(o.property_id, cur);
  }
  return rows.map((r) => ({
    ...r,
    top_offer: best.get(r.id)?.top ?? null,
    top_offer_valid_until: best.get(r.id)?.topValidUntil ?? null,
    offer_count: best.get(r.id)?.count ?? 0,
  }));
}

export async function fetchCatalog(
  filter?: Partial<CatalogFilter> | null,
  sort: CatalogSort = 'NEWEST'
): Promise<PropertyWithMedia[]> {
  const supabase = await createClient();
  const db = supabase.schema('offerra');

  let q = db.from('property').select('*').eq('status', 'ACTIVE');

  if (filter?.transaction) q = q.eq('transaction_type', filter.transaction);
  if (filter?.propertyType) q = q.eq('property_type', filter.propertyType);
  if (filter?.city) q = q.eq('city', filter.city);
  if (filter?.roomsMin != null) q = q.gte('rooms', filter.roomsMin);
  if (filter?.areaMin != null) q = q.gte('area_m2', filter.areaMin);
  // Inzerát BEZ ceny sa cenovým filtrom nesmie stratiť — cena je v Offerre
  // nepovinná, presne ako v appke.
  if (filter?.priceMax != null) q = q.or(`asking_price_hint.lte.${filter.priceMax},asking_price_hint.is.null`);
  if (filter?.priceMin != null) q = q.or(`asking_price_hint.gte.${filter.priceMin},asking_price_hint.is.null`);
  if (filter?.text) {
    for (const w of stemQuery(filter.text.replace(/[%,()]/g, ' ')).split(' ')) {
      if (w) q = q.like('search_norm', `%${w}%`);
    }
  }

  const { data: properties, error } = await q.order('created_at', { ascending: false }).limit(200);
  if (error) throw error;
  const rows = (properties ?? []) as Property[];
  if (rows.length === 0) return [];

  const { data: media, error: mediaError } = await db
    .from('media')
    .select('*')
    .in(
      'property_id',
      rows.map((r) => r.id)
    )
    .order('sort_order', { ascending: true });
  if (mediaError) throw mediaError;

  const byProperty = new Map<string, Media[]>();
  for (const m of (media ?? []) as Media[]) {
    const list = byProperty.get(m.property_id);
    if (list) list.push(m);
    else byProperty.set(m.property_id, [m]);
  }

  const withMedia = rows.map((r) => ({ ...r, media: byProperty.get(r.id) ?? [] }));
  const withOffers = await attachOfferStats(db, withMedia);
  return sortProperties(withOffers, sort);
}
