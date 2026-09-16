/**
 * Detail JEDNÉHO inzerátu, server-side (SSR). Bez explicitného filtra na
 * `status` — presne ako appka (`useProperty` v `use-properties.ts`): RLS
 * anon kľúču pustí len to, čo má byť verejné, a `maybeSingle()` vráti
 * `null`, keď RLS riadok skryje (napr. DRAFT/CLOSED) — to sa potom
 * v stránke zobrazí ako „nenájdené", nie ako chyba.
 */
import type { Media, Property } from '@/lib/property';
import { createClient } from '@/lib/supabase/server';

export type PropertyDetail = Property & {
  media: Media[];
  owner: { nickname: string | null; avatar_url: string | null } | null;
};

export async function fetchProperty(id: string): Promise<PropertyDetail | null> {
  const supabase = await createClient();
  const db = supabase.schema('offerra');

  const { data, error } = await db
    .from('property')
    .select('*, owner:owner_id(nickname, avatar_url)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const { data: media, error: mediaError } = await db
    .from('media')
    .select('*')
    .eq('property_id', id)
    .order('sort_order', { ascending: true });
  if (mediaError) throw mediaError;

  const row = data as Property & { owner: { nickname: string | null; avatar_url: string | null } | null };
  return { ...row, media: (media ?? []) as Media[] };
}
