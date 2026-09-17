"use client";

import { createT, type Locale } from "@/i18n";
import { createClient } from "@/lib/supabase/client";

/**
 * Prihlásenie cez Google — appka aj web overujú totožnosť rovnakým
 * spôsobom (Rastio, 7.8.2026, appkový `auth.ts`: „aby za inzerátom
 * stál skutočný, overený človek"). Apple Sign In pozri
 * `apple-sign-in-button.tsx` — funguje odkedy appka má trvalú doménu
 * (`app.offerra.sk`).
 *
 * `redirectTo` MUSÍ byť v zozname povolených redirect URL v Supabase
 * Auth nastaveniach.
 */
export function GoogleSignInButton({ next = "/", language }: { next?: string; language: Locale }) {
  const t = createT(language);
  async function handleClick() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center justify-center gap-2 rounded-xl border border-border-strong bg-surface px-5 py-3 font-semibold text-text-primary transition-colors hover:bg-surface-pressed"
    >
      {t("login.continueGoogle")}
    </button>
  );
}
