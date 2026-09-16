"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function num(text: string): number | null {
  const c = text.replace(",", ".").trim();
  if (c === "") return null;
  const n = Number(c);
  return Number.isFinite(n) ? n : null;
}

/**
 * Nový dopyt — appka: `dopyt/novy.tsx`. Verejný hneď (`status='ACTIVE'`),
 * na rozdiel od inzerátu žiadny DRAFT nemá — dopyt nemá fotky ani nič,
 * čo by sa dalo rozrobiť.
 *
 * ZJEDNODUŠENÉ oproti appke: appka má `CityPicker` (2 925 obcí, dopĺňa
 * okres/kraj automaticky) — web zatiaľ obec berie ako voľný text, okres
 * a kraj ostávajú `null`. Priznané v reporte, nie tichá medzera.
 */
export async function createDemandAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nie si prihlásený.");

  const description = String(formData.get("description") ?? "").trim();
  if (!description) throw new Error("Popíš, čo hľadáš.");

  const min = num(String(formData.get("budgetMin") ?? ""));
  const max = num(String(formData.get("budgetMax") ?? ""));
  if (min != null && max != null && max < min) {
    throw new Error("Horná hranica rozpočtu nemôže byť nižšia než dolná.");
  }

  const transaction = String(formData.get("transaction") ?? "SALE");
  const type = String(formData.get("propertyType") ?? "ANY");
  const city = String(formData.get("city") ?? "").trim() || null;

  const { data, error } = await supabase
    .schema("offerra")
    .from("buyer_request")
    .insert({
      user_id: user.id,
      transaction_type: transaction,
      property_type: type === "ANY" ? null : type,
      city,
      district: null,
      region: null,
      budget_min: min,
      budget_max: max,
      rooms_min: num(String(formData.get("rooms") ?? "")),
      area_min: num(String(formData.get("area") ?? "")),
      description,
      status: "ACTIVE",
    })
    .select("id")
    .single();
  if (error) throw error;

  redirect(`/dopyt/${(data as { id: string }).id}`);
}
