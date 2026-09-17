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
/**
 * Overenie používateľa — appka: `toggleVerified`. Poznámka je POVINNÁ pri
 * overovaní (nie pri odobratí) — odznak bez dôvodu je len ozdoba a pri
 * nehnuteľnostiach nebezpečná, drží to aj databáza.
 */
export async function setUserVerified(userId: string, verified: boolean, note: string) {
  const supabase = await createClient();
  const { error } = await supabase.schema("offerra").rpc("admin_set_verified", {
    p_user_id: userId,
    p_verified: verified,
    p_note: verified ? note : null,
  });
  if (error) throw error;
  revalidatePath("/admin");
}

/**
 * Povýšenie/odobratie práv správcu — appka: `toggleAdmin`. Bezpečnostné
 * pravidlá (nemeniť vlastnú rolu, aspoň jeden admin musí ostať) sú V
 * DATABÁZE (`admin_set_role`), nie tu.
 */
export async function setUserRole(userId: string, admin: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.schema("offerra").rpc("admin_set_role", {
    p_user_id: userId,
    p_admin: admin,
  });
  if (error) throw error;
  revalidatePath("/admin");
}

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
