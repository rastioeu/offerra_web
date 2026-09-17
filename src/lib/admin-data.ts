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
import type {
  AdminStats,
  AdminUser,
  DuplicateContact,
  ReportRow,
  SuspiciousFlood,
  SuspiciousLowball,
  SuspiciousShill,
} from "@/lib/admin";
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

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.schema("offerra").rpc("admin_users");
  if (error) throw error;
  return (data ?? []) as AdminUser[];
}

/**
 * Podozrivé vzorce a duplicitné kontakty — appka: `admin_suspicious_*`,
 * `admin_duplicate_contacts`. Volané naraz, chyba ktorejkoľvek nezhodí
 * ostatné (appka to isté — každý vzorec je nezávislý signál).
 */
export async function fetchSuspiciousPatterns(): Promise<{
  floods: SuspiciousFlood[];
  lowballs: SuspiciousLowball[];
  shills: SuspiciousShill[];
  duplicates: DuplicateContact[];
}> {
  const client = await createClient();
  const supabase = client.schema("offerra");
  const [fl, lb, sh, dc] = await Promise.all([
    supabase.rpc("admin_suspicious_offer_flood"),
    supabase.rpc("admin_suspicious_lowball"),
    supabase.rpc("admin_suspicious_shill_bidding"),
    supabase.rpc("admin_duplicate_contacts"),
  ]);
  if (fl.error) throw fl.error;
  if (lb.error) throw lb.error;
  if (sh.error) throw sh.error;
  if (dc.error) throw dc.error;
  return {
    floods: (fl.data ?? []) as SuspiciousFlood[],
    lowballs: (lb.data ?? []) as SuspiciousLowball[],
    shills: (sh.data ?? []) as SuspiciousShill[],
    duplicates: (dc.data ?? []) as DuplicateContact[],
  };
}
