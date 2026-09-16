"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

/**
 * Rozhodnutie o ponuke — appka: `OwnerOffers.decide()`. Prijatie AJ
 * odmietnutie sú len UPDATE stavu — kontakt sa odkryje AŽ pri prijatí
 * (appka to robí cez `offer_contact()` RPC, tu sa načíta rovno v
 * `OffersSection` server component po tejto akcii, bez samostatného
 * „Zobraziť kontakt" tlačidla — zjednodušenie).
 */
export async function decideOfferAction(propertyId: string, offerId: string, status: "ACCEPTED" | "REJECTED") {
  const supabase = await createClient();
  const { error } = await supabase.schema("offerra").from("property_offer").update({ status }).eq("id", offerId);
  if (error) throw error;
  revalidatePath(`/inzerat/${propertyId}`);
}

/**
 * Uzavretie obchodu — appka: JEDNA funkcia v databáze (`close_deal`)
 * mení stav inzerátu, víťaznú ponuku, konečnú sumu AJ stav ostatných
 * čakajúcich ponúk naraz — appka to nerobí po krokoch, aby pád medzi
 * nimi nenechal obchod v polovici.
 */
export async function closeDealAction(propertyId: string, offerId: string) {
  const supabase = await createClient();
  const { error } = await supabase.schema("offerra").rpc("close_deal", {
    p_property_id: propertyId,
    p_offer_id: offerId,
    p_final_amount: null,
  });
  if (error) throw error;
  revalidatePath(`/inzerat/${propertyId}`);
  revalidatePath("/moje-inzeraty");
}
