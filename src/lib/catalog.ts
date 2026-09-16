/**
 * Verejný katalóg — SERVER-SIDE dotaz pre SSR (kvôli SEO, viď
 * `reports/OFFERRA_WEB_PLAN.md`). RLS pustí anon kľúču len `status =
 * 'ACTIVE'` riadky rovnako, ako appke — explicitný `.eq('status',
 * 'ACTIVE')` tu je pre čitateľnosť dotazu, nie obchádzanie RLS.
 *
 * ZATIAĽ bez filtrov/vyhľadávania (appka ich má v `src/lib/search.ts` +
 * `use-properties.ts` — Fáza 1.1, pozri report). Len zoznam + fotky,
 * najnovšie prvé, limit 60 — pre prvú SSR obrazovku stačí, stránkovanie
 * pribudne s filtrami.
 */
import { createClient } from '@/lib/supabase/server';
import type { Media, Property, PropertyWithMedia } from '@/lib/property';

export async function fetchCatalog(): Promise<PropertyWithMedia[]> {
  const supabase = await createClient();
  const db = supabase.schema('offerra');

  const { data: properties, error } = await db
    .from('property')
    .select('*')
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false })
    .limit(60);

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

  return rows.map((r) => ({ ...r, media: byProperty.get(r.id) ?? [] }));
}
