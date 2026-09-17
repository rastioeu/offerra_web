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

/**
 * Blokovanie/odblokovanie používateľa — appka: `toggleBlock` v
 * `(tabs)/admin.tsx`. Dôvod sa posiela len pri blokovaní (appka: pevný
 * text `t('admin.blockedReason')`), pri odblokovaní vždy `null`.
 */
export async function setUserBlocked(userId: string, blocked: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.schema("offerra").rpc("admin_set_blocked", {
    p_user_id: userId,
    p_blocked: blocked,
    p_reason: blocked ? "Zablokované administrátorom" : null,
  });
  if (error) throw error;
  revalidatePath("/admin");
}
