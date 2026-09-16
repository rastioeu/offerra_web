/**
 * Admin dáta — SERVER-SIDE. Volá presne tie isté RPC/tabuľky ako appka
 * (`(tabs)/admin.tsx`). ZATIAĽ len prehľad (`admin_stats`) a nahlásenia
 * (`report` + `admin_resolve_report`) — appka má naviac správu
 * používateľov, podozrivé vzorce a nastavenia prahov (Fáza 6+,
 * pozri `reports/OFFERRA_WEB_MILNIK1.md`).
 *
 * Skutočná ochrana je `offerra.is_admin()` V DATABÁZE — táto vrstva len
 * zavolá RPC a chybu nechá prejsť volajúcemu (stránka ju vyhodnotí ako
 * „nie si admin").
 */
import type { AdminStats, ReportRow } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

export async function fetchAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();
  const { data, error } = await supabase.schema("offerra").rpc("admin_stats");
  if (error) throw error;
  const row = ((data ?? []) as AdminStats[])[0];
  if (!row) throw new Error("admin_stats: prázdna odpoveď");
  return row;
}

export async function fetchReports(): Promise<ReportRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("offerra")
    .from("report")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as ReportRow[];
}
