"use client";

import { createT, type Locale } from "@/i18n";
import { createClient } from "@/lib/supabase/client";

/**
 * Prihlásenie cez Apple — appka aj web overujú totožnosť rovnakým
 * spôsobom (Rastio, 7.8.2026: „aby za inzerátom stál skutočný, overený
 * človek"). Appka používa natívne Sign in with Apple (Bundle ID
 * `com.offerra.app`), web ide cez prehliadač na appleid.apple.com a
 * späť (Services ID, náhodou rovnaký identifier ako appkové Bundle ID
 * — Supabase Client ID pole je preto pre oba prípady spoločné).
 */
export function AppleSignInButton({ next = "/", language }: { next?: string; language: Locale }) {
  const t = createT(language);
  async function handleClick() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "apple",
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
      {t("login.continueApple")}
    </button>
  );
}
