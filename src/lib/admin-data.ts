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
  AdminProperty,
  AdminStats,
  AdminUser,
  Alert,
  ConfigRow,
  DuplicateContact,
  RepeatOffender,
  ReportRow,
  SuspiciousFlood,
  SuspiciousLowball,
  SuspiciousShill,
  TopLister,
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

/**
 * Upozornenia, opakované porušenia, top vystavovatelia — appka:
 * `admin_alerts`, `admin_repeat_offenders`, `admin_top_listers`.
 * Čisté signály na ručnú kontrolu, žiadna automatická akcia.
 */
export async function fetchAdminAttention(): Promise<{
  alerts: Alert[];
  repeatOffenders: RepeatOffender[];
  topListers: TopLister[];
}> {
  const client = await createClient();
  const supabase = client.schema("offerra");
  const [a, ro, t] = await Promise.all([
    supabase.rpc("admin_alerts"),
    supabase.rpc("admin_repeat_offenders"),
    supabase.rpc("admin_top_listers"),
  ]);
  if (a.error) throw a.error;
  if (ro.error) throw ro.error;
  if (t.error) throw t.error;
  return {
    alerts: (a.data ?? []) as Alert[],
    repeatOffenders: (ro.data ?? []) as RepeatOffender[],
    topListers: (t.data ?? []) as TopLister[],
  };
}

/**
 * VŠETKY inzeráty pre správu — appka: `PROPERTIES` tab (`(tabs)/admin.tsx`).
 * Predtým web nemal žiadnu obrazovku na schvaľovanie/skrývanie/mazanie
 * inzerátov, len ich videl nepriamo cez nahlásenia.
 */
export async function fetchAdminProperties(): Promise<AdminProperty[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("offerra")
    .from("property")
    .select("id,title,status,city,created_at,rejection_reason")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as AdminProperty[];
}

/** Nastaviteľné prahy — appka: `app_config` tabuľka + `admin_set_config()`. */
export async function fetchAppConfig(): Promise<ConfigRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("offerra")
    .from("app_config")
    .select("key,value,label,hint")
    .order("key");
  if (error) throw error;
  return (data ?? []) as ConfigRow[];
}
