"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Nový inzerát vzniká hneď ako DRAFT v DB (appka: `pridat.tsx`) — nie až
 * po vyplnení formulára. Dôvod: fotky sa nahrávajú do
 * `{ownerId}/{propertyId}/…`, `propertyId` teda musí existovať PRED
 * prvým uploadom. Vedľajší efekt je dobrý — rozrobený inzerát sa
 * nestratí.
 */
export async function createDraftAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nie si prihlásený.");

  const { data, error } = await supabase
    .schema("offerra")
    .from("property")
    .insert({
      owner_id: user.id,
      status: "DRAFT",
      transaction_type: "SALE",
      property_type: "APARTMENT",
      title: "",
    })
    .select("id")
    .single();
  if (error) throw error;

  redirect(`/moje-inzeraty/${(data as { id: string }).id}/upravit`);
}
