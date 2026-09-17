"use server";

import { revalidatePath } from "next/cache";

import type { ViewingStatus } from "@/lib/viewing";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/i18n/server";

/**
 * ZNOVU-ŽIADOSŤ (appka, 19.8.2026): `viewing` má `unique(property_id,
 * requester_id)` — druhá žiadosť na ten istý inzerát NIKDY nie je nový
 * riadok, vždy je to UPDATE existujúcej CANCELLED. DB (`guard_viewing_update`)
 * to isté presadzuje nezávisle, toto len volí správnu cestu.
 */
export async function requestViewingAction(propertyId: string, existingCancelledId: string | null) {
  const [supabase, t] = await Promise.all([createClient(), getT()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error(t("common.notLoggedIn"));

  const db = supabase.schema("offerra");
  if (existingCancelledId) {
    const { error } = await db.from("viewing").update({ status: "REQUESTED" }).eq("id", existingCancelledId);
    if (error) throw error;
  } else {
    const { error } = await db
      .from("viewing")
      .insert({ property_id: propertyId, requester_id: user.id, status: "REQUESTED" });
    if (error) throw error;
  }
  revalidatePath(`/inzerat/${propertyId}`);
}

/** Potvrdí žiadosť — SMIE výhradne vlastník inzerátu, presadzuje to DB. */
export async function confirmViewingAction(propertyId: string, viewingId: string) {
  const supabase = await createClient();
  const { error } = await supabase.schema("offerra").from("viewing").update({ status: "CONFIRMED" }).eq("id", viewingId);
  if (error) throw error;
  revalidatePath(`/inzerat/${propertyId}`);
}

export async function setViewingStatusAction(propertyId: string, viewingId: string, status: ViewingStatus) {
  const supabase = await createClient();
  const { error } = await supabase.schema("offerra").from("viewing").update({ status }).eq("id", viewingId);
  if (error) throw error;
  revalidatePath(`/inzerat/${propertyId}`);
}
