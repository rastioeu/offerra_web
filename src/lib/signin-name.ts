/**
 * Meno z prihlasovacieho účtu — port appkovej `metadataFullName()`
 * časti appkového `signin-name.ts`. Appkovú Apple-špecifickú vec
 * (`rememberSignInName`, meno dostupné len v návratovej hodnote
 * natívneho `signInAsync`) web nemá — webové Apple OAuth ide cez
 * Supabase redirect, nie natívny SDK, takže tento prípad nenastáva.
 * Vždy je to len NÁVRH, pole ostáva bežné, editovateľné.
 */
import type { User } from "@supabase/supabase-js";

export function suggestedFullName(user: User | null | undefined): string {
  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const text = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
  const direct = text(meta.full_name) || text(meta.name);
  if (direct) return direct;
  const joined = [text(meta.given_name), text(meta.family_name)].filter(Boolean).join(" ");
  return joined || "";
}
