/**
 * Obľúbené inzeráty — SERVER-SIDE zoznam pre `/oblubene`. Appka toto
 * nemá ako samostatnú obrazovku (je to sekcia v Profile), web áno —
 * rovnaký vzor ako appkové `useFavoriteProperties`, len bez appkovej
 * obrazovky navôkol.
 *
 * `favorite` nemá RLS na JOIN cez `property` priamo, preto dva dopyty:
 * ID-čka z `favorite`, potom `property`+`media` (RLS na property_select_public
 * odfiltruje sama, čo už nie je ACTIVE — obľúbený, ale zmiznutý inzerát
 * sa v zozname jednoducho nezobrazí, nespadne).
 */
import type { Media, Property, PropertyWithMedia } from "@/lib/property";
import { createClient } from "@/lib/supabase/server";

export async function fetchFavoriteProperties(userId: string): Promise<PropertyWithMedia[]> {
  const supabase = await createClient();
  const db = supabase.schema("offerra");

  const { data: favorites, error: favError } = await db
    .from("favorite")
    .select("property_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (favError) throw favError;
  const ids = (favorites ?? []).map((f) => (f as { property_id: string }).property_id);
  if (ids.length === 0) return [];

  const { data: properties, error } = await db.from("property").select("*").in("id", ids);
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

  // Poradie podľa `favorite.created_at` (najnovšie obľúbené prvé), nie
  // podľa poradia z `property` dopytu.
  const byId = new Map(rows.map((r) => [r.id, { ...r, media: byProperty.get(r.id) ?? [] }]));
  return ids.map((id) => byId.get(id)).filter((p): p is PropertyWithMedia => p != null);
}
