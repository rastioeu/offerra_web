/**
 * Ponuky na JEDEN inzerát — verejný zoznam (appka: `useOffers`). Otvorené,
 * ale pseudonymné — sumu, prezývku, stav a dátum vidí ktokoľvek, aj
 * neprihlásený (Rastio, 7.8.2026). Meno/telefón sú chránené stĺpcovými
 * grantmi, sem sa vôbec nedostanú.
 */
import { OFFER_PUBLIC_COLS, type Offer, type OfferContact } from "@/lib/offers";
import { createClient } from "@/lib/supabase/server";

/**
 * Správy k ponukám na jeden inzerát — len tie, ktoré volajúci smie
 * vidieť (appka: `offer_messages()` RPC — vlastník všetky, záujemca len
 * svoju, neprihlásený nič).
 */
async function fetchOfferMessages(propertyId: string): Promise<Record<string, string>> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return {};

  const { data, error } = await supabase.schema("offerra").rpc("offer_messages", { p_property: propertyId });
  if (error) throw error;
  const map: Record<string, string> = {};
  for (const r of (data ?? []) as { offer_id: string; message: string }[]) map[r.offer_id] = r.message;
  return map;
}

export async function fetchOffers(propertyId: string): Promise<Offer[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("offerra")
    .from("property_offer")
    .select(`${OFFER_PUBLIC_COLS}, bidder:bidder_id(nickname, avatar_url)`)
    .eq("property_id", propertyId)
    .order("amount", { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as unknown as Omit<Offer, "message">[];
  const messages = await fetchOfferMessages(propertyId);
  return rows.map((o) => ({ ...o, message: messages[o.id] ?? null }));
}

/** Kontakt na druhú stranu po prijatí ponuky — appka: `offer_contact()` RPC. */
export async function fetchOfferContact(offerId: string): Promise<OfferContact | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.schema("offerra").rpc("offer_contact", { p_offer_id: offerId });
  if (error) throw error;
  const rows = (data ?? []) as OfferContact[];
  return rows[0] ?? null;
}
