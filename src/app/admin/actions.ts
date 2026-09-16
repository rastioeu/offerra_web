"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

/**
 * Vybavenie nahlásenia — JEDNA operácia, presne ako appka
 * (`admin_resolve_report`): server v jednej transakcii prepíše stav,
 * voliteľne skryje inzerát a upozorní nahláseného. Vracia počet
 * potvrdených nahlásení daného človeka CELKOVO.
 */
export async function resolveReport(reportId: string, hide: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.schema("offerra").rpc("admin_resolve_report", {
    p_report_id: reportId,
    p_hide: hide,
  });
  if (error) throw error;
  revalidatePath("/admin");
}
