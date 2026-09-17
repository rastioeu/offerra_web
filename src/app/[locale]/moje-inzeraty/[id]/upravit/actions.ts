"use server";

import { revalidatePath } from "next/cache";

import { formToPatch, missingForPublish, type ListingForm } from "@/lib/listing-form";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/i18n/server";

async function requireOwnedProperty(propertyId: string) {
  const [supabase, t] = await Promise.all([createClient(), getT()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error(t("common.notLoggedIn"));

  const db = supabase.schema("offerra");
  const { data: property, error } = await db.from("property").select("*").eq("id", propertyId).maybeSingle();
  if (error) throw error;
  if (!property || property.owner_id !== user.id) throw new Error(t("propertyDetail.notFound"));

  return { supabase, db, property };
}

export async function saveListingAction(propertyId: string, form: ListingForm) {
  const { db } = await requireOwnedProperty(propertyId);
  const { error } = await db.from("property").update(formToPatch(form)).eq("id", propertyId);
  if (error) throw error;
  revalidatePath(`/moje-inzeraty/${propertyId}/upravit`);
  revalidatePath(`/inzerat/${propertyId}`);
}

/**
 * Zverejnenie je SAMOSTATNÁ akcia, nie posledný krok formulára — appka:
 * inzerát existuje v DB od začiatku (kvôli fotkám), bez explicitného
 * kroku by sa nedokončený koncept objavil vo verejnom katalógu.
 */
export async function publishListingAction(propertyId: string) {
  const { db, property } = await requireOwnedProperty(propertyId);

  const { count } = await db.from("media").select("id", { count: "exact", head: true }).eq("property_id", propertyId);
  const t = await getT();
  const missing = missingForPublish(t, property, count ?? 0);
  if (missing.length > 0) {
    throw new Error(t("inzeratEdit.missingPrefix", { list: missing.join(", ") }));
  }

  const { error } = await db.from("property").update({ status: "ACTIVE" }).eq("id", propertyId);
  if (error) throw error;
  revalidatePath(`/moje-inzeraty/${propertyId}/upravit`);
  revalidatePath(`/inzerat/${propertyId}`);
  revalidatePath("/moje-inzeraty");
  revalidatePath("/");
}

export async function archiveListingAction(propertyId: string) {
  const { db } = await requireOwnedProperty(propertyId);
  const { error } = await db.from("property").update({ status: "ARCHIVED" }).eq("id", propertyId);
  if (error) throw error;
  revalidatePath(`/moje-inzeraty/${propertyId}/upravit`);
  revalidatePath("/moje-inzeraty");
}

/**
 * Zmazanie inzerátu — Rastio (17.9.2026): „rozpracovaný inzerát sa
 * nedá vymazať." Web mal Uložiť/Zverejniť/Stiahnuť, ale žiadne
 * Zmazať — appka ho má (`inzerat/[id].tsx`, `confirmDelete`) pre
 * KAŽDÝ stav (DRAFT/REJECTED/ACTIVE/...), nie len DRAFT. Rovnaký
 * tvrdý `delete`, kaskáda v DB zmaže aj fotky/ponuky. Web nemá appkové
 * undo okno (`confirmWithUndo`) — potvrdenie je preto len JEDNO
 * (`window.confirm` vo formulári), nie sľub vrátenia späť, ktorý web
 * nevie splniť.
 */
export async function deleteListingAction(propertyId: string) {
  const { db } = await requireOwnedProperty(propertyId);
  const { error } = await db.from("property").delete().eq("id", propertyId);
  if (error) throw error;
  revalidatePath("/moje-inzeraty");
  revalidatePath("/");
}
