"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

/**
 * Podanie / úprava ponuky — presne tá istá logika ako appka
 * (`ponuka/[id].tsx`): jedna ŽIVÁ ponuka na záujemcu a inzerát (v DB
 * čiastočný unikátny index), zvýšenie je teda ÚPRAVA existujúcej, nie
 * nová — inak by sa verejný zoznam dal zaplaviť.
 *
 * Dotazník nájomcu (`tenant_profile`, len pri prenájme) sa zapisuje
 * DRUHÝM krokom, presne ako appka — dve po sebe idúce zápisy, nie
 * jedna transakcia/RPC (appkový vzor, nie zjednodušenie webu).
 */
export async function submitOffer(propertyId: string, existingOfferId: string | null, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nie si prihlásený.");

  const rawAmount = String(formData.get("amount") ?? "").replace(",", ".").trim();
  const amount = Number(rawAmount);
  if (!rawAmount || !Number.isFinite(amount) || amount <= 0) {
    throw new Error("Zadaj sumu ponuky.");
  }
  const message = String(formData.get("message") ?? "").trim() || null;
  const validUntil = String(formData.get("validUntil") ?? "") || null;
  const isRent = String(formData.get("transactionType") ?? "") === "RENT";

  const db = supabase.schema("offerra");
  let offerId = existingOfferId;

  if (existingOfferId) {
    const { error } = await db
      .from("property_offer")
      .update({ amount, message, valid_until: validUntil })
      .eq("id", existingOfferId);
    if (error) throw error;
  } else {
    const { data, error } = await db
      .from("property_offer")
      .insert({
        property_id: propertyId,
        bidder_id: user.id,
        amount,
        message,
        valid_until: validUntil,
        status: "PENDING",
      })
      .select("id")
      .single();
    if (error) throw error;
    offerId = data.id as string;
  }

  if (isRent && offerId) {
    const num = (key: string) => {
      const raw = String(formData.get(key) ?? "").replace(",", ".").trim();
      const n = Number(raw);
      return raw !== "" && Number.isFinite(n) ? n : null;
    };
    const hasPets = formData.get("hasPets") === "YES";
    const { error } = await db.from("tenant_profile").upsert(
      {
        offer_id: offerId,
        num_people: num("numPeople"),
        has_pets: hasPets,
        pet_details: hasPets ? String(formData.get("petDetails") ?? "").trim() || null : null,
        lease_duration_months: num("leaseMonths"),
        employment_status: String(formData.get("employmentStatus") ?? "").trim() || null,
        monthly_income_hint: num("monthlyIncome"),
        note: String(formData.get("tenantNote") ?? "").trim() || null,
      },
      { onConflict: "offer_id" }
    );
    if (error) throw error;
  }

  revalidatePath(`/inzerat/${propertyId}`);
}

export async function withdrawOffer(propertyId: string, offerId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .schema("offerra")
    .from("property_offer")
    .update({ status: "WITHDRAWN" })
    .eq("id", offerId);
  if (error) throw error;
  revalidatePath(`/inzerat/${propertyId}`);
}
