/**
 * Vlastný profil — port appkového `src/hooks/use-profile.ts` (dátová
 * časť; appka drží stav v Reacte, web ho číta nanovo na serveri pri
 * každej stránke, rovnaký vzor ako zvyšok webu).
 *
 * `full_name` a `phone` sa NEDAJÚ prečítať cez tabuľku — rola
 * `authenticated` na tie stĺpce nemá SELECT (zmerané priamo cez
 * Management API, stĺpcový grant v DB, rovnaké ako appka komentuje).
 * Čítanie preto ide cez `offerra.my_profile()` (SECURITY DEFINER,
 * vlastný riadok). Zápis ide cez tabuľku — na to SELECT netreba.
 */
import { createClient } from "@/lib/supabase/server";

export type MyProfile = {
  id: string;
  nickname: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  age_confirmed_at: string | null;
  agent_declaration_at: string | null;
  notif_onboarded_at: string | null;
};

export async function fetchMyProfile(): Promise<MyProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.schema("offerra").rpc("my_profile");
  if (error) throw error;
  const rows = data as MyProfile[] | null;
  return rows && rows.length > 0 ? rows[0] : null;
}

/** Ľahká kontrola pre bránu v layout-e — netreba `full_name`/`phone`, len či riadok existuje. */
export async function myProfileExists(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.schema("offerra").from("profile").select("id").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data != null;
}

/** Rovnaké rozpoznanie chýb ako appkové `saveProfile()` — DB hlášky, nie appkový text. */
export function profileSaveErrorMessage(e: unknown, nicknameTaken: string, nicknameLength: string): string {
  const m = e instanceof Error ? e.message : String(e);
  if (/profile_nickname_key|duplicate key/i.test(m)) return nicknameTaken;
  if (/check constraint|nickname_check/i.test(m)) return nicknameLength;
  return m;
}
