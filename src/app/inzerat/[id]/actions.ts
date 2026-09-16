"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

/**
 * Podanie / úprava ponuky — presne tá istá logika ako appka
 * (`ponuka/[id].tsx`): jedna ŽIVÁ ponuka na záujemcu a inzerát (v DB
 * čiastočný unikátny index), zvýšenie je teda ÚPRAVA existujúcej, nie
 * nová — inak by sa verejný zoznam dal zaplaviť.
 *
 * CHÝBA oproti appke: dotazník nájomcu pri prenájme (appka ho pri
 * prenájme vyžaduje) — web zatiaľ ponuku na prenájom odošle aj bez
 * neho, `tenant_profile` sa nezapisuje. Vedomý, priznaný rozdiel (pozri
 * report), nie tichá medzera.
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

  const db = supabase.schema("offerra");

  if (existingOfferId) {
    const { error } = await db
      .from("property_offer")
      .update({ amount, message, valid_until: validUntil })
      .eq("id", existingOfferId);
    if (error) throw error;
  } else {
    const { error } = await db.from("property_offer").insert({
      property_id: propertyId,
      bidder_id: user.id,
      amount,
      message,
      valid_until: validUntil,
      status: "PENDING",
    });
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
