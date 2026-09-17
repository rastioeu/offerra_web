"use server";

import { createClient } from "@/lib/supabase/server";
import { getT, redirectLocalized } from "@/i18n/server";

/**
 * Nový inzerát vzniká hneď ako DRAFT v DB (appka: `pridat.tsx`) — nie až
 * po vyplnení formulára. Dôvod: fotky sa nahrávajú do
 * `{ownerId}/{propertyId}/…`, `propertyId` teda musí existovať PRED
 * prvým uploadom. Vedľajší efekt je dobrý — rozrobený inzerát sa
 * nestratí.
 */
export async function createDraftAction() {
  const [supabase, t] = await Promise.all([createClient(), getT()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error(t("common.notLoggedIn"));

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

  return redirectLocalized(`/moje-inzeraty/${(data as { id: string }).id}/upravit`);
}
