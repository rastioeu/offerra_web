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

/**
 * Nastaviteľný prah — appka: `SETTINGS` tab, `admin_set_config()`. Platí
 * OKAMŽITE, nový build netreba (appkový princíp, rovnaký text v i18n).
 */
export async function setAppConfig(key: string, value: string) {
  const supabase = await createClient();
  const { error } = await supabase.schema("offerra").rpc("admin_set_config", {
    p_key: key,
    p_value: value,
  });
  if (error) throw error;
  revalidatePath("/admin");
}

/**
 * Zamietnutie nahlásenia — appka: `dismissReportButton` →
 * `admin_set_report_status(DISMISSED)`. Na rozdiel od `resolveReport`
 * NEROBÍ nič s inzerátom ani s počtom potvrdených priestupkov —
 * nahlásenie sa označí za neopodstatnené. Predtým na webe chýbalo
 * úplne, dalo sa len „Vybaviť" (čo VŽDY počíta ako potvrdené).
 */
export async function dismissReport(reportId: string) {
  const supabase = await createClient();
  const { error } = await supabase.schema("offerra").rpc("admin_set_report_status", {
    p_report_id: reportId,
    p_status: "DISMISSED",
  });
  if (error) throw error;
  revalidatePath("/admin");
}

/**
 * Schválenie / skrytie inzerátu — appka: `PROPERTIES` tab,
 * `admin_set_property_status`. Web túto sekciu predtým nemal vôbec —
 * inzerát sa dal skryť LEN cez nahlásenie, nie priamo.
 */
export async function setPropertyStatus(propertyId: string, status: "ACTIVE" | "REJECTED", reason: string | null) {
  const supabase = await createClient();
  const { error } = await supabase.schema("offerra").rpc("admin_set_property_status", {
    p_property_id: propertyId,
    p_status: status,
    p_reason: reason,
  });
  if (error) throw error;
  revalidatePath("/admin");
}

/**
 * Trvalé zmazanie inzerátu — appka: `admin_delete_property`. Na rozdiel
 * od skrytia (`REJECTED`, dá sa vrátiť) je toto nezvratné — appka aj web
 * preto vyžadujú explicitné potvrdenie v klientskej komponente pred
 * volaním.
 */
export async function deleteProperty(propertyId: string) {
  const supabase = await createClient();
  const { error } = await supabase.schema("offerra").rpc("admin_delete_property", {
    p_property_id: propertyId,
  });
  if (error) throw error;
  revalidatePath("/admin");
}
