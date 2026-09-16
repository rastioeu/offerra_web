/**
 * Ponuky na JEDEN inzerát — verejný zoznam (appka: `useOffers`). Otvorené,
 * ale pseudonymné — sumu, prezývku, stav a dátum vidí ktokoľvek, aj
 * neprihlásený (Rastio, 7.8.2026). Meno/telefón sú chránené stĺpcovými
 * grantmi, sem sa vôbec nedostanú.
 */
import { OFFER_PUBLIC_COLS, type Offer } from "@/lib/offers";
import { createClient } from "@/lib/supabase/server";

export async function fetchOffers(propertyId: string): Promise<Offer[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("offerra")
    .from("property_offer")
    .select(`${OFFER_PUBLIC_COLS}, bidder:bidder_id(nickname, avatar_url)`)
    .eq("property_id", propertyId)
    .order("amount", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((o) => ({ ...o, message: null })) as unknown as Offer[];
}
