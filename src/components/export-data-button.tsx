"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

/**
 * GDPR export (rovnaký dôvod ako appka, Rastio 14.8.2026: Privacy Policy
 * sľubuje právo na prenositeľnosť údajov). `export_my_data()` je
 * scope-nutá na `auth.uid()` na strane servera — rovnaká RPC ako appka,
 * len namiesto natívneho `Share` bežné stiahnutie súboru v prehliadači.
 */
export function ExportDataButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: rpcError } = await supabase.schema("offerra").rpc("export_my_data");
      if (rpcError) throw rpcError;

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "offerra-moje-udaje.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export sa nepodaril");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="w-fit rounded-xl border border-border-strong bg-surface px-4 py-2 text-sm font-semibold text-text-primary hover:bg-surface-pressed disabled:opacity-60"
      >
        {busy ? "Pripravujem…" : "Stiahnuť moje dáta"}
      </button>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
