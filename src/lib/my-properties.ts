/**
 * Moje inzeráty — SERVER-SIDE, prihlásený vlastník vidí AJ DRAFT/uzavreté
 * (RLS to pustí len jemu, presne ako appka — `useMyProperties` v
 * `use-properties.ts`, žiadny explicitný filter na `status`).
 */
import type { Media, Property, PropertyWithMedia } from "@/lib/property";
import { createClient } from "@/lib/supabase/server";

export async function fetchMyProperties(userId: string): Promise<PropertyWithMedia[]> {
  const supabase = await createClient();
  const db = supabase.schema("offerra");

  const { data: properties, error } = await db
    .from("property")
    .select("*")
    .eq("owner_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  const rows = (properties ?? []) as Property[];
  if (rows.length === 0) return [];

  const { data: media, error: mediaError } = await db
    .from("media")
    .select("*")
    .in(
      "property_id",
      rows.map((r) => r.id)
    )
    .order("sort_order", { ascending: true });
  if (mediaError) throw mediaError;

  const byProperty = new Map<string, Media[]>();
  for (const m of (media ?? []) as Media[]) {
    const list = byProperty.get(m.property_id);
    if (list) list.push(m);
    else byProperty.set(m.property_id, [m]);
  }

  return rows.map((r) => ({ ...r, media: byProperty.get(r.id) ?? [] }));
}
