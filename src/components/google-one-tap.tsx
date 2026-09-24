"use client";

import { useEffect, useState } from "react";

import type { Locale } from "@/i18n";
import { ONE_TAP_LABELS } from "@/lib/one-tap-labels";
import { createClient } from "@/lib/supabase/client";

type CredentialResponse = { credential?: string };
type PromptNotification = {
  isNotDisplayed: () => boolean;
  getNotDisplayedReason: () => string;
};
type GoogleId = {
  initialize: (cfg: Record<string, unknown>) => void;
  prompt: (cb?: (n: PromptNotification) => void) => void;
  cancel: () => void;
};
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

// Dôvody, prečo Google One Tap nezobrazí, keď je všetko v poriadku
// (používateľ ho zavrel, nie je prihlásený v Google, cooldown…). Tieto
// používateľa netrápime; všetko ostatné (zlá doména, zlý klient) je chyba.
const ROUTINE_REASONS = new Set([
  "opt_out_or_no_session",
  "suppressed_by_user",
  "browser_not_supported",
  "secure_http_required",
]);

async function sha256Hex(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Google One Tap (Rastio, 24.9.2026): „Pokračovať ako <meno>" jedným
 * klepnutím, bez hesla, ak je používateľ v prehliadači prihlásený do
 * Google. Token ide do Supabase cez `signInWithIdToken` (nonce: Google
 * dostane SHA-256, Supabase pôvodnú hodnotu — tak to Supabase overuje).
 *
 * Je len na `/login`: Google skript (accounts.google.com) sa tak
 * nesťahuje každému anonymnému návštevníkovi pred akýmkoľvek súhlasom.
 * Tlačidlá Apple/Google pod tým ostávajú, One Tap ich len dopĺňa.
 */
export function GoogleOneTap({ clientId, next, locale }: { clientId: string; next: string; locale: Locale }) {
  const [error, setError] = useState<string | null>(null);
  const l = ONE_TAP_LABELS[locale];

  useEffect(() => {
    let cancelled = false;
    const rawNonce = crypto.randomUUID();

    async function handleCredential(res: CredentialResponse) {
      console.log("[one-tap] 3 credential prijatý:", Boolean(res.credential));
      if (!res.credential) {
        setError(l.signInFailed);
        return;
      }
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: res.credential,
        nonce: rawNonce,
      });
      if (authError) {
        console.error("[one-tap] 4 signInWithIdToken zlyhalo:", authError.message, authError);
        setError(l.signInFailed);
        return;
      }
      console.log("[one-tap] 5 prihlásený → presmerovanie");
      // Celé načítanie stránky, nie router.push — layout na serveri musí
      // dostať novú session cookie.
      window.location.assign(next.startsWith("/") && !next.startsWith("//") ? next : "/");
    }

    async function start() {
      console.log("[one-tap] 1 START");
      const hashed = await sha256Hex(rawNonce);
      if (cancelled || !window.google) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (r: CredentialResponse) => void handleCredential(r),
        nonce: hashed,
        auto_select: false,
        cancel_on_tap_outside: false,
        use_fedcm_for_prompt: true,
        itp_support: true,
      });
      window.google.accounts.id.prompt((n) => {
        if (!n.isNotDisplayed()) return;
        const reason = n.getNotDisplayedReason();
        console.warn("[one-tap] 2 nezobrazené, dôvod:", reason);
        if (!ROUTINE_REASONS.has(reason)) setError(l.notAvailable);
      });
    }

    const existing = document.getElementById("gsi-client") as HTMLScriptElement | null;
    if (window.google) {
      void start();
    } else if (existing) {
      existing.addEventListener("load", () => void start());
    } else {
      const s = document.createElement("script");
      s.id = "gsi-client";
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.defer = true;
      s.onload = () => void start();
      s.onerror = (e) => {
        console.error("[one-tap] načítanie gsi/client zlyhalo:", e);
        setError(l.loadFailed);
      };
      document.head.appendChild(s);
    }

    return () => {
      cancelled = true;
      window.google?.accounts.id.cancel();
    };
  }, [clientId, next, l.loadFailed, l.notAvailable, l.signInFailed]);

  if (!error) return null;
  return (
    <p role="alert" className="rounded-xl bg-danger/10 px-4 py-2 text-sm text-danger">
      {error}
    </p>
  );
}
