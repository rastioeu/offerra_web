/**
 * Moje ponuky (odoslané) a moje dopyty — SERVER-SIDE, prihlásený
 * používateľ. Rovnaká logika ako appka (`useMyOffers`/`useRequests`
 * s `mineOf` v `use-offers.ts`).
 */
import { OFFER_PUBLIC_COLS, type BuyerRequest, type Offer } from "@/lib/offers";
import { createClient } from "@/lib/supabase/server";

export type MyOffer = Offer & {
  property: { title: string; transaction_type: "SALE" | "RENT"; city: string | null; photo: string | null } | null;
};

export async function fetchMyOffers(userId: string): Promise<MyOffer[]> {
  const supabase = await createClient();
  const db = supabase.schema("offerra");

  const { data, error } = await db
    .from("property_offer")
    .select(`${OFFER_PUBLIC_COLS}, property:property_id(id, title, transaction_type, city)`)
    .eq("bidder_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const rows = (data ?? []) as unknown as (Offer & {
    property: { id: string; title: string; transaction_type: "SALE" | "RENT"; city: string | null } | null;
  })[];

  // Titulná fotka ku každému inzerátu, JEDEN dotaz pre celú stránku
  // (rovnaký vzor ako appkové `attachMedia`) — nie N+1 na riadok.
  const propertyIds = [...new Set(rows.map((r) => r.property?.id).filter((id): id is string => Boolean(id)))];
  const photoByProperty = new Map<string, string>();
  if (propertyIds.length > 0) {
    const { data: media, error: mediaError } = await db
      .from("media")
      .select("property_id, url, sort_order")
      .in("property_id", propertyIds)
      .order("sort_order", { ascending: true });
    if (mediaError) throw mediaError;
    for (const m of (media ?? []) as { property_id: string; url: string }[]) {
      if (!photoByProperty.has(m.property_id)) photoByProperty.set(m.property_id, m.url);
    }
  }

  // Rovnaký dôvod ako appka: `message` sa v zozname mojich ponúk
  // nezobrazuje (viazaná na inzerát, nie na používateľa), preto sa
  // sem ani nedoťahuje.
  return rows.map((r) => ({
    ...r,
    message: null,
    property: r.property ? { ...r.property, photo: photoByProperty.get(r.property.id) ?? null } : null,
  }));
}

export async function fetchMyRequests(userId: string): Promise<BuyerRequest[]> {
  const supabase = await createClient();
  const db = supabase.schema("offerra");

  const { data, error } = await db
    .from("buyer_request")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data ?? []) as BuyerRequest[];
}
