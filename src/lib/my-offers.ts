/**
 * Moje ponuky (odoslané) a moje dopyty — SERVER-SIDE, prihlásený
 * používateľ. Rovnaká logika ako appka (`useMyOffers`/`useRequests`
 * s `mineOf` v `use-offers.ts`).
 */
import { OFFER_PUBLIC_COLS, type BuyerRequest, type Offer } from "@/lib/offers";
import { createClient } from "@/lib/supabase/server";

export type MyOffer = Offer & {
  property: { title: string; transaction_type: "SALE" | "RENT" } | null;
};

export async function fetchMyOffers(userId: string): Promise<MyOffer[]> {
  const supabase = await createClient();
  const db = supabase.schema("offerra");

  const { data, error } = await db
    .from("property_offer")
    .select(`${OFFER_PUBLIC_COLS}, property:property_id(title, transaction_type)`)
    .eq("bidder_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  // Rovnaký dôvod ako appka: `message` sa v zozname mojich ponúk
  // nezobrazuje (viazaná na inzerát, nie na používateľa), preto sa
  // sem ani nedoťahuje.
  return (data ?? []).map((r) => ({ ...r, message: null })) as unknown as MyOffer[];
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
