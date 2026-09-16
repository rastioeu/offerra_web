"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Prihlásenie cez Google — appka aj web overujú totožnosť rovnakým
 * spôsobom (Rastio, 7.8.2026, appkový `auth.ts`: „aby za inzerátom
 * stál skutočný, overený človek"). Apple Sign In na webe vyžaduje
 * vlastnú konfiguráciu (Services ID naviazané na doménu) — pridá sa,
 * až bude appka mať trvalú doménu (`app.offerra.sk`).
 *
 * `redirectTo` MUSÍ byť v zozname povolených redirect URL v Supabase
 * Auth nastaveniach (Rastio to zatiaľ musí pridať ručne — Management
 * API token, ktorý mám, nemá na túto časť prístup, over
 * `reports/OFFERRA_WEB_MILNIK1.md`).
 */
export function GoogleSignInButton({ next = "/" }: { next?: string }) {
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
      Prihlásiť sa cez Google
    </button>
  );
}
